import React, { useContext, useState, useMemo } from "react";
import { DataContext } from "../../context/DataContext";
import WeeklyActivityRevenueGraph from "./WeeklyActivityRevenueGraph";

function AdminDashboard({ onNavigateTab }) {
  const { bookings, services, providers, users, tickets, updateBookingStatus } = useContext(DataContext);

  // Pagination & Filtering states for Recent Booking Inquiries
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate quick KPIs
  const totalRevenue = bookings
    .filter(b => b.status === "Completed" || b.status === "In Progress")
    .reduce((acc, curr) => acc + parseInt(curr.price?.replace(/[^\d]/g, "") || "0"), 0);

  const pendingBookings = bookings.filter(b => b.status === "Pending").length;
  const progressBookings = bookings.filter(b => b.status === "In Progress").length;
  const completedBookings = bookings.filter(b => b.status === "Completed").length;
  const cancelledBookings = bookings.filter(b => b.status === "Cancelled").length;
  const verifiedPros = providers.filter(p => p.verified).length;
  const openTickets = tickets.filter(t => t.status === "Open").length;

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Status Filter
      let matchStatus = true;
      if (statusFilter !== "All") {
        matchStatus = b.status === statusFilter;
      }

      // 2. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (b.id && b.id.toLowerCase().includes(q)) ||
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.service && b.service.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.address && b.address.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [bookings, statusFilter, searchQuery]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredBookings.length);
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const goToPage = (page) => {
    const target = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(target);
    const elem = document.getElementById("recent-bookings-inquiries");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages];
  };

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
      <div className="admin-analytics-layout-grid">
        {/* Real Interactive Weekly Service Activity & Revenue Graph */}
        <WeeklyActivityRevenueGraph bookings={bookings} />

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

      {/* Recent Booking Requests Table with Next Page & Search */}
      <div className="admin-card-section" id="recent-bookings-inquiries">
        <div className="admin-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>Recent Booking Inquiries</h3>
              <span className="admin-count-pill">
                Page {safeCurrentPage} of {totalPages} ({filteredBookings.length} Inquiries)
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0" }}>Customer orders requiring confirmation, dispatch, or inspection</p>
          </div>
          <button className="table-action-btn" onClick={() => onNavigateTab("bookings")}>
            Full Bookings Manager ({bookings.length}) →
          </button>
        </div>

        {/* Search & Status Filter Chips */}
        <div className="admin-catalog-toolbar">
          <div className="admin-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by customer, booking ID, service or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="admin-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div className="admin-tag-chips-wrapper">
            {[
              { id: "All", label: "All Inquiries", count: bookings.length },
              { id: "Pending", label: "⏳ Pending", count: pendingBookings },
              { id: "In Progress", label: "⚡ In Progress", count: progressBookings },
              { id: "Completed", label: "✓ Completed", count: completedBookings },
              { id: "Cancelled", label: "✕ Cancelled", count: cancelledBookings }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                className={`admin-tag-chip ${statusFilter === st.id ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter(st.id);
                  setCurrentPage(1);
                }}
              >
                <span>{st.label}</span>
                <span className="tag-chip-count">{st.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {filteredBookings.length === 0 ? (
          <div className="admin-empty-state">
            <span style={{ fontSize: "40px" }}>🔍</span>
            <h4>No booking inquiries found</h4>
            <p>Try searching with another keyword or reset the filter status.</p>
            <button
              className="btn-secondary-outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer Details</th>
                    <th>Service Requested</th>
                    <th>Estimated Cost</th>
                    <th>Scheduled Slot</th>
                    <th>Current Status</th>
                    <th>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <span className="booking-id-tag">{booking.id}</span>
                      </td>
                      <td>
                        <div className="booking-customer-cell">
                          <strong className="booking-cust-name">{booking.customerName}</strong>
                          <a href={`tel:${booking.phone}`} className="booking-cust-phone">
                            📞 {booking.phone || "—"}
                          </a>
                        </div>
                      </td>
                      <td>
                        <span className="booking-service-badge">
                          🛠️ {booking.service}
                        </span>
                      </td>
                      <td>
                        <strong className="booking-price-tag">{booking.price}</strong>
                      </td>
                      <td>
                        <span className="booking-date-text">{booking.date}</span>
                      </td>
                      <td>
                        <span className={`status-pill status-${booking.status.toLowerCase().replace(/\s+/g, '')}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                          {booking.status === "Pending" && (
                            <>
                              <button 
                                className="table-action-btn"
                                onClick={() => updateBookingStatus(booking.id, "In Progress")}
                                style={{ color: "var(--success)", borderColor: "var(--success)" }}
                                title="Accept this booking and assign dispatch"
                              >
                                ✓ Accept & Dispatch
                              </button>
                              <button 
                                className="table-action-btn delete"
                                onClick={() => {
                                  if (window.confirm(`Cancel inquiry #${booking.id}?`)) {
                                    updateBookingStatus(booking.id, "Cancelled");
                                  }
                                }}
                                style={{ padding: "6px 10px", fontSize: "12px" }}
                                title="Cancel booking"
                              >
                                ✕
                              </button>
                            </>
                          )}
                          {booking.status === "In Progress" && (
                            <>
                              <button 
                                className="table-action-btn"
                                onClick={() => updateBookingStatus(booking.id, "Completed")}
                                style={{ color: "var(--primary)", borderColor: "var(--primary)" }}
                                title="Mark service work as completed"
                              >
                                ✓ Mark Completed
                              </button>
                              <button 
                                className="table-action-btn delete"
                                onClick={() => updateBookingStatus(booking.id, "Cancelled")}
                                style={{ padding: "6px 10px", fontSize: "12px" }}
                                title="Cancel booking"
                              >
                                ✕
                              </button>
                            </>
                          )}
                          {booking.status === "Completed" && (
                            <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 700 }}>
                              ✓ Finished
                            </span>
                          )}
                          {booking.status === "Cancelled" && (
                            <button 
                              className="table-action-btn"
                              onClick={() => updateBookingStatus(booking.id, "Pending")}
                              style={{ fontSize: "11px", padding: "4px 8px" }}
                              title="Reopen cancelled inquiry"
                            >
                              ↩ Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="admin-pagination-wrapper">
                <div className="admin-pagination-info">
                  Showing <strong>{startIndex + 1}</strong> - <strong>{endIndex}</strong> of <strong>{filteredBookings.length}</strong> inquiries
                  <span className="pagination-page-indicator">
                    Page {safeCurrentPage} / {totalPages}
                  </span>
                </div>

                <div className="admin-pagination-controls">
                  {/* Items per page selector */}
                  <div className="items-per-page-select-wrapper">
                    <span>Show:</span>
                    <select 
                      value={itemsPerPage} 
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="admin-per-page-select"
                    >
                      <option value={5}>5 / page</option>
                      <option value={10}>10 / page</option>
                      <option value={15}>15 / page</option>
                      <option value={25}>25 / page</option>
                    </select>
                  </div>

                  {/* First button */}
                  <button
                    type="button"
                    className="btn-pagination nav-btn"
                    onClick={() => goToPage(1)}
                    disabled={safeCurrentPage === 1}
                    title="First Page"
                  >
                    « First
                  </button>

                  {/* Prev button */}
                  <button
                    type="button"
                    className="btn-pagination nav-btn"
                    onClick={() => goToPage(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    title="Previous Page"
                  >
                    ‹ Prev
                  </button>

                  {/* Page number buttons */}
                  <div className="pagination-numbers-list">
                    {getPageNumbers().map((num, idx) => {
                      if (num === "...") {
                        return <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>;
                      }
                      const isActive = num === safeCurrentPage;
                      return (
                        <button
                          key={num}
                          type="button"
                          className={`btn-pagination num-btn ${isActive ? "active" : ""}`}
                          onClick={() => goToPage(num)}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next button */}
                  <button
                    type="button"
                    className="btn-pagination nav-btn"
                    onClick={() => goToPage(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    title="Next Page"
                  >
                    Next ›
                  </button>

                  {/* Last button */}
                  <button
                    type="button"
                    className="btn-pagination nav-btn"
                    onClick={() => goToPage(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    title="Last Page"
                  >
                    Last »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

export default AdminDashboard;
