from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import User, Friend
from app.models.db import db
from sqlalchemy import or_

user_routes = Blueprint("users", __name__)


@user_routes.route("/")
@login_required
def users():
    """
    Query for all users and returns them in a list of user dictionaries
    """
    users = User.query.all()
    return {"users": [user.to_dict() for user in users]}


@user_routes.route("/<int:id>")
@login_required
def user(id):
    """
    Query for a user by id and returns that user in a dictionary
    """
    user = User.query.get(id)
    return user.to_dict()


@user_routes.route("/search", methods=["GET"])
@login_required
def search_users():
    query = request.args.get("query", "")

    if not query:
        return jsonify({"error": "Search query is required"}), 400

    # Find users that match the search query by username or email
    users = (
        User.query.filter(
            (User.username.ilike(f"%{query}%")) | (User.email.ilike(f"%{query}%"))
        )
        .filter(User.id != current_user.id)
        .all()
    )  # Exclude self

    results = []
    for user in users:
        # Check if the current user and the found user are already friends
        is_friend = (
            Friend.query.filter_by(
                user_id=current_user.id, friend_id=user.id, accepted=True
            ).first()
            or Friend.query.filter_by(
                user_id=user.id, friend_id=current_user.id, accepted=True
            ).first()
        )

        # Check if the current user has sent a friend request to the found user
        request_sent = Friend.query.filter_by(
            user_id=current_user.id, friend_id=user.id, accepted=False
        ).first()

        # Check if the current user has received a friend request from the found user
        request_received = Friend.query.filter_by(
            user_id=user.id, friend_id=current_user.id, accepted=False
        ).first()

        results.append(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "isFriend": is_friend is not None,
                "requestSent": request_sent is not None,
                "requestReceived": request_received is not None,
                "friendshipId": request_received.id if request_received else None,
            }
        )

    return jsonify(results), 200


##This is to cancel the option of being a friend after you send it
@user_routes.route("/cancel_request/<int:friend_id>", methods=["DELETE"])
@login_required
def cancel_friend_request(friend_id):
    # Find the pending friend request where the current user sent the request
    friend_request = Friend.query.filter_by(
        user_id=current_user.id, friend_id=friend_id, accepted=0
    ).first()

    if not friend_request:
        return jsonify({"error": "No pending friend request found"}), 404

    # Delete the pending friend request
    db.session.delete(friend_request)
    db.session.commit()

    return jsonify({"message": "Friend request canceled"}), 200
