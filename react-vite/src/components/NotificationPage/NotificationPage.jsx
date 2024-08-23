// import React from "react";
import "./Notificationpage.css"; // Import any styles for notification

const Notification = ({ message, type }) => {
  return (
    <div className={`notification ${type}`}>
      <p>{message}</p>
    </div>
  );
};

export { Notification };
