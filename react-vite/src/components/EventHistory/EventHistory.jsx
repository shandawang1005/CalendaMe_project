import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, deleteEvent } from "../../redux/event"; // Using the deleteEvent thunk
import { useNotification } from "../NotificationPage/NotificationContainer"; // Import the useNotification hook
import "./EventHistory.css"; // Import CSS for styling

const EventHistory = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events); // Assuming your events are stored in this part of the state
  const currentUser = useSelector((state) => state.session.user);
  const { addNotification } = useNotification(); // Hook to trigger notifications

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchEvents()); // Fetch all events
    }
  }, [dispatch, currentUser]);

  const userEvents = events.filter(
    (event) => event.creator_id === currentUser.id
  );

  const today = new Date();

  // Separate upcoming, past, and ongoing events
  const upcomingEvents = userEvents.filter(
    (event) => new Date(event.start_time) > today
  );
  const pastEvents = userEvents.filter(
    (event) => new Date(event.end_time) < today
  );
  const ongoingEvents = userEvents.filter(
    (event) =>
      new Date(event.start_time) <= today && new Date(event.end_time) >= today
  );

  const handleDelete = async (eventId) => {
    try {
      const response = await dispatch(deleteEvent(eventId));

      // Check if the response exists and contains an error
      if (response?.error) {
        addNotification(response.error, "error");
      } else {
        addNotification("Event deleted successfully", "success");

        // After deletion, re-fetch events to update the UI
        dispatch(fetchEvents());
      }
    } catch (error) {
      // Handle any unexpected errors during the deletion process
      addNotification(
        "An unexpected error occurred while deleting the event",
        "error"
      );
    }
  };
  return (
    <div className="event-history-container">
      <h2 className="event-history-title">Your Event History</h2>

      <div className="ongoing-events">
        <h3 className="section-title">Ongoing Events</h3>
        <ul className="event-list">
          {ongoingEvents.length > 0 ? (
            ongoingEvents.map((event) => (
              <li key={event.id} className="event-item">
                <div className="card">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-details">
                    <strong>Start Time:</strong>{" "}
                    {new Date(event.start_time).toLocaleString()}
                  </p>
                  <p className="event-details">
                    <strong>End Time:</strong>{" "}
                    {new Date(event.end_time).toLocaleString()}
                  </p>
                  <p className="event-details">
                    <strong>Location:</strong> {event.location || "N/A"}
                  </p>
                  <p className="event-details">
                    <strong>Visibility:</strong> {event.visibility}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <p className="inactive">No ongoing events.</p>
          )}
        </ul>
      </div>

      <div className="upcoming-events">
        <h3 className="section-title">Upcoming Events</h3>
        <ul className="event-list">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <li key={event.id} className="event-item">
                <div className="card">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-details">
                    <strong>Start Time:</strong>{" "}
                    {new Date(event.start_time).toLocaleString()}
                  </p>
                  <p className="event-details">
                    <strong>End Time:</strong>{" "}
                    {new Date(event.end_time).toLocaleString()}
                  </p>
                  <p className="event-details">
                    <strong>Location:</strong> {event.location || "N/A"}
                  </p>
                  <p className="event-details">
                    <strong>Visibility:</strong> {event.visibility}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <p className="inactive">No upcoming events.</p>
          )}
        </ul>
      </div>

      <div className="past-events">
        <h3 className="section-title">Past Events</h3>
        <ul className="event-list">
          {pastEvents.length > 0 ? (
            pastEvents.map((event) => (
              <li key={event.id} className="event-item">
                <div className="card">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-details">
                    <strong>Start Time:</strong>{" "}
                    {new Date(event.start_time).toLocaleString()}
                  </p>
                  <p className="event-details">
                    <strong>End Time:</strong>{" "}
                    {new Date(event.end_time).toLocaleString()}
                  </p>
                  <p className="event-details">
                    <strong>Location:</strong> {event.location || "N/A"}
                  </p>
                  <p className="event-details">
                    <strong>Visibility:</strong> {event.visibility}
                  </p>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(event.id)}
                  >
                    Delete Event
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="inactive">No past events.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default EventHistory;
