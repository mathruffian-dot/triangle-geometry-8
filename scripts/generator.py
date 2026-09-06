import os
import argparse
import importlib.util
from pathlib import Path
from config import get as runtime_config
import sys
import json
import time
import shutil
import wave
import subprocess

# Config paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(SCRIPT_DIR, "video_configs.json")
CLONER_PYTHON = runtime_config("cloner_python")
CLONER_SCRIPT = runtime_config("cloner_script")
PPTX_PATH = runtime_config("pptx_path")


def check_environment(q_id, force_voice=False):
    """只檢查本機檔案、快取及執行檔；不配音、不開 PowerPoint、不渲染。"""
    configs = json.loads(Path(CONFIG_PATH).read_text(encoding="utf-8"))
    if q_id not in configs:
        return [f"找不到題目設定：{q_id}"]
    cfg = configs[q_id]
    folder = Path(PROJECT_ROOT) / "working" / cfg["output_dir"]
    errors = []
    if not (folder / cfg["background_image"]).is_file():
        if not PPTX_PATH or not Path(PPTX_PATH).is_file():
            errors.append("缺少原始簡報，請設定 MATH809_VIDEO_PPTX_PATH 或 video_runtime.local.json")
        if os.name != "nt" or importlib.util.find_spec("win32com") is None:
            errors.append("匯出新投影片需要 Windows、PowerPoint 與 pywin32")
    else:
        print("底圖：使用現有快取")
    need_voice = force_voice
    for index, step in enumerate(cfg["steps"]):
        wav = folder / f"step_{index}_{step['id']}.wav"
        if force_voice or not wav.is_file():
            need_voice = True
        else:
            try:
                if get_wav_duration(str(wav)) <= 0:
                    errors.append(f"語音快取為空：{wav.name}")
            except (OSError, wave.Error, EOFError) as exc:
                errors.append(f"語音快取損壞：{wav.name}：{exc}")
    if need_voice:
        for label, value in (("配音 Python", CLONER_PYTHON), ("配音腳本", CLONER_SCRIPT)):
            if not value or not Path(value).is_file():
                errors.append(f"找不到{label}：{value}")
    else:
        print("配音：使用現有快取")
    for key in ("npx", "ffmpeg"):
        if not shutil.which(runtime_config(key)):
            errors.append(f"找不到執行檔：{key}")
    print("路徑檢查不代表 HyperFrames、PowerPoint 或語音模型已完成實際渲染驗證。")
    return errors


def get_wav_duration(path):
    """Get WAV file duration using python built-in wave module."""
    with wave.open(path, 'rb') as w:
        frames = w.getnframes()
        rate = w.getframerate()
        return frames / float(rate)

def concat_wavs(input_paths, output_path):
    """Concatenate multiple WAV files into a single WAV file."""
    data = []
    params = None
    for path in input_paths:
        with wave.open(path, 'rb') as w:
            if params is None:
                params = w.getparams()
            data.append(w.readframes(w.getnframes()))
    with wave.open(output_path, 'wb') as w:
        w.setparams(params)
        for d in data:
            w.writeframes(d)

def export_clean_slide(slide_index, out_png_path):
    """Use PowerPoint COM to hide solution shapes and export a clean slide image."""
    import win32com.client
    print(f"Opening PowerPoint to export Slide {slide_index}...")
    
    powerpoint = win32com.client.Dispatch('PowerPoint.Application')
    powerpoint.Visible = True
    
    # Open presentation
    presentation = powerpoint.Presentations.Open(PPTX_PATH, ReadOnly=True, WithWindow=False)
    slide = presentation.Slides(slide_index)
    
    hidden_shapes = []
    # Identify and hide solution shapes
    for shape in slide.Shapes:
        is_solution = False
        # 1. Check if top is below question area (270 points threshold)
        if shape.Top > 270:
            is_solution = True
        
        has_text = False
        text = ""
        try:
            if shape.HasTextFrame:
                text = shape.TextFrame.TextRange.Text.strip()
                if text:
                    has_text = True
        except:
            pass
            
        if has_text:
            # 2. Check keywords
            if (any(kw in text for kw in ["解", "答：", "代入", "得到"]) and "？" not in text) or shape.Top > 270:
                is_solution = True
                
            # 3. Check if it's a small single-digit helper label (e.g. angle label "3", "4")
            if text.isdigit() and len(text) == 1 and shape.Width < 100:
                is_solution = True
                
        if is_solution:
            print(f"  Hiding shape: {shape.Name} (Text: '{text}', Top: {shape.Top:.1f})")
            shape.Visible = False
            hidden_shapes.append(shape)
            
    # Export slide to PNG
    os.makedirs(os.path.dirname(out_png_path), exist_ok=True)
    slide.Export(out_png_path, "PNG")
    print(f"  Clean slide exported to: {out_png_path}")
    
    # Restore visibility
    for shape in hidden_shapes:
        shape.Visible = True
        
    presentation.Close()
    powerpoint.Quit()

def generate_step_voice(text, out_wav_path):
    """Run voxcpm cloner to generate cloned voice wav file."""
    print(f"Generating voice for: \"{text[:40]}...\"")
    cmd = [
        CLONER_PYTHON,
        CLONER_SCRIPT,
        text,
        "-o", out_wav_path,
        "-v", "三師爸"
    ]
    
    t0 = time.time()
    # Run in subprocess and wait
    result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
    
    if result.returncode != 0:
        print(f"  Error generating voice: {result.stderr}")
        raise RuntimeError("Voice cloning failed")
    
    elapsed = time.time() - t0
    dur = get_wav_duration(out_wav_path)
    print(f"  Generated WAV in {elapsed:.1f}s | Audio duration: {dur:.1f}s")
    return dur

def generate_video(q_id, force_voice=False):
    """Generate the full video package for a specific question."""
    problems = check_environment(q_id, force_voice)
    if problems:
        raise RuntimeError("\n".join(problems))
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        configs = json.load(f)
        
    if q_id not in configs:
        print(f"Error: Question {q_id} not found in config file.")
        return
        
    q_cfg = configs[q_id]
    print(f"\n==========================================")
    print(f"Processing Question: {q_id} ({q_cfg['title']})")
    print(f"==========================================")
    
    # Setup directories
    working_dir = os.path.join(PROJECT_ROOT, "working", q_cfg["output_dir"])
    os.makedirs(working_dir, exist_ok=True)
    
    # 1. Export clean slide
    clean_slide_png = os.path.join(working_dir, q_cfg["background_image"])
    # Only export if it doesn't exist
    if not os.path.exists(clean_slide_png):
        export_clean_slide(q_cfg["slide_index"], clean_slide_png)
    else:
        print(f"Using existing clean slide image: {clean_slide_png}")
    
    # 2. Generate segment voice WAVs
    audio_paths = []
    durations = []
    
    for idx, step in enumerate(q_cfg["steps"]):
        step_wav_name = f"step_{idx}_{step['id']}.wav"
        step_wav_path = os.path.join(working_dir, step_wav_name)
        
        # Check if already exists and not forcing voice regenerate
        if os.path.exists(step_wav_path) and not force_voice:
            print(f"Using cached voice file: {step_wav_name}")
            dur = get_wav_duration(step_wav_path)
        else:
            dur = generate_step_voice(step["narration"], step_wav_path)
            
        audio_paths.append(step_wav_path)
        durations.append(dur)
        
    # 3. Concatenate segment WAVs to narration.wav
    narration_wav_path = os.path.join(working_dir, "narration.wav")
    concat_wavs(audio_paths, narration_wav_path)
    total_audio_duration = sum(durations)
    print(f"Combined audio saved to: {narration_wav_path} (Total duration: {total_audio_duration:.1f}s)")
    
    # 4. Generate HTML and GSAP logic
    # Calculate reveal onset times
    reveal_times = {}
    current_time = 0.0
    for idx, step in enumerate(q_cfg["steps"]):
        # The reveal action for this step should happen at the start of this step's narration
        reveal_times[step["id"]] = current_time
        current_time += durations[idx]
        
    # Build HTML elements for solution textboxes
    zoom_cx = q_cfg.get("zoom_center", {}).get("cx", 960)
    zoom_cy = q_cfg.get("zoom_center", {}).get("cy", 540)
    
    shapes_html = []
    gsap_animations = []
    
    for s_id, s_info in q_cfg["shapes"].items():
        # Scale EMUs coordinates to pixels (1920x1080)
        px_left = int(s_info["left"] * 1920 / 12192000)
        px_top = int(s_info["top"] * 1080 / 6858000)
        px_width = int(s_info["width"] * 1920 / 12192000)
        px_height = int(s_info["height"] * 1080 / 6858000)
        
        div_id = f"overlay-{s_id}"
        shapes_html.append(f"""
      <div id="{div_id}" class="clip solution-box" 
           style="position:absolute; left:{px_left}px; top:{px_top}px; width:{px_width}px; min-height:{px_height}px; {s_info['style']}">
        <div>{s_info['text']}</div>
      </div>""")
      
    # Map steps to reveal animations and subtitle voice triggers in GSAP
    for idx, step in enumerate(q_cfg["steps"]):
        onset = reveal_times[step["id"]]
        
        # Subtitles removed by request
        pass
        
        for shape_id in step["reveal_shapes"]:
            div_id = f"overlay-{shape_id}"
            # 1. Animate the textbox reveal (fade in and slide from left)
            gsap_animations.append(f"      tl.from(\"#{div_id}\", {{ opacity: 0, x: -30, duration: 0.8, ease: \"power3.out\" }}, {onset:.2f});")
            # 2. Animate the highlighter sweep for equations in this box (if any)
            gsap_animations.append(f"      tl.to(\"#{div_id} .highlight-eq\", {{ backgroundSize: \"100% 100%\", duration: 1.0, ease: \"power2.inOut\", stagger: 0.5 }}, {onset + 0.8:.2f});")
            
    # Add laser highlights
    if "highlights" in q_cfg:
        for hl in q_cfg["highlights"]:
            gsap_animations.append(f"      tl.call(highlightVertex, [{hl['cx']}, {hl['cy']}], {hl['time']:.2f});")
            
    # Add zoom animations
    if "zooms" in q_cfg:
        for z in q_cfg["zooms"]:
            if z["scale"] == 1.0:
                gsap_animations.append(f"      tl.to(\"#viewport\", {{ scale: 1.0, x: 0, y: 0, duration: 1.0, ease: \"power2.inOut\" }}, {z['time']:.2f});")
            else:
                tx = 960 - zoom_cx * z["scale"]
                ty = 540 - zoom_cy * z["scale"]
                gsap_animations.append(f"      tl.to(\"#viewport\", {{ scale: {z['scale']}, x: {tx:.1f}, y: {ty:.1f}, duration: 1.0, ease: \"power2.inOut\" }}, {z['time']:.2f});")
            
    shapes_html_str = "\n".join(shapes_html)
    gsap_anim_str = "\n".join(gsap_animations)
    
    # Write package.json for HyperFrames
    package_json = {
        "name": q_cfg["output_dir"],
        "private": True,
        "type": "module",
        "scripts": {
            "render": "npx hyperframes render"
        }
    }
    with open(os.path.join(working_dir, "package.json"), "w", encoding="utf-8") as f:
        json.dump(package_json, f, indent=2)
        
    # Write hyperframes.json
    hyperframes_json = {
        "$schema": "https://hyperframes.heygen.com/schema/hyperframes.json",
        "registry": "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
        "paths": {
            "blocks": "compositions",
            "components": "compositions/components",
            "assets": "assets"
        }
    }
    with open(os.path.join(working_dir, "hyperframes.json"), "w", encoding="utf-8") as f:
        json.dump(hyperframes_json, f, indent=2)

    # Create index.html
    html_content = f"""<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{
        margin: 0; width: 1920px; height: 1080px; overflow: hidden;
        font-family: 'Noto Sans TC', system-ui, -apple-system, sans-serif;
        background: #fff;
      }}
      .solution-box {{
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(226, 232, 240, 0.8);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        border-radius: 8px;
        padding: 14px 20px;
        font-size: 32px;
        color: #1e293b;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }}
      .eq {{
        background-color: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        font-size: 22px;
        font-weight: bold;
        color: #475569;
        margin: 0 4px;
      }}
      .highlight-eq {{
        background: linear-gradient(120deg, rgba(254, 240, 138, 0.7) 0%, rgba(254, 240, 138, 0.7) 100\u0025);
        background-repeat: no-repeat;
        background-size: 0% 100%;
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
      }}
    </style>
  </head>
  <body>
    <!-- The root wrapper maps the main composition -->
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total_audio_duration:.2f}" data-width="1920" data-height="1080">
      
      <!-- Viewport wrapping background and laser pointer for synchronized zooming -->
      <div id="viewport" class="clip" data-start="0" data-duration="{total_audio_duration:.2f}"
           style="position:absolute; top:0; left:0; width:1920px; height:1080px; transform-origin: 0 0;">
        <!-- Slide background question image -->
        <img src="./{q_cfg['background_image']}" class="clip" data-start="0" data-duration="{total_audio_duration:.2f}"
             style="position:absolute; top:0; left:0; width:1920px; height:1080px; object-fit:contain;" />

        <!-- Laser Pointer overlay -->
        <svg id="laser-pointer" viewBox="0 0 1920 1080" class="clip" data-start="0" data-duration="{total_audio_duration:.2f}"
             style="position:absolute; top:0; left:0; width:1920px; height:1080px; pointer-events:none; z-index:90;">
          <circle id="laser-circle" cx="0" cy="0" r="40" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="4" stroke-dasharray="252" stroke-dashoffset="252" style="filter: drop-shadow(0 0 8px #ef4444); opacity: 0;" />
        </svg>
      </div>

      <!-- Solution overlay shapes -->
{shapes_html_str}

    </div>

    <script>
      window.__timelines = window.__timelines || {{}};
      var tl = gsap.timeline({{ paused: true }});
      
      // Laser pointer highlight function
      function highlightVertex(cx, cy) {{
        gsap.killTweensOf("#laser-circle");
        gsap.set("#laser-circle", {{ cx: cx, cy: cy, r: 40, strokeDashoffset: 252, scale: 1, opacity: 0 }});
        
        var tempTl = gsap.timeline();
        tempTl.to("#laser-circle", {{ opacity: 0.9, strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }})
              .to("#laser-circle", {{ r: 50, duration: 0.35, yoyo: true, repeat: 11, ease: "sine.inOut" }})
              .to("#laser-circle", {{ opacity: 0, scale: 1.2, transformOrigin: cx + "px " + cy + "px", duration: 0.3, ease: "power2.in" }});
      }}

      // Animations for revealing steps
{gsap_anim_str}

      // Extend timeline to match video duration
      tl.set({{}}, {{}}, {total_audio_duration:.2f});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
    with open(os.path.join(working_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Created index.html inside {working_dir}")
    
    # 5. Render using HyperFrames
    output_video_dir = os.path.join(PROJECT_ROOT, "output", "math_videos")
    os.makedirs(output_video_dir, exist_ok=True)
    output_video_path = os.path.join(output_video_dir, f"{q_cfg['output_dir']}.mp4")
    
    print(f"Rendering composition to MP4 using HyperFrames...")
    # Run render command in the working directory
    render_cmd = [runtime_config("npx"), "--no-install", "hyperframes", "render", "--output", output_video_path]
    t_render = time.time()
    # Standard render locally
    render_result = subprocess.run(render_cmd, cwd=working_dir, capture_output=True, text=True)
    
    if render_result.returncode != 0:
        print(f"  Error rendering video: {render_result.stderr}")
        raise RuntimeError("HyperFrames rendering failed")
        
    print(f"Successfully rendered video in {time.time() - t_render:.1f}s!")
    print(f"Video saved to: {output_video_path}")
    
    # 6. Mix combined audio narration.wav into the final video using FFmpeg
    temp_mixed_video = os.path.join(working_dir, "mixed_output.mp4")
    print(f"Mixing narration.wav into the final video using FFmpeg...")
    ffmpeg_cmd = [
        runtime_config("ffmpeg"), "-y",
        "-i", output_video_path,
        "-i", narration_wav_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        temp_mixed_video
    ]
    mix_result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    if mix_result.returncode != 0:
        print(f"  Error mixing audio: {mix_result.stderr}")
        raise RuntimeError("FFmpeg audio mix failed")
        
    # Replace final video with the mixed video
    shutil.move(temp_mixed_video, output_video_path)
    print(f"Successfully mixed audio! Final video ready: {output_video_path}")

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description="數學教學影片產生器")
    ap.add_argument("question_id", help="video_configs.json 中的題目代號，如 q1")
    ap.add_argument("--force-voice", action="store_true", help="重新產生各段配音")
    ap.add_argument("--check", action="store_true", help="只檢查本機前置條件，不製作影片")
    args = ap.parse_args()
    if args.check:
        problems = check_environment(args.question_id, args.force_voice)
        for problem in problems:
            print("缺少：" + problem)
        print("本機前置檢查未通過" if problems else "本機路徑與快取檢查通過")
        sys.exit(1 if problems else 0)
    generate_video(args.question_id, force_voice=args.force_voice)
