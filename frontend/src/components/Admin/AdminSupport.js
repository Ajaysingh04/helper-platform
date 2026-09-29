import React, { useContext, useState, useMemo } from "react";
import { DataContext } from "../../context/DataContext";

function AdminSupport() {
  const { tickets = [], updateTicketStatus, deleteTicket, resolveTicket } = useContext(DataContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Normalizing helper for ticket properties
  const getTicketName = (t) => t.customerName || t.name || "Customer";
  const getTicketMessage = (t) => t.description || t.message || "No message content provided.";
  const getTicketSubject = (t) => t.subject || t.topic || "General Inquiry";
  const getTicketStatus = (t) => t.status || "Open";
  const getTicketPriority = (t) => t.priority || "Medium";

  // Summary counts
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => (t.status || "Open") === "Open" || t.status === "Active").length;
  const inProgressCount = tickets.filter(t => t.status === "In Progress").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length;
  const resolutionRate = totalCount ? Math.round((resolvedCount / totalCount) * 100) : 100;

  // Filtered tickets
  const filtered = useMemo(() => {
    return tickets.filter(t => {
      const name = getTicketName(t).toLowerCase();
      const email = (t.email || "").toLowerCase();
      const phone = (t.phone || "").toLowerCase();
      const id = (t.id || "").toLowerCase();
      const subj = getTicketSubject(t).toLowerCase();
      const msg = getTicketMessage(t).toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        id.includes(q) ||
        subj.includes(q) ||
        msg.includes(q);

      const status = getTicketStatus(t);
      let matchesStatus = true;
      if (filterStatus === "Open") {
        matchesStatus = status === "Open" || status === "Active";
      } else if (filterStatus === "In Progress") {
        matchesStatus = status === "In Progress";
      } else if (filterStatus === "Resolved") {
        matchesStatus = status === "Resolved" || status === "Closed";
      }

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, filterStatus]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedTickets = filtered.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const changePage = (p) => {
    setCurrentPage(p);
    const el = document.getElementById("support-management-header");
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: Math.max(0, topOffset), left: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages];
  };

  // Actions
  const handleDelete = (t) => {
    const name = getTicketName(t);
    const id = t.id || t._id;
    if (window.confirm(`Are you sure you want to permanently delete Inquiry #${t.id} from "${name}"?`)) {
      if (deleteTicket) {
        deleteTicket(id);
      }
      if (selectedTicket && (selectedTicket.id === t.id || selectedTicket._id === id)) {
        setSelectedTicket(null);
      }
    }
  };

  const handleToggleStatus = (t) => {
    const id = t.id || t._id;
    const current = getTicketStatus(t);
    const newStatus = (current === "Resolved" || current === "Closed") ? "Open" : "Resolved";
    if (updateTicketStatus) {
      updateTicketStatus(id, newStatus);
    } else if (resolveTicket && newStatus === "Resolved") {
      resolveTicket(id);
    }
    if (selectedTicket && (selectedTicket.id === t.id || selectedTicket._id === id)) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const handleSetStatus = (t, status) => {
    const id = t.id || t._id;
    if (updateTicketStatus) {
      updateTicketStatus(id, status);
    } else if (resolveTicket && status === "Resolved") {
      resolveTicket(id);
    }
    if (selectedTicket && (selectedTicket.id === t.id || selectedTicket._id === id)) {
      setSelectedTicket({ ...selectedTicket, status });
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Open":
      case "Active":
        return {
          bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(249, 115, 22, 0.18) 100%)",
          color: "#EA580C",
          border: "rgba(234, 88, 12, 0.35)",
          label: "🔴 Active / Open"
        };
      case "In Progress":
        return {
          bg: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.18) 100%)",
          color: "#4F46E5",
          border: "rgba(99, 102, 241, 0.35)",
          label: "⚡ In Progress"
        };
      case "Resolved":
        return {
          bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.18) 100%)",
          color: "#059669",
          border: "rgba(16, 185, 129, 0.35)",
          label: "✓ Resolved"
        };
      case "Closed":
        return {
          bg: "rgba(148, 163, 184, 0.15)",
          color: "#64748B",
          border: "rgba(148, 163, 184, 0.3)",
          label: "Closed"
        };
      default:
        return {
          bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(249, 115, 22, 0.18) 100%)",
          color: "#EA580C",
          border: "rgba(234, 88, 12, 0.35)",
          label: status
        };
    }
  };

  return (
    <div className="admin-support-tab animate-fade-in" id="support-management-header">
      
      {/* Top Stat Summary Grid */}
      <div className="admin-stats-summary-grid">
        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366F1" }}>
            📩
          </div>
          <div>
            <div className="summary-card-num">{totalCount}</div>
            <div className="summary-card-label">Total Support Inquiries</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#EF4444" }}>
            🔴
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#EF4444" }}>{openCount}</div>
            <div className="summary-card-label">Active / Open Inquiries</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#4F46E5" }}>
            ⚡
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#4F46E5" }}>{inProgressCount}</div>
            <div className="summary-card-label">Investigating In-Progress</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
            ✅
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#10B981" }}>{resolvedCount}</div>
            <div className="summary-card-label">Resolved Inquiries</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#D97706" }}>
            🎯
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#D97706" }}>{resolutionRate}%</div>
            <div className="summary-card-label">Inquiry Resolution Rate</div>
          </div>
        </div>
      </div>

      {/* Main Support Section */}
      <div className="admin-card-section">
        
        {/* Header Row */}
        <div className="admin-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>Customer Inquiries & Support Tickets</h3>
              <span className="admin-count-pill">
                Page {safeCurrentPage} of {totalPages} ({filtered.length} Inquiries)
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0" }}>
              Manage inbound customer queries, activate or resolve issues, and communicate with senders
            </p>
          </div>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="table-controls-bar">
          <div className="search-box-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by ticket ID, customer, email, phone, subject, or message..."
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

          {/* Segmented Filter Tabs with Live Badges */}
          <div className="filters-group">
            <div className="segmented-control">
              {[
                { id: "All", label: "All Inquiries", count: totalCount, icon: "📬" },
                { id: "Open", label: "Active", count: openCount, icon: "🔴" },
                { id: "In Progress", label: "In Progress", count: inProgressCount, icon: "⚡" },
                { id: "Resolved", label: "Resolved", count: resolvedCount, icon: "✅" }
              ].map((st) => {
                const isActive = filterStatus === st.id;
                let specificClass = "";
                if (st.id === "All") specificClass = "seg-all";
                else if (st.id === "Open") specificClass = "seg-pending";
                else if (st.id === "In Progress") specificClass = "seg-all";
                else if (st.id === "Resolved") specificClass = "seg-verified";

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
                    {isActive && st.id === "Open" && (
                      <span className="seg-live-dot" style={{ background: "#EF4444" }} />
                    )}
                    <span className="seg-count-badge">{st.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="admin-empty-state">
            <span style={{ fontSize: "42px" }}>🔍</span>
            <h4>No matching support tickets found</h4>
            <p>Try searching with another keyword or reset the filter.</p>
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
              <table className="admin-table support-table">
                <thead>
                  <tr>
                    <th className="col-tk-id">Ticket ID</th>
                    <th className="col-tk-sender">Customer / Sender</th>
                    <th className="col-tk-subject">Subject & Topic</th>
                    <th className="col-tk-msg">Customer Message</th>
                    <th className="col-tk-date">Received Date</th>
                    <th className="col-tk-status">Ticket Status</th>
                    <th className="col-tk-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTickets.map((t) => {
                    const id = t.id || t._id;
                    const name = getTicketName(t);
                    const email = t.email || "—";
                    const phone = t.phone || "—";
                    const subject = getTicketSubject(t);
                    const message = getTicketMessage(t);
                    const status = getTicketStatus(t);
                    const statusStyle = getStatusBadgeStyle(status);
                    const priority = getTicketPriority(t);

                    return (
                      <tr key={id}>
                        {/* Ticket ID & Priority */}
                        <td className="col-tk-id">
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <strong className="booking-id-tag">{id}</strong>
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontWeight: 800,
                                padding: "2px 6px",
                                borderRadius: "4px",
                                width: "fit-content",
                                background: priority === "High" ? "rgba(239, 68, 68, 0.12)" : "rgba(148, 163, 184, 0.15)",
                                color: priority === "High" ? "#DC2626" : "#64748B",
                                border: priority === "High" ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(148, 163, 184, 0.25)"
                              }}
                            >
                              {priority} Priority
                            </span>
                          </div>
                        </td>

                        {/* Customer / Sender */}
                        <td className="col-tk-sender">
                          <div className="booking-customer-cell">
                            <strong className="booking-cust-name">{name}</strong>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                              {phone !== "—" && (
                                <a href={`tel:${phone}`} className="booking-cust-phone" title="Call Customer">
                                  📞 {phone}
                                </a>
                              )}
                              {email !== "—" && (
                                <a
                                  href={`mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`}
                                  className="booking-cust-phone"
                                  title="Send Email"
                                  style={{ color: "#6366F1" }}
                                >
                                  ✉️ {email}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="col-tk-subject">
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span className="service-sector-pill" style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {subject}
                            </span>
                          </div>
                        </td>

                        {/* Message Snippet */}
                        <td className="col-tk-msg">
                          <div
                            style={{
                              fontSize: "12.5px",
                              color: "var(--text-muted)",
                              lineHeight: 1.45,
                              maxHeight: "42px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              cursor: "pointer"
                            }}
                            onClick={() => setSelectedTicket(t)}
                            title="Click to view full message"
                          >
                            {message}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="col-tk-date">
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                            {t.date || "Recent"}
                          </span>
                        </td>

                        {/* Status Select / Pill */}
                        <td className="col-tk-status">
                          <select
                            className="status-select-pill"
                            style={{
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              borderColor: statusStyle.border
                            }}
                            value={status}
                            onChange={(e) => handleSetStatus(t, e.target.value)}
                            title="Click to change ticket status"
                          >
                            <option value="Open">🔴 Active / Open</option>
                            <option value="In Progress">⚡ In Progress</option>
                            <option value="Resolved">✓ Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>

                        {/* Actions: View, Toggle Active/Resolved, Delete */}
                        <td className="col-tk-actions">
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
                            <button
                              type="button"
                              className="btn-card-action edit icon-only"
                              onClick={() => setSelectedTicket(t)}
                              title="View full inquiry details"
                            >
                              👁️
                            </button>

                            <button
                              type="button"
                              className="btn-card-action edit icon-only"
                              onClick={() => handleToggleStatus(t)}
                              title={(status === "Resolved" || status === "Closed") ? "Re-activate inquiry" : "Mark as resolved"}
                              style={{
                                color: (status === "Resolved" || status === "Closed") ? "#EA580C" : "#059669",
                                borderColor: (status === "Resolved" || status === "Closed") ? "rgba(234, 88, 12, 0.3)" : "rgba(16, 185, 129, 0.3)",
                                background: (status === "Resolved" || status === "Closed") ? "rgba(234, 88, 12, 0.08)" : "rgba(16, 185, 129, 0.08)"
                              }}
                            >
                              {(status === "Resolved" || status === "Closed") ? "⚡" : "✓"}
                            </button>

                            <button
                              type="button"
                              className="btn-card-action delete icon-only"
                              onClick={() => handleDelete(t)}
                              title="Delete inquiry"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card Grid View (Visible <= 992px) */}
            <div className="admin-mobile-cards-view">
              {paginatedTickets.map((t) => {
                const id = t.id || t._id;
                const name = getTicketName(t);
                const email = t.email || "—";
                const phone = t.phone || "—";
                const subject = getTicketSubject(t);
                const message = getTicketMessage(t);
                const status = getTicketStatus(t);
                const statusStyle = getStatusBadgeStyle(status);
                const priority = getTicketPriority(t);

                return (
                  <div key={`ticket-card-${id}`} className="admin-order-card">
                    {/* Header: ID, Priority, Date, and Delete Button */}
                    <div className="order-card-header">
                      <div className="order-card-id-block">
                        <strong className="booking-id-tag">{id}</strong>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 800,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: priority === "High" ? "rgba(239, 68, 68, 0.12)" : "rgba(148, 163, 184, 0.15)",
                            color: priority === "High" ? "#DC2626" : "#64748B",
                            border: priority === "High" ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(148, 163, 184, 0.25)"
                          }}
                        >
                          {priority}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="order-card-date">{t.date || "Recent"}</span>
                        <button
                          type="button"
                          className="btn-card-action delete icon-only"
                          onClick={() => handleDelete(t)}
                          title="Delete inquiry"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Sender Row */}
                    <div className="order-card-cust-row">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="order-card-avatar" style={{ background: "linear-gradient(135deg, #FF4D2D, #F59E0B)" }}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong className="booking-cust-name">{name}</strong>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "3px" }}>
                            {phone !== "—" && (
                              <a href={`tel:${phone}`} className="booking-cust-phone">
                                📞 {phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {email !== "—" && (
                        <a
                          href={`mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`}
                          className="btn-card-action edit icon-only"
                          title="Email Customer"
                        >
                          ✉️
                        </a>
                      )}
                    </div>

                    {/* Subject & Message Bubble */}
                    <div className="order-card-service-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                      <span className="service-sector-pill">
                        {subject}
                      </span>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                        {message}
                      </p>
                    </div>

                    {/* Footer: Status Dropdown & Toggle Active Button */}
                    <div className="order-card-footer">
                      <select
                        className="status-select-pill"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderColor: statusStyle.border,
                          fontWeight: 700
                        }}
                        value={status}
                        onChange={(e) => handleSetStatus(t, e.target.value)}
                      >
                        <option value="Open">🔴 Active / Open</option>
                        <option value="In Progress">⚡ In Progress</option>
                        <option value="Resolved">✓ Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="btn-secondary-outline"
                          style={{ padding: "5px 12px", fontSize: "12px", borderRadius: "8px" }}
                          onClick={() => setSelectedTicket(t)}
                        >
                          Details 👁️
                        </button>

                        <button
                          type="button"
                          className="btn-card-action edit"
                          style={{
                            padding: "5px 12px",
                            fontSize: "12px",
                            borderRadius: "8px",
                            color: (status === "Resolved" || status === "Closed") ? "#EA580C" : "#059669",
                            borderColor: (status === "Resolved" || status === "Closed") ? "rgba(234, 88, 12, 0.3)" : "rgba(16, 185, 129, 0.3)",
                            background: (status === "Resolved" || status === "Closed") ? "rgba(234, 88, 12, 0.08)" : "rgba(16, 185, 129, 0.08)"
                          }}
                          onClick={() => handleToggleStatus(t)}
                        >
                          {(status === "Resolved" || status === "Closed") ? "⚡ Activate" : "✓ Resolve"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="admin-pagination-container">
                <div className="pagination-info">
                  Showing <strong>{(safeCurrentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                  <strong>{Math.min(safeCurrentPage * itemsPerPage, filtered.length)}</strong> of{" "}
                  <strong>{filtered.length}</strong> inquiries
                </div>

                <div className="pagination-btn-group">
                  <button
                    type="button"
                    className="btn-pagination nav-btn"
                    onClick={() => changePage(1)}
                    disabled={safeCurrentPage === 1}
                    title="First Page"
                  >
                    « First
                  </button>

                  <button
                    type="button"
                    className="btn-pagination nav-btn"
                    onClick={() => changePage(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    title="Previous Page"
                  >
                    ‹ Prev
                  </button>

                  <div className="pagination-numbers">
                    {getPageNumbers().map((num, idx) => {
                      if (num === "...") {
                        return (
                          <span key={`dots-${idx}`} className="pagination-ellipsis">
                            ...
                          </span>
                        );
                      }
                      const isActive = num === safeCurrentPage;
                      return (
                        <button
                          key={`page-${num}`}
                          type="button"
                          className={`btn-pagination num-btn ${isActive ? "active" : ""}`}
                          onClick={() => changePage(num)}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="btn-pagination nav-btn"
                    onClick={() => changePage(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    title="Next Page"
                  >
                    Next ›
                  </button>

                  <button
                    type="button"
                    className="btn-pagination nav-btn"
                    onClick={() => changePage(totalPages)}
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

      {/* Ticket Details View & Action Modal */}
      {selectedTicket && (
        <div className="admin-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <button className="admin-modal-close" onClick={() => setSelectedTicket(null)}>✕</button>
            
            <div className="modal-title-row">
              <span style={{ fontSize: "28px" }}>📩</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0 }}>Inquiry Details</h3>
                  <strong className="booking-id-tag">{selectedTicket.id || selectedTicket._id}</strong>
                </div>
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Received on {selectedTicket.date || "Recent"}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Sender Info Card */}
              <div style={{ background: "var(--bg-canvas, #F8FAFC)", padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--border-color, #E2E8F0)" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                  Customer Sender Profile
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>
                      {getTicketName(selectedTicket)}
                    </strong>
                    <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                      ✉️ {selectedTicket.email || "No email"} • 📞 {selectedTicket.phone || "No phone"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {selectedTicket.phone && (
                      <a href={`tel:${selectedTicket.phone}`} className="btn-secondary-outline" style={{ padding: "6px 12px", fontSize: "12px" }}>
                        📞 Call
                      </a>
                    )}
                    {selectedTicket.email && (
                      <a
                        href={`mailto:${selectedTicket.email}?subject=Re: ${encodeURIComponent(getTicketSubject(selectedTicket))}`}
                        className="btn-primary-glow"
                        style={{ padding: "6px 14px", fontSize: "12px" }}
                      >
                        ✉️ Email
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Inquiry Subject & Full Message */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px", marginBottom: "6px" }}>
                  Query Topic & Full Customer Message
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <span className="service-sector-pill" style={{ fontSize: "12.5px" }}>
                    {getTicketSubject(selectedTicket)}
                  </span>
                </div>
                <div
                  style={{
                    background: "var(--surface-input, #F8FAFC)",
                    border: "1px solid var(--border-color, #E2E8F0)",
                    borderRadius: "12px",
                    padding: "16px",
                    fontSize: "13.5px",
                    lineHeight: 1.6,
                    color: "var(--text-main)",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {getTicketMessage(selectedTicket)}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  Change Ticket Status
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn-card-action"
                    style={{
                      background: (getTicketStatus(selectedTicket) === "Open" || getTicketStatus(selectedTicket) === "Active") ? "#EF4444" : "rgba(239, 68, 68, 0.1)",
                      color: (getTicketStatus(selectedTicket) === "Open" || getTicketStatus(selectedTicket) === "Active") ? "#FFFFFF" : "#EF4444",
                      border: "1px solid rgba(239, 68, 68, 0.3)"
                    }}
                    onClick={() => handleSetStatus(selectedTicket, "Open")}
                  >
                    🔴 Active / Open
                  </button>
                  <button
                    type="button"
                    className="btn-card-action"
                    style={{
                      background: getTicketStatus(selectedTicket) === "In Progress" ? "#4F46E5" : "rgba(99, 102, 241, 0.1)",
                      color: getTicketStatus(selectedTicket) === "In Progress" ? "#FFFFFF" : "#4F46E5",
                      border: "1px solid rgba(99, 102, 241, 0.3)"
                    }}
                    onClick={() => handleSetStatus(selectedTicket, "In Progress")}
                  >
                    ⚡ In Progress
                  </button>
                  <button
                    type="button"
                    className="btn-card-action"
                    style={{
                      background: getTicketStatus(selectedTicket) === "Resolved" ? "#10B981" : "rgba(16, 185, 129, 0.1)",
                      color: getTicketStatus(selectedTicket) === "Resolved" ? "#FFFFFF" : "#10B981",
                      border: "1px solid rgba(16, 185, 129, 0.3)"
                    }}
                    onClick={() => handleSetStatus(selectedTicket, "Resolved")}
                  >
                    ✓ Mark Resolved
                  </button>
                  <button
                    type="button"
                    className="btn-card-action"
                    style={{
                      background: getTicketStatus(selectedTicket) === "Closed" ? "#64748B" : "rgba(148, 163, 184, 0.1)",
                      color: getTicketStatus(selectedTicket) === "Closed" ? "#FFFFFF" : "#64748B",
                      border: "1px solid rgba(148, 163, 184, 0.3)"
                    }}
                    onClick={() => handleSetStatus(selectedTicket, "Closed")}
                  >
                    Close Ticket
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid var(--border-color, #E2E8F0)", marginTop: "6px" }}>
                <button
                  type="button"
                  className="btn-card-action delete"
                  onClick={() => handleDelete(selectedTicket)}
                >
                  🗑️ Delete This Inquiry
                </button>
                <button
                  type="button"
                  className="btn-secondary-outline"
                  onClick={() => setSelectedTicket(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminSupport;
