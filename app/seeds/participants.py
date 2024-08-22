from app.models import db, Participant, environment, SCHEMA


def seed_participants():
    # 添加一些默认的保护措施，确保 status 始终有值
    participant1 = Participant(event_id=1, user_id=1, status="accepted")
    participant2 = Participant(event_id=1, user_id=2, status="accepted")
    participant3 = Participant(event_id=2, user_id=3, status="pending")

    # 确保所有对象都被添加，并且没有空值问题
    participants = [participant1, participant2, participant3]
    for participant in participants:
        if participant.status is None:
            participant.status = "pending"  # 或者你可以设置为其他默认值

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
