from .db import db, SCHEMA, environment, add_prefix_for_prod
from sqlalchemy.orm import relationship
from .events import Event
from .participants import Participant
from datetime import datetime


class Invitation(db.Model):
    __tablename__ = "invitations"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("events.id")), nullable=False
    )
    inviter_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    invitee_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    status = db.Column(
        db.String(20), default="pending"
    )  # 'pending', 'accepted', 'declined'

    # Relationships
    event = db.relationship("Event", back_populates="invitations")
    inviter = db.relationship("User", foreign_keys=[inviter_id])
    invitee = db.relationship("User", foreign_keys=[invitee_id])

    def to_dict_with_event_details(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "event_title": self.event.title,
            "event_start_time": self.event.start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "event_end_time": self.event.end_time.strftime("%Y-%m-%d %H:%M:%S"),
            "event_duration": round(
                (self.event.end_time - self.event.start_time).total_seconds() / 60
            ),  # duration in minutes, rounded
            "location": self.event.location or "N/A",
            "status": self.status,
            "inviter_id": self.inviter_id,
            "inviter_name": self.inviter.username if self.inviter else None,
            "invitee_id": self.invitee_id,
            "invitee_name": self.invitee.username if self.invitee else None,
        }

    @classmethod
    def check_time_conflict_for_invitee(cls, invitee_id, start_time, end_time):
        conflicts = (
            db.session.query(Event)
            .join(Participant)
            .filter(
                Participant.user_id == invitee_id,
                Participant.status == "accepted",
                Event.start_time < end_time,
                Event.end_time > start_time,
            )
            .count()
        )
        return conflicts > 0
