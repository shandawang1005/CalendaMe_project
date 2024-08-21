from app.models import db, Participant, environment, SCHEMA


def seed_participants():
    participant1 = Participant(event_id=1, user_id=1, status="accepted")
    participant2 = Participant(event_id=1, user_id=2, status="accepted")
    participant3 = Participant(event_id=2, user_id=3, status="pending")

    db.session.add_all([participant1, participant2, participant3])
    db.session.commit()


def undo_participants():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.participants RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute("DELETE FROM participants")
    db.session.commit()
