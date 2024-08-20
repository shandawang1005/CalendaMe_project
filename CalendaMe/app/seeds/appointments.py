from app.models import db, Appointment
from datetime import datetime, timedelta


def seed_appointments():
    # Example: booking appointments 3, 4, and 5 weeks in the future
    appointment1 = Appointment(
        event_id=1,
        user_id=1,
        start_time=datetime.now() + timedelta(weeks=3),
        end_time=datetime.now() + timedelta(weeks=3, hours=1),
        status="confirmed",
    )
    appointment2 = Appointment(
        event_id=2,
        user_id=2,
        start_time=datetime.now() + timedelta(weeks=4),
        end_time=datetime.now() + timedelta(weeks=4, hours=1),
        status="pending",
    )
    appointment3 = Appointment(
        event_id=1,
        user_id=3,
        start_time=datetime.now() + timedelta(weeks=5),
        end_time=datetime.now() + timedelta(weeks=5, hours=1),
        status="confirmed",
    )

    # Add the appointments to the session
    db.session.add_all([appointment1, appointment2, appointment3])
    db.session.commit()


def undo_appointments():
    db.session.execute("DELETE FROM appointments")
    db.session.commit()
