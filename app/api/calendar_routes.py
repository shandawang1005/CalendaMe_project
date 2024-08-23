from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import db, Event, Participant, Invitation
from datetime import datetime

calendar_routes = Blueprint("calendar", __name__)


## Helper function to check for time conflicts
def has_time_conflict(user_id, start_time, end_time, event_id=None):
    conflicts = (
        db.session.query(Event)
        .join(Participant)
        .filter(
            Participant.user_id == user_id,
            Participant.status == "accepted",
            Event.start_time < end_time,
            Event.end_time > start_time,
            Event.id != event_id,  # Exclude the current event when editing
        )
        .count()
    )
    return conflicts > 0


## Get events for the logged-in user, either as a participant or as a creator
@calendar_routes.route("/", methods=["GET"])
@login_required
def get_events():
    events = (
        db.session.query(Event)
        .join(Participant)
        .filter(
            (Participant.user_id == current_user.id) & (Participant.status == "accepted")
        )
        .all()
    )

    return jsonify([event.to_dict() for event in events]), 200


## Add an event with conflict and validation checks
@calendar_routes.route("/add", methods=["POST"])
@login_required
def add_event():
    data = request.json

    title = data.get("title")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    location = data.get("location", None)
    visibility = data.get("visibility", "private")
    recurring = data.get("recurring", False)

    # Validate required fields
    if not title or not start_time or not end_time:
        return jsonify({"error": "Title, start time, and end time are required fields."}), 400

    # Validate start and end times
    try:
        start_time = datetime.fromisoformat(start_time)
        end_time = datetime.fromisoformat(end_time)
    except ValueError:
        return jsonify({"error": "Invalid date format."}), 400

    if start_time >= end_time:
        return jsonify({"error": "Start time must be before end time."}), 400

    # Check for time conflicts
    if has_time_conflict(current_user.id, start_time, end_time):
        return jsonify({"error": "This event conflicts with another event."}), 409

    # Create the new event
    new_event = Event(
        title=title,
        start_time=start_time,
        end_time=end_time,
        location=location,
        visibility=visibility,
        recurring=recurring,
        creator_id=current_user.id,
    )

    db.session.add(new_event)
    db.session.commit()

    # Add the current user as a participant
    participant = Participant(
        user_id=current_user.id, event_id=new_event.id, status="accepted"
    )
    db.session.add(participant)
    db.session.commit()

    return jsonify({"message": "Event added successfully!", "event": new_event.to_dict()}), 201


## Edit an event with conflict and validation checks
@calendar_routes.route("/edit/<int:event_id>", methods=["PUT"])
@login_required
def edit_event(event_id):
    data = request.json
    event = Event.query.get(event_id)

    if event is None:
        return jsonify({"error": "Event not found."}), 404

    if event.creator_id != current_user.id:
        return jsonify({"error": "Unauthorized."}), 403

    title = data.get("title", event.title)
    start_time = data.get("start_time", event.start_time)
    end_time = data.get("end_time", event.end_time)
    location = data.get("location", event.location)
    visibility = data.get("visibility", event.visibility)
    recurring = data.get("recurring", event.recurring)

    # Validate start and end times
    try:
        start_time = datetime.fromisoformat(start_time)
        end_time = datetime.fromisoformat(end_time)
    except ValueError:
        return jsonify({"error": "Invalid date format."}), 400

    if start_time >= end_time:
        return jsonify({"error": "Start time must be before end time."}), 400

    # Check for time conflicts
    if has_time_conflict(current_user.id, start_time, end_time, event_id):
        return jsonify({"error": "This event conflicts with another event."}), 409

    # Update the event
    event.title = title
    event.start_time = start_time
    event.end_time = end_time
    event.location = location
    event.visibility = visibility
    event.recurring = recurring

    db.session.commit()

    return jsonify({"message": "Event updated successfully!", "event": event.to_dict()}), 200


## Delete event
@calendar_routes.route("/delete/<int:event_id>", methods=["DELETE"])
@login_required
def delete_event(event_id):
    event = Event.query.get(event_id)

    if event is None:
        return jsonify({"error": "Event not found"}), 404

    # Check if the logged-in user is the creator
    if event.creator_id != current_user.id:
        return jsonify({"error": "Unauthorized. Only the event creator can delete the event."}), 403

    # Delete the event
    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": "Event deleted successfully!"}), 200


## Remove participant if host
@calendar_routes.route("/<int:event_id>/remove-participant/<int:participant_id>", methods=["DELETE"])
@login_required
def remove_participant(event_id, participant_id):
    event = Event.query.get(event_id)

    if event is None:
        return jsonify({"error": "Event not found"}), 404

    # Ensure the current user is the creator of the event
    if event.creator_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    # Prevent the event creator from removing themselves
    if event.creator_id == participant_id:
        return jsonify({"error": "You cannot remove yourself as the creator of the event."}), 403

    # Find the participant to remove
    participant = Participant.query.filter_by(event_id=event_id, user_id=participant_id).first()

    if not participant:
        return jsonify({"error": "Participant not found"}), 404

    # Remove the participant
    db.session.delete(participant)

    # Also remove the corresponding invitation, if it exists
    invitation = Invitation.query.filter_by(event_id=event_id, invitee_id=participant_id).first()
    if invitation:
        db.session.delete(invitation)

    db.session.commit()

    return jsonify({"message": "Participant and corresponding invitation removed successfully!"}), 200
