from app.models import db, Friend, environment, SCHEMA

def seed_friends():
    friend1 = Friend(user_id=1, friend_id=2, accepted=True)
    friend2 = Friend(user_id=2, friend_id=3, accepted=True)
    friend3 = Friend(user_id=1, friend_id=3, accepted=False)

    db.session.add_all([friend1, friend2, friend3])
    db.session.commit()

def undo_friends():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.friends RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM friends")
    db.session.commit()
