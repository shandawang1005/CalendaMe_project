from app.models import db, Participant, environment, SCHEMA


def seed_participants():
    # Clear all participants before seeding
    db.session.execute("DELETE FROM participants")
    db.session.commit()

    # Seed participants with accepted status
    participants = [
        Participant(event_id=1, user_id=1, status="accepted"),
        Participant(event_id=1, user_id=2, status="accepted"),
        Participant(
            event_id=2, user_id=3, status="accepted"
        ),  # Ensure 'accepted' status
    ]

    db.session.add_all(participants)
    db.session.commit()


def undo_participants():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.participants RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute("DELETE FROM participants")
    db.session.commit()
