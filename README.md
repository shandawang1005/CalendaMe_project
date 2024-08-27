# Calendar Scheduling App

## Project Overview

The Calendar Scheduling App is a comprehensive tool that allows users to manage their schedules, connect with friends, and communicate during events. The application is built using Flask for the backend and React for the frontend, providing a robust and user-friendly experience.

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- SQLite3

### Backend Setup

1. Clone the repository and navigate to the backend directory:

   ```bash
   git clone https://github.com/your-repo/calendar-app.git
   cd backend
   ```

2. Install dependencies:

   ```bash
   pipenv install -r requirements.txt
   ```

3. Create a `.env` file based on the example provided, setting up your environment variables, including the SQLite3 database connection URL and other necessary settings.

4. Make sure the SQLite3 database connection URL is configured in the `.env` file.

5. The application uses a schema defined by the `SCHEMA` environment variable. Replace the `SCHEMA` value with a unique name in snake_case.

6. Start the Flask app:

   ```bash
   pipenv shell
   flask db upgrade
   flask seed all
   flask run
   ```

### Frontend Setup

1. Navigate to the `react-vite` directory:

   ```bash
   cd react-vite
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the React frontend:

   ```bash
   npm run build
   ```

   The build process will create a `dist` folder containing the production-ready React code.

4. To run the frontend in development mode:

   ```bash
   npm start
   ```

### Deployment on Render.com

Before deploying, ensure that your `dist` folder is built and up to date. Vite, used for development, will not be included in the production environment.

1. Run the build command:

   ```bash
   npm run build
   ```

2. Push your changes to GitHub, then follow the steps on Render.com to deploy your project.

3. Set up the environment variables on Render.com, including `SECRET_KEY`, `FLASK_ENV`, `FLASK_APP`, `SCHEMA`, and `DATABASE_URL`.

4. Deploy the application by creating a new Web Service on Render.com and selecting the correct repository.

### MVP Feature List

#### 1. Friend System

   - **Search for Friends**: Users can search for other users by username or email.
   - **Send Friend Requests**: Users can send friend requests to connect with other users.
   - **Accept/Decline Friend Requests**: Users can view and accept/decline incoming friend requests.
   - **View Friends List**: Users can see their confirmed friends.

**Backend Routes**:
- **GET /api/friends**: Retrieve list of friends.
- **POST /api/friends/request**: Send a friend request.
- **PUT /api/friends/request/:id**: Accept/decline a friend request.
- **DELETE /api/friends/:id**: Remove a friend.

**Frontend Routes**:
- `/friends`: Manage friends and friend requests.
- `/friends/search`: Search for friends.

#### 2. Appointments and Scheduling

   - **Create Availability Slots**: Users can create time slots for when they are available to meet.
   - **View Available Slots**: Users can view friends' available time slots.
   - **Request Appointments**: Users can request an appointment based on their friend's availability.
   - **Accept/Decline Appointments**: Users can accept or decline appointment requests.
   - **View Appointments**: Users can view all confirmed and pending appointments.

**Backend Routes**:
- **POST /api/appointments**: Create a new appointment request.
- **PUT /api/appointments/:id**: Accept/decline an appointment request.
- **GET /api/appointments**: Retrieve scheduled appointments.

**Frontend Routes**:
- `/appointments`: View/manage appointment requests.

#### 3. Calendar/Event CRUD

   - **Calendar Display**: Users can view their events and appointments in a monthly, weekly, or daily calendar format.
   - **Event Creation**: Users can create events directly from the calendar view.
   - **Edit Events**: Users can click on events to edit details such as time, location, and visibility.
   - **Set Event Visibility**: Users can choose whether an event is public (visible to friends) or private (visible only to them).
   - **Filter Events by Visibility**: Users can filter events by visibility to see public events shared by friends or their private events.
   - **Create Recurring Events**: Users can create events that repeat daily, weekly, or monthly.
   - **Manage Recurring Events**: Users can modify or cancel recurring events.

**Backend Routes**:
- **GET /api/events**: Get all user events.
- **POST /api/events**: Create a new event.
- **PUT /api/events/:id**: Update an event.
- **DELETE /api/events/:id**: Delete an event.
- **POST /api/events/:id/recurring**: Create a recurring event.

**Frontend Routes**:
- `/calendar`: View the calendar in various formats.
- `/calendar/new`: Create a new event.
- `/calendar/edit/:id`: Edit an event.
- `/calendar/recurring`: Manage recurring events.

#### 4. Notifications

   - **Event & Appointment Notifications**: Users receive notifications when an event or appointment is requested, accepted, or canceled.
   - **Friend Request Notifications**: Users receive notifications when they receive a new friend request.

**Backend Routes**:
- **GET /api/notifications**: Retrieve user notifications.
- **PUT /api/notifications/:id/read**: Mark a notification as read.

**Frontend Routes**:
- `/notifications`: View notifications.

#### 5. Event Live Chat (Bonus)

   - **Live Chat**: Users can communicate with other participants during the event via a real-time chat interface.

**Backend Routes**:
- **GET /api/events/:id/chat**: Fetch chat history.
- **POST /api/events/:id/chat**: Send a chat message.

**Frontend Routes**:
- `/events/:id/chat`: Access live chat.

#### 6. File Sharing (Bonus Feature)

   - **File Upload**: Users can upload files to an event for participants to access and download.
   - **File Download**: Participants can view and share important documents or resources related to the event.

**Backend Routes**:
- **POST /api/files**: Upload a file for an event.
- **GET /api/files/:id**: Retrieve a file.
- **DELETE /api/files/:id**: Delete a file.

**Frontend Routes**:
- `/events/:id/files`: Manage event files.
