from app.models import db, Event, environment, SCHEMA
from datetime import datetime, timedelta


def seed_events():
    event1 = Event(
        title="Meeting",
        start_time=datetime.utcnow() + timedelta(weeks=4),
        end_time=datetime.utcnow() + timedelta(weeks=4) + timedelta(hours=1),
        location="Office",
        visibility="public",
        creator_id=1,
    )
    event2 = Event(
        title="Lunch",
        start_time=datetime.utcnow() + timedelta(weeks=4) + timedelta(days=1),
        end_time=datetime.utcnow() + timedelta(weeks=4) + timedelta(days=1, hours=1),
        location="Cafe",
        visibility="private",
        creator_id=2,
    )

    db.session.add_all([event1, event2])
    db.session.commit()


def undo_events():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.events RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM events")
    db.session.commit()
