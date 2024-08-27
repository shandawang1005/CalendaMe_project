from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Email, ValidationError, Length
from app.models import User


# Custom validation for checking if a user with the given email already exists
def user_exists(form, field):
    email = field.data
    user = User.query.filter(User.email == email).first()
    if user:
        raise ValidationError("Email address is already in use.")


# Custom validation for checking if a username is already taken
def username_exists(form, field):
    username = field.data
    user = User.query.filter(User.username == username).first()
    if user:
        raise ValidationError("Username is already in use.")


# The SignUpForm class, inheriting from FlaskForm
class SignUpForm(FlaskForm):
    # Username field with custom validation for checking if the username is taken
    username = StringField(
        "Username",
        validators=[DataRequired(message="Username is required."), username_exists],
    )

    # Email field with both validation for email format and uniqueness check
    email = StringField(
        "Email",
        validators=[
            DataRequired(message="Email is required."),
            Email(message="Please enter a valid email address."),
            user_exists,
        ],
    )

    # Password field with validation for required data and minimum length
    password = PasswordField(
        "Password",
        validators=[
            DataRequired(message="Password is required."),
            Length(min=6, message="Password must be at least 6 characters long."),
        ],
    )
