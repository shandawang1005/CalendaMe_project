from app.models import db, Invitation, environment, SCHEMA
from sqlalchemy.sql import text


def seed_invitations():
    # Invite Bob Brown to the first event (Weekly Standup)
    invitation1 = Invitation(
        event_id=1,
        inviter_id=1,  # Demo is the inviter
        invitee_id=3,  # Bobbie is the invitee
        status="pending",  # Pending invitation
    )

    # Invite Jane Smith to the first event (Weekly Standup)
    invitation2 = Invitation(
        event_id=1,
        inviter_id=1,  # Demo is the inviter
        invitee_id=2,  # marine is the invitee
        status="accepted",  # Jane has already accepted
    )

    db.session.add(invitation1)
    db.session.add(invitation2)
    db.session.commit()


def undo_invitations():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.invitations RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM invitations"))
    db.session.commit()
