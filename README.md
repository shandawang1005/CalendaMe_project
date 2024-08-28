# CalendaMe  by October Momento.LLC © 2024

## Project Overview

The Calendar Scheduling App is a comprehensive tool that allows users to manage their schedules, connect with friends, and communicate during events. The application is built using Flask for the backend and React for the frontend, providing a robust and user-friendly experience.

## Live Site

[Visit the Calendar Scheduling App](https://calendame.onrender.com)

## Backend Repository (if separate)

[Link to Backend Repository](https://github.com/shandawang1005/CalendaMe_project)

## Summary

The Calendar Scheduling App offers users a full suite of scheduling tools, including event management, friend connections, and real-time chat. The app is designed to be intuitive and accessible, providing users with a seamless way to organize their time and communicate with friends during events.

## Screenshots

![Home Page](/CalendaMe_project/react-vite/public/images/Home.png)
![Calendar View](/CalendaMe_project/react-vite/public/images/SingleDay.png)
![Chat Feature](/CalendaMe_project/react-vite/public/images/Chat.png)

## Technologies Used

- **Frontend:** React, Redux, Socket.IO, CSS3, Html, 
- **Backend:** Flask, SQLAlchemy, SQLite3
- **Deployment:** Render.com
- **Others:** WebSockets for real-time communication, CRON Jobs for keeping the web app alive

## Features

1. **User Authentication System**
   - Users can sign up, log in, log out, and access protected content.
2. **Friend System**
   - Users can search for friends, send friend requests, accept/decline friend requests, view friends, and remove friends.
3. **Calendar/Event CRUD**
   - Users can view, create, edit, and delete events, set event visibility, and manage recurring events.
4. **Scheduling Appointments**
   - Users can create availability slots, request appointments, and manage them.
5. **Real-Time Chat**
   - Users can chat with friends or event participants in real-time.
6. **File Sharing**
   - Users can upload and share files related to events.

## Future Features

- **Recurring Events:** Allow users to create and manage recurring events.
- **Event Reminders:** Automated event reminders via email or SMS.
- **Public Calendars:** Option to make your calendar public for others to view.
- **Google Calendar Integration:** Sync events with Google Calendar.

## Technical Implementation Details

### Event Creation and Validation

- **Frontend:**

  - The event creation form includes validations for title length, start and end times, and participant limits. The frontend ensures that users are guided through an error-free process.

  ```javascript
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    } else if (formData.title.length > 50) {
      newErrors.title = "Title cannot exceed 50 characters.";
    }
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required.";
    }
    if (!formData.end_time) {
      newErrors.end_time = "End time is required.";
    } else if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      newErrors.end_time = "End time must be after start time.";
    }
    return newErrors;
  };
 - The event display on daily event calendar page.Split up 

  ```javascript
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    } else if (formData.title.length > 50) {
      newErrors.title = "Title cannot exceed 50 characters.";
    }
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required.";
    }
    if (!formData.end_time) {
      newErrors.end_time = "End time is required.";
    } else if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      newErrors.end_time = "End time must be after start time.";
    }
    return newErrors;
  };


- **Backend:**
  - Flask handles data validation, storage, and retrieval using SQLAlchemy, ensuring data consistency and security.

### Real-Time Chat

- **WebSocket Implementation:**
  - The app leverages Socket.IO for real-time communication. Users are notified of new messages instantly, and the chat history is efficiently managed in the backend.

### Responsive Design

- **Media Queries:**
  - CSS3 media queries ensure that the application adapts to different screen sizes, providing an optimal user experience on both mobile and desktop devices.

## Challenges Faced

### WebSocket Integration:

- Implementing real-time communication using WebSockets was challenging but rewarding. Ensuring that messages were delivered and displayed correctly across all connected clients required careful consideration.

### Data Validation:

- Balancing between front-end and back-end validations to ensure data integrity while maintaining a responsive user experience was another key challenge.

## Endpoints

### Friend System

**Backend Routes:**

- **GET /api/friends:** Retrieve the list of friends.
- **POST /api/friends/request:** Send a friend request.
- **PUT /api/friends/request/:id:** Accept/decline a friend request.
- **DELETE /api/friends/:id:** Remove a friend.

**Frontend Routes:**

- **/friends:** Manage friends and friend requests.
- **/friends/search:** Search for friends.

### Appointments and Scheduling

**Backend Routes:**

- **POST /api/appointments:** Create a new appointment request.
- **PUT /api/appointments/:id:** Accept/decline an appointment request.
- **GET /api/appointments:** Retrieve scheduled appointments.

**Frontend Routes:**

- **/appointments:** View/manage appointment requests.

### Calendar/Event CRUD

**Backend Routes:**

- **GET /api/events:** Get all user events.
- **POST /api/events:** Create a new event.
- **PUT /api/events/:id:** Update an event.
- **DELETE /api/events/:id:** Delete an event.
- **POST /api/events/:id/recurring:** Create a recurring event.

**Frontend Routes:**

- **/calendar:** View the calendar in various formats.
- **/calendar/new:** Create a new event.
- **/calendar/edit/:id:** Edit an event.
- **/calendar/recurring:** Manage recurring events.

### Notifications

**Backend Routes:**

- **GET /api/notifications:** Retrieve user notifications.
- **PUT /api/notifications/:id/read:** Mark a notification as read.

**Frontend Routes:**

- **/notifications:** View notifications.

### Event Live Chat (Bonus)

**Backend Routes:**

- **GET /api/events/:id/chat:** Fetch chat history.
- **POST /api/events/:id/chat:** Send a chat message.

**Frontend Routes:**

- **/events/:id/chat:** Access live chat.

### File Sharing (Bonus Feature)

**Backend Routes:**

- **POST /api/files:** Upload a file for an event.
- **GET /api/files/:id:** Retrieve a file.
- **DELETE /api/files/:id:** Delete a file.

**Frontend Routes:**

- **/events/:id/files:** Manage event files.

