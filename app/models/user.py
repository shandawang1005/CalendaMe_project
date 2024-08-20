from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from .friends import Friend


class User(db.Model, UserMixin):
    __tablename__ = "users"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    hashed_password = db.Column(db.String(255), nullable=False)

    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {"id": self.id, "username": self.username, "email": self.email}

    # Self-referential relationship: a user can have many friends
    friends = db.relationship(
        "Friend",
        foreign_keys=[Friend.user_id],
        back_populates="user",
        cascade="all, delete-orphan",
    )
    events = db.relationship(
        "Event", back_populates="creator", cascade="all, delete-orphan"
    )
    appointments = db.relationship(
        "Appointment", back_populates="user", cascade="all, delete-orphan"
    )
    messages_sent = db.relationship(
        "Message", back_populates="sender", cascade="all, delete-orphan"
    )
    notifications = db.relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )
