import os
import json
from pathlib import Path

# ============================================================
# CONFIG
# ============================================================

ROOT_FOLDERS = [
    "backend",
    "frontends/frontend-admin",
    "frontends/frontend-bubble",
]

OUTPUT_DIR = "docs"

EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    ".vite",
    "dist",
    "build",
    "__pycache__",
    ".venv",
    "venv",
}

# ============================================================
# HELPERS
# ============================================================

def ensure_output_dir():
    Path(OUTPUT_DIR).mkdir(
        parents=True,
        exist_ok=True
    )

def write_file(
    filename,
    content
):
    path = Path(OUTPUT_DIR) / filename

    with open(
        path,
        "w",
        encoding="utf-8"
    ) as f:
        f.write(content)

    print(
        f"Generated: {path}"
    )

# ============================================================
# PROJECT SCANNER
# ============================================================

def scan_folders():

    result = {
        "admin_features": [],
        "bubble_features": [],
        "backend_routers": [],
        "services": [],
        "pages": [],
        "components": [],
    }

    # --------------------------------------------------------
    # FRONTEND ADMIN
    # --------------------------------------------------------

    admin_root = Path(
        "frontends/frontend-admin/src/admin/components"
    )

    if admin_root.exists():

        for item in admin_root.iterdir():

            if item.is_dir():

                result[
                    "admin_features"
                ].append(
                    item.name
                )

    # --------------------------------------------------------
    # BUBBLE FEATURES
    # --------------------------------------------------------

    bubble_root = Path(
        "frontends/frontend-bubble/src/bubble-chat"
    )

    if bubble_root.exists():

        for root, dirs, files in os.walk(
            bubble_root
        ):

            dirs[:] = [
                d
                for d in dirs
                if d not in EXCLUDE_DIRS
            ]

            for file in files:

                if file.endswith(
                    (
                        ".js",
                        ".jsx",
                    )
                ):
                    result[
                        "components"
                    ].append(
                        file
                    )

    # --------------------------------------------------------
    # BACKEND ROUTERS
    # --------------------------------------------------------

    router_root = Path(
        "backend/app/api/routers"
    )

    if router_root.exists():

        for file in router_root.glob(
            "*.py"
        ):
            if file.name != "__init__.py":
                result[
                    "backend_routers"
                ].append(
                    file.stem
                )

    # --------------------------------------------------------
    # SERVICES
    # --------------------------------------------------------

    service_root = Path(
        "backend/app/services"
    )

    if service_root.exists():

        for root, dirs, files in os.walk(
            service_root
        ):

            dirs[:] = [
                d
                for d in dirs
                if d not in EXCLUDE_DIRS
            ]

            for file in files:

                if file.endswith(".py"):
                    result[
                        "services"
                    ].append(
                        file
                    )

    return result

# ============================================================
# PROJECT SUMMARY
# ============================================================

def generate_project_summary(
    data
):

    return f"""# LemonSquare Chatbot

## Overview

LemonSquare Chatbot is an AI-powered helpdesk platform consisting of:

- FastAPI Backend
- React Admin Dashboard
- React SDK Chat Widget
- Groq LLM Integration
- Qdrant Vector Search
- RAG Knowledge Base
- Ticket Escalation System

## Main Modules

### Backend

Routers:

{chr(10).join(f"- {x}" for x in sorted(data["backend_routers"]))}

### Admin Dashboard

Modules:

{chr(10).join(f"- {x}" for x in sorted(data["admin_features"]))}

### Chat Widget

Embedded SDK chatbot for customer websites.

"""

# ============================================================
# USER GUIDE
# ============================================================

def generate_user_guide(
    data
):

    features = "\n".join(
        f"### {x.title()}\n"
        f"Manage and interact with the {x} module.\n"
        for x in sorted(
            data["admin_features"]
        )
    )

    return f"""# User Guide

## Login

Access the admin dashboard using your administrator account.

## Dashboard Features

{features}

## Knowledge Management

Upload documents and manage manual entries.

## AI Configuration

Configure:

- Models
- Prompts
- Embeddings
- Retrieval Settings

## Ticket Management

Review and process escalated support tickets.

"""

# ============================================================
# SDK GUIDE
# ============================================================

def generate_sdk_guide():

    return """# SDK Integration Guide

## Installation

Include:

```html
<link
  rel="stylesheet"
  href="lemonsquare-chatbot.css"
/>

<script
  src="lemonsquare-chat.js"
></script>