import streamlit as st
import requests
import json
from typing import List, Dict, Any

# Configuration
API_BASE_URL = "http://localhost:8000/api"

st.set_page_config(page_title="IT Support AI Dashboard", layout="wide")

st.title("IT Support AI Enterprise Dashboard")

# Sidebar for navigation
page = st.sidebar.selectbox("Choose a section", ["Chat", "Documents", "Tickets"])

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
            response = requests.delete(url)

        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"Error {response.status_code}: {response.text}")
            return {}
    except Exception as e:
        st.error(f"Request failed: {str(e)}")
        return {}

# Chat Section
if page == "Chat":
    st.header("AI Chat")

    if "session_id" not in st.session_state:
        st.session_state.session_id = None
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.write(message["content"])

    # Chat input
    if prompt := st.chat_input("Ask me anything about IT support..."):
        # Add user message to history
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.write(prompt)

        # Make API call
        chat_data = {
            "session_id": st.session_state.session_id,
            "message": prompt
        }
        response = make_request("POST", "/chat", chat_data)

        if response:
            st.session_state.session_id = response.get("session_id")
            ai_response = response.get("response", "No response")
            ticket_ids = response.get("ticket_ids_used", [])

            # Add AI response to history
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
                # Convert to dataframe-friendly format
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

st.sidebar.markdown("---")
st.sidebar.markdown("**Note:** Make sure the backend API is running on localhost:8000")