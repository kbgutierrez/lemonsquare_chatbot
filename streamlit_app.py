import streamlit as st
import requests
import pandas as pd
import json

# --- CONFIGURATION ---
st.set_page_config(page_title="BigE Enterprise Dashboard", layout="wide")
API_BASE = "http://localhost:8000/api"

# --- HELPER FUNCTIONS ---
def api_get(endpoint, params=None):
    try:
        res = requests.get(f"{API_BASE}{endpoint}", params=params)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        st.error(f"API GET Error ({endpoint}): {e}")
        return []

def api_post(endpoint, json_data=None, files=None):
    try:
        res = requests.post(f"{API_BASE}{endpoint}", json=json_data, files=files)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        st.error(f"API POST Error ({endpoint}): {e}")
        return None

def api_put(endpoint, json_data):
    try:
        res = requests.put(f"{API_BASE}{endpoint}", json=json_data)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        st.error(f"API PUT Error ({endpoint}): {e}")
        return None

def api_delete(endpoint):
    try:
        res = requests.delete(f"{API_BASE}{endpoint}")
        res.raise_for_status()
        return res.json()
    except Exception as e:
        st.error(f"API DELETE Error ({endpoint}): {e}")
        return None

# --- SIDEBAR NAVIGATION ---
st.sidebar.title("⚙️ AI Admin Dashboard")
page = st.sidebar.radio(
    "Navigation",
    ["Knowledge Explorer", "PDF Documents", "Manual Rules", "AI Self-Knowledge", "Chat Simulator"]
)

st.sidebar.markdown("---")
st.sidebar.caption("Connected to FastAPI backend.")

# ==========================================
# PAGE 1: KNOWLEDGE EXPLORER (The SQL Source of Truth)
# ==========================================
if page == "Knowledge Explorer":
    st.title("🌐 Global Knowledge Explorer")
    st.write("Blazing fast SQL-backed view of everything the AI knows.")

    col1, col2, col3 = st.columns(3)
    with col1:
        doc_type = st.selectbox("Filter by Source", ["All", "official_document", "general_text", "resolved_chat", "helpdesk_ticket"])
    with col2:
        category = st.text_input("Filter by Category (Optional)", placeholder="e.g. Hardware_Guide")
    with col3:
        limit = st.number_input("Limit Results", min_value=10, max_value=500, value=100)

    if st.button("Fetch Knowledge"):
        params = {"limit": limit}
        if doc_type != "All": params["doc_type"] = doc_type
        if category: params["category"] = category
        
        with st.spinner("Fetching from SQL..."):
            data = api_get("/knowledge/explore", params=params)
            if data:
                df = pd.DataFrame(data)
                st.dataframe(df, use_container_width=True, hide_index=True)
            else:
                st.info("No data found for these filters.")


# ==========================================
# PAGE 2: PDF DOCUMENTS (CRUD)
# ==========================================
elif page == "PDF Documents":
    st.title("📄 PDF Document Management")

    tab1, tab2 = st.tabs(["Upload New PDF", "Manage Existing PDFs"])

    with tab1:
        st.subheader("Upload to AI Brain")
        uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")
        cat_input = st.text_input("Category", value="General_IT")
        if st.button("Upload & Embed"):
            if uploaded_file:
                files = {"file": (uploaded_file.name, uploaded_file, "application/pdf")}
                data = {"category": cat_input}
                with st.spinner("Processing & Vectorizing..."):
                    # We use requests directly here because we are sending a file multipart/form-data
                    res = requests.post(f"{API_BASE}/documents/upload", files=files, data=data)
                    if res.status_code == 200:
                        st.success("PDF Uploaded and Vectorized!")
            else:
                st.warning("Please select a file.")

    with tab2:
        st.subheader("Edit or Delete PDFs")
        docs = api_get("/documents")
        if docs:
            doc_options = {d['document_id']: f"{d['file_name']} ({d['category']})" for d in docs}
            selected_doc = st.selectbox("Select Document to Manage", options=doc_options.keys(), format_func=lambda x: doc_options[x])
            
            with st.form("edit_doc_form"):
                new_name = st.text_input("New File Name", value=doc_options[selected_doc].split(" (")[0])
                new_cat = st.text_input("New Category", value=doc_options[selected_doc].split("(")[1].replace(")", ""))
                
                col1, col2 = st.columns(2)
                with col1:
                    if st.form_submit_button("Update Metadata"):
                        res = api_put(f"/documents/{selected_doc}", {"file_name": new_name, "category": new_cat})
                        if res: st.success("Metadata updated in SQL and Qdrant!")
                with col2:
                    if st.form_submit_button("DELETE Document", type="primary"):
                        res = api_delete(f"/documents/{selected_doc}")
                        if res: st.success("Document scrubbed from database.")


# ==========================================
# PAGE 3: MANUAL RULES (CRUD)
# ==========================================
elif page == "Manual Rules":
    st.title("✍️ Manual Knowledge Rules")

    tab1, tab2 = st.tabs(["Add New Rule", "Manage Existing Rules"])

    with tab1:
        with st.form("add_rule_form"):
            r_title = st.text_input("Rule Title")
            r_content = st.text_area("Rule Content")
            r_category = st.text_input("Category", value="General_IT")
            if st.form_submit_button("Add to Brain"):
                res = api_post("/documents/manual", {"title": r_title, "content": r_content, "category": r_category})
                if res: st.success("Rule added!")

    with tab2:
        rules = api_get("/documents/manual")
        if rules:
            # FIX: Use lowercase 'entry_id' and 'title'
            rule_opts = {r['entry_id']: r['title'] for r in rules}
            selected_rule = st.selectbox("Select Rule", options=rule_opts.keys(), format_func=lambda x: rule_opts[x])
            
            # Find the selected rule data using lowercase 'entry_id'
            current_rule = next(r for r in rules if r['entry_id'] == selected_rule)
            
            with st.form("edit_rule_form"):
                # FIX: Use lowercase keys for title, content, and category
                u_title = st.text_input("Title", value=current_rule['title'])
                u_content = st.text_area("Content", value=current_rule['content'])
                u_category = st.text_input("Category", value=current_rule['category'])
                
                col1, col2 = st.columns(2)
                with col1:
                    if st.form_submit_button("Update Rule"):
                        res = api_put(f"/documents/manual/{selected_rule}", {"title": u_title, "content": u_content, "category": u_category})
                        if res: st


# ==========================================
# PAGE 4: AI SELF-KNOWLEDGE (CRUD)
# ==========================================
elif page == "AI Self-Knowledge":
    st.title("🧠 AI Extracted Chats")
    st.write("Manage what the AI has learned from resolved chat sessions.")

    chats = api_get("/knowledge/explore", {"doc_type": "resolved_chat"})
    if chats:
        chat_opts = {c['id']: c['source'] for c in chats}
        selected_chat = st.selectbox("Select Learned Chat", options=chat_opts.keys(), format_func=lambda x: chat_opts[x])
        
        current_chat = next(c for c in chats if c['id'] == selected_chat)
        content_dict = json.loads(current_chat['content'])

        with st.form("edit_chat_form"):
            st.write("Edit AI Hallucinations:")
            u_rep = st.text_area("Issue Reported", value=content_dict.get("Issue Reported", ""))
            u_fnd = st.text_area("Issue Found", value=content_dict.get("Issue Found", ""))
            u_cau = st.text_area("Root Cause", value=content_dict.get("Root Cause", ""))
            u_wrk = st.text_area("Work Done", value=content_dict.get("Work Done", ""))
            
            col1, col2 = st.columns(2)
            with col1:
                if st.form_submit_button("Save Corrections"):
                    payload = {"issue_reported": u_rep, "issue_found": u_fnd, "issue_cause": u_cau, "work_done": u_wrk}
                    res = api_put(f"/self_knowledge/chats/{selected_chat}", payload)
                    if res: st.success("AI Knowledge corrected!")
            with col2:
                if st.form_submit_button("Force AI to Unlearn", type="primary"):
                    res = api_delete(f"/self_knowledge/chats/{selected_chat}")
                    if res: st.success("Chat purged from AI memory.")


# ==========================================
# PAGE 5: CHAT SIMULATOR
# ==========================================
elif page == "Chat Simulator":
    st.title("💬 Chat Simulator")
    
    if "session_id" not in st.session_state:
        st.session_state.session_id = "test-session-" + str(pd.Timestamp.now().timestamp())
        st.session_state.chat_history = []

    st.caption(f"Active Session: {st.session_state.session_id}")

    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if prompt := st.chat_input("Ask the IT Support AI..."):
        st.session_state.chat_history.append({"role": "user", "content": prompt})
        with st.chat_message("user"): st.markdown(prompt)

        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                payload = {
                    "message": prompt,
                    "session_id": st.session_state.session_id,
                    "user_token": "dummy_dev_token"
                }
                res = api_post("/chat", payload)
                if res and "response" in res:
                    st.markdown(res["response"])
                    st.session_state.chat_history.append({"role": "assistant", "content": res["response"]})
                else:
                    st.error("Failed to get response.")