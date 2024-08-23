import { useState, createContext, useContext } from "react";
import { Notification } from "./NotificationPage"; // Assuming you have this component to display individual notifications

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

const NotificationContainer = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = "success", duration = 3000) => {
    const id = Date.now();
    setNotifications([...notifications, { id, message, type, duration }]);

    setTimeout(() => {
      setNotifications((current) =>
        current.filter((notification) => notification.id !== id)
      );
    }, duration);
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="notification-container">
        {notifications.map((notification) => (
          <Notification key={notification.id} {...notification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContainer;
