from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Event, User, Invitation

invitation_routes = Blueprint("invitations", __name__)


@invitation_routes.route("/received", methods=["GET"])
@login_required
def view_received_invitations():
    try:
        invitations = Invitation.query.filter(
            (Invitation.invitee_id == current_user.id)
            | (Invitation.inviter_id == current_user.id)
        ).all()

        # Convert invitations to JSON using the to_dict method
        return jsonify([invitation.to_dict() for invitation in invitations]), 200
    except Exception as e:
        # Log the error on the server for debugging
        print(f"Error fetching invitations: {e}")
        return jsonify({"error": "Something went wrong"}), 500


@invitation_routes.route("/send", methods=["POST"])
@login_required
def send_invitations():
    data = request.json
    event_id = data.get("event_id")
    invitee_ids = data.get("invitee_ids")  # List of user IDs to invite

    event = Event.query.get(event_id)

    # Check if the event exists and if the current user is authorized to invite others
    if not event or event.creator_id != current_user.id:
        return jsonify({"error": "Unauthorized to invite users to this event."}), 403

    # Send invitations
    for invitee_id in invitee_ids:
        # Avoid inviting the same user twice
        if Invitation.query.filter_by(event_id=event_id, invitee_id=invitee_id).first():
            continue

        invitation = Invitation(
            event_id=event_id,
            inviter_id=current_user.id,
            invitee_id=invitee_id,
            status="pending",
        )
        db.session.add(invitation)

    db.session.commit()
    return jsonify({"message": "Invitations sent successfully."}), 200


##response to invitation
@invitation_routes.route("/respond", methods=["POST"])
@login_required
def respond_to_invitation():
    data = request.json
    invitation_id = data.get("invitation_id")
    response = data.get("response")  # 'accepted' or 'declined'

    invitation = Invitation.query.get(invitation_id)

    # Check if the invitation exists and is meant for the current user
    if not invitation or invitation.invitee_id != current_user.id:
        return jsonify({"error": "Invalid invitation."}), 403

    # Update the invitation status
    if response not in ["accepted", "declined"]:
        return jsonify({"error": "Invalid response."}), 400

    invitation.status = response
    db.session.commit()

    return jsonify({"message": f"Invitation {response} successfully."}), 200


##cancel invitation/ delete
@invitation_routes.route("/cancel/<int:invitation_id>", methods=["DELETE"])
@login_required
def cancel_invitation(invitation_id):
    invitation = Invitation.query.get(invitation_id)

    # Ensure the current user is the inviter
    if invitation.inviter_id != current_user.id:
        return jsonify({"error": "Unauthorized to cancel this invitation."}), 403

    db.session.delete(invitation)
    db.session.commit()

    return jsonify({"message": "Invitation canceled successfully."}), 200
