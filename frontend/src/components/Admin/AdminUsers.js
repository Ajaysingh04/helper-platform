import React, { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";

function AdminUsers() {
  const { users, bookings, updateUserStatus, deleteUser } = useContext(DataContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  const isUserActive = (u) => !u.isBlocked && u.status !== "Suspended" && u.status !== "Blocked" && u.isActive !== false;

  const getUserOrdersCount = (u) => {
    const uId = String(u.id || u._id || "");
    const uPhone = String(u.phone || "").replace(/\D/g, "").slice(-10);
    const uEmail = (u.email || "").toLowerCase().trim();
    const matched = (bookings || []).filter((b) => {
      const bUser = String(b.userId || b.customerId || "");
      const bPhone = String(b.phone || b.customerPhone || "").replace(/\D/g, "").slice(-10);
      const bEmail = (b.customerEmail || b.email || "").toLowerCase().trim();
      return (
        (bUser && bUser === uId) ||
        (uPhone && bPhone && bPhone === uPhone) ||
        (uEmail && bEmail && bEmail === uEmail)
      );
    });
    return Math.max(matched.length, u.bookingsCount || 0, u.totalBookings || 0);
  };

  const getUserPlatform = (u) => {
    if (u.source === "app" || u.source === "mobile" || u.platform === "app" || u.platform === "mobile") return "app";
    if (u.source === "web" || u.platform === "web") return "web";
    if (u.authProvider === "otp" || (u.phone && (!u.email || u.email.includes("@example.com") || u.email.includes("gmail.com")))) {
      return "app";
    }
    return "web";
  };

  const filteredUsers = (users || []).filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q));

    const active = isUserActive(u);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && active) ||
      (statusFilter === "suspended" && !active);

    const r = (u.role || "customer").toLowerCase();
    const matchRole =
      roleFilter === "all" ||
      (roleFilter === "customer" && (r === "customer" || r === "user")) ||
      (roleFilter === "provider" && (r === "provider" || r === "vendor" || r === "worker" || r === "technician")) ||
      (roleFilter === "admin" && (r === "admin" || r === "superadmin"));

    const platform = getUserPlatform(u);
    const matchPlatform =
      platformFilter === "all" ||
      (platformFilter === "app" && platform === "app") ||
      (platformFilter === "web" && platform === "web");

    return matchSearch && matchStatus && matchRole && matchPlatform;
  });

  const activeCount = (users || []).filter(isUserActive).length;
  const suspendedCount = (users || []).length - activeCount;

  const customerCount = (users || []).filter((u) => {
    const r = (u.role || "customer").toLowerCase();
    return r === "customer" || r === "user";
  }).length;

  const vendorCount = (users || []).filter((u) => {
    const r = (u.role || "").toLowerCase();
    return r === "provider" || r === "vendor" || r === "worker" || r === "technician";
  }).length;

  const appUsersCount = (users || []).filter((u) => getUserPlatform(u) === "app").length;
  const webUsersCount = (users || []).filter((u) => getUserPlatform(u) === "web").length;

  return (
    <div className="admin-users-tab animate-fade-in">
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>Customer Accounts & Platform Users</h3>
              <span className="admin-count-pill" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#4F46E5", fontWeight: 800, padding: "3px 10px", borderRadius: "10px", fontSize: "12px" }}>
                Total {(users || []).length} Accounts
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0" }}>
              Monitor live customer profiles, profile photos, order history, platform origins, and account access
            </p>
          </div>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="table-controls-bar">
          <div className="search-box-wrap">
            <span className="search-icon">🔍</span>
            <input 
              type="text"
              placeholder="Search by customer name, email, phone number, or role..."
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

          {/* Filters Group */}
          <div className="filters-group" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* Platform Filter */}
            <div className="segmented-control">
              <button 
                type="button"
                className={`seg-all ${platformFilter === "all" ? "active" : ""}`}
                onClick={() => setPlatformFilter("all")}
              >
                <span>All Sources</span>
              </button>
              <button 
                type="button"
                className={`seg-active ${platformFilter === "app" ? "active" : ""}`}
                onClick={() => setPlatformFilter("app")}
              >
                <span>📱 Mobile App ({appUsersCount})</span>
              </button>
              <button 
                type="button"
                className={`seg-inactive ${platformFilter === "web" ? "active" : ""}`}
                onClick={() => setPlatformFilter("web")}
              >
                <span>🌐 Website ({webUsersCount})</span>
              </button>
            </div>

            {/* Role Filter Tabs */}
            <div className="segmented-control">
              <button 
                type="button"
                className={`seg-all ${roleFilter === "all" ? "active" : ""}`}
                onClick={() => setRoleFilter("all")}
              >
                <span>All Roles</span>
                <span className="seg-count-badge">{(users || []).length}</span>
              </button>
              <button 
                type="button"
                className={`seg-active ${roleFilter === "customer" ? "active" : ""}`}
                onClick={() => setRoleFilter("customer")}
              >
                <span>👤 Customers</span>
                <span className="seg-count-badge">{customerCount}</span>
              </button>
              <button 
                type="button"
                className={`seg-inactive ${roleFilter === "provider" ? "active" : ""}`}
                onClick={() => setRoleFilter("provider")}
              >
                <span>🛡️ Vendors & Fleet</span>
                <span className="seg-count-badge">{vendorCount}</span>
              </button>
            </div>

            {/* Status Filter */}
            <div className="segmented-control">
              <button 
                type="button"
                className={`seg-all ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                <span>All Status</span>
              </button>
              <button 
                type="button"
                className={`seg-active ${statusFilter === "active" ? "active" : ""}`}
                onClick={() => setStatusFilter("active")}
              >
                <span className="seg-live-dot" />
                <span>Active ({activeCount})</span>
              </button>
              <button 
                type="button"
                className={`seg-inactive ${statusFilter === "suspended" ? "active" : ""}`}
                onClick={() => setStatusFilter("suspended")}
              >
                <span>Suspended ({suspendedCount})</span>
              </button>
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="admin-empty-state">
            <span style={{ fontSize: "42px" }}>👥</span>
            <h4>No user accounts found matching criteria</h4>
            <p>Try clearing search keywords or resetting the filters.</p>
            <button
              className="btn-secondary-outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setRoleFilter("all");
                setPlatformFilter("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="admin-table-container admin-desktop-table-view">
            <table className="admin-table" style={{ width: "100%", borderCollapse: "separate" }}>
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Platform Source</th>
                  <th>Email Address</th>
                  <th>Mobile Number</th>
                  <th>Total Orders</th>
                  <th>Account Role</th>
                  <th>Access Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const active = isUserActive(u);
                  const userId = u.id || u._id;
                  const r = (u.role || "customer").toLowerCase();
                  const platform = getUserPlatform(u);
                  const userOrders = getUserOrdersCount(u);
                  const avatarUrl = u.avatar || u.photo || u.profileImage;

                  return (
                    <tr key={userId}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt={u.name} 
                              className="user-real-avatar-img"
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "12px",
                                objectFit: "cover",
                                border: "2px solid #E2E8F0",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget.parentElement.querySelector(".fallback-avatar");
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div 
                            className="admin-avatar-small fallback-avatar" 
                            style={{
                              display: avatarUrl ? "none" : "flex",
                              width: "42px",
                              height: "42px",
                              borderRadius: "12px",
                              background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                              color: "#FFFFFF",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "15px",
                              flexShrink: 0
                            }}
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <strong style={{ fontSize: "14px", color: "var(--text-main)", display: "block" }}>
                              {u.name}
                            </strong>
                            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600, marginTop: "1px" }}>
                              Joined {u.joined || (u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : "Recently")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`platform-pill ${platform === "app" ? "app" : "web"}`} style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          background: platform === "app" ? "rgba(16, 185, 129, 0.12)" : "rgba(79, 70, 229, 0.12)",
                          color: platform === "app" ? "#059669" : "#4F46E5",
                          border: platform === "app" ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(79, 70, 229, 0.25)"
                        }}>
                          {platform === "app" ? "📱 Mobile App" : "🌐 Website"}
                        </span>
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
                        <span className="user-orders-badge" style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          background: userOrders > 0 ? "rgba(79, 70, 229, 0.12)" : "rgba(148, 163, 184, 0.15)",
                          color: userOrders > 0 ? "#4338CA" : "var(--text-muted)",
                          fontWeight: 700,
                          fontSize: "12px"
                        }}>
                          <strong>{userOrders}</strong> Bookings
                        </span>
                      </td>
                      <td>
                        <span className={`badge-pill role-${r.replace(" ", "-")}`} style={{
                          background: r.includes("vendor") || r.includes("provider") ? "rgba(16, 185, 129, 0.12)" : r.includes("admin") ? "rgba(239, 68, 68, 0.12)" : "rgba(99, 102, 241, 0.12)",
                          color: r.includes("vendor") || r.includes("provider") ? "#10B981" : r.includes("admin") ? "#EF4444" : "#4F46E5",
                          borderColor: r.includes("vendor") || r.includes("provider") ? "rgba(16, 185, 129, 0.3)" : r.includes("admin") ? "rgba(239, 68, 68, 0.3)" : "rgba(99, 102, 241, 0.3)"
                        }}>
                          {u.role || "Customer"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${active ? "status-active" : "status-suspended"}`}>
                          <span style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: active ? "#10B981" : "#EF4444",
                            display: "inline-block"
                          }} />
                          {active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                          <button 
                            type="button"
                            className={`table-action-btn status-toggle ${active ? "suspend" : "activate"}`}
                            onClick={() => updateUserStatus(userId, active ? "Suspended" : "Active")}
                            title={active ? "Suspend / Block Account" : "Activate Account"}
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              borderRadius: "8px",
                              border: "none",
                              cursor: "pointer",
                              background: active ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
                              color: active ? "#EF4444" : "#10B981",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            {active ? "🚫 Suspend" : "✓ Activate"}
                          </button>

                          {r !== "superadmin" && (
                            <button 
                              type="button"
                              className="table-action-btn delete"
                              onClick={() => {
                                if (window.confirm(`Permanently remove user "${u.name}" from database?`)) {
                                  deleteUser(userId);
                                }
                              }}
                              title="Delete User Record"
                              style={{
                                padding: "6px 10px",
                                fontSize: "12px",
                                borderRadius: "8px",
                                border: "none",
                                background: "rgba(239, 68, 68, 0.08)",
                                color: "#EF4444",
                                cursor: "pointer"
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile & Tablet Card Grid View (Visible <= 992px) */}
        <div className="admin-mobile-cards-view">
          {filteredUsers.map((u) => {
            const active = isUserActive(u);
            const userId = u.id || u._id;
            const r = (u.role || "customer").toLowerCase();
            const platform = getUserPlatform(u);
            const userOrders = getUserOrdersCount(u);
            const avatarUrl = u.avatar || u.photo || u.profileImage;

            return (
              <div key={`m-user-${userId}`} className="admin-user-card" style={{
                background: "var(--card-bg, #FFFFFF)",
                border: "1px solid var(--border-color, #E2E8F0)",
                borderRadius: "16px",
                padding: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                marginBottom: "12px"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={u.name} 
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          objectFit: "cover",
                          border: "2px solid #E2E8F0"
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.parentElement.querySelector(".fallback-avatar-mobile");
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div 
                      className="fallback-avatar-mobile" 
                      style={{
                        display: avatarUrl ? "none" : "flex",
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                        color: "#FFFFFF",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "16px",
                        flexShrink: 0
                      }}
                    >
                      {u.name ? u.name.charAt(0).toUpperCase() : "U"}
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

                  <span className={`status-pill ${active ? "status-active" : "status-suspended"}`}>
                    <span style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: active ? "#10B981" : "#EF4444",
                      display: "inline-block"
                    }} />
                    {active ? "Active" : "Suspended"}
                  </span>
                </div>

                <div className="user-card-details-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "10px 0" }}>
                  <div className="user-detail-row">
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>🌐 Platform</span>
                    <span className={`platform-pill ${platform === "app" ? "app" : "web"}`} style={{
                      display: "inline-block",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      color: platform === "app" ? "#059669" : "#4F46E5"
                    }}>
                      {platform === "app" ? "📱 Mobile App" : "🌐 Website"}
                    </span>
                  </div>
                  <div className="user-detail-row">
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>📦 Orders</span>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#4F46E5" }}>{userOrders} Bookings</span>
                  </div>
                  <div className="user-detail-row">
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>✉️ Email</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{u.email || "—"}</span>
                  </div>
                  <div className="user-detail-row">
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>📞 Phone</span>
                    <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-main)" }}>{u.phone || "—"}</span>
                  </div>
                </div>

                <div className="user-card-actions-bar" style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border-color, #E2E8F0)" }}>
                  <button 
                    className={`table-action-btn status-toggle ${active ? "suspend" : "activate"}`}
                    onClick={() => updateUserStatus(userId, active ? "Suspended" : "Active")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      background: active ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
                      color: active ? "#EF4444" : "#10B981"
                    }}
                  >
                    {active ? "🚫 Suspend Account" : "✓ Activate Account"}
                  </button>
                  {r !== "superadmin" && (
                    <button 
                      className="table-action-btn delete"
                      onClick={() => {
                        if (window.confirm(`Permanently delete user "${u.name}"?`)) {
                          deleteUser(userId);
                        }
                      }}
                      style={{
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: 700,
                        borderRadius: "8px",
                        border: "none",
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#EF4444",
                        cursor: "pointer"
                      }}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default AdminUsers;
