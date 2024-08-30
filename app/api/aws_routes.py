import os
import boto3
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import SharedFile, db

# Initialize your S3 client
s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)

# Create a Blueprint for AWS-related routes
aws_routes = Blueprint("aws", __name__)


@aws_routes.route("/files", methods=["GET"])
@login_required
def get_files():
    try:
        # Get the friend_id from query parameters
        friend_id = request.args.get("friend_id")

        if not friend_id:
            return jsonify({"error": "Friend ID is required"}), 400

        # Get files owned by the current user and shared with the specified friend
        owned_files = SharedFile.query.filter_by(
            owner_id=current_user.id, friend_id=friend_id
        ).all()

        # Get files owned by the friend and shared with the current user
        received_files = SharedFile.query.filter_by(
            owner_id=friend_id, friend_id=current_user.id
        ).all()

        # Combine the lists
        all_files = owned_files + received_files

        # Prepare the response
        files = [
            {"id": file.id, "file_url": file.file_url, "owner_id": file.owner_id}
            for file in all_files
        ]

        return jsonify({"files": files}), 200

    except Exception as e:
        # Log the error for debugging
        print(f"Error in get_files: {e}")
        return jsonify({"error": "An error occurred while fetching files."}), 500


@aws_routes.route("/upload", methods=["POST"])
def upload_file():
    try:
        # Check if the request contains a file part
        if "file" not in request.files:
            print("No file part in the request")
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]

        # Check if a filename is empty
        if file.filename == "":
            print("No selected file")
            return jsonify({"error": "No selected file"}), 400

        # Secure the filename
        filename = secure_filename(file.filename)
        print(f"Uploading file: {filename}")

        # Upload the file to S3
        s3.upload_fileobj(
            file,
            os.getenv("AWS_S3_BUCKET_NAME"),
            filename,
            ExtraArgs={"ACL": "public-read"},
        )

        # Generate the file URL
        file_url = (
            f"https://{os.getenv('AWS_S3_BUCKET_NAME')}.s3.amazonaws.com/{filename}"
        )
        print(f"File uploaded successfully: {file_url}")

        return jsonify({"file_url": file_url}), 200

    except Exception as e:
        print(f"Error in /upload route: {str(e)}")
        return jsonify({"error": str(e)}), 500


@aws_routes.route("/share", methods=["POST"])
@login_required
def share_file():
    try:
        # Extract data from the request body
        data = request.get_json()
        file_url = data.get("file_url")
        friend_id = data.get("friend_id")

        if not file_url or not friend_id:
            return jsonify({"error": "File URL and Friend ID are required"}), 400

        # Create a new SharedFile record
        shared_file = SharedFile(
            file_url=file_url, owner_id=current_user.id, friend_id=friend_id
        )

        # Save the record in the database
        db.session.add(shared_file)
        db.session.commit()

        return jsonify({"message": "File shared successfully"}), 200

    except Exception as e:
        # Log the error for debugging
        print(f"Error in share_file: {e}")
        return jsonify({"error": "An error occurred while sharing the file."}), 500


@aws_routes.route("/delete", methods=["DELETE"])
@login_required
def delete_file():
    try:
        # Extract the file_id and file_url from the request body
        data = request.get_json()
        file_id = data.get("file_id")
        file_url = data.get("file_url")

        if not file_id or not file_url:
            return jsonify({"error": "File ID and File URL are required"}), 400

        # Find the shared file record in the database
        shared_file = SharedFile.query.filter_by(
            id=file_id, owner_id=current_user.id
        ).first()

        if not shared_file:
            return jsonify(
                {"error": "File not found or you don't have permission to delete it"}
            ), 404

        # Delete the file from S3
        filename = file_url.split("/")[-1]
        s3.delete_object(Bucket=os.getenv("AWS_S3_BUCKET_NAME"), Key=filename)

        # Delete the record from the database
        db.session.delete(shared_file)
        db.session.commit()

        return jsonify({"message": "File deleted successfully"}), 200

    except Exception as e:
        # Log the error for debugging
        print(f"Error in delete_file: {e}")
        return jsonify({"error": "An error occurred while deleting the file."}), 500
