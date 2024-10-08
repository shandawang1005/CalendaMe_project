# Use official Python runtime as the base image
FROM python:3.9.18-alpine3.18

# Install system dependencies needed for building and running the application
RUN apk add --no-cache build-base \
    postgresql-dev gcc python3-dev musl-dev libffi-dev openssl-dev

# Set working directory
WORKDIR /var/www

# Copy over the requirements.txt file and install dependencies
COPY requirements.txt .

# Install dependencies including gevent instead of eventlet
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir psycopg2 \
    && pip install --no-cache-dir gevent

# Copy the rest of the application code to the container
COPY . .

# Command to run Flask migrations and seed data at startup
CMD flask db upgrade && flask seed all && gunicorn -k gevent --bind 0.0.0.0:$PORT app:app
