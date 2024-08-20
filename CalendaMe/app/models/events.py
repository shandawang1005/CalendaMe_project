from .db import db
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(255), nullable=True)
    visibility = db.Column(db.String(10), nullable=False)  # 'public' or 'private'
    recurring = db.Column(db.Boolean, default=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    creator = db.relationship('User', back_populates='events')
    participants = db.relationship('Participant', back_populates='event')
    messages = db.relationship('Message', back_populates='event')
