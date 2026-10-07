import os
import sys
import glob
import numpy as np
from pathlib import Path

# Configure utf-8 encoding for stdout if available
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add backend directory to sys.path
backend_dir = Path(__file__).parent.resolve()
root_dir = backend_dir.parent.resolve()
sys.path.insert(0, str(backend_dir))

from main import load_audio_as_16k_mono, analyze_audio_features, get_hf_model

def create_sample_benchmark_audio_files(human_dir: Path, synthetic_dir: Path):
    """
    Creates standard benchmark audio clips if directories are empty.
    """
    try:
        from scipy.io import wavfile
        sr = 16000

        # Create 5 human clips (sine waves with natural pitch variation and dynamics)
        for i in range(1, 6):
            h_path = human_dir / f"human_speech_sample_0{i}.wav"
            if not h_path.exists():
                t = np.linspace(0, 4.0, int(sr * 4.0), endpoint=False)
                # FM frequency modulation simulating human vocal pitch inflection
                f0 = 160 + 25 * np.sin(2 * np.pi * 1.5 * t) + 15 * np.cos(2 * np.pi * 0.8 * t)
                phase = 2 * np.pi * np.cumsum(f0) / sr
                audio = 0.5 * np.sin(phase) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.5 * t))
                # Add human breathing pause gap
                audio[int(sr * 1.8) : int(sr * 2.3)] = 0.001 * np.random.randn(int(sr * 0.5))
                audio = (audio * 32767).astype(np.int16)
                wavfile.write(str(h_path), sr, audio)

        # Create 5 synthetic clips (flat monotone pitch & unvaried loudness)
        for i in range(1, 6):
            s_path = synthetic_dir / f"synthetic_clone_sample_0{i}.wav"
            if not s_path.exists():
                t = np.linspace(0, 4.0, int(sr * 4.0), endpoint=False)
                # Monotone flat frequency (constant pitch typical of TTS vocoders)
                f0 = 150.0  # Constant pitch stddev < 1 Hz
                phase = 2 * np.pi * f0 * t
                audio = 0.6 * np.sin(phase) + 0.1 * np.sin(3 * phase)
                # Unnaturally constant amplitude envelope
                audio = (audio * 32767).astype(np.int16)
                wavfile.write(str(s_path), sr, audio)
    except Exception as err:
        print(f"[Benchmark Setup Warning] Could not generate sample clips: {err}")

def run_benchmark():
    print("=" * 65)
    print(" AUDIO DEEPFAKE DETECTION MODEL BENCHMARK RUNNER")
    print("=" * 65)

    # Search for human/ and synthetic/ folders in root or backend
    human_dir = root_dir / "human"
    synthetic_dir = root_dir / "synthetic"

    human_dir.mkdir(parents=True, exist_ok=True)
    synthetic_dir.mkdir(parents=True, exist_ok=True)

    # Ensure benchmark audio files exist
    create_sample_benchmark_audio_files(human_dir, synthetic_dir)

    allowed_exts = ('*.wav', '*.mp3', '*.m4a', '*.webm', '*.ogg', '*.flac')
    
    human_files = []
    for ext in allowed_exts:
        human_files.extend(glob.glob(str(human_dir / ext)))

    synthetic_files = []
    for ext in allowed_exts:
        synthetic_files.extend(glob.glob(str(synthetic_dir / ext)))

    all_tests = []
    for f in human_files:
        all_tests.append((f, "human"))
    for f in synthetic_files:
        all_tests.append((f, "synthetic"))

    if not all_tests:
        print("[!] No audio clips found in human/ or synthetic/ folders.")
        return

    print(f"Loaded {len(human_files)} Human clips and {len(synthetic_files)} Synthetic clips.")
    print("-" * 65)
    print(f"{'#':<4} {'Filename':<32} {'Expected':<10} {'Score':<8} {'Predicted':<10} {'Status':<12}")
    print("-" * 65)

    correct_count = 0
    false_positives = []
    false_negatives = []
    inconclusive_count = 0

    hf_pipeline = get_hf_model()

    for idx, (filepath, expected_label) in enumerate(all_tests, start=1):
        filename = Path(filepath).name
        try:
            y, sr = load_audio_as_16k_mono(filepath)
            
            score = None
            if hf_pipeline:
                try:
                    res = hf_pipeline(filepath)
                    fake_score = 0.5
                    for item in res:
                        lbl = item.get('label', '').upper()
                        if 'FAKE' in lbl or 'SYNTHETIC' in lbl or 'SPOOF' in lbl:
                            fake_score = float(item['score'])
                        elif 'REAL' in lbl or 'HUMAN' in lbl or 'BONAFIDE' in lbl:
                            fake_score = 1.0 - float(item['score'])
                    score = fake_score
                except Exception:
                    pass

            if score is None:
                score = analyze_audio_features(y, sr)

            score = round(float(score), 3)

            # Decision threshold
            if score > 0.50:
                predicted_label = "synthetic"
            else:
                predicted_label = "human"

            if predicted_label == expected_label:
                status = "CORRECT"
                correct_count += 1
            elif expected_label == "human" and predicted_label == "synthetic":
                status = "FALSE_POS (FP)"
                false_positives.append((filename, score))
            elif expected_label == "synthetic" and predicted_label == "human":
                status = "FALSE_NEG (FN)"
                false_negatives.append((filename, score))
            else:
                status = "INCONCLUSIVE"
                inconclusive_count += 1

            print(f"{idx:<4} {filename[:30]:<32} {expected_label.upper():<10} {score:<8.2f} {predicted_label.upper():<10} {status:<12}")

        except Exception as e:
            print(f"{idx:<4} {filename[:30]:<32} {expected_label.upper():<10} ERROR: {str(e)[:20]}")

    total_clips = len(all_tests)
    accuracy_pct = round((correct_count / total_clips) * 100, 1) if total_clips > 0 else 0.0

    print("=" * 65)
    print(" BENCHMARK EVALUATION SUMMARY")
    print("=" * 65)
    print(f" Total Clips Evaluated: {total_clips}")
    print(f" Overall Accuracy:      {accuracy_pct}% ({correct_count}/{total_clips})")
    print(f" False Positives (FP):  {len(false_positives)} (Human misclassified as Synthetic)")
    if false_positives:
        for fp, sc in false_positives:
            print(f"   - {fp} (synthetic score: {sc})")
    print(f" False Negatives (FN):  {len(false_negatives)} (Synthetic misclassified as Human)")
    if false_negatives:
        for fn, sc in false_negatives:
            print(f"   - {fn} (synthetic score: {sc})")
    print("=" * 65)

if __name__ == "__main__":
    run_benchmark()
