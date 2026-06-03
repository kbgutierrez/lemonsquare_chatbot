import os
from pathlib import Path

# === CONFIG ===
ROOT = Path("frontends/frontend-bubble/src")
EXCLUDE_DIRS = {"node_modules", ".vite", "dist", "build", "__pycache__"}
INCLUDE_EXTS = {".jsx", ".css", ".js", ".json"}

# === OUTPUT ===
for root, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]
    for f in sorted(files):
        if any(f.endswith(e) for e in INCLUDE_EXTS):
            p = Path(root) / f
            print(f"\n=== {p.as_posix()} ===\n")
            try:
                print(p.read_text(encoding="utf-8"))
            except Exception as e:
                print(f"# ERROR reading file: {e}")