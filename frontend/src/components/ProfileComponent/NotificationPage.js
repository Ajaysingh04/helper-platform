import React, { useEffect, useState } from "react";
import "../../css/Profile/NotificationPage.css";

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(stored);
  }, []);

  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  return (
    <div className="notifications-page">
      <h2>Notifications</h2>

      {notifications.length === 0 ? (
        <p className="empty">No notifications yet</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={n.id} className={n.read ? "read" : "unread"}>
              <span>{n.message}</span>
              {!n.read && (
                <button onClick={() => markAsRead(n.id)}>
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationPage;
