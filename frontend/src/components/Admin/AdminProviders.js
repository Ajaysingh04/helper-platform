import React, { useContext, useState, useMemo } from "react";
import { DataContext } from "../../context/DataContext";

function AdminProviders() {
  const { providers, addProvider, updateProvider, deleteProvider } = useContext(DataContext);
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [showModal, setShowModal] = useState(false);
  const [editingProv, setEditingProv] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState("Electrician");
  const [contact, setContact] = useState("+91 ");
  const [hourlyRate, setHourlyRate] = useState("₹299/hr");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState("");
  const [verified, setVerified] = useState(true);
  const [franchiseActive, setFranchiseActive] = useState(false);
  const [franchisePlan, setFranchisePlan] = useState("monthly");

  // Summary Metrics
  const totalCount = providers.length;
  const verifiedCount = providers.filter((p) => p.verified).length;
  const pendingCount = providers.filter((p) => !p.verified).length;
  const franchiseCount = providers.filter((p) => p.franchiseActive).length;
  const totalJobsDone = providers.reduce((sum, p) => sum + (p.jobsDone || 0), 0);

  // Filter Providers
  const filtered = useMemo(() => {
    return providers.filter((p) => {
      // 1. Status / Tag Filter
      let matchType = true;
      if (filterType === "Verified") matchType = p.verified === true;
      else if (filterType === "Pending") matchType = p.verified === false;
      else if (filterType === "Franchise") matchType = p.franchiseActive === true;

      // 2. Search Query Filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.shopName && p.shopName.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.contact && p.contact.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q));

      return matchType && matchSearch;
    });
  }, [providers, filterType, searchQuery]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginatedProviders = filtered.slice(startIndex, endIndex);

  const goToPage = (page) => {
    const target = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(target);
    const elem = document.getElementById("providers-management-header");
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

  const openAdd = () => {
    setEditingProv(null);
    setName("");
    setShopName("");
    setCategory("Electrician");
    setContact("+91 ");
    setHourlyRate("₹299/hr");
    setAddress("Metro Zone, City Center");
    setImage("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600");
    setVerified(true);
    setFranchiseActive(false);
    setFranchisePlan("monthly");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProv(p);
    setName(p.name || "");
    setShopName(p.shopName || "");
    setCategory(p.category || "Electrician");
    setContact(p.contact || p.phone || "+91 ");
    setHourlyRate(p.hourlyRate || "₹299/hr");
    setAddress(p.address || p.location || "");
    setImage(p.image || p.avatar || "");
    setVerified(p.verified !== false);
    setFranchiseActive(Boolean(p.franchiseActive));
    setFranchisePlan(p.franchisePlan || "monthly");
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      shopName: shopName.trim() || `${name.trim()}'s Services`,
      category: category.trim(),
      contact: contact.trim(),
      phone: contact.trim(),
      hourlyRate: hourlyRate.trim(),
      address: address.trim(),
      location: address.trim(),
      image: image.trim() || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600",
      avatar: image.trim() || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600",
      verified,
      franchiseActive,
      franchisePlan,
      franchiseAmount: franchisePlan === "annual" ? 500000 : 4000
    };

    if (editingProv) {
      updateProvider(editingProv.id, payload);
    } else {
      addProvider({
        ...payload,
        id: `vdr_${Date.now()}`,
        rating: 5.0,
        jobsDone: 0,
        status: "Active"
      });
    }
    setShowModal(false);
    setCurrentPage(1);
  };

  return (
    <div className="admin-providers-tab animate-fade-in" id="providers-management-header">
      
      {/* Top Stat Summary Grid */}
      <div className="admin-stats-summary-grid">
        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366F1" }}>
            👥
          </div>
          <div>
            <div className="summary-card-num">{totalCount}</div>
            <div className="summary-card-label">Total Registered Partners</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
            🛡️
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#10B981" }}>{verifiedCount}</div>
            <div className="summary-card-label">100% ID Verified Pros</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#D97706" }}>
            ⏳
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#D97706" }}>{pendingCount}</div>
            <div className="summary-card-label">Pending Document Checks</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(255, 77, 45, 0.12)", color: "#FF4D2D" }}>
            👑
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#FF4D2D" }}>{franchiseCount}</div>
            <div className="summary-card-label">Franchise Elite Partners</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(147, 51, 234, 0.12)", color: "#9333EA" }}>
            ⭐
          </div>
          <div>
            <div className="summary-card-num">{totalJobsDone}+</div>
            <div className="summary-card-label">Customer Orders Fulfilled</div>
          </div>
        </div>
      </div>

      {/* Main Providers Section */}
      <div className="admin-card-section">
        
        {/* Header Row */}
        <div className="admin-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>Verified Service Providers & Partners</h3>
              <span className="admin-count-pill">
                Page {safeCurrentPage} of {totalPages} ({filtered.length} Pros)
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0" }}>
              Manage background-checked local experts, franchise plans, and real-time live dispatches
            </p>
          </div>

          <button className="btn-primary-glow" onClick={openAdd}>
            <span>+</span> <span>Register New Partner</span>
          </button>
        </div>

        {/* Search & Filter Chips Toolbar */}
        <div className="admin-catalog-toolbar">
          <div className="admin-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by partner name, business, category, phone, or city..."
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

          {/* Filter Chips */}
          <div className="admin-tag-chips-wrapper">
            {[
              { id: "All", label: "All Pros", count: totalCount },
              { id: "Verified", label: "🛡️ Verified", count: verifiedCount },
              { id: "Pending", label: "⏳ Pending ID", count: pendingCount },
              { id: "Franchise", label: "👑 Franchise Elite", count: franchiseCount }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                className={`admin-tag-chip ${filterType === st.id ? "active" : ""}`}
                onClick={() => {
                  setFilterType(st.id);
                  setCurrentPage(1);
                }}
              >
                <span>{st.label}</span>
                <span className="tag-chip-count">{st.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Providers Table / Cards */}
        {filtered.length === 0 ? (
          <div className="admin-empty-state">
            <span style={{ fontSize: "42px" }}>🔍</span>
            <h4>No matching service partners found</h4>
            <p>Try searching with another keyword or reset the filter.</p>
            <button
              className="btn-secondary-outline"
              onClick={() => {
                setSearchQuery("");
                setFilterType("All");
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
                    <th>Partner / Business</th>
                    <th>Category Sector</th>
                    <th>Hourly Charge</th>
                    <th>Contact Phone</th>
                    <th>Rating & Jobs</th>
                    <th>ID Verification</th>
                    <th>Franchise Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProviders.map((p) => {
                    const fallbackImg = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
                    const imgSrc = p.image || p.avatar || fallbackImg;

                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="provider-cell-profile">
                            <img 
                              src={imgSrc} 
                              alt={p.name} 
                              className="provider-avatar-img"
                              onError={(e) => { e.currentTarget.src = fallbackImg; }}
                            />
                            <div>
                              <strong className="provider-name-title">{p.shopName || p.name}</strong>
                              {p.shopName && p.name && p.shopName !== p.name && (
                                <div className="provider-owner-sub">Owner: {p.name}</div>
                              )}
                              <div className="provider-address-sub">📍 {p.address || p.location || "City Center"}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="service-sector-pill" style={{ fontSize: "12px", fontWeight: 700 }}>
                            {p.category}
                          </span>
                        </td>

                        <td>
                          <strong className="provider-rate-tag">{p.hourlyRate || "₹299/hr"}</strong>
                        </td>

                        <td>
                          <a href={`tel:${p.contact || p.phone}`} className="booking-cust-phone">
                            📞 {p.contact || p.phone || "—"}
                          </a>
                        </td>

                        <td>
                          <div className="provider-rating-box">
                            <span className="provider-stars">★ {p.rating || 4.9}</span>
                            <span className="provider-jobs-count">{p.jobsDone || 0} Delivered</span>
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={`provider-verify-toggle-btn ${p.verified ? "verified" : "pending"}`}
                            onClick={() => updateProvider(p.id, { verified: !p.verified })}
                            title="Click to toggle ID verification status"
                          >
                            {p.verified ? "🛡️ Verified" : "⏳ Pending ID"}
                          </button>
                        </td>

                        <td>
                          {p.franchiseActive ? (
                            <span className="provider-franchise-badge active">
                              👑 {p.franchisePlan === "annual" ? "₹5L / yr (Annual)" : "₹4k / mo (Monthly)"}
                            </span>
                          ) : (
                            <span className="provider-franchise-badge standard">
                              Standard Partner
                            </span>
                          )}
                        </td>

                        <td>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <button 
                              type="button"
                              className="btn-card-action edit icon-only"
                              onClick={() => openEdit(p)}
                              title={`Edit ${p.name}`}
                            >
                              ✏️
                            </button>
                            <button 
                              type="button"
                              className="btn-card-action delete icon-only"
                              onClick={() => {
                                if (window.confirm(`Remove provider "${p.name}" from platform?`)) {
                                  deleteProvider(p.id);
                                }
                              }}
                              title={`Delete ${p.name}`}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="admin-pagination-wrapper">
                <div className="admin-pagination-info">
                  Showing <strong>{startIndex + 1}</strong> - <strong>{endIndex}</strong> of <strong>{filtered.length}</strong> partners
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

      {/* Add / Edit Provider Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            
            <div className="modal-title-row">
              <span style={{ fontSize: "28px" }}>{editingProv ? "✏️" : "🛡️"}</span>
              <div>
                <h3 style={{ margin: 0 }}>{editingProv ? `Edit Partner: ${editingProv.name}` : "Register New Verified Partner"}</h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Partner will be immediately listed across User Booking & Search directories.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Professional Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Business / Shop Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma Express Electricals"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Primary Service Category *</label>
                  <input
                    type="text"
                    placeholder="e.g. Electrician, Plumber, Home Chef"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Contact Phone / Hotline *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Hourly / Base Rate *</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹299/hr"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>City & Operating Area *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 62, Noida"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Photo / Avatar URL (Unsplash or CDN)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              {/* Photo Preview */}
              {image && (
                <div className="modal-image-preview-box">
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Avatar Preview</span>
                  <img
                    src={image}
                    alt="Preview"
                    style={{ width: "64px", height: "64px", borderRadius: "14px", objectFit: "cover", marginTop: "6px" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              )}

              {/* Verification & Franchise Toggles */}
              <div className="admin-checkbox-group" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                  />
                  <span>🛡️ Grant 100% Background Verified Badge</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={franchiseActive}
                    onChange={(e) => setFranchiseActive(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#FF4D2D" }}
                  />
                  <span>👑 Enable Franchise Partner Privileges</span>
                </label>

                {franchiseActive && (
                  <div style={{ marginLeft: "26px", marginTop: "4px" }}>
                    <label style={{ fontSize: "12.5px", color: "var(--text-muted)", marginRight: "8px" }}>Plan Tier:</label>
                    <select
                      value={franchisePlan}
                      onChange={(e) => setFranchisePlan(e.target.value)}
                      className="admin-per-page-select"
                    >
                      <option value="monthly">Monthly Plan (₹4,000 / month)</option>
                      <option value="annual">Annual Elite Plan (₹5,00,000 / year)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-actions-group">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-glow" style={{ flex: 1 }}>
                  {editingProv ? "Save Partner Profile 💾" : "Register Partner ⚡"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminProviders;

