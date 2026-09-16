import React, { useContext } from "react";
import { DataContext } from "../../context/DataContext";

function AdminDashboard({ onNavigateTab }) {
  const { bookings, services, providers, users, tickets, updateBookingStatus } = useContext(DataContext);

  // Calculate quick KPIs
  const totalRevenue = bookings
    .filter(b => b.status === "Completed" || b.status === "In Progress")
    .reduce((acc, curr) => acc + parseInt(curr.price.replace(/[^\d]/g, "") || "0"), 0);

  const pendingBookings = bookings.filter(b => b.status === "Pending").length;
  const verifiedPros = providers.filter(p => p.verified).length;
  const openTickets = tickets.filter(t => t.status === "Open").length;

  const chartData = [
    { month: "Mon", height: "45%", val: "₹1,400" },
    { month: "Tue", height: "65%", val: "₹2,100" },
    { month: "Wed", height: "85%", val: "₹3,400" },
    { month: "Thu", height: "55%", val: "₹1,800" },
    { month: "Fri", height: "95%", val: "₹4,200" },
    { month: "Sat", height: "100%", val: "₹5,100" },
    { month: "Sun", height: "75%", val: "₹2,900" },
  ];

  return (
    <div className="admin-dashboard-tab animate-fade-in">
      
      {/* Top Welcome Bar */}
      <div className="admin-card-section" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.12) 100%)", border: "1px solid rgba(99,102,241,0.25)" }}>
        <div className="admin-card-header" style={{ marginBottom: 0 }}>
          <div>
            <span className="admin-tag">Master Control Overview</span>
            <h2 style={{ fontSize: "26px", fontWeight: 800, marginTop: "4px" }}>Welcome to Helper Super Admin ⚡</h2>
            <p style={{ marginTop: "4px" }}>Manage, monitor, and configure all live services, customer bookings, verified pros, and platform finances in real-time.</p>
          </div>
          <div className="admin-header-actions">
            <button className="btn-primary-glow" onClick={() => onNavigateTab("bookings")}>
              View Urgent Bookings ({pendingBookings}) →
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-text-box">
            <span className="kpi-label">Weekly Platform Volume</span>
            <span className="kpi-value">₹{totalRevenue.toLocaleString()}</span>
            <span className="kpi-trend">↑ +18.4% from last week</span>
          </div>
          <div className="kpi-icon-box kpi-blue">💰</div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-text-box">
            <span className="kpi-label">Active Bookings</span>
            <span className="kpi-value">{bookings.length} Orders</span>
            <span className="kpi-trend" style={{ color: pendingBookings > 0 ? "#f59e0b" : "#10b981" }}>
              {pendingBookings} awaiting approval
            </span>
          </div>
          <div className="kpi-icon-box kpi-orange">📦</div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-text-box">
            <span className="kpi-label">Verified Providers</span>
            <span className="kpi-value">{verifiedPros} / {providers.length} Pros</span>
            <span className="kpi-trend">100% ID Verified</span>
          </div>
          <div className="kpi-icon-box kpi-green">🛡️</div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-text-box">
            <span className="kpi-label">Registered Customers</span>
            <span className="kpi-value">{users.length} Users</span>
            <span className="kpi-trend">98% Satisfaction</span>
          </div>
          <div className="kpi-icon-box kpi-purple">👥</div>
        </div>
      </div>

      {/* Visual Analytics Chart & Quick Status Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", marginBottom: "32px" }}>
        
        {/* Weekly Revenue Chart */}
        <div className="admin-card-section" style={{ marginBottom: 0 }}>
          <div className="admin-card-header">
            <div>
              <h3>Weekly Service Activity & Revenue</h3>
              <p>Daily booking volume over the last 7 days</p>
            </div>
            <span className="badge-pill">Live Synced</span>
          </div>

          <div className="chart-bars-container">
            {chartData.map((bar, idx) => (
              <div className="chart-bar-column" key={idx}>
                <div 
                  className="chart-bar-fill" 
                  style={{ height: bar.height }}
                  title={`${bar.month}: ${bar.val}`}
                ></div>
                <span className="chart-bar-label">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick System Summary */}
        <div className="admin-card-section" style={{ marginBottom: 0 }}>
          <div className="admin-card-header">
            <div>
              <h3>System Health & Quick Links</h3>
              <p>Platform status & alerts</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "var(--surface-input)", borderRadius: "8px" }}>
              <span>🛠️ Active Services in Catalog:</span>
              <strong>{services.length} Listed</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "var(--surface-input)", borderRadius: "8px" }}>
              <span>💬 Open Support Tickets:</span>
              <strong style={{ color: openTickets > 0 ? "var(--danger)" : "var(--success)" }}>
                {openTickets} Open
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "var(--surface-input)", borderRadius: "8px" }}>
              <span>⚡ Auto-Dispatch Engine:</span>
              <strong style={{ color: "var(--success)" }}>Online (Optimal)</strong>
            </div>

            <button 
              className="btn-secondary-glass" 
              style={{ width: "100%", marginTop: "10px" }}
              onClick={() => onNavigateTab("services")}
            >
              Manage Services Catalog →
            </button>
          </div>
        </div>

      </div>

      {/* Recent Booking Requests Table */}
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div>
            <h3>Recent Booking Inquiries</h3>
            <p>Customer orders requiring confirmation or dispatch</p>
          </div>
          <button className="table-action-btn" onClick={() => onNavigateTab("bookings")}>
            View All ({bookings.length}) →
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Estimated Cost</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id}>
                  <td><strong>{booking.id}</strong></td>
                  <td>
                    <div>
                      <strong>{booking.customerName}</strong>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{booking.phone}</div>
                    </div>
                  </td>
                  <td>{booking.service}</td>
                  <td><strong style={{ color: "var(--primary)" }}>{booking.price}</strong></td>
                  <td>{booking.date}</td>
                  <td>
                    <span className={`status-pill status-${booking.status.toLowerCase().replace(/\s+/g, '')}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {booking.status === "Pending" && (
                      <button 
                        className="table-action-btn"
                        onClick={() => updateBookingStatus(booking.id, "In Progress")}
                        style={{ color: "var(--success)", borderColor: "var(--success)" }}
                      >
                        ✓ Accept & Dispatch
                      </button>
                    )}
                    {booking.status === "In Progress" && (
                      <button 
                        className="table-action-btn"
                        onClick={() => updateBookingStatus(booking.id, "Completed")}
                        style={{ color: "var(--primary)", borderColor: "var(--primary)" }}
                      >
                        ✓ Mark Completed
                      </button>
                    )}
                    {booking.status === "Completed" && (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Finished</span>
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

export default AdminDashboard;
