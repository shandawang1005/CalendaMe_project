from .db import db, SCHEMA, environment, add_prefix_for_prod
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class Message(db.Model):
    __tablename__ = "messages"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    recipient_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    content = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=func.now())

    # Relationships
    sender = db.relationship(
        "User", foreign_keys=[sender_id], back_populates="messages_sent"
    )
    recipient = db.relationship(
        "User", foreign_keys=[recipient_id], back_populates="messages_received"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "sender_id": self.sender_id,
            "recipient_id": self.recipient_id,
            "sent_at": self.sent_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
