import os
import re
import sys
from pathlib import Path

def apply_changes(ai_output_file):
    if not os.path.exists(ai_output_file):
        print(f"❌ Could not find file: {ai_output_file}")
        return

    with open(ai_output_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to match the exact format the AI will use
    pattern = r'<<<< FILE:\s*(.*?)\s*>>>>\n(.*?)(?=\n<<<< END FILE >>>>)'
    matches = list(re.finditer(pattern, content, re.DOTALL))
    
    if not matches:
        print("⚠️ No valid file blocks found. Did the AI use the <<<< FILE: path >>>> format?")
        return

    print("================================================")
    print(" APPLYING AI CHANGES")
    print("================================================\n")

    for match in matches:
        file_path_str = match.group(1).strip()
        
        # Clean up markdown code block ticks if the AI accidentally adds them
        new_code = match.group(2)
        if new_code.startswith("```python\n"):
            new_code = new_code[10:]
        elif new_code.startswith("```\n"):
            new_code = new_code[4:]
        if new_code.endswith("\n```"):
            new_code = new_code[:-4]

        # Resolve the full path
        full_path = Path.cwd() / file_path_str
        
        # Ensure directories exist
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write the new file content
        with open(full_path, 'w', encoding='utf-8') as code_file:
            code_file.write(new_code)
            
        print(f"✅ Updated: {file_path_str}")
        
    print(f"\n🎉 Successfully updated {len(matches)} files!\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python apply_changes.py <path_to_ai_response.txt>")
    else:
        apply_changes(sys.argv[1])