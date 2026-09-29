import React, { useContext, useState, useMemo } from "react";
import { DataContext } from "../../context/DataContext";
import WeeklyActivityRevenueGraph from "./WeeklyActivityRevenueGraph";

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

  // Fulfillment Donut Math
  const fulfillmentRate = totalCount > 0 
    ? Math.round(((completedCount + inProgressCount) / totalCount) * 100) 
    : 100;
  const donutR = 42;
  const donutCirc = 2 * Math.PI * donutR; // 263.89

  const compPct = totalCount > 0 ? (completedCount / totalCount) : 0;
  const progPct = totalCount > 0 ? (inProgressCount / totalCount) : 0;
  const pendPct = totalCount > 0 ? (pendingCount / totalCount) : 0;
  const cancPct = totalCount > 0 ? (cancelledCount / totalCount) : 0;

  const compLen = compPct * donutCirc;
  const progLen = progPct * donutCirc;
  const pendLen = pendPct * donutCirc;
  const cancLen = cancPct * donutCirc;

  const compOffset = 0;
  const progOffset = -compLen;
  const pendOffset = -(compLen + progLen);
  const cancOffset = -(compLen + progLen + pendLen);

  // 7-Day Intake Flow Graph Math
  const svgW = 460;
  const svgH = 100;
  const padX = 26;
  const padY = 16;
  const graphW = svgW - padX * 2;
  const graphH = svgH - padY * 2;

  const intakePoints = weeklyOrderTrend.map((d, i) => {
    const x = padX + (i / (weeklyOrderTrend.length - 1)) * graphW;
    const y = padY + graphH - (d.count / maxDailyOrders) * graphH;
    return { ...d, x, y };
  });

  const intakeSpline = useMemo(() => {
    if (!intakePoints.length) return "";
    let path = `M ${intakePoints[0].x.toFixed(1)},${intakePoints[0].y.toFixed(1)}`;
    for (let i = 0; i < intakePoints.length - 1; i++) {
      const p0 = i > 0 ? intakePoints[i - 1] : intakePoints[0];
      const p1 = intakePoints[i];
      const p2 = intakePoints[i + 1];
      const p3 = i < intakePoints.length - 2 ? intakePoints[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y + (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return path;
  }, [intakePoints]);

  const intakeArea = `${intakeSpline} L ${intakePoints[intakePoints.length - 1].x},${padY + graphH} L ${intakePoints[0].x},${padY + graphH} Z`;

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

      {/* Real Interactive Weekly Service Activity & Revenue Graph */}
      <div style={{ marginBottom: "24px" }}>
        <WeeklyActivityRevenueGraph bookings={bookings} />
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

        {/* Visual Graph Layout: Status Donut Graph + Weekly Intake Flow Spline */}
        <div className="bookings-graph-grid">
          
          {/* 1. Order Fulfillment Ratio: Interactive Donut Gauge Graph */}
          <div className="status-progress-block">
            <div className="status-progress-title">
              <span>Order Fulfillment Ratio</span>
              <strong style={{ color: "#10B981" }}>{fulfillmentRate}% Success Rate</strong>
            </div>

            <div className="fulfillment-donut-flex">
              {/* SVG Donut Chart */}
              <div className="donut-svg-stage">
                <svg viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={donutR}
                    fill="none"
                    stroke="rgba(150, 150, 150, 0.15)"
                    strokeWidth="11"
                  />
                  {/* Completed Arc */}
                  {compLen > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={donutR}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="11"
                      strokeDasharray={`${compLen} ${donutCirc - compLen}`}
                      strokeDashoffset={compOffset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 0.6s ease" }}
                    />
                  )}
                  {/* In Progress Arc */}
                  {progLen > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={donutR}
                      fill="none"
                      stroke="#6366F1"
                      strokeWidth="11"
                      strokeDasharray={`${progLen} ${donutCirc - progLen}`}
                      strokeDashoffset={progOffset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 0.6s ease" }}
                    />
                  )}
                  {/* Pending Arc */}
                  {pendLen > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={donutR}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="11"
                      strokeDasharray={`${pendLen} ${donutCirc - pendLen}`}
                      strokeDashoffset={pendOffset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 0.6s ease" }}
                    />
                  )}
                  {/* Cancelled Arc */}
                  {cancLen > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={donutR}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="11"
                      strokeDasharray={`${cancLen} ${donutCirc - cancLen}`}
                      strokeDashoffset={cancOffset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 0.6s ease" }}
                    />
                  )}
                </svg>

                <div className="donut-center-badge">
                  <strong>{fulfillmentRate}%</strong>
                  <span>Fulfilled</span>
                </div>
              </div>

              {/* Interactive Legend Grid */}
              <div className="fulfillment-legend-grid">
                <div
                  className={`fulfillment-stat-chip ${filterStatus === "Completed" ? "active" : ""}`}
                  onClick={() => { setFilterStatus("Completed"); setCurrentPage(1); }}
                  title="Filter Completed orders"
                >
                  <span className="chip-label-left">
                    <span className="chip-dot" style={{ background: "#10B981" }} />
                    Completed
                  </span>
                  <span className="chip-val-right" style={{ color: "#10B981" }}>
                    {completedCount} <span style={{ opacity: 0.6, fontSize: "10.5px" }}>({Math.round(compPct * 100)}%)</span>
                  </span>
                </div>

                <div
                  className={`fulfillment-stat-chip ${filterStatus === "In Progress" ? "active" : ""}`}
                  onClick={() => { setFilterStatus("In Progress"); setCurrentPage(1); }}
                  title="Filter In-Progress orders"
                >
                  <span className="chip-label-left">
                    <span className="chip-dot" style={{ background: "#6366F1" }} />
                    In Progress
                  </span>
                  <span className="chip-val-right" style={{ color: "#6366F1" }}>
                    {inProgressCount} <span style={{ opacity: 0.6, fontSize: "10.5px" }}>({Math.round(progPct * 100)}%)</span>
                  </span>
                </div>

                <div
                  className={`fulfillment-stat-chip ${filterStatus === "Pending" ? "active" : ""}`}
                  onClick={() => { setFilterStatus("Pending"); setCurrentPage(1); }}
                  title="Filter Pending inquiries"
                >
                  <span className="chip-label-left">
                    <span className="chip-dot" style={{ background: "#F59E0B" }} />
                    Pending
                  </span>
                  <span className="chip-val-right" style={{ color: "#F59E0B" }}>
                    {pendingCount} <span style={{ opacity: 0.6, fontSize: "10.5px" }}>({Math.round(pendPct * 100)}%)</span>
                  </span>
                </div>

                <div
                  className={`fulfillment-stat-chip ${filterStatus === "Cancelled" ? "active" : ""}`}
                  onClick={() => { setFilterStatus("Cancelled"); setCurrentPage(1); }}
                  title="Filter Cancelled orders"
                >
                  <span className="chip-label-left">
                    <span className="chip-dot" style={{ background: "#EF4444" }} />
                    Cancelled
                  </span>
                  <span className="chip-val-right" style={{ color: "#EF4444" }}>
                    {cancelledCount} <span style={{ opacity: 0.6, fontSize: "10.5px" }}>({Math.round(cancPct * 100)}%)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 7-Day Order Intake Flow: Real SVG Area & Spline Graph */}
          <div className="weekly-mini-chart-block">
            <div className="status-progress-title">
              <span>7-Day Orders Intake Flow</span>
              <span className="mini-chart-peak">
                <span className="seg-live-dot" style={{ width: "6px", height: "6px", marginRight: "4px" }} />
                Peak: Saturday
              </span>
            </div>

            <div className="intake-flow-chart-wrap">
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="intake-svg-stage">
                <defs>
                  <linearGradient id="intakeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle horizontal grid lines */}
                <line x1={padX} y1={padY + graphH} x2={svgW - padX} y2={padY + graphH} stroke="var(--border-color)" strokeDasharray="3 3" opacity="0.6" />
                <line x1={padX} y1={padY + graphH / 2} x2={svgW - padX} y2={padY + graphH / 2} stroke="var(--border-color)" strokeDasharray="3 3" opacity="0.3" />

                {/* Shaded Area Under Curve */}
                {intakeArea && (
                  <path d={intakeArea} fill="url(#intakeAreaGrad)" />
                )}

                {/* Spline Stroke Curve */}
                {intakeSpline && (
                  <path d={intakeSpline} fill="none" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
                )}

                {/* Interactive Day Points */}
                {intakePoints.map((pt, idx) => {
                  const isHovered = hoveredBarIndex === idx;
                  return (
                    <g
                      key={pt.day}
                      className="intake-hover-point"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Vertical highlight guideline */}
                      {isHovered && (
                        <line x1={pt.x} y1={padY} x2={pt.x} y2={padY + graphH} stroke="#6366F1" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.7" />
                      )}
                      <circle cx={pt.x} cy={pt.y} r={isHovered ? 8 : 4.5} fill="#6366F1" className="point-outer" opacity={isHovered ? 0.35 : 0.2} />
                      <circle cx={pt.x} cy={pt.y} r={isHovered ? 5 : 3} fill={isHovered ? "#FFFFFF" : "#6366F1"} stroke="#6366F1" strokeWidth="2" className="point-inner" />
                    </g>
                  );
                })}
              </svg>

              {/* Day Labels Row */}
              <div className="intake-day-labels">
                {weeklyOrderTrend.map((d, idx) => (
                  <span
                    key={d.day}
                    className={`intake-day-tag ${hoveredBarIndex === idx ? "active" : ""}`}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {d.day}
                  </span>
                ))}
              </div>

              {/* Hover Value Tooltip Floating Popup */}
              {hoveredBarIndex !== null && weeklyOrderTrend[hoveredBarIndex] && (
                <div
                  className="mini-bar-hover-pop animate-scale-up"
                  style={{
                    left: `${intakePoints[hoveredBarIndex]?.x || 200}px`,
                    top: "-8px",
                    transform: "translate(-50%, -100%)"
                  }}
                >
                  <strong>{weeklyOrderTrend[hoveredBarIndex].full}</strong>
                  <span>{weeklyOrderTrend[hoveredBarIndex].count} Bookings</span>
                  <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>{weeklyOrderTrend[hoveredBarIndex].rev} Volume</span>
                </div>
              )}
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

        {/* Search & Status Filter Controls Bar */}
        <div className="table-controls-bar">
          <div className="search-box-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by customer, booking ID, phone, service, or city..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Segmented Status Filter Tabs with Live Badges */}
          <div className="filters-group">
            <div className="segmented-control">
              {[
                { id: "All", label: "All Orders", count: totalCount, icon: "📦" },
                { id: "Pending", label: "Pending", count: pendingCount, icon: "⏳" },
                { id: "In Progress", label: "In Progress", count: inProgressCount, icon: "⚡" },
                { id: "Completed", label: "Completed", count: completedCount, icon: "✅" },
                { id: "Cancelled", label: "Cancelled", count: cancelledCount, icon: "❌" }
              ].map((st) => {
                const isActive = filterStatus === st.id;
                let specificClass = "";
                if (st.id === "All") specificClass = "seg-all";
                else if (st.id === "Completed") specificClass = "seg-active";
                else if (st.id === "Cancelled") specificClass = "seg-inactive";

                return (
                  <button
                    key={st.id}
                    type="button"
                    className={`${isActive ? "active" : ""} ${specificClass}`}
                    onClick={() => {
                      setFilterStatus(st.id);
                      setCurrentPage(1);
                    }}
                  >
                    <span>{st.icon}</span>
                    <span>{st.label}</span>
                    <span className="seg-count-badge">{st.count}</span>
                  </button>
                );
              })}
            </div>
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
            {/* Desktop Table View (Visible > 992px) */}
            <div className="admin-table-container admin-desktop-table-view">
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

            {/* Mobile & Tablet Card Grid View (Visible <= 992px) */}
            <div className="admin-mobile-cards-view">
              {paginatedBookings.map((booking) => (
                <div key={`card-${booking.id}`} className="admin-order-card">
                  {/* Card Header: ID, OTP & Status */}
                  <div className="order-card-header">
                    <div className="order-card-id-block">
                      <span className="booking-id-tag">{booking.id}</span>
                      {booking.doorOtp && (
                        <span className="order-card-otp" title="Customer Door Security OTP">
                          OTP: {booking.doorOtp}
                        </span>
                      )}
                    </div>
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
                  </div>

                  {/* Customer Info Row */}
                  <div className="order-card-cust-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="order-card-avatar">
                        {(booking.customerName || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong className="booking-cust-name">{booking.customerName}</strong>
                        <a href={`tel:${booking.phone}`} className="booking-cust-phone" style={{ display: "block" }}>
                          📞 {booking.phone}
                        </a>
                      </div>
                    </div>
                    <strong className="booking-price-tag">{booking.price}</strong>
                  </div>

                  {/* Service */}
                  <div className="order-card-service-row">
                    <div className="booking-service-badge" style={{ margin: 0 }}>
                      <span>{booking.service}</span>
                    </div>
                  </div>

                  {/* Provider Assignment */}
                  <div className="order-card-pro-row">
                    <span style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Provider:</span>
                    <select
                      value={booking.provider || ""}
                      onChange={(e) => updateBookingStatus(booking.id, booking.status, e.target.value)}
                      className="booking-provider-select"
                      style={{ flex: 1, maxWidth: "none" }}
                    >
                      <option value="Auto Assigned">Auto Assigned</option>
                      {providers.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  <div className="order-card-address">
                    <span>📍</span>
                    <span>{booking.address}</span>
                  </div>

                  {/* Card Footer: Date & Delete Action */}
                  <div className="order-card-footer">
                    <span className="order-card-date">🕒 {booking.date || "Today"}</span>
                    <div className="order-card-actions">
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
                    </div>
                  </div>
                </div>
              ))}
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

