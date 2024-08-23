from .db import db, SCHEMA, environment, add_prefix_for_prod
from sqlalchemy.orm import relationship  # type: ignore
from sqlalchemy.schema import UniqueConstraint  # For unique constraints


class Participant(db.Model):
    __tablename__ = "participants"

    if environment == "production":
        __table_args__ = (
            UniqueConstraint("user_id", "event_id", name="unique_user_event"),
            {"schema": SCHEMA},
        )
    else:
        __table_args__ = (
            UniqueConstraint("user_id", "event_id", name="unique_user_event"),
        )

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("events.id")), nullable=False
    )
    user_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    status = db.Column(
        db.String(20), nullable=False
    )  # 'pending', 'accepted', 'declined'

    # Relationships
    event = db.relationship("Event", back_populates="participants")
    user = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.user.username
            if self.user
            else None,  # Add null check for user relationship
            "event_id": self.event_id,
            "status": self.status,
        }
