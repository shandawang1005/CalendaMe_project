from .db import db, SCHEMA, environment, add_prefix_for_prod

# from sqlalchemy.schema import ForeignKey #type: ignore
from sqlalchemy.orm import relationship  # type: ignore
from sqlalchemy.sql import func
from datetime import datetime


class Notification(db.Model):
    __tablename__ = "notifications"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    notification_type = db.Column(
        db.String(50), nullable=False
    )  # 'friend_request', 'appointment_update', etc.
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    read = db.Column(db.Boolean, default=False)

    user = db.relationship("User")
