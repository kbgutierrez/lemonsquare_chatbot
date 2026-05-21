import shutil
from pathlib import Path

# ============================================================
# CONFIG
# ============================================================

FILES_TO_COPY = [
    # Services
    "backend/app/services/settings_service.py",

    # Routers
    "backend/app/api/routers/maintenance.py",
    "backend/app/api/routers/analytics.py",
    "backend/app/api/routers/auth.py",
    "backend/app/api/routers/explorer.py",

    # Core
    "backend/app/core/database.py",
    "backend/app/core/config.py",
    "backend/app/core/exceptions.py",

    # Main app
    "backend/main.py",

    # Scripts
    "scripts/ingest_tickets.py",
]

DESTINATION_FOLDER = "copies"


# ============================================================
# MAIN
# ============================================================

def main():

    root = Path.cwd()

    destination_root = root / DESTINATION_FOLDER

    # Create copies folder
    destination_root.mkdir(exist_ok=True)

    copied = []
    missing = []

    for relative_file in FILES_TO_COPY:

        source_path = root / relative_file

        if not source_path.exists():
            missing.append(relative_file)
            continue

        # Copy ONLY filename
        destination_path = destination_root / source_path.name

        shutil.copy2(source_path, destination_path)

        copied.append(source_path.name)

    # ========================================================
    # REPORT
    # ========================================================

    print("\n========================================")
    print("COPY OPERATION COMPLETE")
    print("========================================\n")

    if copied:
        print("COPIED FILES:")
        for file in copied:
            print(f"  ✓ {file}")

    if missing:
        print("\nMISSING FILES:")
        for file in missing:
            print(f"  ✗ {file}")

    print(f"\nDestination Folder: {destination_root}")


# ============================================================
# ENTRY
# ============================================================

if __name__ == "__main__":
    main()