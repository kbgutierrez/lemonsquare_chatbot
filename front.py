import os
import re
import json
from pathlib import Path

OUTPUT_FILE = "AI_CONTEXT.txt"

ROOT_FOLDERS = [
    "frontends/frontend-admin",
    "frontends/frontend-bubble",
    "backend"
]

EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    ".vite",
    "dist",
    "build",
    "__pycache__",
    ".venv",
    "venv",
    ".idea",
    ".vscode"
}

ALLOWED_EXTENSIONS = {
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py"
}


# ============================================================
# HELPERS
# ============================================================

def write_header(f, title):
    f.write("\n")
    f.write("=" * 80 + "\n")
    f.write(title + "\n")
    f.write("=" * 80 + "\n\n")


def safe_read(path):
    try:
        return path.read_text(
            encoding="utf-8",
            errors="ignore"
        )
    except:
        return ""


# ============================================================
# PACKAGE.JSON
# ============================================================

def find_package_json(root):

    for file in Path(root).rglob("package.json"):
        return file

    return None


def extract_dependencies(package_json):

    try:

        data = json.loads(
            package_json.read_text(
                encoding="utf-8"
            )
        )

        deps = data.get("dependencies", {})
        dev = data.get("devDependencies", {})

        return deps, dev

    except:
        return {}, {}


# ============================================================
# REACT COMPONENTS
# ============================================================

COMPONENT_PATTERNS = [

    r'export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)',

    r'function\s+([A-Z][A-Za-z0-9_]*)\s*\(',

    r'const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*\(',
]


def extract_components(content):

    found = set()

    for pattern in COMPONENT_PATTERNS:

        matches = re.findall(
            pattern,
            content
        )

        found.update(matches)

    return sorted(found)


# ============================================================
# HOOKS
# ============================================================

def extract_hooks(content):

    matches = re.findall(
        r'(use[A-Z][A-Za-z0-9_]*)',
        content
    )

    return sorted(set(matches))


# ============================================================
# IMPORTS
# ============================================================

def extract_imports(content):

    imports = re.findall(
        r'import\s+.*?\s+from\s+[\'"](.*?)[\'"]',
        content
    )

    return sorted(set(imports))


# ============================================================
# API ENDPOINTS
# ============================================================

def extract_endpoints(content):

    endpoints = []

    matches = re.findall(
        r'([A-Z0-9_]+)\s*:\s*"([^"]+)"',
        content
    )

    for name, route in matches:

        if route.startswith("/api"):
            endpoints.append(
                (name, route)
            )

    return endpoints


# ============================================================
# FASTAPI ROUTERS
# ============================================================

def extract_router_prefix(content):

    matches = re.findall(
        r'APIRouter\s*\(\s*prefix\s*=\s*[\'"]([^\'"]+)',
        content
    )

    return matches


# ============================================================
# SQLALCHEMY TABLES
# ============================================================

def extract_tables(content):

    return re.findall(
        r'__tablename__\s*=\s*[\'"]([^\'"]+)',
        content
    )


# ============================================================
# SCAN PROJECT
# ============================================================

def scan_project(root_folder):

    result = {
        "components": {},
        "hooks": set(),
        "services": [],
        "pages": [],
        "imports": {},
        "endpoints": [],
        "routers": [],
        "tables": []
    }

    root = Path(root_folder)

    if not root.exists():
        return result

    for current_root, dirs, files in os.walk(root):

        dirs[:] = [
            d
            for d in dirs
            if d not in EXCLUDE_DIRS
        ]

        for file in files:

            path = Path(current_root) / file

            if path.suffix.lower() not in ALLOWED_EXTENSIONS:
                continue

            content = safe_read(path)

            relative = str(
                path.relative_to(root)
            )

            lower = relative.lower()

            # Components

            components = extract_components(
                content
            )

            if components:

                result["components"][
                    relative
                ] = components

            # Hooks

            hooks = extract_hooks(content)

            result["hooks"].update(hooks)

            # Services

            if "service" in lower:

                result["services"].append(
                    relative
                )

            # Pages

            if "page" in lower:

                result["pages"].append(
                    relative
                )

            # Imports

            imports = extract_imports(
                content
            )

            if imports:

                result["imports"][
                    relative
                ] = imports

            # Endpoints

            result["endpoints"].extend(
                extract_endpoints(
                    content
                )
            )

            # Routers

            result["routers"].extend(
                extract_router_prefix(
                    content
                )
            )

            # Tables

            result["tables"].extend(
                extract_tables(
                    content
                )
            )

    return result


# ============================================================
# MAIN
# ============================================================

def generate_context():

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        write_header(
            f,
            "AI PROJECT CONTEXT"
        )

        f.write(
            "This file is generated automatically.\n"
        )

        f.write(
            "Purpose: Give an LLM enough context to understand the project.\n\n"
        )

        for root_folder in ROOT_FOLDERS:

            root = Path(root_folder)

            if not root.exists():
                continue

            write_header(
                f,
                f"PROJECT: {root.name}"
            )

            package_json = find_package_json(
                root
            )

            if package_json:

                deps, dev = extract_dependencies(
                    package_json
                )

                write_header(
                    f,
                    "DEPENDENCIES"
                )

                for k, v in deps.items():
                    f.write(
                        f"- {k}: {v}\n"
                    )

            data = scan_project(
                root_folder
            )

            write_header(
                f,
                "PAGES"
            )

            for page in sorted(
                data["pages"]
            ):
                f.write(
                    f"- {page}\n"
                )

            write_header(
                f,
                "SERVICES"
            )

            for service in sorted(
                data["services"]
            ):
                f.write(
                    f"- {service}\n"
                )

            write_header(
                f,
                "COMPONENTS"
            )

            for file, comps in sorted(
                data["components"].items()
            ):

                f.write(
                    f"\n{file}\n"
                )

                for c in comps:
                    f.write(
                        f"  └─ {c}\n"
                    )

            write_header(
                f,
                "HOOKS"
            )

            for hook in sorted(
                data["hooks"]
            ):
                f.write(
                    f"- {hook}\n"
                )

            write_header(
                f,
                "API ENDPOINTS"
            )

            for name, route in sorted(
                set(data["endpoints"])
            ):

                f.write(
                    f"{name}\n"
                )

                f.write(
                    f"  {route}\n\n"
                )

            write_header(
                f,
                "FASTAPI ROUTERS"
            )

            for router in sorted(
                set(data["routers"])
            ):
                f.write(
                    f"- {router}\n"
                )

            write_header(
                f,
                "DATABASE TABLES"
            )

            for table in sorted(
                set(data["tables"])
            ):
                f.write(
                    f"- {table}\n"
                )

            write_header(
                f,
                "IMPORT RELATIONSHIPS"
            )

            for file, imports in sorted(
                data["imports"].items()
            ):

                f.write(
                    f"\n{file}\n"
                )

                for imp in imports:
                    f.write(
                        f"  └─ {imp}\n"
                    )

        write_header(
            f,
            "AI SUMMARY"
        )

        f.write(
            "Use the information above to understand architecture, dependencies, data flow, APIs, services, components, and backend structure.\n"
        )

    print(
        f"Generated: {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    generate_context()