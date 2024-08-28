import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventsForDay } from "../../redux/event";
import CreateEditEventModal from "../CreateEditEventModal/CreateEditEventModal";
import { useNavigate } from "react-router-dom";
import { TfiAngleLeft, TfiAngleRight } from "react-icons/tfi";
import "../DayEvent/DayEvent.css"; // Custom CSS for the timeline

const CalendarPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.session.user);
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);
  const today = new Date();
  const offset = today.getTimezoneOffset(); // Get timezone offset
  const date = new Date(today.getTime() - offset * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events);
  // const navigate = useNavigate(); // Replace useHistory with useNavigate

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      await dispatch(fetchEventsForDay(date));
      setLoading(false); // Stop loading after fetch is complete
    };

    fetchData();
  }, [dispatch, date]);

  const openEditEventModal = (event) => {
    const currentTime = new Date();
    const eventStartTime = new Date(event.start_time);

    // Check if the event has already started
    if (currentTime < eventStartTime) {
      setEditingEvent(event); // Update the event being edited
      setIsModalOpen(true); // Open the modal
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setEditingEvent(null); // Reset the editing event
    dispatch(fetchEventsForDay(date)); // Fetch updated events after closing modal
  };

  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return new Date(year, month - 1, day);
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const handleEarlierDayClick = () => {
    const currentDate = parseDate(date);
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);
    navigate(`/timeline/${formatDate(previousDay)}`);
  };

  const handleNextDayClick = () => {
    const currentDate = parseDate(date);
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    navigate(`/timeline/${formatDate(nextDay)}`);
  };

  const renderTimeline = () => {
    const currentDate = parseDate(date); // Parse the date from the URL
    const hours = Array.from({ length: 24 }, (_, i) => i); // Array from 0 to 23

    return hours.map((hour) => {
      return (
        <div key={hour} className="timeline-hour">
          <div className="timeline-hour-label">
            {`${hour.toString().padStart(2, "0")}:00`}
          </div>
          <div className="timeline-hour-events">
            {events
              .filter((event) => {
                const eventStartDate = new Date(event.start_time);
                const eventEndDate = new Date(event.end_time);

                // Handle single-day events that start and end on the same day
                if (
                  eventStartDate.toDateString() ===
                    currentDate.toDateString() &&
                  eventEndDate.toDateString() === currentDate.toDateString()
                ) {
                  return hour === eventStartDate.getHours();
                }

                // Case 1: Event starts today and ends after today
                if (
                  eventStartDate.toDateString() ===
                    currentDate.toDateString() &&
                  eventEndDate.toDateString() !== currentDate.toDateString()
                ) {
                  return hour === eventStartDate.getHours();
                }

                // Case 2: Event starts before today but ends today
                if (
                  eventStartDate.toDateString() !==
                    currentDate.toDateString() &&
                  eventEndDate.toDateString() === currentDate.toDateString()
                ) {
                  return hour === 0; // Event starts at 00:00 today
                }

                // Case 3: Event spans the entire day
                if (
                  eventStartDate.toDateString() !==
                    currentDate.toDateString() &&
                  eventEndDate.toDateString() !== currentDate.toDateString()
                ) {
                  return hour === 0; // Event spans the entire day, starting at 00:00
                }

                return false; // Event doesn't match today's criteria
              })
              .map((event) => {
                const startDateTime = new Date(event.start_time);
                const endDateTime = new Date(event.end_time);
                const currentTime = new Date();

                let adjustedStartTime = startDateTime;
                let adjustedEndTime = endDateTime;

                // Handle single-day events (no adjustment needed)
                if (
                  startDateTime.toDateString() === currentDate.toDateString() &&
                  endDateTime.toDateString() === currentDate.toDateString()
                ) {
                  // No adjustment necessary
                }

                // Case 1: Event starts today and ends after today
                if (
                  startDateTime.toDateString() === currentDate.toDateString() &&
                  endDateTime.toDateString() !== currentDate.toDateString()
                ) {
                  adjustedEndTime = new Date(startDateTime);
                  adjustedEndTime.setHours(23, 59, 59, 999); // Stop the event at the end of today
                }

                // Case 2: Event starts before today but ends today
                if (
                  startDateTime.toDateString() !== currentDate.toDateString() &&
                  endDateTime.toDateString() === currentDate.toDateString()
                ) {
                  adjustedStartTime = new Date(endDateTime);
                  adjustedStartTime.setHours(0, 0, 0, 0); // Start the event at 00:00 today
                }

                // Case 3: Event spans the entire day
                if (
                  startDateTime.toDateString() !== currentDate.toDateString() &&
                  endDateTime.toDateString() !== currentDate.toDateString()
                ) {
                  adjustedStartTime = new Date(currentDate);
                  adjustedStartTime.setHours(0, 0, 0, 0); // Start the event at 00:00 today
                  adjustedEndTime = new Date(currentDate);
                  adjustedEndTime.setHours(23, 59, 59, 999); // End the event at 23:59:59 today
                }

                const durationMinutes =
                  (adjustedEndTime.getTime() - adjustedStartTime.getTime()) /
                  60000; // Duration in minutes

                const heightPerMinute = 60 / 60; // 60px per hour, 60 minutes per hour
                const eventHeight = durationMinutes * heightPerMinute;

                // Calculate the top offset based on the event's exact start time
                const startMinutes = adjustedStartTime.getMinutes();
                let topOffset = (startMinutes / 60) * 60; // Convert minutes into pixels

                // Adjust for morning vs. afternoon events
                if (adjustedStartTime.getHours() < 12) {
                  topOffset -= 30; // Morning events get a -30px offset
                } else {
                  topOffset = 0; // Afternoon events have no offset
                }

                // Check if the event has already started
                const eventHasStarted = currentTime >= startDateTime;

                return (
                  <div
                    key={event.id}
                    className={`timeline-event ${
                      eventHasStarted ? "event-started" : ""
                    }`}
                    style={{
                      height: `${eventHeight}px`,
                      top: `${topOffset}px`,
                      width: "80%",
                      marginLeft: "10%",
                    }}
                    onClick={() => {
                      if (!eventHasStarted) {
                        openEditEventModal(event);
                      }
                    }} // Only open modal if the event has not started
                  >
                    <div className="event-main">
                      <div className="event-content">
                        <span className="event-title">{event.title}</span>
                        <div className="event-details">
                          <span className="event-location">
                            {event.location || "N/A"}
                          </span>
                          <span className="event-time">
                            {adjustedStartTime.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {adjustedEndTime.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
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
      <div className="navigation-buttons">
        <button
          onClick={handleEarlierDayClick}
          className="navigation-buttons-button"
        >
          <TfiAngleLeft />
        </button>
        <h2>Events for {date}</h2>
        <button
          onClick={handleNextDayClick}
          className="navigation-buttons-button"
        >
          <TfiAngleRight />
        </button>
      </div>
      {loading ? (
        <main>
          <div className="center-loading">
            <div className="lds-roller">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p>Loading...</p>
          </div>
        </main>
      ) : (
        <div className="timeline-container">{renderTimeline()}</div>
      )}
      <CreateEditEventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingEvent={editingEvent}
      />
    </div>
  );
};

export default CalendarPage;
