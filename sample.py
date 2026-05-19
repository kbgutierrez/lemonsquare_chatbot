import os
from pathlib import Path

# --- Configuration ---
OUTPUT_FILE = "project_summary.txt"
EXCLUDE_DIRS = {'.venv', 'venv', '.git', '__pycache__', '.env', '.idea', '.vscode', 'LemonSquare_ChatBot', 'frontend', 'oldbackend', 'frontend-admin', 'frontend-bubble'}
EXCLUDE_FILES = {OUTPUT_FILE, '.DS_Store', '.env'}

# Add a set of allowed extensions for text/code files
ALLOWED_EXTENSIONS = {'.py'}

def generate_tree(root_dir, prefix=""):
    """Recursively generates a visual directory tree."""
    tree = []
    items = sorted([item for item in os.listdir(root_dir) if item not in EXCLUDE_DIRS])
    
    for i, item in enumerate(items):
        path = os.path.join(root_dir, item)
        is_last = (i == len(items) - 1)
        connector = "└── " if is_last else "├── "
        
        tree.append(f"{prefix}{connector}{item}")
        
        if os.path.isdir(path):
            extension = "    " if is_last else "│   "
            tree.extend(generate_tree(path, prefix + extension))
    return tree

def pack_project():
    root_path = Path.cwd()
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        # 1. Write the Directory Tree
        f.write("================================================\n")
        f.write(f"PROJECT DIRECTORY TREE\n")
        f.write("================================================\n")
        tree_lines = generate_tree(root_path)
        f.write(f"{root_path.name}/\n" + "\n".join(tree_lines) + "\n\n")

        # 2. Write File Contents
        f.write("================================================\n")
        f.write("FILE CONTENTS\n")
        f.write("================================================\n\n")
        
        for root, dirs, files in os.walk(root_path):
            # Prune excluded directories in-place
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                file_path = Path(root) / file
                
                # Check 1: Is it in the explicit exclude list?
                if file in EXCLUDE_FILES:
                    continue
                
                # Check 2: Does it have an allowed text/code extension?
                if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
                    continue
                
                relative_path = file_path.relative_to(root_path)
                
                f.write(f"--- FILE: {relative_path} ---\n")
                try:
                    # 'errors=ignore' is safer now, but you could even remove it 
                    # since we are only targeting text files.
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as code_file:
                        f.write(code_file.read())
                except Exception as e:
                    f.write(f"[Error reading file: {e}]")
                
                f.write("\n\n")

    print(f"Successfully packed project into {OUTPUT_FILE}")

if __name__ == "__main__":
    pack_project()