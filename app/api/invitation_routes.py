from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy.exc import SQLAlchemyError
from app.models import db, Event, User, Invitation, Participant

invitation_routes = Blueprint("invitations", __name__)


# Fetch received invitations
@invitation_routes.route("/received", methods=["GET"])
@login_required
def view_received_invitations():
    try:
        # Fetch invitations where the current user is either the invitee or the inviter
        invitations = Invitation.query.filter(
            (Invitation.invitee_id == current_user.id)
            | (Invitation.inviter_id == current_user.id)
        ).all()

        # Add event details to each invitation's response
        invitations_data = [
            invitation.to_dict_with_event_details() for invitation in invitations
        ]

        return jsonify(invitations_data), 200

    except SQLAlchemyError as e:
        print(f"Error fetching invitations: {e}")
        return jsonify(
            {"error": "Database error occurred while fetching invitations."}
        ), 500


# Send invitations to users
@invitation_routes.route("/send", methods=["POST"])
@login_required
def send_invitations():
    data = request.json
    event_id = data.get("event_id")
    invitee_ids = data.get("invitee_ids")  # List of invitee IDs

    if not event_id or not invitee_ids or not isinstance(invitee_ids, list):
        return jsonify({"error": "Invalid event ID or invitee IDs."}), 400

    event = Event.query.get(event_id)

    # Check if the event exists and if the current user is authorized to invite others
    if not event:
        return jsonify({"error": "Event not found."}), 404
    if event.creator_id != current_user.id:
        return jsonify({"error": "Unauthorized to invite users to this event."}), 403

    invitations = []

    # Loop over invitee_ids and create invitations for each
    for invitee_id in invitee_ids:
        if Invitation.check_time_conflict_for_invitee(
            invitee_id, event.start_time, event.end_time
        ):
            return jsonify(
                {"error": f"Invitee with ID {invitee_id} has a scheduling conflict."}
            ), 409

        # Avoid inviting the same user twice
        existing_invitation = Invitation.query.filter_by(
            event_id=event_id, invitee_id=invitee_id
        ).first()
        if existing_invitation:
            continue

        # Create a new invitation
        invitation = Invitation(
            event_id=event_id,
            inviter_id=current_user.id,
            invitee_id=invitee_id,
            status="pending",
        )
        db.session.add(invitation)
        invitations.append(invitation)

    try:
        db.session.commit()
        return jsonify(
            {
                "message": "Invitations sent successfully.",
                "invitations": [
                    inv.to_dict_with_event_details() for inv in invitations
                ],
            }
        ), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error while sending invitations."}), 500


# Respond to an invitation
@invitation_routes.route("/respond", methods=["POST"])
@login_required
def respond_to_invitation():
    data = request.json
    invitation_id = data.get("invitation_id")
    response = data.get("response")  # 'accepted' or 'declined'

    if not invitation_id or response not in ["accepted", "declined"]:
        return jsonify({"error": "Missing or invalid invitation ID or response."}), 400

    invitation = Invitation.query.get(invitation_id)

    # Check if the invitation exists and is meant for the current user
    if not invitation:
        return jsonify({"error": "Invitation not found."}), 404

    if invitation.invitee_id != current_user.id:
        return jsonify({"error": "Unauthorized to respond to this invitation."}), 403

    # Update the invitation status
    invitation.status = response

    # If the user accepts the invitation, add them as a participant to the event
    if response == "accepted":
        # Ensure the participant isn't already in the event
        existing_participant = Participant.query.filter_by(
            event_id=invitation.event_id, user_id=current_user.id
        ).first()

        if not existing_participant:
            new_participant = Participant(
                user_id=current_user.id,
                event_id=invitation.event_id,
                status="accepted",
            )
            db.session.add(new_participant)

    db.session.commit()

    return jsonify({"message": f"Invitation {response} successfully."}), 200


# Cancel an invitation
@invitation_routes.route("/cancel/<int:invitation_id>", methods=["DELETE"])
@login_required
def cancel_invitation(invitation_id):
    invitation = Invitation.query.get(invitation_id)

    if not invitation:
        return jsonify({"error": "Invitation not found."}), 404

    # Ensure the current user is the inviter
    if invitation.inviter_id != current_user.id:
        return jsonify({"error": "Unauthorized to cancel this invitation."}), 403

    try:
        db.session.delete(invitation)
        db.session.commit()
        return jsonify({"message": "Invitation canceled successfully."}), 200
    except SQLAlchemyError as e:
        print(f"Error deleting invitation: {e}")
        return jsonify({"error": "Error canceling invitation."}), 500
