import streamlit as st
import requests
from typing import Dict, Any, List

API_BASE_URL = "http://localhost:8000/api"

st.set_page_config(page_title="Chat History Viewer", layout="wide")
st.title("Chat History Viewer")
st.markdown("Enter a user ID to load that user's chat sessions and inspect session history.")


def make_request(method: str, endpoint: str, params: Dict[str, Any] = None) -> Any:
    url = f"{API_BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, params=params)
        else:
            raise ValueError("Unsupported method")

        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as exc:
        st.error(f"Request error: {exc}")
        return None


with st.form(key="chat_history_form"):
    st.subheader("Load chat history for a user")
    user_id = st.text_input("User ID", help="Enter the numeric or string user identifier.")
    user_token = st.text_input(
        "User Token",
        value="TEST_USER_1",
        help="Provide a valid auth token for the history endpoint. Use TEST_USER_1 if your backend allows it.",
    )
    session_limit = st.number_input("Max sessions to fetch", min_value=1, max_value=100, value=20, step=1)
    fetch = st.form_submit_button("Load Chat Sessions")

if fetch:
    if not user_id:
        st.error("Please enter a User ID.")
    elif not user_token:
        st.error("Please enter a User Token.")
    else:
        sessions = make_request("GET", f"/chat/user-sessions/{user_id}", {"limit": session_limit})
        if sessions is None:
            st.error("Unable to fetch sessions.")
        elif len(sessions) == 0:
            st.info("No chat sessions found for that user.")
        else:
            st.success(f"Found {len(sessions)} sessions for user {user_id}.")

            session_options = [f"{item['session_id']} ({item['message_count']} msgs)" for item in sessions]
            selected = st.selectbox("Select session to inspect", session_options)
            selected_index = session_options.index(selected)
            selected_session = sessions[selected_index]["session_id"]

            st.markdown(f"### Session details for `{selected_session}`")
            st.write(sessions[selected_index])

            history = make_request(
                "GET",
                f"/chat/history/{selected_session}",
                {"user_token": user_token},
            )
            if history is None:
                st.error("Unable to fetch chat history for the selected session.")
            else:
                st.markdown("#### Messages")
                messages = history.get("messages", [])
                if not messages:
                    st.info("This session has no messages.")
                else:
                    for msg in messages:
                        align = "left" if msg["SenderRole"] == "user" else "right"
                        with st.container():
                            st.markdown(
                                f"**{msg['SenderRole'].title()}** — {msg['CreatedAt']}"
                            )
                            st.write(msg["MessageContent"])
                            st.markdown("---")
