import React, { useState } from "react";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Your order has been shipped!", read: false },
    { id: 2, message: "New message from Admin.", read: false },
    { id: 3, message: "Password changed successfully.", read: true },
  ]);

  const markAsRead = (id) => {
    const updated = notifications.map((notif) =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((notif) => ({ ...notif, read: true }));
    setNotifications(updated);
  };

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {notifications.length === 0 && <p>No notifications available.</p>}
      <button className="mark-all-btn" onClick={markAllAsRead}>
        Mark All as Read
      </button>
      <ul className="notification-list">
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`notification-item ${notif.read ? "read" : "unread"}`}
          >
            {notif.message}
            {!notif.read && (
              <button
                className="mark-read-btn"
                onClick={() => markAsRead(notif.id)}
              >
                Mark as Read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notifications;
