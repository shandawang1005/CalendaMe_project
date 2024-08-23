// import React from "react";
import "./Notificationpage.css";

export const Notification = ({ message, type }) => {
  return <div className={`notification ${type}`}>{message}</div>;
};
