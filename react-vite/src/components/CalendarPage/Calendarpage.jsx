import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventsForDay,
  deleteEvent,
  removeParticipant,
} from "../../redux/event"; // Import your event thunks
import CreateEditEventModal from "../CreateEditEventModal/CreateEditEventModal"; // Import your modal
import NotificationContainer, {
  useNotification,
} from "../NotificationPage/NotificationContainer"; // Import notification
import { useParams } from "react-router-dom"; // Use to get the date from the URL
import "../DayEvent/DayEvent.css"; // Custom CSS for the timeline

const CalendarPage = () => {
  const dateString = "Sat Aug 24 2024 05:35:20 GMT-0700";
  const dateObject = new Date(dateString);

  // Convert the date object to YYYY-MM-DD format
  const date = dateObject.toISOString().split("T")[0];

  const dispatch = useDispatch();
  const events = useSelector((state) => state.events); // Get events from Redux store
  const currentUser = useSelector((state) => state.session.user); // Get the logged-in user info

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // Track event being edited

  // Notification system hook
  const { addNotification } = useNotification();

  useEffect(() => {
    dispatch(fetchEventsForDay(date)); // Fetch events for the specific day
  }, [dispatch, date]);

  const openCreateEventModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (eventId) => {
    dispatch(deleteEvent(eventId))
      .then(() => {
        dispatch(fetchEventsForDay(date)); // Refresh events after deletion
        addNotification("Event deleted successfully!", "success");
      })
      .catch(() => {
        addNotification("Failed to delete event", "error");
      });
  };

  const handleRemoveParticipant = (eventId, participantId) => {
    dispatch(removeParticipant(eventId, participantId))
      .then(() => {
        dispatch(fetchEventsForDay(date)); // Refresh events after removing participant
        addNotification("Participant removed successfully!", "info");
      })
      .catch(() => {
        addNotification("Failed to remove participant", "error");
      });
  };

  const renderTimeline = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i); // Array from 0 to 23

    return hours.map((hour) => {
      return (
        <div key={hour} className="timeline-hour">
          <div className="timeline-hour-label">
            {hour === 24 ? "00:00" : `${hour.toString().padStart(2, "0")}:00`}
          </div>
          <div className="timeline-hour-events">
            {events
              .filter((event) => new Date(event.start_time).getHours() === hour)
              .map((event) => {
                const startDateTime = new Date(event.start_time);
                const endDateTime = new Date(event.end_time);

                // Calculate the duration of the event in minutes
                const durationMinutes =
                  (endDateTime.getTime() - startDateTime.getTime()) / 60000;

                // Define the height per minute (based on 50px per hour, or 50/60 per minute)
                const heightPerMinute = 50 / 60; // 50px per hour, 60 minutes per hour

                // Calculate the height of the event box based on the duration
                const eventHeight = durationMinutes * heightPerMinute;

                return (
                  <div
                    key={event.id}
                    className="timeline-event"
                    style={{ height: `${eventHeight}px` }} // Set the height dynamically
                  >
                    <div className="event-main">
                      <div className="event-details">
                        <div className="event-title">{event.title}</div>
                        <div className="event-location">
                          Location: {event.location || "N/A"}
                        </div>
                        <div className="event-time">
                          {startDateTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {endDateTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="event-visibility">
                          Meeting Type:{" "}
                          {event.visibility === "private"
                            ? "Private"
                            : "Public"}
                        </div>{" "}
                        {/* Added visibility */}
                      </div>

                      {currentUser && event.creator_id === currentUser.id && (
                        <div className="event-actions-container">
                          <button
                            className="edit-event-button"
                            onClick={() => openEditEventModal(event)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-event-button"
                            onClick={() => handleDeleteClick(event.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="participants-sidebar">
                      <strong>Participants:</strong>
                      <ul className="participants-list">
                        {event.participants && event.participants.length > 0 ? (
                          event.participants.map((participant) => (
                            <li
                              key={participant.id}
                              className="participant-item"
                            >
                              {participant.username}
                              {participant.user_id === event.creator_id ? (
                                <span> (Host)</span>
                              ) : (
                                currentUser.id === event.creator_id && (
                                  <button
                                    className="remove-participant-button"
                                    onClick={() =>
                                      handleRemoveParticipant(
                                        event.id,
                                        participant.user_id
                                      )
                                    }
                                  >
                                    Remove
                                  </button>
                                )
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="participant-item">No participants</li>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="day-event-container">
      <h2>Events for {date}</h2>

      <button onClick={openCreateEventModal}>Create New Event</button>

      <div className="timeline-container">{renderTimeline()}</div>

      <CreateEditEventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingEvent={editingEvent}
      />

      <NotificationContainer />
    </div>
  );
};

export default CalendarPage;
