"""
Backfill RequesterName for existing LearnedChat entries from ChatSession table.
This ensures all resolved chats show the requester name in the admin dashboard.
"""
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.chatbot import LearnedChat, ChatSession

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def backfill_requester_names():
    """Join LearnedChat with ChatSession to backfill RequesterName."""
    
    # Create engine for chatbot DB
    engine = create_engine(settings.DATABASE_URL_CHATBOT)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Find all LearnedChat entries with NULL or empty RequesterName
        learned_chats = db.query(LearnedChat).filter(
            (LearnedChat.RequesterName.is_(None)) |
            (LearnedChat.RequesterName == "")
        ).all()
        
        total = len(learned_chats)
        updated = 0
        
        logger.info(f"Found {total} LearnedChat entries with missing RequesterName")
        
        for chat in learned_chats:
            # Look up the ChatSession by SessionID
            session = db.query(ChatSession).filter(
                ChatSession.SessionID == chat.SessionID
            ).first()
            
            if session and session.RequesterName:
                chat.RequesterName = session.RequesterName
                updated += 1
                logger.info(
                    f"Updated {chat.SessionID[:8]}... -> {session.RequesterName}"
                )
        
        # Commit all changes
        if updated > 0:
            db.commit()
            logger.info(f"\n✅ Successfully updated {updated}/{total} records")
        else:
            logger.info("No updates needed - all RequesterNames are populated")
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error during backfill: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    backfill_requester_names()
