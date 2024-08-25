# Use official Python runtime as the base image
FROM python:3.9.18-alpine3.18

# Install system dependencies needed for building and running the application
RUN apk add --no-cache build-base \
    postgresql-dev gcc python3-dev musl-dev libffi-dev openssl-dev

# Set environment variables passed via ARG
ARG FLASK_APP
ARG FLASK_ENV
ARG DATABASE_URL
ARG SCHEMA
ARG SECRET_KEY

ENV FLASK_APP=${FLASK_APP}
ENV FLASK_ENV=${FLASK_ENV}
ENV DATABASE_URL=${DATABASE_URL}
ENV SCHEMA=${SCHEMA}
ENV SECRET_KEY=${SECRET_KEY}

# Set working directory
WORKDIR /var/www

# Copy over the requirements.txt file and install dependencies
COPY requirements.txt .

# Install dependencies and correct version of eventlet
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir psycopg2 \
    && pip install --no-cache-dir eventlet==0.32.0  # Install stable eventlet version

# Copy the rest of the application code to the container
COPY . .

# Run database migrations and seeding
RUN flask db upgrade
RUN flask seed all

# Expose the port Gunicorn will serve on
EXPOSE 8000

# Run the application using Gunicorn with WebSocket support (via eventlet)
CMD ["gunicorn", "-k", "eventlet", "--bind", "0.0.0.0:8000", "app:app"]
