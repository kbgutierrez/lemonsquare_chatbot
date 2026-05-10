import uuid
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, BigInteger, Numeric
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from app.core.config import settings

# Engines
engine_helpdesk = create_engine(settings.HELPDESK_DB_CONN)
SessionHelpdesk = sessionmaker(autocommit=False, autoflush=False, bind=engine_helpdesk)
BaseHelpdesk = declarative_base()

engine_chatbot = create_engine(settings.CHATBOT_DB_CONN)
SessionChatbot = sessionmaker(autocommit=False, autoflush=False, bind=engine_chatbot)
BaseChatbot = declarative_base()

# Helpdesk Models (Read-Only)
class TicketEvaluation(BaseHelpdesk):
    __tablename__ = "tbl_ticket_evaluation" 
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(15), index=True)
    issue_reported = Column(Text)
    issue_found = Column(Text)
    issue_cause = Column(Text)
    work_done = Column(Text)
    advanced_work_done = Column(Text)

# Chatbot Models (Read/Write)
class ChatSession(BaseChatbot):
    __tablename__ = "ChatSession" 
    SessionID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    RequesterUserID = Column(BigInteger, nullable=False, default=1)
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(BaseChatbot):
    __tablename__ = "ChatMessage" 
    MessageID = Column(BigInteger, primary_key=True, autoincrement=True)
    SessionID = Column(String(36), ForeignKey("ChatSession.SessionID", ondelete="CASCADE"), nullable=False)
    SenderRole = Column(String(10), nullable=False) 
    MessageContent = Column(Text, nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
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
    UseReranker = Column(Boolean, default=True)
    
    # ---> NEW: Admin Configuration <---
    AllowedCategories = Column(String(500), default="Network_Infrastructure,Hardware_Guide,Software_Documentation,HR_IT_Policy,Troubleshooting_Manual,General_IT")
    
    IsActive = Column(Boolean, default=True)
    CreatedDate = Column(DateTime, default=datetime.utcnow)
    UpdatedBy = Column(BigInteger)

# ---> NEW: Admin Tracking for Uploaded Documents <---
class UploadedDocument(BaseChatbot):
    __tablename__ = "tbl_uploaded_documents"
    
    DocumentID = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    FileName = Column(String(255), nullable=False)
    Category = Column(String(100), nullable=False)
    ChunkCount = Column(Integer, nullable=False)
    UploadedAt = Column(DateTime, default=datetime.utcnow)
    UploadedBy = Column(BigInteger, default=1) 
    IsActive = Column(Boolean, default=True)