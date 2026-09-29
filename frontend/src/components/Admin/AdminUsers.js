import React, { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";

function AdminUsers() {
  const { users, updateUserStatus, deleteUser } = useContext(DataContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = (users || []).filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q));

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.status === "Active") ||
      (statusFilter === "suspended" && u.status !== "Active");

    return matchSearch && matchStatus;
  });

  const activeCount = (users || []).filter((u) => u.status === "Active").length;
  const suspendedCount = (users || []).length - activeCount;

  return (
    <div className="admin-users-tab animate-fade-in">
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div>
            <h3>User & Customer Database</h3>
            <p>Monitor customer accounts, service history, and access privileges</p>
          </div>
        </div>

        {/* Animated Search & Filter Bar */}
        <div className="table-controls-bar">
          <div className="search-box-wrap">
            <span className="search-icon">🔍</span>
            <input 
              type="text"
              placeholder="Search by customer name, email, phone or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filters-group">
            <div className="segmented-control">
              <button 
                type="button"
                className={`seg-all ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                <span>All Users</span>
                <span className="seg-count-badge">{(users || []).length}</span>
              </button>
              <button 
                type="button"
                className={`seg-active ${statusFilter === "active" ? "active" : ""}`}
                onClick={() => setStatusFilter("active")}
              >
                <span className="seg-live-dot" />
                <span>Active</span>
                <span className="seg-count-badge">{activeCount}</span>
              </button>
              <button 
                type="button"
                className={`seg-inactive ${statusFilter === "suspended" ? "active" : ""}`}
                onClick={() => setStatusFilter("suspended")}
              >
                <span>Suspended</span>
                <span className="seg-count-badge">{suspendedCount}</span>
              </button>
            </div>
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
              {filteredUsers.map((u) => (
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
