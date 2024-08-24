import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventsForDay,
  deleteEvent,
  removeParticipant,
} from "../../redux/event";
import CreateEditEventModal from "../CreateEditEventModal/CreateEditEventModal";
import NotificationContainer, {
  useNotification,
} from "../NotificationPage/NotificationContainer";
import { useParams } from "react-router-dom";
import "./DayEvent.css"; // Custom CSS for the timeline

const DayEvent = () => {
  const { date } = useParams();
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events);
  const currentUser = useSelector((state) => state.session.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const { addNotification } = useNotification();

  useEffect(() => {
    dispatch(fetchEventsForDay(date));
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
        dispatch(fetchEventsForDay(date));
        addNotification("Event deleted successfully!", "success");
      })
      .catch(() => {
        addNotification("Failed to delete event", "error");
      });
  };

  const handleRemoveParticipant = (eventId, participantId) => {
    dispatch(removeParticipant(eventId, participantId))
      .then(() => {
        dispatch(fetchEventsForDay(date));
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
            {`${hour.toString().padStart(2, "0")}:00`}
          </div>
          <div className="timeline-hour-events">
            {events
              .filter(
                (event) =>
                  new Date(event.start_time).getHours() === hour ||
                  (new Date(event.start_time).getHours() < hour &&
                    new Date(event.end_time).getHours() >= hour)
              ) // Check for events that cross over into the next hour
              .map((event) => {
                const startDateTime = new Date(event.start_time);
                const endDateTime = new Date(event.end_time);

                // Cap the event at 23:59:59 to prevent overflow into the next day
                const endOfDay = new Date(startDateTime);
                endOfDay.setHours(23, 59, 59, 999);

                const eventEndTime =
                  endDateTime > endOfDay ? endOfDay : endDateTime;
                const durationMinutes =
                  (eventEndTime.getTime() - startDateTime.getTime()) / 60000; // Duration in minutes

                const heightPerMinute = 50 / 60; // 50px per hour, 60 minutes per hour
                const eventHeight = durationMinutes * heightPerMinute;

                // Calculate the top offset based on the event's exact start time within the hour
                const startMinutes = startDateTime.getMinutes();
                const topOffset =
                  (startDateTime.getHours() - hour) * 50 +
                  (startMinutes / 60) * 50; // Convert minutes into pixels

                return (
                  <div
                    key={event.id}
                    className="timeline-event"
                    style={{
                      height: `${eventHeight}px`,
                      top: `${topOffset}px`,
                    }} // Set the height and position dynamically
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
                          {eventEndTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="event-visibility">
                          Meeting Type:{" "}
                          {event.visibility === "private"
                            ? "Private"
                            : "Public"}
                        </div>
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

export default DayEvent;
