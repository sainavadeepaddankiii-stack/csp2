import sys
from pathlib import Path

# Delegate to backend/benchmark.py
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

from benchmark import run_benchmark

if __name__ == "__main__":
    run_benchmark()
