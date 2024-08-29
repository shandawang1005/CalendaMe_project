from .db import db, SCHEMA, environment, add_prefix_for_prod


class SharedFile(db.Model):
    __tablename__ = "shared_files"

    id = db.Column(db.Integer, primary_key=True)
    file_url = db.Column(db.String, nullable=False)
    owner_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    friend_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )

    owner = db.relationship("User", foreign_keys=[owner_id], )
    friend = db.relationship("User", foreign_keys=[friend_id],)
