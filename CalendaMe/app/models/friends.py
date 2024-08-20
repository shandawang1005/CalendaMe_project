from .db import db


class Friend(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    friend_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    accepted = db.Column(db.Boolean, default=False)

    user = db.relationship("User", foreign_keys=[user_id], back_populates="friends")
    friend = db.relationship("User", foreign_keys=[friend_id])
