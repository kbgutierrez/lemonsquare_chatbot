import streamlit as st
import requests
from typing import Dict, Any

# Configuration
API_BASE_URL = "http://localhost:8000/api"

st.set_page_config(page_title="IT Support AI Dashboard", layout="wide")

st.title("IT Support AI Enterprise Dashboard")

# Sidebar for navigation
page = st.sidebar.selectbox(
    "Choose a section",
    ["Chat", "Documents", "Tickets", "Settings"]
)


def make_request(method: str, endpoint: str, data: Dict = None, files: Dict = None) -> Dict:
    """Helper function to make API requests"""
    url = f"{API_BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, params=data)
        elif method == "POST":
            if files:
                response = requests.post(url, files=files, data=data)
            else:
                response = requests.post(url, json=data)
        elif method == "DELETE":
            response = requests.delete(url, json=data)
        else:
            raise ValueError(f"Unsupported method: {method}")

        if 200 <= response.status_code < 300:
            try:
                return response.json()
            except ValueError:
                return {"message": response.text}
        else:
            st.error(f"Error {response.status_code}: {response.text}")
            return {}
    except Exception as e:
        st.error(f"Request failed: {str(e)}")
        return {}


def load_ai_settings() -> Dict[str, Any]:
    settings = make_request("GET", "/settings/ai")
    if settings:
        st.session_state.ai_settings = settings
    return settings


# Chat Section
if page == "Chat":
    st.header("AI Chat")

    if "session_id" not in st.session_state:
        st.session_state.session_id = None
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "user_token" not in st.session_state:
        st.session_state.user_token = "TEST_USER_1"

    with st.expander("Chat configuration", expanded=True):
        st.session_state.user_token = st.text_input(
            "User Token",
            value=st.session_state.user_token,
            help="Use TEST_USER_1 for local development or provide a valid auth token."
        )

    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.write(message["content"])

    # Chat input
    if prompt := st.chat_input("Ask me anything about IT support..."):
        if not st.session_state.user_token:
            st.error("Please provide a user token before sending a chat message.")
        else:
            st.session_state.messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"):
                st.write(prompt)

            chat_data = {
                "session_id": st.session_state.session_id,
                "message": prompt,
                "user_token": st.session_state.user_token,
            }
            response = make_request("POST", "/chat", chat_data)

            if response:
                st.session_state.session_id = response.get("session_id")
                ai_response = response.get("response", "No response")
                ticket_ids = response.get("ticket_ids_used", [])

                st.session_state.messages.append({"role": "assistant", "content": ai_response})
                with st.chat_message("assistant"):
                    st.write(ai_response)
                    if ticket_ids:
                        st.write(f"Referenced tickets: {', '.join(map(str, ticket_ids))}")


# Documents Section
elif page == "Documents":
    st.header("Document Management")

    tab1, tab2, tab3 = st.tabs(["Upload", "List", "Delete"])

    with tab1:
        st.subheader("Upload Document")
        uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")
        if uploaded_file is not None and st.button("Upload"):
            files = {"file": (uploaded_file.name, uploaded_file, "application/pdf")}
            response = make_request("POST", "/upload-document", files=files)
            if response:
                st.success("Document uploaded successfully!")
                st.json(response)

    with tab2:
        st.subheader("List Documents")
        category = st.selectbox("Filter by category", ["All", "Hardware", "Software", "Network", "Other"])
        category_param = None if category == "All" else category

        if st.button("Fetch Documents"):
            params = {"category": category_param} if category_param else {}
            documents = make_request("GET", "/documents", params)
            if documents:
                st.dataframe(documents)

    with tab3:
        st.subheader("Delete Document")
        document_id = st.text_input("Enter Document ID to delete")
        if st.button("Delete Document"):
            if document_id:
                response = make_request("DELETE", f"/documents/{document_id}")
                if response:
                    st.success("Document deleted successfully!")
                    st.json(response)
            else:
                st.error("Please enter a Document ID")


# Tickets Section
elif page == "Tickets":
    st.header("Ticket Management")

    tab1, tab2 = st.tabs(["List Tickets", "Delete Ticket"])

    with tab1:
        st.subheader("List Resolved Tickets")
        search = st.text_input("Search by ticket number")
        if st.button("Fetch Tickets"):
            params = {"search": search} if search else {}
            tickets = make_request("GET", "/tickets", params)
            if tickets:
                df_data = []
                for ticket in tickets:
                    df_data.append({
                        "ID": ticket["id"],
                        "Ticket Number": ticket["ticket_number"],
                        "Issue Reported": ticket["issue_reported"],
                        "Work Done": ticket["work_done"],
                        "Blacklisted": ticket["is_blacklisted"]
                    })
                st.dataframe(df_data)

    with tab2:
        st.subheader("Delete Ticket from AI Knowledge")
        ticket_number = st.text_input("Enter Ticket Number to delete")
        if st.button("Delete Ticket"):
            if ticket_number:
                response = make_request("DELETE", f"/tickets/{ticket_number}")
                if response:
                    st.success("Ticket deleted and blacklisted successfully!")
                    st.json(response)
            else:
                st.error("Please enter a Ticket Number")


# Settings Section
elif page == "Settings":
    st.header("AI Settings")

    if "ai_settings" not in st.session_state:
        st.session_state.ai_settings = None

    if st.button("Load Current AI Settings") or st.session_state.ai_settings is None:
        load_ai_settings()

    current_settings = st.session_state.ai_settings or {}

    if current_settings:
        with st.expander("Current Active Settings", expanded=True):
            st.json(current_settings)

    st.markdown("---")
    st.subheader("Update AI Settings")
    with st.form("settings_form"):
        active_model = st.text_input("Active Model", value=current_settings.get("ActiveModel", ""))
        reformulator_model = st.text_input("Reformulator Model", value=current_settings.get("ReformulatorModel", ""))
        system_prompt = st.text_area("System Prompt", value=current_settings.get("SystemPrompt", ""), height=120)
        reformulator_prompt = st.text_area(
            "Reformulator Prompt",
            value=current_settings.get("ReformulatorPrompt", ""),
            height=100,
        )
        temperature = st.number_input(
            "Temperature",
            min_value=0.0,
            max_value=2.0,
            value=max(0.0, min(2.0, float(current_settings.get("Temperature", 0.7)) if current_settings.get("Temperature") is not None else 0.7)),
            step=0.05,
        )
        confidence_threshold = st.number_input(
            "Confidence Threshold",
            min_value=0.0,
            max_value=1.0,
            value=max(0.0, min(1.0, float(current_settings.get("ConfidenceThreshold", 0.5)) if current_settings.get("ConfidenceThreshold") is not None else 0.5)),
            step=0.01,
        )
        embedding_model = st.text_input("Embedding Model", value=current_settings.get("EmbeddingModel", ""))
        reranker_model = st.text_input("Reranker Model", value=current_settings.get("RerankerModel", ""))
        top_k_tickets = st.number_input(
            "Top K Tickets",
            min_value=1,
            max_value=50,
            value=max(1, min(50, int(current_settings.get("TopK_Tickets", 5)) if current_settings.get("TopK_Tickets") is not None else 5)),
            step=1,
        )
        use_reformulator = st.checkbox(
            "Use Reformulator",
            value=current_settings.get("UseReformulator", True),
        )
        use_reranker = st.checkbox(
            "Use Reranker",
            value=current_settings.get("UseReranker", True),
        )
        allowed_categories = st.text_area(
            "Allowed Categories",
            value=current_settings.get(
                "AllowedCategories",
                "Network_Infrastructure,Hardware_Guide,Software_Documentation,HR_IT_Policy,Troubleshooting_Manual,General_IT",
            ),
            help="Comma-separated list of categories to include in AI responses.",
            height=100,
        )

        submit_update = st.form_submit_button("Save AI Settings")

    if submit_update:
        if not active_model or not system_prompt:
            st.error("Active Model and System Prompt are required.")
        else:
            settings_payload = {
                "ActiveModel": active_model,
                "ReformulatorModel": reformulator_model,
                "SystemPrompt": system_prompt,
                "ReformulatorPrompt": reformulator_prompt,
                "Temperature": temperature,
                "ConfidenceThreshold": confidence_threshold,
                "EmbeddingModel": embedding_model,
                "RerankerModel": reranker_model,
                "TopK_Tickets": top_k_tickets,
                "UseReformulator": use_reformulator,
                "UseReranker": use_reranker,
                "AllowedCategories": allowed_categories,
            }
            response = make_request("POST", "/settings/ai/update", settings_payload)
            if response:
                st.success("AI settings updated successfully.")
                st.json(response)
                st.session_state.ai_settings = response.get("data") or settings_payload

st.sidebar.markdown("---")
st.sidebar.markdown("**Note:** Make sure the backend API is running on localhost:8000")
