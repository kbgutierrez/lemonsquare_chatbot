"""
SQLAlchemy ORM models for the Chatbot (read/write) database.

WHY models/ imports nothing from services/:
  The original models.py imported fetch_user_details from user_service.py.
  That function was never called inside models.py — the import was
  accidental pollution. ORM models must be pure data definitions.
  They have zero business logic and zero knowledge of services.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import declarative_base, relationship

BaseChatbot = declarative_base()


class ChatSession(BaseChatbot):
    """A conversation session between a user and the AI."""
    __tablename__ = "ChatSession"

    SessionID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    RequesterUserID = Column(BigInteger, nullable=False, default=1)
    
    # --- THE NEWLY DISCOVERED COLUMNS ---
    ChatTitle = Column(String(255))
    StartTime = Column(DateTime, default=datetime.utcnow)
    LastActive = Column(DateTime)
    IsActive = Column(Boolean, default=True)
    RelatedTicketID = Column(String(50))
    IssueSummary = Column(Text)
    ResolutionSummary = Column(Text)
    SessionStatus = Column(String(50), default="Active")

    messages = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
    )


class ChatMessage(BaseChatbot):
    """A single message within a chat session (from user or AI)."""

    __tablename__ = "ChatMessage"

    MessageID = Column(BigInteger, primary_key=True, autoincrement=True)
    SessionID = Column(
        String(36),
        ForeignKey("ChatSession.SessionID", ondelete="CASCADE"),
        nullable=False,
    )
    SenderRole = Column(String(10), nullable=False)  # "user" or "ai"
    MessageContent = Column(Text, nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")


class AIChatbotSetting(BaseChatbot):
    """
    AI configuration row.

    Versioned via IsActive: only one row is active at a time.
    When settings are updated, the current row is deactivated and a
    new row is inserted, preserving the full audit history.
    """

    __tablename__ = "AIChatbot_Settings"

    SettingID = Column(Integer, primary_key=True, autoincrement=True)
    ActiveModel = Column(String(100), nullable=False)
    ReformulatorModel = Column(String(100))
    SystemPrompt = Column(Text, nullable=False)
    ReformulatorPrompt = Column(Text)
    Temperature = Column(Numeric(3, 2))
    ConfidenceThreshold = Column(Numeric(4, 2))
    EmbeddingModel = Column(String(100))
    RerankerModel = Column(String(100))
    TopK_Tickets = Column(Integer)
    UseReformulator = Column(Boolean, default=True)
    UseReranker = Column(Boolean, default=True)
    ChatExtractionPrompt = Column(Text)
    AllowedCategories = Column(
        String(500),
        default=(
            "Network_Infrastructure,Hardware_Guide,Software_Documentation,"
            "HR_IT_Policy,Troubleshooting_Manual,General_IT"
        ),
    )
    IsActive = Column(Boolean, default=True)
    CreatedDate = Column(DateTime, default=datetime.utcnow)
    UpdatedBy = Column(BigInteger)


class UploadedDocument(BaseChatbot):
    """Metadata record for a PDF document that has been ingested into the vector store."""

    __tablename__ = "tbl_uploaded_documents"

    DocumentID = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    FileName = Column(String(255), nullable=False)
    Category = Column(String(100), nullable=False)
    ChunkCount = Column(Integer, nullable=False)
    UploadedAt = Column(DateTime, default=datetime.utcnow)
    UploadedBy = Column(BigInteger, default=1)
    IsActive = Column(Boolean, default=True)


class BlacklistedTicket(BaseChatbot):
    """Ticket numbers that have been manually excluded from the AI knowledge base."""

    __tablename__ = "tbl_blacklisted_tickets"

    TicketNumber = Column(String(15), primary_key=True)
    BlacklistedAt = Column(DateTime, default=datetime.utcnow)
    BlacklistedBy = Column(BigInteger, default=1)


class ManualKnowledgeEntry(BaseChatbot):
    """Metadata and content record for manually typed knowledge base rules."""

    __tablename__ = "tbl_manual_knowledge"

    EntryID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Title = Column(String(255), nullable=False)
    Content = Column(Text, nullable=False)
    Category = Column(String(100), nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    CreatedBy = Column(BigInteger, default=1)
    IsActive = Column(Boolean, default=True)



class LearnedChat(BaseChatbot):
    """Structured knowledge extracted by the AI from resolved chats."""

    __tablename__ = "tbl_learned_chats"

    SessionID = Column(String(36), primary_key=True)
    IssueReported = Column(Text)
    IssueFound = Column(Text)
    RootCause = Column(Text)
    WorkDone = Column(Text)
    LearnedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    IsActive = Column(Boolean, default=True)



class KnowledgeClusterMap(BaseChatbot):
    """
    Maps a source record (ticket/manual/chat/pdf) to its canonical Qdrant cluster.
    This keeps update/delete flows stable even when multiple SQL rows merge into
    one semantic cluster in Qdrant.
    """

    __tablename__ = "tbl_knowledge_cluster_map"

    SourceID = Column(String(64), primary_key=True)     # ticket number / entry id / session id / document id
    SourceType = Column(String(50), nullable=False)     # ticket | manual | chat | pdf
    ClusterID = Column(String(64), nullable=False, index=True)
    ClusterKey = Column(String(128), nullable=False, index=True)
    IsActive = Column(Boolean, default=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)



class TicketRoutingLog(BaseChatbot):
    """
    Telemetry log for the AI Routing Engine.
    Tracks what the AI predicted, why it predicted it, and if a human had to fix it.
    """
    __tablename__ = "tbl_ticket_routing_log"

    LogID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # The raw input
    InputSummary = Column(String(500), nullable=False)
    InputDescription = Column(Text, nullable=False)
    
    # The AI's Prediction
    PredictedDepartment = Column(String(100))
    PredictedSubcategory = Column(String(100))
    ConfidenceScore = Column(Numeric(4, 3)) # e.g., 0.985
    LLMReasoning = Column(Text)             # The explainability payload
    
    # The "Continuous Learning" Loop
    IsHumanOverridden = Column(Boolean, default=False)
    FinalDepartment = Column(String(100))   # Filled in later if a human corrects it
    FinalSubcategory = Column(String(100))
    
    CreatedAt = Column(DateTime, default=datetime.utcnow)