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

    tab1, tab2, tab3, tab4, tab5 = st.tabs(["Upload", "List", "Delete", "RAG Debugger", "Full Pipeline Debug"])

    with tab1:
        st.subheader("Upload Document")
        uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")
        if uploaded_file is not None and st.button("Upload"):
            files = {"file": (uploaded_file.name, uploaded_file, "application/pdf")}
            response = make_request("POST", "/documents/upload", files=files)
            if response:
                st.success("Document uploaded successfully!")
                st.json(response)

    with tab2:
        st.subheader("List Documents")
        category = st.selectbox("Filter by category", ["All", "Hardware", "Software", "Network", "Other"])
        category_param = None if category == "All" else category
        col1, col2 = st.columns(2)
        with col1:
            skip = st.number_input("Skip", min_value=0, value=0, step=10, key="doc_skip")
        with col2:
            limit = st.number_input("Limit", min_value=1, max_value=100, value=50, step=10, key="doc_limit")

        if st.button("Fetch Documents"):
            params = {"category": category_param} if category_param else {}
            params.update({"skip": skip, "limit": limit})
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

    with tab4:
        st.subheader("RAG Debugger: Query Qdrant Directly")
        query = st.text_input("Search query", help="Inspect the exact document chunks returned by Qdrant.")
        limit = st.number_input("Result limit", min_value=1, max_value=20, value=5, step=1)

        if st.button("Run Qdrant Test Search"):
            if not query:
                st.error("Please enter a search query to run the debug search.")
            else:
                response = make_request("POST", "/documents/test-search", {"query": query, "limit": limit})
                if response:
                    st.success("Qdrant results retrieved.")
                    results = response.get("results", [])
                    if results:
                        st.write(f"Query: {response.get('query')}")
                        st.table([
                            {
                                "score": hit.get("score"),
                                "type": hit.get("type"),
                                "content": hit.get("content"),
                            }
                            for hit in results
                        ])
                        st.json(response)
                    else:
                        st.info("No results returned from Qdrant.")

    with tab5:
        st.subheader("Full Pipeline Debug")
        st.write("See the complete RAG pipeline: Query → Reformulation → Retrieval → Answer")
        query = st.text_input("Query", help="Test the full RAG pipeline end-to-end.")
        user_token = st.text_input("User Token", value="TEST_USER_1", help="Token for auth (use TEST_USER_1 for testing)")

        if st.button("Run Full Pipeline Debug", key="chat_debug_button"):
            if not query:
                st.error("Please enter a query to run the full pipeline debug.")
            elif not user_token:
                st.error("Please provide a user token.")
            else:
                response = make_request("POST", "/documents/debug/full-pipeline", {"query": query})
                if response:
                    st.success("Full pipeline debug completed.")
                    
                    # 1. Original Query
                    st.subheader("1. Original Query")
                    st.code(response.get("original_query", "N/A"))
                    
                    # 2. Reformulated Query
                    st.subheader("2. Reformulated Query")
                    reformulated = response.get("reformulated_query")
                    st.code(reformulated or "No reformulation")
                    if reformulated and reformulated != response.get("original_query"):
                        st.write("✅ Reformulation applied.")
                    else:
                        st.write("❌ No reformulation applied.")
                    
                    # 3. Retrieval Results
                    st.subheader("3. Retrieval Results")
                    retrieval = response.get("retrieval_results", {})
                    tickets = retrieval.get("tickets", [])
                    documents = retrieval.get("documents", [])
                    
                    if tickets or documents:
                        st.write(f"Found {len(tickets)} tickets and {len(documents)} documents:")
                        
                        # Tickets
                        if tickets:
                            st.write("**Tickets:**")
                            for i, ticket in enumerate(tickets, 1):
                                with st.expander(f"Ticket {i} (Score: {ticket['score']:.3f})"):
                                    st.write(ticket["content"])
                        
                        # Documents
                        if documents:
                            st.write("**Documents:**")
                            for i, doc in enumerate(documents, 1):
                                with st.expander(f"Document {i} (Score: {doc['score']:.3f})"):
                                    st.write(doc["content"])
                    else:
                        st.warning("No retrieval results found.")
                    
                    # 4. Final AI Answer
                    st.subheader("4. Final AI Answer")
                    answer = response.get("final_answer")
                    if answer:
                        st.write(answer)
                    else:
                        st.error("No answer generated.")
                    
                    # Raw Debug Data
                    with st.expander("Raw Debug Data"):
                        st.json(response.get("raw_debug", {}))
                else:
                    st.error("Failed to run full pipeline debug.")

# Tickets Section
elif page == "Tickets":
    st.header("Ticket Management")

    tab1, tab2 = st.tabs(["List Tickets", "Delete Ticket"])

    with tab1:
        st.subheader("List Resolved Tickets")
        search = st.text_input("Search by ticket number")
        col1, col2 = st.columns(2)
        with col1:
            skip = st.number_input("Skip", min_value=0, value=0, step=10)
        with col2:
            limit = st.number_input("Limit", min_value=1, max_value=100, value=50, step=10)
        if st.button("Fetch Tickets"):
            params = {"search": search} if search else {}
            params.update({"skip": skip, "limit": limit})
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
