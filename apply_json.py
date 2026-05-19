import json
import sys
import os
from pathlib import Path

def apply_changes(json_file):
    if not os.path.exists(json_file):
        print(f"❌ File not found: {json_file}")
        return

    # Load and parse the JSON file
    with open(json_file, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON format: {e}")
            print("Make sure you copied the entire JSON block from the AI.")
            return

    updates = data.get("updates", [])
    if not updates:
        print("⚠️ No 'updates' array found in JSON.")
        return

    print("================================================")
    print(" APPLYING AI CHANGES (JSON MODE)")
    print("================================================\n")

    root_path = Path.cwd()
    for update in updates:
        file_path_str = update.get("file")
        new_code = update.get("code")

        if not file_path_str or new_code is None:
            print("⚠️ Skipping invalid entry (missing 'file' or 'code').")
            continue

        # Resolve path and ensure parent directories exist
        full_path = root_path / file_path_str
        full_path.parent.mkdir(parents=True, exist_ok=True)

        # Write the new code
        with open(full_path, 'w', encoding='utf-8') as code_file:
            code_file.write(new_code)
        
        print(f"✅ Updated: {file_path_str}")

    print(f"\n🎉 Successfully applied {len(updates)} file updates!\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python apply_json.py <path_to_ai_response.json>")
    else:
        apply_changes(sys.argv[1])