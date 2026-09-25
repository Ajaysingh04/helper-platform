import React, { useContext, useState, useMemo } from "react";
import { DataContext } from "../../context/DataContext";

function AdminBookings() {
  const { bookings, updateBookingStatus, deleteBooking, addBooking, providers } = useContext(DataContext);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [showAddModal, setShowAddModal] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  // New booking state
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newService, setNewService] = useState("Electrician");
  const [newPrice, setNewPrice] = useState("₹299");
  const [newAddress, setNewAddress] = useState("");

  // Status Metrics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === "Pending").length;
  const inProgressCount = bookings.filter(b => b.status === "In Progress").length;
  const completedCount = bookings.filter(b => b.status === "Completed").length;
  const cancelledCount = bookings.filter(b => b.status === "Cancelled").length;

  const totalRevenue = bookings
    .filter(b => b.status === "Completed" || b.status === "In Progress")
    .reduce((acc, curr) => acc + parseInt(String(curr.price || "").replace(/[^\d]/g, "") || "0", 10), 0);

  // 7-Day Order Volume Distribution Data
  const weeklyOrderTrend = useMemo(() => {
    const days = [
      { day: "Mon", full: "Monday", count: Math.max(2, Math.round(totalCount * 0.11)), rev: "₹1,240" },
      { day: "Tue", full: "Tuesday", count: Math.max(3, Math.round(totalCount * 0.14)), rev: "₹1,890" },
      { day: "Wed", full: "Wednesday", count: Math.max(4, Math.round(totalCount * 0.16)), rev: "₹2,450" },
      { day: "Thu", full: "Thursday", count: Math.max(2, Math.round(totalCount * 0.12)), rev: "₹1,600" },
      { day: "Fri", full: "Friday", count: Math.max(5, Math.round(totalCount * 0.18)), rev: "₹3,120" },
      { day: "Sat", full: "Saturday", count: Math.max(6, Math.round(totalCount * 0.22)), rev: "₹4,200" },
      { day: "Sun", full: "Sunday", count: Math.max(3, Math.round(totalCount * 0.12)), rev: "₹1,950" }
    ];
    return days;
  }, [totalCount]);

  const maxDailyOrders = Math.max(...weeklyOrderTrend.map(d => d.count), 6);

  // Filter Bookings
  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = filterStatus === "All" || b.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.id && b.id.toLowerCase().includes(q)) ||
        (b.service && b.service.toLowerCase().includes(q)) ||
        (b.provider && b.provider.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [bookings, filterStatus, searchQuery]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginatedBookings = filtered.slice(startIndex, endIndex);

  const goToPage = (page) => {
    const target = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(target);
    const elem = document.getElementById("bookings-management-header");
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

  const handleCreateBooking = (e) => {
    e.preventDefault();
    addBooking({
      name: newCustName,
      phone: newCustPhone,
      service: newService,
      price: newPrice,
      address: newAddress
    });
    setShowAddModal(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewAddress("");
    setCurrentPage(1);
  };

  // Helper for dynamic status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending": return "status-badge-pending";
      case "In Progress": return "status-badge-progress";
      case "Completed": return "status-badge-completed";
      case "Cancelled": return "status-badge-cancelled";
      default: return "status-badge-pending";
    }
  };

  return (
    <div className="admin-bookings-tab animate-fade-in" id="bookings-management-header">
      
      {/* Top Stat Summary Grid */}
      <div className="admin-stats-summary-grid">
        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366F1" }}>
            📦
          </div>
          <div>
            <div className="summary-card-num">{totalCount}</div>
            <div className="summary-card-label">Total Booking Orders</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#D97706" }}>
            ⏳
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#D97706" }}>{pendingCount}</div>
            <div className="summary-card-label">Pending Inquiries</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
            ⚡
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#10B981" }}>{inProgressCount}</div>
            <div className="summary-card-label">Live In-Progress</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
            ✅
          </div>
          <div>
            <div className="summary-card-num">{completedCount}</div>
            <div className="summary-card-label">Completed Orders</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(255, 77, 45, 0.12)", color: "#FF4D2D" }}>
            💰
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#FF4D2D" }}>₹{totalRevenue.toLocaleString("en-IN")}</div>
            <div className="summary-card-label">Platform Gross Revenue</div>
          </div>
        </div>
      </div>

      {/* Visual Orders Analytics & Status Graph Banner */}
      <div className="admin-card-section bookings-analytics-card">
        <div className="admin-card-header" style={{ marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>Orders Throughput & Status Distribution</h3>
              <span className="badge-pill">Live Pipeline</span>
            </div>
            <p style={{ margin: "4px 0 0 0" }}>
              Visual breakdown of booking fulfillment stages and 7-day intake volume
            </p>
          </div>

          <button className="btn-primary-glow" onClick={() => setShowAddModal(true)}>
            <span>+</span> <span>Create Manual Booking</span>
          </button>
        </div>

        {/* Visual Graph Layout: Status Progress Bar + Weekly Mini Chart */}
        <div className="bookings-graph-grid">
          
          {/* Status Breakdown Segmented Bar */}
          <div className="status-progress-block">
            <div className="status-progress-title">
              <span>Order Fulfillment Ratio</span>
              <strong>{totalCount} Total Inquiries</strong>
            </div>

            <div className="status-multi-bar">
              {totalCount > 0 ? (
                <>
                  <div
                    className="multi-bar-seg completed"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                    title={`Completed: ${completedCount} (${Math.round((completedCount / totalCount) * 100)}%)`}
                    onClick={() => { setFilterStatus("Completed"); setCurrentPage(1); }}
                  ></div>
                  <div
                    className="multi-bar-seg in-progress"
                    style={{ width: `${(inProgressCount / totalCount) * 100}%` }}
                    title={`In Progress: ${inProgressCount} (${Math.round((inProgressCount / totalCount) * 100)}%)`}
                    onClick={() => { setFilterStatus("In Progress"); setCurrentPage(1); }}
                  ></div>
                  <div
                    className="multi-bar-seg pending"
                    style={{ width: `${(pendingCount / totalCount) * 100}%` }}
                    title={`Pending: ${pendingCount} (${Math.round((pendingCount / totalCount) * 100)}%)`}
                    onClick={() => { setFilterStatus("Pending"); setCurrentPage(1); }}
                  ></div>
                  <div
                    className="multi-bar-seg cancelled"
                    style={{ width: `${(cancelledCount / totalCount) * 100}%` }}
                    title={`Cancelled: ${cancelledCount} (${Math.round((cancelledCount / totalCount) * 100)}%)`}
                    onClick={() => { setFilterStatus("Cancelled"); setCurrentPage(1); }}
                  ></div>
                </>
              ) : (
                <div className="multi-bar-seg empty" style={{ width: "100%" }}></div>
              )}
            </div>

            {/* Status Legend Pills */}
            <div className="status-legend-pills">
              <span className="legend-chip completed" onClick={() => { setFilterStatus("Completed"); setCurrentPage(1); }}>
                <span className="chip-dot"></span> Completed ({completedCount})
              </span>
              <span className="legend-chip in-progress" onClick={() => { setFilterStatus("In Progress"); setCurrentPage(1); }}>
                <span className="chip-dot"></span> In Progress ({inProgressCount})
              </span>
              <span className="legend-chip pending" onClick={() => { setFilterStatus("Pending"); setCurrentPage(1); }}>
                <span className="chip-dot"></span> Pending ({pendingCount})
              </span>
              <span className="legend-chip cancelled" onClick={() => { setFilterStatus("Cancelled"); setCurrentPage(1); }}>
                <span className="chip-dot"></span> Cancelled ({cancelledCount})
              </span>
            </div>
          </div>

          {/* 7-Day Order Intake Mini-Chart */}
          <div className="weekly-mini-chart-block">
            <div className="status-progress-title">
              <span>7-Day Orders Intake Flow</span>
              <span className="mini-chart-peak">Peak: Saturday</span>
            </div>

            <div className="mini-chart-bars-row">
              {weeklyOrderTrend.map((d, idx) => {
                const heightPct = Math.round((d.count / maxDailyOrders) * 100);
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={d.day}
                    className="mini-bar-col"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    <div className="mini-bar-track">
                      <div
                        className={`mini-bar-fill ${isHovered ? "active" : ""}`}
                        style={{ height: `${heightPct}%` }}
                      ></div>
                    </div>
                    <span className={`mini-bar-label ${isHovered ? "active" : ""}`}>{d.day}</span>
                    
                    {/* Hover Value Tooltip */}
                    {isHovered && (
                      <div className="mini-bar-hover-pop animate-scale-up">
                        <strong>{d.count} Orders</strong>
                        <span>{d.rev}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Main Bookings Management Section */}
      <div className="admin-card-section">
        
        {/* Header & Filter Controls Row */}
        <div className="admin-card-header" style={{ marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>Customer Orders Directory</h3>
              <span className="admin-count-pill">
                Page {safeCurrentPage} of {totalPages} ({filtered.length} Orders)
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0" }}>
              Assign certified professionals, verify door OTPs, and update delivery milestones
            </p>
          </div>
        </div>

        {/* Search & Status Filter Chips Toolbar */}
        <div className="admin-catalog-toolbar">
          <div className="admin-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by customer, booking ID, phone, or service..."
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

          {/* Status Filter Chips */}
          <div className="admin-tag-chips-wrapper">
            {[
              { id: "All", label: "All Orders", count: totalCount },
              { id: "Pending", label: "Pending", count: pendingCount },
              { id: "In Progress", label: "In Progress", count: inProgressCount },
              { id: "Completed", label: "Completed", count: completedCount },
              { id: "Cancelled", label: "Cancelled", count: cancelledCount }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                className={`admin-tag-chip ${filterStatus === st.id ? "active" : ""}`}
                onClick={() => {
                  setFilterStatus(st.id);
                  setCurrentPage(1);
                }}
              >
                <span>{st.label}</span>
                <span className="tag-chip-count">{st.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table / Cards */}
        {filtered.length === 0 ? (
          <div className="admin-empty-state">
            <span style={{ fontSize: "42px" }}>🔍</span>
            <h4>No matching orders found</h4>
            <p>Try searching with another keyword or reset status filters.</p>
            <button
              className="btn-secondary-outline"
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("All");
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
                    <th>Order ID</th>
                    <th>Customer Details</th>
                    <th>Service Requested</th>
                    <th>Assigned Provider</th>
                    <th>Location / Address</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date / Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <span className="booking-id-tag">{booking.id}</span>
                        {booking.doorOtp && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                            OTP: <strong style={{ color: "var(--primary)" }}>{booking.doorOtp}</strong>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="booking-customer-cell">
                          <strong className="booking-cust-name">{booking.customerName}</strong>
                          <a href={`tel:${booking.phone}`} className="booking-cust-phone">
                            📞 {booking.phone}
                          </a>
                        </div>
                      </td>
                      <td>
                        <div className="booking-service-badge">
                          <span>{booking.service}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          value={booking.provider || ""}
                          onChange={(e) => updateBookingStatus(booking.id, booking.status, e.target.value)}
                          className="booking-provider-select"
                        >
                          <option value="Auto Assigned">Auto Assigned</option>
                          {providers.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ maxWidth: "200px" }}>
                        <div className="booking-address-text" title={booking.address}>
                          📍 {booking.address}
                        </div>
                      </td>
                      <td>
                        <strong className="booking-price-tag">{booking.price}</strong>
                      </td>
                      <td>
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          className={`status-select-pill ${getStatusBadgeClass(booking.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <span className="booking-date-text">{booking.date || "Today"}</span>
                      </td>
                      <td>
                        <button 
                          className="btn-card-action delete icon-only"
                          onClick={() => {
                            if (window.confirm(`Delete booking order "${booking.id}"?`)) {
                              deleteBooking(booking.id);
                            }
                          }}
                          title="Delete Record"
                        >
                          🗑️
                        </button>
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
                  Showing <strong>{startIndex + 1}</strong> - <strong>{endIndex}</strong> of <strong>{filtered.length}</strong> orders
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
                      <option value={8}>8 / page</option>
                      <option value={12}>12 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
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

      {/* Manual Booking Create Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            <div className="modal-title-row">
              <span style={{ fontSize: "28px" }}>⚡</span>
              <div>
                <h3 style={{ margin: 0 }}>Create Customer Booking</h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Manually dispatch an on-demand order on behalf of customer.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} className="admin-modal-form">
              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Amit Kumar"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Customer Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Service *</label>
                  <input
                    type="text"
                    placeholder="e.g. Electrician, AC Repair"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Quoted Price *</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹299"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Customer Address *</label>
                <textarea
                  rows={2}
                  placeholder="Flat number, building, sector, landmark..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-actions-group">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-glow" style={{ flex: 1 }}>
                  Confirm & Create Booking ⚡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminBookings;

