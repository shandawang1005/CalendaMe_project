from .db import db, SCHEMA, environment, add_prefix_for_prod
from datetime import datetime
from sqlalchemy.orm import relationship  # type: ignore
from sqlalchemy.sql import func


class Appointment(db.Model):
    __tablename__ = "appointments"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("events.id")), nullable=False
    )
    user_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    status = db.Column(
        db.String(20), nullable=False
    )  # 'pending', 'confirmed', 'cancelled'

    # Relationships
    event = db.relationship("Event", back_populates="appointments")
    user = db.relationship("User", back_populates="appointments")
    messages = db.relationship("Message", back_populates="appointment")
