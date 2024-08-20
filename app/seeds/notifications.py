# app/notifications.py
from app.models import db, Notification


def seed_notifications():
    # Example notifications
    notification1 = Notification(
        user_id=1,
        content="You have a pending friend request from User3.",
        notification_type="friend_request",
    )
    notification2 = Notification(
        user_id=3,
        notification_type="friend_request",
        content="User1 has not yet accepted your friend request.",
    )

    # Add the notifications to the session
    db.session.add_all([notification1, notification2])
    db.session.commit()


def undo_notifications():
    db.session.execute("DELETE FROM notifications")
    db.session.commit()
