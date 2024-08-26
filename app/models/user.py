from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from .friends import Friend
from .events import Event  # Import the Event model


class User(db.Model, UserMixin):
    __tablename__ = "users"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    hashed_password = db.Column(db.String(255), nullable=False)

    # Password properties and methods
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

    # Relationship for messages the user has sent
    messages_sent = db.relationship(
        "Message",
        foreign_keys="[Message.sender_id]",
        back_populates="sender",
        cascade="all, delete-orphan",
    )

    # Relationship for messages the user has received
    messages_received = db.relationship(
        "Message",
        foreign_keys="[Message.recipient_id]",
        back_populates="recipient",
        cascade="all, delete-orphan",
    )

    # Relationship for notifications
    notifications = db.relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )

    # Relationship for events the user has created
    events = db.relationship(
        "Event", back_populates="creator", cascade="all, delete-orphan"
    )
