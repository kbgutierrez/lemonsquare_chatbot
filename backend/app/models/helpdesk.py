"""
SQLAlchemy ORM models for the Helpdesk (read-only) database.

These models map to the existing helpdesk schema and should never
be written to by this application.
"""

from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import declarative_base

BaseHelpdesk = declarative_base()


class TicketEvaluation(BaseHelpdesk):
    """Represents a resolved IT support ticket from the helpdesk system."""

    __tablename__ = "tbl_ticket_evaluation"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(15), index=True)
    issue_reported = Column(Text)
    issue_found = Column(Text)
    issue_cause = Column(Text)
    work_done = Column(Text)
    advanced_work_done = Column(Text)
