from flask import Blueprint, request, jsonify
from app.models import User, db
from app.forms import LoginForm
from app.forms import SignUpForm
from flask_login import current_user, login_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash

auth_routes = Blueprint("auth", __name__)


@auth_routes.route("/")
def authenticate():
    if current_user.is_authenticated:
        return current_user.to_dict()
    return {"errors": {"message": "Unauthorized"}}, 401


@auth_routes.route("/login", methods=["POST"])
def login():
    form = LoginForm()
    form["csrf_token"].data = request.cookies["csrf_token"]

    if form.validate_on_submit():
        user = User.query.filter(User.email == form.data["email"]).first()

        # Debugging
        print("Do we get here?")
        print(f"Stored hashed password: {user.hashed_password}")
        print(f"Entered password: {form.data['password']}")

        login_user(user)
        return user.to_dict()

    print(f"Form validation failed. Errors: {form.errors}")
    return form.errors, 401


@auth_routes.route("/logout")
def logout():
    logout_user()
    return {"message": "User logged out"}


@auth_routes.route("/signup", methods=["POST"])
def sign_up():
    try:
        form = SignUpForm()
        form["csrf_token"].data = request.cookies["csrf_token"]

        if form.validate_on_submit():
            user = User(username=form.data["username"], email=form.data["email"])
            user.password = form.data["password"]  # This will hash the password
            db.session.add(user)
            db.session.commit()
            login_user(user)
            return user.to_dict()

        return form.errors, 400

    except Exception as e:
        print(f"Exception during signup: {e}")  # Log the error details
        db.session.rollback()
        return {"error": "An internal server error occurred. Please try again."}, 500


@auth_routes.route("/profile", methods=["GET"])
@login_required
def get_profile():
    user = current_user
    return jsonify(user.to_dict())


@auth_routes.route("/profile", methods=["PUT"])
@login_required
def update_profile():
    data = request.get_json()
    user = current_user
    user.username = data.get("username", user.username)
    user.email = data.get("email", user.email)

    db.session.commit()
    return jsonify(user.to_dict())


@auth_routes.route("/change-password", methods=["POST"])
@login_required
def change_password():
    data = request.get_json()
    old_password = data.get("old_password")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")

    print(f"Old password (plain): {old_password}")
    print(f"Stored hashed password: {current_user.hashed_password}")

    if new_password != confirm_password:
        return jsonify({"error": "New passwords do not match."}), 400

    if not check_password_hash(current_user.hashed_password, old_password):
        return jsonify({"error": "Current password is incorrect."}), 400

    current_user.hashed_password = generate_password_hash(new_password)
    db.session.commit()

    print(f"Updated hashed password: {current_user.hashed_password}")
    return jsonify({"message": "Password changed successfully."}), 200


@auth_routes.route("/unauthorized")
def unauthorized():
    return {"errors": {"message": "Unauthorized"}}, 401
