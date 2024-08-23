import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEvents,
  createEvent,
  editEvent,
  deleteEvent,
  sendInvitations,
  removeParticipant,
} from "../../redux/event"; // Import your event thunks
import { fetchFriendsListThunk } from "../../redux/friends"; // Thunk to fetch friends

const CalendarPage = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events); // Get events from Redux store
  const currentUser = useSelector((state) => state.session.user); // Get the logged-in user info
  const friends = useSelector((state) => state.friends.accepted); // Get the list of accepted friends

  const [formData, setFormData] = useState({
    title: "",
    start_time: "",
    end_time: "",
    location: "",
    visibility: "private",
    recurring: false,
  });

  const [inviteeIds, setInviteeIds] = useState([]); // Manage invited friend IDs
  const [editingEventId, setEditingEventId] = useState(null); // Track if we're editing an event

  useEffect(() => {
    dispatch(fetchEvents()); // Fetch events on component mount
    dispatch(fetchFriendsListThunk()); // Fetch the list of friends on component mount
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInviteeChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedIds = selectedOptions.map((option) => parseInt(option.value));
    setInviteeIds(selectedIds);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingEventId) {
      // Edit existing event
      dispatch(editEvent(editingEventId, formData)).then((response) => {
        const updatedEvent = response?.event || response;
        if (inviteeIds.length > 0 && updatedEvent?.id) {
          dispatch(sendInvitations(updatedEvent.id, inviteeIds)); // Send invitations after editing
        }
        setEditingEventId(null);
      });
    } else {
      // Create new event
      dispatch(createEvent(formData)).then((response) => {
        const newEvent = response?.event || response;
        if (inviteeIds.length > 0 && newEvent?.id) {
          dispatch(sendInvitations(newEvent.id, inviteeIds)); // Send invitations after creating event
        }
      });
    }

    setFormData({
      title: "",
      start_time: "",
      end_time: "",
      location: "",
      visibility: "private",
      recurring: false,
    });
    setInviteeIds([]); // Reset invitee selection
  };

  const handleEditClick = (event) => {
    setEditingEventId(event.id);
    setFormData({
      title: event.title,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location || "",
      visibility: event.visibility || "private",
      recurring: event.recurring || false,
    });
    setInviteeIds([]); // Clear previous invites when editing
  };

  const handleDeleteClick = (eventId) => {
    dispatch(deleteEvent(eventId));
  };

  const handleRemoveParticipant = (eventId, participantId) => {
    dispatch(removeParticipant(eventId, participantId)).then(() => {
      dispatch(fetchEvents()); // Refetch events to rerender the updated participants list
    });
  };

  // Function to calculate event duration in minutes
  const calculateDurationInMinutes = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.round((end - start) / 60000); // Convert milliseconds to minutes and round
    return duration;
  };

  return (
    <div>
      <h2>Your Events</h2>

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
              {calculateDurationInMinutes(event.start_time, event.end_time)}{" "}
              minutes
            </div>
            <div>Location: {event.location || "N/A"}</div>

            {/* Display Participants */}
            <div>
              <strong>Participants:</strong>
              <ul>
                {event.participants && event.participants.length > 0 ? (
                  event.participants.map((participant) => (
                    <li key={participant.id}>
                      {participant.username}
                      {participant.user_id === event.creator_id ? (
                        <span> (Host)</span> // Show "Host" label if the participant is the event creator
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
                <button onClick={() => handleEditClick(event)}>Edit</button>
                <button onClick={() => handleDeleteClick(event.id)}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <h3>{editingEventId ? "Edit Event" : "Add a New Event"}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Start Time:</label>
          <input
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>End Time:</label>
          <input
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Visibility:</label>
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div>
          <label>Recurring:</label>
          <input
            type="checkbox"
            name="recurring"
            checked={formData.recurring}
            onChange={(e) =>
              setFormData({ ...formData, recurring: e.target.checked })
            }
          />
        </div>

        {/* Invite Friends */}
        <div>
          <label>Invite Friends:</label>
          <select multiple onChange={handleInviteeChange}>
            {friends.map((friend) => (
              <option key={friend.id} value={friend.id}>
                {friend.username}
              </option>
            ))}
          </select>
          <ul>
            {inviteeIds.map((id) => (
              <li key={id}>Friend ID: {id}</li>
            ))}
          </ul>
        </div>

        <button type="submit">
          {editingEventId ? "Update Event" : "Add Event"}
        </button>
      </form>
    </div>
  );
};

export default CalendarPage;
