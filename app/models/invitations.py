from .db import db


class Invitation(db.Model):
    __tablename__ = "invitations"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    inviter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    invitee_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    status = db.Column(
        db.String(20), default="pending"
    )  # 'pending', 'accepted', 'declined'

    # Relationships
    event = db.relationship("Event", back_populates="invitations")
    inviter = db.relationship("User", foreign_keys=[inviter_id])
    invitee = db.relationship("User", foreign_keys=[invitee_id])

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "inviter_id": self.inviter_id,
            "invitee_id": self.invitee_id,
            "status": self.status,
            "event_title": self.event.title
            if self.event
            else None,  # Optional, depending on your relationship
            "inviter_name": self.inviter.username if self.inviter else None,
            "invitee_name": self.invitee.username if self.invitee else None,
        }
