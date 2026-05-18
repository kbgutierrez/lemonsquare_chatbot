import streamlit as st
import requests
import pandas as pd
import json
import time

# --- CONFIGURATION ---
st.set_page_config(page_title="Lemon Square IT AI", page_icon="🍋", layout="wide")
API_BASE = "http://localhost:8000/api"

# --- API HELPER FUNCTIONS ---
def api_request(method, endpoint, params=None, json_data=None, files=None, data=None):
    url = f"{API_BASE}{endpoint}"

    try:
        if method == "GET":
            res = requests.get(url, params=params)

        elif method == "POST":
            res = requests.post(
                url,
                params=params,
                json=json_data,
                files=files,
                data=data
            )

        elif method == "PUT":
            res = requests.put(url, params=params, json=json_data)

        elif method == "DELETE":
            res = requests.delete(url, params=params)

        res.raise_for_status()
        return res.json()

    except requests.exceptions.HTTPError as e:
        err_msg = (
            e.response.json().get('error', str(e))
            if e.response else str(e)
        )

        st.error(f"API Error: {err_msg}")
        return None

    except Exception as e:
        st.error(f"Connection Error: {e}")
        return None


# --- SESSION STATE INITIALIZATION ---
if "user" not in st.session_state:
    st.session_state.user = None

# BACKEND OWNS SESSION CREATION
if "session_id" not in st.session_state:
    st.session_state.session_id = None

if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

if "ticket_draft" not in st.session_state:
    st.session_state.ticket_draft = None

if "system_categories" not in st.session_state:
    st.session_state.system_categories = ["General_IT"]


# ==========================================
# 🔐 AUTHENTICATION
# ==========================================
if not st.session_state.user:

    st.title("🍋 Lemon Square IT Helpdesk")

    st.markdown(
        "Please log in using your Employee ID "
        "(Try `TEST_USER_1` for local dev)."
    )

    with st.form("login_form"):

        user_id = st.text_input("User Token")

        if st.form_submit_button("Login"):

            with st.spinner("Authenticating..."):

                auth_data = api_request(
                    "GET",
                    "/auth/verify",
                    params={"user_token": user_id}
                )

                if auth_data and auth_data.get("is_valid"):

                    st.session_state.user = auth_data

                    st.success(
                        f"Welcome, {auth_data['name']}!"
                    )

                    # Fetch active categories on login
                    settings = api_request("GET", "/settings")

                    if settings:
                        st.session_state.system_categories = [
                            c.strip()
                            for c in settings.get(
                                "AllowedCategories",
                                "General_IT"
                            ).split(",")
                        ]

                    st.rerun()

                else:
                    st.error(
                        auth_data.get(
                            "error",
                            "Authentication failed."
                        )
                    )

    st.stop()


# ==========================================
# 🧭 SIDEBAR NAVIGATION
# ==========================================
with st.sidebar:

    st.subheader(
        f"👤 {st.session_state.user['name']}"
    )

    st.caption(
        f"{st.session_state.user.get('department', 'Unknown Dept')} "
        f"| ID: {st.session_state.user.get('user_id')}"
    )

    st.markdown("---")

    view = st.radio(
        "Navigation",
        [
            "💬 IT Support Chat",
            "📊 Admin: Dashboard",
            "📚 Admin: Knowledge Explorer",
            "📄 Admin: Documents & Rules",
            "🧠 Admin: Self-Knowledge & Tickets",
            "⚙️ Admin: System Settings",
            "🧪 Admin: Pipeline Debugger"
        ]
    )

    st.markdown("---")

    if st.button("🚪 Logout", use_container_width=True):
        st.session_state.clear()
        st.rerun()


# ==========================================
# VIEW 1: IT SUPPORT CHAT
# ==========================================
if view == "💬 IT Support Chat":

    st.title("IT Support Assistant")

    # Header actions
    col1, col2, col3, col4 = st.columns([4, 2, 2, 2])

    with col2:

        if st.button("✨ New Chat"):

            # CLEAR SESSION
            # BACKEND WILL GENERATE NEW ID
            st.session_state.session_id = None

            st.session_state.chat_history = []
            st.session_state.ticket_draft = None

            st.rerun()

    with col3:

        if st.button(
            "✅ Mark Resolved",
            type="secondary",
            use_container_width=True
        ):

            if not st.session_state.session_id:
                st.warning("No active chat session yet.")

            else:
                with st.spinner(
                    "Extracting resolution to AI Brain..."
                ):

                    res = api_request(
                        "POST",
                        f"/chat/resolve/{st.session_state.session_id}"
                    )

                    if res:
                        st.success(
                            "Chat learned successfully!"
                        )

    with col4:

        if st.button(
            "🚨 Escalate to Agent",
            type="primary",
            use_container_width=True
        ):

            if not st.session_state.session_id:
                st.warning("No active chat session yet.")

            else:
                with st.spinner(
                    "Drafting ticket & routing..."
                ):

                    res = api_request(
                        "GET",
                        f"/chat/escalate/draft/{st.session_state.session_id}"
                    )

                    if (
                        res and
                        res.get("status") == "success"
                    ):
                        st.session_state.ticket_draft = res
                        st.rerun()

    # Escalation Draft UI
    if st.session_state.ticket_draft:

        st.warning("### 📝 Review Ticket Draft")

        draft = st.session_state.ticket_draft

        if draft.get("routing_reasoning"):
            st.info(
                f"🧠 **AI Routing Reasoning:** "
                f"{draft['routing_reasoning']}"
            )

        with st.form("escalate_form"):

            summary = st.text_input(
                "Summary",
                value=draft.get("summary", "")
            )

            desc = st.text_area(
                "Description",
                value=draft.get("description", ""),
                height=150
            )

            c1, c2 = st.columns(2)

            c1.text_input(
                "Predicted Dept",
                value=draft.get(
                    "department_name",
                    "Unknown"
                ),
                disabled=True
            )

            c2.text_input(
                "Predicted Subcategory",
                value=draft.get(
                    "subcategory_name",
                    "Unknown"
                ),
                disabled=True
            )

            if st.form_submit_button(
                "Submit Ticket to Helpdesk",
                type="primary"
            ):

                payload = {
                    "session_id": st.session_state.session_id,
                    "requester_id": int(
                        st.session_state.user.get(
                            "user_id",
                            1
                        )
                    ),
                    "company_id": int(
                        st.session_state.user.get(
                            "company_id",
                            1
                        )
                    ),
                    "summary": summary,
                    "description": desc,
                    "department_id": draft.get(
                        "department_id",
                        29
                    ),
                    "subcategory_id": draft.get(
                        "subcategory_id",
                        11200
                    )
                }

                with st.spinner("Submitting..."):

                    submit_res = api_request(
                        "POST",
                        "/chat/escalate/submit",
                        json_data=payload
                    )

                    if submit_res:
                        st.success(
                            "Ticket escalated successfully!"
                        )

                        st.session_state.ticket_draft = None
                        st.rerun()

    st.markdown("---")

    # Chat History Display
    for msg in st.session_state.chat_history:

        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    # ==========================================
    # CHAT INPUT
    # ==========================================
    if prompt := st.chat_input(
        "Describe your IT issue here..."
    ):

        st.session_state.chat_history.append({
            "role": "user",
            "content": prompt
        })

        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):

            with st.spinner("AI is thinking..."):

                # BUILD PAYLOAD
                payload = {
                    "message": prompt,
                    "user_token": str(
                        st.session_state.user.get(
                            "user_id",
                            "TEST_USER_1"
                        )
                    )
                }

                # ONLY SEND SESSION ID
                # IF BACKEND ALREADY CREATED ONE
                if st.session_state.session_id:
                    payload["session_id"] = (
                        st.session_state.session_id
                    )

                # SEND REQUEST
                res = api_request(
                    "POST",
                    "/chat",
                    json_data=payload
                )

                if res and "response" in res:

                    # CAPTURE BACKEND SESSION ID
                    if (
                        not st.session_state.session_id and
                        "session_id" in res
                    ):
                        st.session_state.session_id = (
                            res["session_id"]
                        )

                    ai_reply = res["response"]

                    st.markdown(ai_reply)

                    if res.get("ticket_ids_used"):

                        st.caption(
                            f"Context used: "
                            f"Tickets {res['ticket_ids_used']}"
                        )

                    st.session_state.chat_history.append({
                        "role": "assistant",
                        "content": ai_reply
                    })