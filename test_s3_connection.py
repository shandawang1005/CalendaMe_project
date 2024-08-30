import boto3
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create an S3 client
s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

# Specify the bucket name you want to test
bucket_name = 'shandabucket'

# Test the S3 connection by listing objects in the specified bucket
try:
    response = s3.list_objects_v2(Bucket=bucket_name)
    print(f"Connected to S3! Objects in {bucket_name}:")
    for obj in response.get('Contents', []):
        print(f"  - {obj['Key']}")
except Exception as e:
    print(f"Error connecting to S3: {e}")
