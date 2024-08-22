from .db import db, SCHEMA, environment, add_prefix_for_prod
from sqlalchemy.orm import relationship  # type: ignore
from sqlalchemy.sql import func


class Event(db.Model):
    __tablename__ = "events"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(255), nullable=True)
    visibility = db.Column(db.String(10), nullable=False)  # 'public' or 'private'
    recurring = db.Column(db.Boolean, default=False)
    creator_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )

    # Relationships
    creator = db.relationship("User", back_populates="events")
    participants = db.relationship(
        "Participant", back_populates="event", cascade="all, delete-orphan"
    )
    messages = db.relationship(
        "Message", back_populates="event", cascade="all, delete-orphan"
    )
    appointments = db.relationship(
        "Appointment", back_populates="event", cascade="all, delete-orphan"
    )
    invitations = db.relationship(
        "Invitation", back_populates="event", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "start_time": self.start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": self.end_time.strftime("%Y-%m-%d %H:%M:%S"),
            "location": self.location,
            "visibility": self.visibility,
            "recurring": self.recurring,
            "creator_id": self.creator_id,
            # You may also add participants if needed, but you would need to convert them to a dict format
        }
