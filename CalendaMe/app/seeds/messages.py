from app.models import db, Message
from datetime import datetime, timedelta


def seed_messages():
    # Example: Messages tied to specific appointments
    message1 = Message(
        content="Looking forward to our appointment!",
        sent_at=datetime.now(),
        appointment_id=1,
        sender_id=1,
        event_id=1,
    )
    message2 = Message(
        content="See you then!",
        sent_at=datetime.now(),
        appointment_id=1,
        sender_id=2,
        event_id=1,
    )
    message3 = Message(
        content="Can we reschedule?",
        sent_at=datetime.now(),
        appointment_id=2,
        sender_id=2,
        event_id=2,
    )

    # Add the messages to the session
    db.session.add_all([message1, message2, message3])
    db.session.commit()


def undo_messages():
    db.session.execute("DELETE FROM messages")
    db.session.commit()
