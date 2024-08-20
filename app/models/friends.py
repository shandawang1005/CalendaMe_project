from .db import db, SCHEMA, environment, add_prefix_for_prod

# from sqlalchemy.schema import ForeignKey #type: ignore
from sqlalchemy.orm import relationship  # type: ignore
from sqlalchemy.sql import func


class Friend(db.Model):
    __tablename__ = "friends"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    friend_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    accepted = db.Column(db.Boolean, default=False)

    user = db.relationship("User", foreign_keys=[user_id], back_populates="friends")
    friend = db.relationship("User", foreign_keys=[friend_id])
