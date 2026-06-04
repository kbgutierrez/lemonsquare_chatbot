"""
SQLAlchemy ORM models for the Chatbot (read/write) database.
"""
import uuid
from datetime import datetime, timezone
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
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship

BaseChatbot = declarative_base()


class ChatSession(BaseChatbot):
    __tablename__ = "ChatSession"
    SessionID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    RequesterUserID = Column(BigInteger, nullable=False)
    RequesterName = Column(String(150))
    ChatTitle = Column(String(255))
    StartTime = Column(DateTime, default=lambda: datetime.now(timezone.utc))
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
    __tablename__ = "ChatMessage"
    MessageID = Column(BigInteger, primary_key=True, autoincrement=True)
    SessionID = Column(
        String(36),
        ForeignKey("ChatSession.SessionID", ondelete="CASCADE"),
        nullable=False,
    )
    SenderRole = Column(String(10), nullable=False)
    SenderName = Column(String(150))
    MessageContent = Column(Text, nullable=False)
    CreatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    session = relationship("ChatSession", back_populates="messages")


class AIChatbotSetting(BaseChatbot):
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
    UseReranker = Column(Boolean, default=False)
    ChatExtractionModel = Column(String(100))
    ChatExtractionPrompt = Column(Text)
    AllowedCategories = Column(
        String(500),
        default=(
            "General, Policies, Procedures, Software, Hardware, Network"
        ),
    )
    IsActive = Column(Boolean, default=True)
    CreatedDate = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    UpdatedBy = Column(BigInteger)
    UpdatedByUsername = Column(String(150))

    EscalationDraftModel = Column(String(100))
    EscalationDraftPrompt = Column(Text)

    RoutingModel = Column(String(100))
    RoutingPrompt = Column(Text)

    DocumentClassifierModel = Column(String(100))
    DocumentClassifierPrompt = Column(Text)

    ConversationResolutionModel = Column(String(100))
    ConversationResolutionPrompt = Column(Text)

    AIName = Column(String(100), nullable=False, default="Cheesecake AI")

    BubbleTheme = Column(String(50), default="lemon-square")
    HeaderGradientEnabled = Column(Boolean, default=True)
    CustomHeaderGradientStart = Column(String(7), default="#7BE38E")
    CustomHeaderGradientEnd = Column(String(7), default="#5dd87a")
    CustomAccent = Column(String(7), default="#22c55e")
    CustomWindowBg = Column(String(7), default="#f6fff7")


class UserThemePreference(BaseChatbot):
    __tablename__ = "UserThemePreferences"
    PreferenceID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(BigInteger, nullable=False, unique=True)
    BubbleTheme = Column(String(50), default="lemon-square")
    HeaderGradientEnabled = Column(Boolean, default=True)
    CustomHeaderGradientStart = Column(String(7), default="#7BE38E")
    CustomHeaderGradientEnd = Column(String(7), default="#5dd87a")
    CustomAccent = Column(String(7), default="#22c55e")
    CustomWindowBg = Column(String(7), default="#f6fff7")
    UpdatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("UserID", name="UQ_UserThemePreferences_UserID"),
    )


class UploadedDocument(BaseChatbot):
    __tablename__ = "tbl_uploaded_documents"
    DocumentID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    FileName = Column(String(255), nullable=False, unique=True)
    Category = Column(String(100), nullable=False)
    ChunkCount = Column(Integer, nullable=False)
    UploadedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    UploadedBy = Column(BigInteger)
    UploadedByUsername = Column(String(150))
    UpdatedAt = Column(DateTime, onupdate=lambda: datetime.now(timezone.utc))
    UpdatedBy = Column(BigInteger)
    UpdatedByUsername = Column(String(150))
    IsActive = Column(Boolean, default=True)


class BlacklistedTicket(BaseChatbot):
    __tablename__ = "tbl_blacklisted_tickets"
    TicketNumber = Column(String(15), primary_key=True)
    BlacklistedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    BlacklistedBy = Column(BigInteger)


class ManualKnowledgeEntry(BaseChatbot):
    __tablename__ = "tbl_manual_knowledge"
    EntryID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Title = Column(String(255), nullable=False)
    Content = Column(Text, nullable=False)
    Category = Column(String(100), nullable=False)
    CreatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    UpdatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    CreatedBy = Column(BigInteger)
    CreatedByUsername = Column(String(150))
    UpdatedBy = Column(BigInteger)
    UpdatedByUsername = Column(String(150))
    IsActive = Column(Boolean, default=True)


class LearnedChat(BaseChatbot):
    __tablename__ = "tbl_learned_chats"
    SessionID = Column(String(36), primary_key=True)
    UserID = Column(BigInteger)
    RequesterName = Column(String(150))
    IssueReported = Column(Text)
    IssueFound = Column(Text)
    RootCause = Column(Text)
    WorkDone = Column(Text)
    LearnedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    UpdatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    IsActive = Column(Boolean, default=True)


class KnowledgeClusterMap(BaseChatbot):
    __tablename__ = "tbl_knowledge_cluster_map"
    SourceID = Column(String(64), primary_key=True)
    SourceType = Column(String(50), nullable=False)
    ClusterID = Column(String(64), nullable=False, index=True)
    ClusterKey = Column(String(128), nullable=False, index=True)
    IsActive = Column(Boolean, default=True)
    CreatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    UpdatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class TicketRoutingLog(BaseChatbot):
    __tablename__ = "tbl_ticket_routing_log"
    LogID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    InputSummary = Column(String(500), nullable=False)
    InputDescription = Column(Text, nullable=False)
    PredictedDepartment = Column(String(100))
    PredictedSubcategory = Column(String(100))
    ConfidenceScore = Column(Numeric(4, 3))
    LLMReasoning = Column(Text)
    IsHumanOverridden = Column(Boolean, default=False)
    FinalDepartment = Column(String(100))
    FinalSubcategory = Column(String(100))
    CreatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class IngestionSyncState(BaseChatbot):
    __tablename__ = "tbl_ingestion_sync_state"
    EntityKey = Column(String(256), primary_key=True)
    EntityType = Column(String(50), nullable=False)
    ContentHash = Column(String(64), nullable=False)  # CHAR(64) effectively
    LastSyncedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))