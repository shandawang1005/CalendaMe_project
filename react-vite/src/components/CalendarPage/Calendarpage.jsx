import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEvents,
  createEvent,
  editEvent,
  deleteEvent,
} from "../../redux/event"; // Import your thunks

const Calendar = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events); // Get events from Redux store
  const currentUser = useSelector((state) => state.session.user); // Assuming you have current user info in your session slice

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    start_time: "",
    end_time: "",
    location: "",
    visibility: "private",
    recurring: false,
  });

  const [editingEventId, setEditingEventId] = useState(null); // Track if we're editing an event

  useEffect(() => {
    dispatch(fetchEvents()); // Fetch events on component mount
  }, [dispatch]);

  // Handle input changes in the form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission for adding or editing events
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingEventId) {
      // Edit event
      dispatch(editEvent(editingEventId, formData)).then(() => {
        setEditingEventId(null); // Clear editing state after submission
      });
    } else {
      // Add new event
      dispatch(createEvent(formData));
    }

    // Reset the form after submission
    setFormData({
      title: "",
      start_time: "",
      end_time: "",
      location: "",
      visibility: "private",
      recurring: false,
    });
  };

  // Handle clicking on an "Edit" button
  const handleEditClick = (event) => {
    setEditingEventId(event.id); // Set the event ID to indicate editing mode
    setFormData({
      title: event.title,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location || "",
      visibility: event.visibility || "private",
      recurring: event.recurring || false,
    });
  };

  // Handle clicking on a "Delete" button
  const handleDeleteClick = (eventId) => {
    console.log(`Deleting event with ID: ${eventId}`);
    dispatch(deleteEvent(eventId));
  };

  return (
    <div>
      <h2>Your Events</h2>

      {/* Display list of events */}
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <div>
              {event.title} - {new Date(event.start_time).toLocaleString()} to{" "}
              {new Date(event.end_time).toLocaleString()}
            </div>
            <button onClick={() => handleEditClick(event)}>Edit</button>

            {/* Show delete button only if the logged-in user is the creator */}
            {currentUser && event.creator_id === currentUser.id && (
              <button onClick={() => handleDeleteClick(event.id)}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Form for adding or editing events */}
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
        <button type="submit">
          {editingEventId ? "Update Event" : "Add Event"}
        </button>
      </form>
    </div>
  );
};

export default Calendar;
