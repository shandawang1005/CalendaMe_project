import  { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, deleteEvent, removeParticipant } from "../../redux/event"; // Import your event thunks
import CreateEditEventModal from "../CreateEditEventModal/CreateEditEventModal"; // Import your modal
import NotificationContainer, {
  useNotification,
} from "../NotificationPage/NotificationContainer"; // Import notification

const CalendarPage = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events); // Get events from Redux store
  const currentUser = useSelector((state) => state.session.user); // Get the logged-in user info

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // Track event being edited

  // Notification system hook
  const { addNotification } = useNotification();

  useEffect(() => {
    dispatch(fetchEvents()); // Fetch events on component mount
  }, [dispatch]);

  // Open the modal for creating a new event
  const openCreateEventModal = () => {
    setEditingEvent(null); // Clear editing state when creating a new event
    setIsModalOpen(true); // Open the modal
  };

  // Open the modal for editing an event
  const openEditEventModal = (event) => {
    setEditingEvent(event); // Pass the selected event for editing
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  const handleDeleteClick = (eventId) => {
    dispatch(deleteEvent(eventId))
      .then(() => {
        addNotification("Event deleted successfully!", "success");
      })
      .catch(() => {
        addNotification("Failed to delete event", "error");
      });
  };

  const handleRemoveParticipant = (eventId, participantId) => {
    dispatch(removeParticipant(eventId, participantId))
      .then(() => {
        dispatch(fetchEvents());
        addNotification("Participant removed successfully!", "info");
      })
      .catch(() => {
        addNotification("Failed to remove participant", "error");
      });
  };

  return (
    <div>
      <h2>Your Events</h2>

      <button onClick={openCreateEventModal}>Create New Event</button>

      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <div>
              <strong>{event.title}</strong> -{" "}
              {new Date(event.start_time).toLocaleString()} to{" "}
              {new Date(event.end_time).toLocaleString()}
            </div>
            <div>
              Duration:{" "}
              {(new Date(event.end_time) - new Date(event.start_time)) / 60000}{" "}
              minutes
            </div>
            <div>Location: {event.location || "N/A"}</div>

            <div>
              <strong>Participants:</strong>
              <ul>
                {event.participants && event.participants.length > 0 ? (
                  event.participants.map((participant) => (
                    <li key={participant.id}>
                      {participant.username}
                      {participant.user_id === event.creator_id ? (
                        <span> (Host)</span>
                      ) : (
                        currentUser.id === event.creator_id && (
                          <button
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
                  <li>No participants</li>
                )}
              </ul>
            </div>

            {/* Show edit and delete buttons only for event creators */}
            {currentUser && event.creator_id === currentUser.id && (
              <>
                <button onClick={() => openEditEventModal(event)}>Edit</button>
                <button onClick={() => handleDeleteClick(event.id)}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Render the Create/Edit Event Modal */}
      <CreateEditEventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingEvent={editingEvent} // Pass the event to edit (or null to create new)
      />

      {/* Notification System */}
      <NotificationContainer />
    </div>
  );
};

export default CalendarPage;
