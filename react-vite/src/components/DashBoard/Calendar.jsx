import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchEventsForMonth } from "../../redux/event";
import "./Calendar.css";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events);
  const navigate = useNavigate();

  // Fetch events whenever the month changes
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // getMonth() is zero-indexed

    dispatch(fetchEventsForMonth(year, month));
  }, [currentDate, dispatch]);

  // Handle moving to the next month
  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const nextMonth = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() + 1
      );
      return nextMonth;
    });
  };

  // Handle moving to the previous month
  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => {
      const prevMonth = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() - 1
      );
      return prevMonth;
    });
  };

  const handleDayClick = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    navigate(`/timeline/${dateStr}`);
  };

  // New logic to account for multi-day events
  const getEventsForDay = (year, month, day) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);

      const currentDayStart = new Date(year, month, day, 0, 0, 0);
      const currentDayEnd = new Date(year, month, day, 23, 59, 59);

      // Event spans the current day if it starts or ends on this day,
      // or if it spans across this entire day
      return (
        (eventStart >= currentDayStart && eventStart <= currentDayEnd) ||
        (eventEnd >= currentDayStart && eventEnd <= currentDayEnd) ||
        (eventStart < currentDayStart && eventEnd > currentDayEnd)
      );
    });
  };

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const calendarDays = [...blanks, ...days];

    return calendarDays.map((day, index) => {
      const eventsForDay = day ? getEventsForDay(year, month, day) : [];

      return (
        <div
          key={index}
          className={`calendar-day ${
            eventsForDay.length > 0 ? "clickable" : ""
          }`}
          onClick={() => {
            if (eventsForDay.length > 0) handleDayClick(year, month, day);
          }}
        >
          <div className="calendar-date">{day || ""}</div>
          {eventsForDay.length > 0 && (
            <div className="calendar-event-indicator">•</div>
          )}
        </div>
      );
    });
  };

  const formatMonthYear = (date) => {
    const options = { year: "numeric", month: "long" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="calendar-button">
          Prev
        </button>
        <h2>{formatMonthYear(currentDate)}</h2>
        <button onClick={handleNextMonth} className="calendar-button">
          Next
        </button>
      </div>

      <div className="calendar-grid">
        {/* Days of the week */}
        <div className="calendar-day-name">Sun</div>
        <div className="calendar-day-name">Mon</div>
        <div className="calendar-day-name">Tue</div>
        <div className="calendar-day-name">Wed</div>
        <div className="calendar-day-name">Thu</div>
        <div className="calendar-day-name">Fri</div>
        <div className="calendar-day-name">Sat</div>

        {/* Render the calendar days */}
        {renderDays()}
      </div>
    </div>
  );
}

export default Calendar;
