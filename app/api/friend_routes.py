from flask import request, jsonify, Blueprint
from flask_login import login_required, current_user
from ..models.db import db
from ..models.friends import Friend
from ..models.user import User

friend_routes = Blueprint("friend", __name__)


# Helper function to serialize a user object
def serialize_friend(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }


# Send Friend Request
@friend_routes.route("/request", methods=["POST"])
@login_required
def send_friend_request():
    friend_id = request.json.get("friend_id")
    if not friend_id:
        return jsonify({"error": "Friend ID is required"}), 400

    if current_user.id == friend_id:
        return jsonify({"error": "You cannot send a friend request to yourself"}), 400

    # Check if there's an existing friendship
    existing_friendship = Friend.query.filter_by(
        user_id=current_user.id, friend_id=friend_id
    ).first()

    if existing_friendship:
        return jsonify(
            {"error": "Friend request already sent or user is already a friend"}
        ), 400

    # Create a new friendship request
    new_friendship = Friend(
        user_id=current_user.id,
        friend_id=friend_id,
        accepted=False,  # False indicates pending
    )
    db.session.add(new_friendship)
    db.session.commit()

    # Retrieve the friend user data
    friend_user = User.query.get(friend_id)

    return jsonify(
        {"message": "Friend request sent", "friend": serialize_friend(friend_user)}
    ), 201


# Respond to Friend Request
@friend_routes.route("/<int:friendship_id>/respond", methods=["POST"])
@login_required
def respond_to_friend_request(friendship_id):
    response = request.json.get("response")
    friendship = Friend.query.filter(Friend.friend_id == current_user.id).filter(Friend.user_id == friendship_id).first()

    # Ensure the friendship exists and the current user is the recipient
    if not friendship or friendship.friend_id != current_user.id:
        return jsonify({"error": "Friend request not found"}), 404

    # Ensure the friendship is still pending (accepted == False)
    if friendship.accepted != False:
        return jsonify({"error": "This friend request has already been processed"}), 400

    # Process the response
    if response == "accept":
        friendship.accepted = True  # Accept the friend request
    elif response == "reject":
        db.session.delete(friendship)  # Reject and delete the friend request
    else:
        return jsonify({"error": "Invalid response"}), 400

    db.session.commit()
    return jsonify({"message": f"Friend request {response}ed"}), 200


# Get Friends List
@friend_routes.route("/", methods=["GET"])
@login_required
def get_friends():
    # Query all friendships involving the current user
    friendships = Friend.query.filter(
        (Friend.user_id == current_user.id) | (Friend.friend_id == current_user.id)
    ).all()

    # Create lists for accepted friends and pending requests
    accepted_friends = []
    pending_requests = []

    for f in friendships:
        # Determine whether the current user is the friend or the requester
        if f.accepted == True:  # Friendship accepted
            friend_user = (
                User.query.get(f.friend_id)
                if f.user_id == current_user.id
                else User.query.get(f.user_id)
            )
            accepted_friends.append(serialize_friend(friend_user))
        else:  # Friendship pending
            if f.user_id == current_user.id:
                friend_user = User.query.get(f.friend_id)
                pending_requests.append(
                    {**serialize_friend(friend_user), "isRequestSentByYou": True}
                )
            else:
                friend_user = User.query.get(f.user_id)
                pending_requests.append(
                    {**serialize_friend(friend_user), "isRequestSentByYou": False}
                )

    return jsonify({"accepted": accepted_friends, "pending": pending_requests}), 200


# Cancel Friend Request
@friend_routes.route("/cancel/<int:friend_id>", methods=["DELETE"])
@login_required
def cancel_friend_request(friend_id):
    # Query for the pending friend request where the current user is the one who sent it
    friendship = Friend.query.filter_by(
        user_id=current_user.id, friend_id=friend_id
    ).first()

    if not friendship:
        return jsonify({"error": "Pending friend request not found"}), 404

    # Delete the friend request
    db.session.delete(friendship)
    db.session.commit()

    return jsonify({"message": "Friend request canceled"}), 200


# Remove Friend (Unfriend)
@friend_routes.route("/<int:friend_id>/remove", methods=["DELETE"])
@login_required
def remove_friend(friend_id):
    # Find the friendship where the current user is either the user or the friend
    friendship = Friend.query.filter(
        ((Friend.user_id == current_user.id) & (Friend.friend_id == friend_id))
        | ((Friend.friend_id == current_user.id) & (Friend.user_id == friend_id))
    ).first()

    if not friendship:
        return jsonify({"error": "Friendship not found"}), 404

    # Get the other user's details before deleting
    friend_user = User.query.get(friend_id)

    # Delete the friendship
    db.session.delete(friendship)
    db.session.commit()

    return jsonify(
        {"message": "Friend removed", "friend": serialize_friend(friend_user)}
    ), 200
