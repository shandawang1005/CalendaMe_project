from app.models import db, Message, environment, SCHEMA
from datetime import datetime


def seed_messages():
    message1 = Message(
        event_id=1,
        user_id=1,
        content="Looking forward to our meeting!",
        timestamp=datetime.utcnow(),
    )
    message2 = Message(
        event_id=1,
        user_id=2,
        content="Same here, see you then!",
        timestamp=datetime.utcnow(),
    )
    message3 = Message(
        event_id=2,
        user_id=2,
        content="Let's meet at the cafe tomorrow.",
        timestamp=datetime.utcnow(),
    )

    db.session.add_all([message1, message2, message3])
    db.session.commit()


def undo_messages():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.messages RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute("DELETE FROM messages")
    db.session.commit()
