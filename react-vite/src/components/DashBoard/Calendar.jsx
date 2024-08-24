import React, { useState } from "react";
import "./Calendar.css";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Handle moving to the next month
  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const nextMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1);
      return nextMonth;
    });
  };

  // Handle moving to the previous month
  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => {
      const prevMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() - 1);
      return prevMonth;
    });
  };

  // Helper function to format the month and year
  const formatMonthYear = (date) => {
    const options = { year: "numeric", month: "long" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  // Function to get the number of days in a month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Render the calendar days
  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay(); // Get the starting day of the week

    // Create an array of empty spots for the days before the 1st of the month
    const blanks = Array(firstDay).fill(null);

    // Create an array of days in the month
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Combine blanks and days for rendering
    const calendarDays = [...blanks, ...days];

    return calendarDays.map((day, index) => (
      <div key={index} className="calendar-day">
        {day || ""}
      </div>
    ));
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
