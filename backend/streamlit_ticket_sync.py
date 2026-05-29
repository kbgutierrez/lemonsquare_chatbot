from pathlib import Path
import sys

# Allow running this script from the backend folder directly.
sys.path.insert(0, str(Path(__file__).resolve().parent))

import streamlit as st
import requests

from app.core.config import settings
from app.core.database import SessionHelpdesk
from app.models.helpdesk import TicketEvaluation


st.set_page_config(page_title="Ticket Sync", layout="centered")

st.title("Resolved Ticket Sync")

with st.form("ticket_form"):
    ticket_number = st.text_input("Ticket Number")
    issue_reported = st.text_area("Issue Reported")
    issue_found = st.text_area("Actual Issue Found")
    issue_cause = st.text_area("Root Cause")
    work_done = st.text_area("Resolution (Work Done)")
    advanced_work_done = st.text_area("Advanced Resolution (optional)")

    submitted = st.form_submit_button("Sync and Save")

if submitted:
    if not ticket_number or not work_done:
        st.error("Please provide at least Ticket Number and Work Done.")
    else:
        payload = {
            "ticket_number": ticket_number,
            "issue_reported": issue_reported or "",
            "issue_found": issue_found or "",
            "issue_cause": issue_cause or "",
            "work_done": work_done or "",
        }

        api_url = f"http://127.0.0.1:8000/api/tickets/sync"
        try:
            resp = requests.post(api_url, json=payload, timeout=10)
            resp.raise_for_status()
            st.success(f"API sync response: {resp.json()}")
        except Exception as exc:
            st.warning(f"API sync failed: {exc}")

        try:
            db = SessionHelpdesk()
            eval_row = TicketEvaluation(
                ticket_number=ticket_number,
                issue_reported=issue_reported or None,
                issue_found=issue_found or None,
                issue_cause=issue_cause or None,
                work_done=work_done or None,
                advanced_work_done=advanced_work_done or None,
            )
            db.add(eval_row)
            db.commit()
            st.success("Saved evaluation to Helpdesk database.")
        except Exception as exc:
            st.error(f"Failed to write to Helpdesk DB: {exc}")
        finally:
            try:
                db.close()
            except Exception:
                pass

st.markdown("---")
st.write("This simple form posts a resolved ticket to the backend ingestion endpoint and attempts to insert the same evaluation into the Helpdesk DB used by the ingestion scripts.")
