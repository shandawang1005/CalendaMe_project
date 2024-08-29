import os
import boto3
from werkzeug.utils import secure_filename

from flask import Flask, render_template, request, session, redirect
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_login import LoginManager
from flask_socketio import SocketIO, emit, join_room, leave_room

from .models import db, User
from .api.user_routes import user_routes
from .api.auth_routes import auth_routes
from .api.friend_routes import friend_routes
from .api.calendar_routes import calendar_routes
from .api.invitation_routes import invitation_routes
from .api.messages_routes import messages_routes
from .seeds import seed_commands
from .config import Config
from .api.aws_routes import aws_routes
app = Flask(__name__, static_folder="../react-vite/dist", static_url_path="/")

# Setup login manager
login = LoginManager(app)
login.login_view = "auth.unauthorized"


@login.user_loader
def load_user(id):
    return User.query.get(int(id))


# # Setup AWS
# s3 = boto3.client(
#     "s3",
#     aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
#     aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
#     region_name=os.getenv("AWS_REGION"),
# )


# Setup WebSocket (Flask-SocketIO)


socketio = SocketIO(
    app, cors_allowed_origins="*", async_mode="gevent", ping_interval=25
)

# Tell flask about our seed commands
app.cli.add_command(seed_commands)

app.config.from_object(Config)
app.register_blueprint(user_routes, url_prefix="/api/users")
app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(friend_routes, url_prefix="/api/friends")
app.register_blueprint(calendar_routes, url_prefix="/api/calendar")
app.register_blueprint(invitation_routes, url_prefix="/api/invitation")
app.register_blueprint(messages_routes, url_prefix="/api/messages")
app.register_blueprint(aws_routes, url_prefix="/api/aws")

print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")


db.init_app(app)
Migrate(app, db)

# Application Security
CORS(app)


@app.before_request
def https_redirect():
    if os.environ.get("FLASK_ENV") == "production":
        if request.headers.get("X-Forwarded-Proto") == "http":
            url = request.url.replace("http://", "https://", 1)
            code = 301
            return redirect(url, code=code)


@app.after_request
def inject_csrf_token(response):
    response.set_cookie(
        "csrf_token",
        generate_csrf(),
        secure=True if os.environ.get("FLASK_ENV") == "production" else False,
        samesite="Strict" if os.environ.get("FLASK_ENV") == "production" else None,
        httponly=True,
    )
    return response


@app.route("/api/docs")
def api_help():
    """
    Returns all API routes and their doc strings
    """
    acceptable_methods = ["GET", "POST", "PUT", "PATCH", "DELETE"]
    route_list = {
        rule.rule: [
            [method for method in rule.methods if method in acceptable_methods],
            app.view_functions[rule.endpoint].__doc__,
        ]
        for rule in app.url_map.iter_rules()
        if rule.endpoint != "static"
    }
    return route_list


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def react_root(path):
    if path == "favicon.ico":
        return app.send_from_directory("public", "favicon.ico")
    return app.send_static_file("index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")


# WebSocket Events for Chat
user_rooms = {}


@socketio.on("join")
def handle_join(data):
    user_id = data["user_id"]
    room = f"user_{user_id}"
    user_rooms[user_id] = room
    join_room(room)
    emit("joined", {"room": room})


@socketio.on("leave")
def handle_leave(data):
    user_id = data["user_id"]
    room = user_rooms.get(user_id)
    if room:
        leave_room(room)
        del user_rooms[user_id]
        emit("left", {"room": room})


@socketio.on("private_message")
def handle_private_message(data):
    sender_id = data["sender_id"]
    recipient_id = data["recipient_id"]
    message = data["message"]

    if recipient_id in user_rooms:
        room = user_rooms[recipient_id]
        emit("new_message", {"sender_id": sender_id, "message": message}, room=room)


# Run the Flask app with SocketIO Test
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=10000)
