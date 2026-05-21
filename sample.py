import os
from pathlib import Path

# ============================================================
# CONFIGURATION
# ============================================================

OUTPUT_FILE = "project_summary.txt"

# ONLY this folder will be scanned
ALLOWED_ROOT_FOLDER = r"backend\app"

# Ignored directories
EXCLUDE_DIRS = {
    ".venv",
    "venv",
    ".git",
    "__pycache__",
    ".env",
    ".idea",
    ".vscode"
}

# Ignored files
EXCLUDE_FILES = {
    OUTPUT_FILE,
    ".DS_Store",
    ".env"
}

# ONLY .py files allowed
ALLOWED_EXTENSIONS = {
    ".py"
}


# ============================================================
# TREE GENERATOR
# ============================================================

def directory_contains_py_files(path: Path) -> bool:
    """
    Check recursively if a directory contains any .py files.
    """

    for root, dirs, files in os.walk(path):

        # Remove excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            if Path(file).suffix.lower() in ALLOWED_EXTENSIONS:
                return True

    return False


def generate_tree(root_dir: Path, prefix: str = ""):
    """
    Generate a tree that ONLY shows:
    - directories containing .py files
    - .py files
    """

    tree = []

    valid_items = []

    for item in sorted(os.listdir(root_dir)):

        if item in EXCLUDE_DIRS:
            continue

        item_path = root_dir / item

        # Include only .py files
        if item_path.is_file():
            if item_path.suffix.lower() in ALLOWED_EXTENSIONS:
                valid_items.append(item)

        # Include only directories that contain .py files
        elif item_path.is_dir():
            if directory_contains_py_files(item_path):
                valid_items.append(item)

    for i, item in enumerate(valid_items):

        item_path = root_dir / item

        is_last = (i == len(valid_items) - 1)

        connector = "└── " if is_last else "├── "

        tree.append(f"{prefix}{connector}{item}")

        if item_path.is_dir():
            extension = "    " if is_last else "│   "
            tree.extend(generate_tree(item_path, prefix + extension))

    return tree


# ============================================================
# MAIN PACKER
# ============================================================

def pack_project():

    cwd = Path.cwd()

    # FIXED: compile ONLY backend/app-refactored
    root_path = cwd / Path(ALLOWED_ROOT_FOLDER)

    if not root_path.exists() or not root_path.is_dir():
        print(f'Error: "{ALLOWED_ROOT_FOLDER}" folder not found.')
        return

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:

        # ====================================================
        # DIRECTORY TREE
        # ====================================================

        f.write("================================================\n")
        f.write("PROJECT DIRECTORY TREE\n")
        f.write("================================================\n")

        tree_lines = generate_tree(root_path)

        f.write(f"{ALLOWED_ROOT_FOLDER}/\n")

        if tree_lines:
            f.write("\n".join(tree_lines))

        f.write("\n\n")

        # ====================================================
        # FILE CONTENTS
        # ====================================================

        f.write("================================================\n")
        f.write("FILE CONTENTS\n")
        f.write("================================================\n\n")

        for root, dirs, files in os.walk(root_path):

            # Remove excluded directories
            dirs[:] = [
                d for d in dirs
                if d not in EXCLUDE_DIRS
            ]

            for file in sorted(files):

                file_path = Path(root) / file

                # Skip excluded files
                if file in EXCLUDE_FILES:
                    continue

                # ONLY .py files
                if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
                    continue

                relative_path = file_path.relative_to(cwd)

                f.write(f"--- FILE: {relative_path} ---\n")

                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as code_file:
                        f.write(code_file.read())

                except Exception as e:
                    f.write(f"[Error reading file: {e}]")

                f.write("\n\n")

    print(
        f'Successfully packed ONLY Python files from "{ALLOWED_ROOT_FOLDER}" into "{OUTPUT_FILE}"'
    )


# ============================================================
# ENTRY
# ============================================================

if __name__ == "__main__":
    pack_project()