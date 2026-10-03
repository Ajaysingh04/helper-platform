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

        <div className="admin-table-container admin-desktop-table-view">
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
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="admin-avatar-small">
                        {u.name ? u.name.charAt(0) : "U"}
                      </div>
                      <div>
                        <strong style={{ fontSize: "14px", color: "var(--text-main)", display: "block" }}>
                          {u.name}
                        </strong>
                        <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600, marginTop: "1px" }}>
                          Joined {u.joined || "Recently"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>
                      {u.email || "—"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>
                      {u.phone || "—"}
                    </span>
                  </td>
                  <td>
                    <span className="user-orders-badge">
                      <strong>{u.bookingsCount || 0}</strong> Bookings
                    </span>
                  </td>
                  <td>
                    <span className={`badge-pill role-${(u.role || "customer").toLowerCase().replace(" ", "-")}`}>
                      {u.role || "Customer"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${u.status === "Active" ? "status-active" : "status-suspended"}`}>
                      <span style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: u.status === "Active" ? "#10B981" : "#EF4444",
                        display: "inline-block"
                      }} />
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button 
                        className={`table-action-btn status-toggle ${u.status === "Active" ? "suspend" : "activate"}`}
                        onClick={() => updateUserStatus(u.id, u.status === "Active" ? "Suspended" : "Active")}
                        title={u.status === "Active" ? "Suspend Account" : "Activate Account"}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View (<= 992px) */}
        <div className="admin-mobile-cards-view">
          {filteredUsers.map((u) => (
            <div key={`card-${u.id}`} className="admin-user-card admin-order-card">
              <div className="order-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="admin-avatar-small">
                    {u.name ? u.name.charAt(0) : "U"}
                  </div>
                  <div>
                    <strong style={{ fontSize: "14.5px", color: "var(--text-main)", display: "block" }}>
                      {u.name}
                    </strong>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                      Joined {u.joined || "Recently"}
                    </span>
                  </div>
                </div>

                <span className={`status-pill ${u.status === "Active" ? "status-active" : "status-suspended"}`}>
                  <span style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: u.status === "Active" ? "#10B981" : "#EF4444",
                    display: "inline-block"
                  }} />
                  {u.status}
                </span>
              </div>

              <div className="user-card-details-grid">
                <div className="user-detail-row">
                  <span className="user-detail-label">✉️ Email</span>
                  <span className="user-detail-val" title={u.email}>{u.email || "—"}</span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">📞 Mobile</span>
                  <span className="user-detail-val">{u.phone || "—"}</span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">📦 Total Orders</span>
                  <span className="user-orders-badge">
                    <strong>{u.bookingsCount || 0}</strong> Bookings
                  </span>
                </div>
                <div className="user-detail-row">
                  <span className="user-detail-label">🏷️ Account Role</span>
                  <span className={`badge-pill role-${(u.role || "customer").toLowerCase().replace(" ", "-")}`}>
                    {u.role || "Customer"}
                  </span>
                </div>
              </div>

              <div className="user-card-actions-footer">
                <button 
                  type="button"
                  className={`btn-user-mobile-action ${u.status === "Active" ? "suspend" : "activate"}`}
                  onClick={() => updateUserStatus(u.id, u.status === "Active" ? "Suspended" : "Active")}
                >
                  {u.status === "Active" ? "🚫 Suspend Account" : "✓ Activate Account"}
                </button>

                {u.role !== "Super Admin" && (
                  <button 
                    type="button"
                    className="btn-user-mobile-delete"
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
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="empty-state-card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "42px", marginBottom: "12px" }}>👥</div>
            <h4 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 6px 0", color: "var(--text-main)" }}>
              No Users Found
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
              No user accounts matched "{searchQuery}". Try a different keyword or reset filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
