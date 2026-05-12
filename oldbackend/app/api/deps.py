from app.core.models import SessionHelpdesk, SessionChatbot

def get_helpdesk_db():
    db = SessionHelpdesk()
    try:
        yield db
    finally:
        db.close()

def get_chatbot_db():
    db = SessionChatbot()
    try:
        yield db
    finally:
        db.close()