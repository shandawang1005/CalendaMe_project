from .db import db
from datetime import datetime


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    notification_type = db.Column(
        db.String(50), nullable=False
    )  # 'friend_request', 'appointment_update', etc.
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    read = db.Column(db.Boolean, default=False)

    user = db.relationship("User")
