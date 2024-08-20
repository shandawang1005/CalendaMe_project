from .db import db, SCHEMA, environment, add_prefix_for_prod

# from sqlalchemy.schema import ForeignKey #type: ignore
from sqlalchemy.orm import relationship  # type: ignore
from sqlalchemy.sql import func
from datetime import datetime


class Message(db.Model):
    __tablename__ = "messages"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("events.id")), nullable=False
    )
    sender_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    appointment_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod("appointments.id")),
        nullable=False,
    )
    content = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=func.now())

    # Relationships
    event = db.relationship("Event", back_populates="messages")
    sender = db.relationship("User", back_populates="messages_sent")
    appointment = db.relationship("Appointment", back_populates="messages")
