from app.models import db, Message, environment, SCHEMA
from datetime import datetime
from sqlalchemy.sql import text


def seed_messages():
    # Example: Messages between friends
    message1 = Message(
        content="Hey, how are you?",
        sent_at=datetime.now(),
        sender_id=1,
        recipient_id=2,
    )
    message2 = Message(
        content="I'm doing well! How about you?",
        sent_at=datetime.now(),
        sender_id=2,
        recipient_id=1,
    )
    message3 = Message(
        content="I'm good too. Want to catch up later?",
        sent_at=datetime.now(),
        sender_id=1,
        recipient_id=2,
    )

    # Add the messages to the session
    db.session.add_all([message1, message2, message3])
    db.session.commit()


def undo_messages():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.messages RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM messages"))

    db.session.commit()
