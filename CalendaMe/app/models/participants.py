from .db import db


class Participant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    status = db.Column(
        db.String(20), nullable=False
    )  # 'pending', 'accepted', 'declined'

    event = db.relationship("Event", back_populates="participants")
    user = db.relationship("User")
