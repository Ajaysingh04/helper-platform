import React, { useContext } from "react";
import { DataContext } from "../../context/DataContext";

function AdminUsers() {
  const { users, updateUserStatus, deleteUser } = useContext(DataContext);

  return (
    <div className="admin-users-tab animate-fade-in">
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div>
            <h3>User & Customer Database</h3>
            <p>Monitor customer accounts, service history, and access privileges</p>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Mobile Number</th>
                <th>Total Orders</th>
                <th>Account Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="admin-avatar-small">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <strong>{u.name}</strong>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Joined {u.joined}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td><strong>{u.bookingsCount} Bookings</strong></td>
                  <td>
                    <span className="badge-pill">{u.role}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${u.status === "Active" ? "status-active" : "status-suspended"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="table-action-btn"
                      onClick={() => updateUserStatus(u.id, u.status === "Active" ? "Suspended" : "Active")}
                      style={{ color: u.status === "Active" ? "var(--danger)" : "var(--success)" }}
                    >
                      {u.status === "Active" ? "🚫 Suspend" : "✓ Activate"}
                    </button>
                    {u.role !== "Super Admin" && (
                      <button 
                        className="table-action-btn delete"
                        onClick={() => {
                          if (window.confirm(`Delete user ${u.name}?`)) {
                            deleteUser(u.id);
                          }
                        }}
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
