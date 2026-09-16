import React, { useContext } from "react";
import { DataContext } from "../../context/DataContext";

function AdminSupport() {
  const { tickets, resolveTicket } = useContext(DataContext);

  return (
    <div className="admin-support-tab animate-fade-in">
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div>
            <h3>Customer Inquiries & Support Tickets</h3>
            <p>Messages received from Contact Us and Help pages</p>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Sender Details</th>
                <th>Query Subject</th>
                <th>Customer Message</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.id}</strong></td>
                  <td>
                    <div>
                      <strong>{t.name}</strong>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{t.email} • {t.phone}</div>
                    </div>
                  </td>
                  <td><strong>{t.subject || t.topic || "Inquiry"}</strong></td>
                  <td style={{ maxWidth: "260px", fontSize: "13px", color: "var(--text-muted)" }}>
                    {t.message}
                  </td>
                  <td>{t.date}</td>
                  <td>
                    <span className={`status-pill ${t.status === "Open" ? "status-pending" : "status-completed"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    {t.status === "Open" ? (
                      <button 
                        className="table-action-btn"
                        onClick={() => resolveTicket(t.id)}
                        style={{ color: "var(--success)" }}
                      >
                        ✓ Mark Resolved
                      </button>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    No support tickets pending.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminSupport;
