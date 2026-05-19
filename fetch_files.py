import sys
import os
from pathlib import Path

OUTPUT_FILE = "ai_context.txt"

def fetch_files(file_paths):
    if not file_paths:
        print("Usage: python fetch_files.py <path1> <path2> ...")
        return

    root_path = Path.cwd()
    success_count = 0
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out_file:
        out_file.write("================================================\n")
        out_file.write("REQUESTED FILE CONTENTS\n")
        out_file.write("================================================\n\n")
        
        for path_str in file_paths:
            clean_path = path_str.strip('\'" ,')
            file_path = root_path / clean_path
            
            if file_path.is_file():
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as in_file:
                        out_file.write(f"--- FILE: {clean_path} ---\n")
                        out_file.write(in_file.read())
                        out_file.write("\n\n")
                        print(f"✅ Packed: {clean_path}")
                        success_count += 1
                except Exception as e:
                    print(f"❌ Error reading {clean_path}: {e}")
            else:
                print(f"❌ Not found or not a file: {clean_path}")

    print("================================================")
    print(f"🎉 Packed {success_count} files into '{OUTPUT_FILE}'")
    print("================"
    "================================")

if __name__ == "__main__":
    fetch_files(sys.argv[1:])