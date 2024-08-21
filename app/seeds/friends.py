from app.models import db, Friend, environment, SCHEMA
from sqlalchemy.sql import text


def seed_friends():
    print("Seeding friends...")
    undo_friends()
    friends_count = db.session.query(Friend).count()
    print(f"Number of friends before seeding: {friends_count}")
    friend1 = Friend(user_id=1, friend_id=2, accepted=True)
    friend2 = Friend(user_id=2, friend_id=3, accepted=True)
    friend3 = Friend(user_id=1, friend_id=3, accepted=False)
    friend4 = Friend(user_id=4, friend_id=1, accepted=False)

    db.session.add_all([friend1, friend2, friend3, friend4])
    db.session.commit()
    friends_count_after = db.session.query(Friend).count()
    print(f"Number of friends after seeding: {friends_count_after}")


def undo_friends():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.friends RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM friends"))
    db.session.commit()
