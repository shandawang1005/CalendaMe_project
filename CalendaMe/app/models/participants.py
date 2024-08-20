from .db import db, SCHEMA, environment, add_prefix_for_prod

# from sqlalchemy.schema import ForeignKey #type: ignore
from sqlalchemy.orm import relationship  # type: ignore
from sqlalchemy.sql import func


class Participant(db.Model):
    __tablename__ = "participants"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

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

    event = db.relationship("Event", back_populates="participants")
    user = db.relationship("User")
