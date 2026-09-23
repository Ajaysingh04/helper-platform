import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../../context/DataContext";
import { HERO_IMAGE_PRESETS } from "../../data/heroBannersData";

function AdminHeroBanners() {
  const dataContext = useContext(DataContext);
  const heroBanners = dataContext?.heroBanners || [];
  const addHeroBanner = dataContext?.addHeroBanner;
  const updateHeroBanner = dataContext?.updateHeroBanner;
  const toggleHeroBannerActive = dataContext?.toggleHeroBannerActive;
  const setActiveHeroBanner = dataContext?.setActiveHeroBanner;
  const deleteHeroBanner = dataContext?.deleteHeroBanner;

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form State
  const [title, setTitle] = useState("");
  const [highlight, setHighlight] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("#1 ON-DEMAND HOME SERVICE PLATFORM");
  const [city, setCity] = useState("📍 INDORE & REGION");
  const [image, setImage] = useState("/images/homepage_1.jpg");
  const [ctaText, setCtaText] = useState("Book Service Now ➔");
  const [ctaLink, setCtaLink] = useState("/services");
  const [tagsText, setTagsText] = useState("Electrician, AC Repair, Cleaning, Plumber, Salon at Home");
  const [active, setActive] = useState(true);
  const [fileError, setFileError] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const openAdd = () => {
    setEditingBanner(null);
    setTitle("Everything Your Home Needs.");
    setHighlight("Delivered In 15 Mins.");
    setSubtitle("Book certified electricians, plumbers, AC technicians, salon pros & cleaning experts. Guaranteed upfront rates with live GPS tracking.");
    setBadge("#1 ON-DEMAND HOME SERVICE PLATFORM");
    setCity("📍 INDORE & REGION");
    setImage("/images/homepage_1.jpg");
    setCtaText("Book Service Now ➔");
    setCtaLink("/services");
    setTagsText("Electrician, AC Repair, Cleaning, Plumber, Salon at Home");
    setActive(true);
    setFileError("");
    setShowModal(true);
  };

  const openEdit = (banner) => {
    setEditingBanner(banner);
    setTitle(banner.title || "");
    setHighlight(banner.highlight || "");
    setSubtitle(banner.subtitle || "");
    setBadge(banner.badge || "#1 ON-DEMAND HOME SERVICE PLATFORM");
    setCity(banner.city || "📍 INDORE & REGION");
    setImage(banner.image || "/images/homepage_1.jpg");
    setCtaText(banner.ctaText || "Book Service Now ➔");
    setCtaLink(banner.ctaLink || "/services");
    setTagsText(Array.isArray(banner.tags) ? banner.tags.join(", ") : "");
    setActive(banner.active !== false);
    setFileError("");
    setShowModal(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setFileError("Image size should be less than 8MB.");
      return;
    }

    setFileError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result);
        showToast("Uploaded image selected successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a title for the hero banner.");
      return;
    }
    if (!image.trim()) {
      alert("Please select or enter an image for the hero banner.");
      return;
    }

    const tagsArray = tagsText
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      highlight,
      subtitle,
      badge,
      city,
      image,
      ctaText,
      ctaLink,
      tags: tagsArray,
      active
    };

    if (editingBanner) {
      const bannerId = editingBanner.id || editingBanner._id;
      if (updateHeroBanner) updateHeroBanner(bannerId, payload);
      showToast(`Updated banner: "${title}"`);
    } else {
      if (addHeroBanner) addHeroBanner(payload);
      showToast(`Added new hero banner: "${title}"`);
    }

    setShowModal(false);
  };

  const handleToggle = (banner) => {
    const bannerId = banner.id || banner._id;
    if (toggleHeroBannerActive) {
      toggleHeroBannerActive(bannerId);
      showToast(`Toggled status for "${banner.title}"`);
    }
  };

  const handleMakeActivePrimary = (banner) => {
    const bannerId = banner.id || banner._id;
    if (setActiveHeroBanner) {
      setActiveHeroBanner(bannerId);
      showToast(`🌟 Set "${banner.title}" as primary active hero banner on homepage!`);
    }
  };

  const handleDelete = (banner) => {
    const bannerId = banner.id || banner._id;
    if (window.confirm(`Are you sure you want to delete banner: "${banner.title}"?`)) {
      if (deleteHeroBanner) {
        deleteHeroBanner(bannerId);
        showToast(`Deleted hero banner.`);
      }
    }
  };

  // Filter banners
  const filteredBanners = heroBanners.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      b.title?.toLowerCase().includes(q) ||
      b.highlight?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q) ||
      b.badge?.toLowerCase().includes(q) ||
      (Array.isArray(b.tags) && b.tags.some(t => t.toLowerCase().includes(q)));

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && b.active !== false) ||
      (statusFilter === "inactive" && b.active === false);

    return matchSearch && matchStatus;
  });

  const activeCount = heroBanners.filter(b => b.active !== false).length;
  const primaryActiveBanner = heroBanners.find(b => b.active !== false) || heroBanners[0];

  return (
    <div className="admin-page-container animate-fade-up">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="admin-toast-float">
          <span>⚡ {toastMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🖼️ Hero Section Banners</h1>
          <p className="admin-page-desc">
            Manage full-page hero background images, headlines, gradients & active banners displayed on your homepage.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="action-pill-btn secondary"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <span>🌐 View Live Homepage ↗</span>
          </Link>
          <button className="btn-primary-glow" onClick={openAdd}>
            <span>➕ Add Hero Banner</span>
          </button>
        </div>
      </div>

      {/* Primary Active Banner Preview Card */}
      {primaryActiveBanner && (
        <div
          style={{
            marginBottom: "24px",
            padding: "20px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(255, 77, 45, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)",
            border: "1.5px solid rgba(255, 77, 45, 0.25)",
            display: "flex",
            gap: "24px",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              width: "280px",
              height: "150px",
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              border: "2px solid #FFFFFF"
            }}
          >
            <img
              src={primaryActiveBanner.image}
              alt="Active Hero Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.target.src = "/images/homepage_1.jpg"; }}
            />
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "8px",
                background: "#16A34A",
                color: "#FFFFFF",
                fontSize: "10px",
                fontWeight: 800,
                padding: "3px 8px",
                borderRadius: "999px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
              }}
            >
              ● CURRENT LIVE HERO
            </div>
          </div>

          <div style={{ flex: 1, minWidth: "260px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#EA580C", textTransform: "uppercase" }}>
                {primaryActiveBanner.badge}
              </span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>
                {primaryActiveBanner.city}
              </span>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 4px 0", color: "var(--text-main)" }}>
              {primaryActiveBanner.title}{" "}
              <span style={{ color: "#FF4D2D" }}>{primaryActiveBanner.highlight}</span>
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 12px 0", maxWidth: "600px", lineHeight: 1.5 }}>
              {primaryActiveBanner.subtitle}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                className="action-pill-btn primary"
                onClick={() => openEdit(primaryActiveBanner)}
                style={{ padding: "6px 14px", fontSize: "12px" }}
              >
                ✏️ Edit Live Hero
              </button>
              <Link
                to="/"
                className="action-pill-btn secondary"
                style={{ padding: "6px 14px", fontSize: "12px", textDecoration: "none" }}
              >
                👁️ View Live in New Tab
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Filter and stats row */}
      <div className="table-controls-bar">
        <div className="search-box-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title, highlight, city or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="segmented-control">
            <button
              className={statusFilter === "all" ? "active" : ""}
              onClick={() => setStatusFilter("all")}
            >
              All ({heroBanners.length})
            </button>
            <button
              className={statusFilter === "active" ? "active" : ""}
              onClick={() => setStatusFilter("active")}
            >
              Active ({activeCount})
            </button>
            <button
              className={statusFilter === "inactive" ? "active" : ""}
              onClick={() => setStatusFilter("inactive")}
            >
              Inactive ({heroBanners.length - activeCount})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Banners */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "20px",
          marginTop: "16px"
        }}
      >
        {filteredBanners.map((banner) => {
          const bannerId = banner.id || banner._id;
          const isLivePrimary = primaryActiveBanner && (primaryActiveBanner.id === bannerId || primaryActiveBanner._id === bannerId);

          return (
            <div
              key={bannerId}
              className="admin-card-base"
              style={{
                padding: "0",
                overflow: "hidden",
                border: isLivePrimary ? "2px solid #FF4D2D" : "1px solid var(--border-color)",
                boxShadow: isLivePrimary ? "0 8px 24px rgba(255, 77, 45, 0.2)" : undefined,
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Image banner area */}
              <div style={{ position: "relative", height: "180px", background: "#0F172A", overflow: "hidden" }}>
                <img
                  src={banner.image}
                  alt={banner.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: banner.active !== false ? "none" : "grayscale(80%) opacity(0.7)"
                  }}
                  onError={(e) => { e.target.src = "/images/homepage_1.jpg"; }}
                />

                {/* Top Badge overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    display: "flex",
                    gap: "6px"
                  }}
                >
                  {isLivePrimary && (
                    <span
                      style={{
                        background: "#FF4D2D",
                        color: "#FFFFFF",
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: "999px"
                      }}
                    >
                      ⭐ PRIMARY ACTIVE
                    </span>
                  )}
                  <span
                    style={{
                      background: banner.active !== false ? "rgba(22, 163, 74, 0.9)" : "rgba(100, 116, 139, 0.9)",
                      color: "#FFFFFF",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "999px"
                    }}
                  >
                    {banner.active !== false ? "🟢 Active" : "⚪ Inactive"}
                  </span>
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "10px",
                    background: "rgba(0,0,0,0.6)",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "6px"
                  }}
                >
                  {banner.city || "Indore"}
                </div>
              </div>

              {/* Card content body */}
              <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#EA580C", marginBottom: "4px" }}>
                  {banner.badge}
                </div>

                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-main)" }}>
                  {banner.title}{" "}
                  <span style={{ color: "#FF4D2D", display: "inline-block" }}>{banner.highlight}</span>
                </h3>

                <p
                  style={{
                    fontSize: "12.5px",
                    color: "var(--text-muted)",
                    margin: "0 0 12px 0",
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {banner.subtitle}
                </p>

                {/* Quick Tags chips */}
                {Array.isArray(banner.tags) && banner.tags.length > 0 && (
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "14px" }}>
                    {banner.tags.slice(0, 4).map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background: "var(--surface-input)",
                          color: "var(--text-main)",
                          border: "1px solid var(--border-color)"
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {banner.tags.length > 4 && (
                      <span style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>
                        +{banner.tags.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Card Actions Footer */}
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px"
                  }}
                >
                  <button
                    className={`action-pill-btn ${isLivePrimary ? "primary" : "secondary"}`}
                    onClick={() => handleMakeActivePrimary(banner)}
                    title="Set this as the active hero banner on homepage"
                    style={{ fontSize: "11.5px", padding: "5px 10px" }}
                  >
                    {isLivePrimary ? "⭐ Active Hero" : "Set Active"}
                  </button>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="table-action-btn edit"
                      onClick={() => openEdit(banner)}
                      title="Edit Hero Banner"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className={`table-action-btn ${banner.active !== false ? "toggle-active" : "toggle-inactive"}`}
                      onClick={() => handleToggle(banner)}
                      title={banner.active !== false ? "Deactivate" : "Activate"}
                    >
                      {banner.active !== false ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="table-action-btn delete"
                      onClick={() => handleDelete(banner)}
                      title="Delete Hero Banner"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBanners.length === 0 && (
        <div className="empty-state-card" style={{ marginTop: "24px" }}>
          <div className="empty-icon">🖼️</div>
          <h3>No hero banners match your search</h3>
          <p>Try searching for a different keyword or create a new hero banner.</p>
          <button className="btn-primary-glow" onClick={openAdd}>
            ➕ Add Hero Banner
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div
            className="admin-modal-card animate-scale-up"
            style={{ maxWidth: "780px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="modal-header">
              <h2>{editingBanner ? "✏️ Edit Hero Banner" : "➕ Add New Hero Banner"}</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              {/* Live Preview Box inside Modal */}
              <div style={{ marginBottom: "20px" }}>
                <label className="form-field-label">Live Preview (Desktop Home Screen Preview):</label>
                <div
                  style={{
                    position: "relative",
                    borderRadius: "14px",
                    overflow: "hidden",
                    height: "180px",
                    background: "#0F172A",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <img
                    src={image || "/images/homepage_1.jpg"}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { e.target.src = "/images/homepage_1.jpg"; }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.7) 45%, transparent 100%)"
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      left: "20px",
                      maxWidth: "340px",
                      zIndex: 2
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "#EA580C", marginBottom: "4px" }}>
                      {badge} • <span style={{ color: "#475569" }}>{city}</span>
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", lineHeight: 1.15, marginBottom: "4px" }}>
                      {title} <span style={{ color: "#FF4D2D" }}>{highlight}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#334155", lineHeight: 1.3 }}>
                      {subtitle.slice(0, 90)}...
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Selection Section */}
              <div style={{ marginBottom: "18px" }}>
                <label className="form-field-label">Hero Background Image *</label>
                
                {/* Method 1: File Upload */}
                <div
                  style={{
                    padding: "12px",
                    background: "var(--surface-input)",
                    borderRadius: "10px",
                    border: "1.5px dashed var(--border-color)",
                    marginBottom: "10px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>📁</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "13px", display: "block", color: "var(--text-main)" }}>
                        Upload Image from Your Computer
                      </strong>
                      <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                        Choose high-res landscape (1920×1080 or 1400×700) JPG, PNG or WebP
                      </span>
                    </div>
                    <label
                      className="btn-primary-glow"
                      style={{ padding: "6px 14px", fontSize: "12px", cursor: "pointer", margin: 0 }}
                    >
                      Browse File
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  {fileError && (
                    <div style={{ color: "#EF4444", fontSize: "12px", marginTop: "6px" }}>⚠️ {fileError}</div>
                  )}
                </div>

                {/* Method 2: Image URL */}
                <div style={{ marginBottom: "10px" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Or enter Image URL (e.g. /images/homepage_1.jpg or https://...)"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>

                {/* Method 3: Presets Gallery */}
                <div>
                  <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase" }}>
                    Or Pick from High-Resolution Presets:
                  </span>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "8px",
                      marginTop: "6px"
                    }}
                  >
                    {HERO_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setImage(preset.url)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          background: image === preset.url ? "rgba(255, 77, 45, 0.15)" : "var(--surface-input)",
                          border: image === preset.url ? "1.5px solid #FF4D2D" : "1px solid var(--border-color)",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }}
                        />
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-main)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                            {preset.name}
                          </div>
                          <div style={{ fontSize: "9.5px", color: "var(--text-dim)" }}>
                            {preset.badge}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-field-label">Headline Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Everything Your Home Needs."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-field-label">Highlight Phrase (Orange / Blue)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Delivered In 15 Mins."
                    value={highlight}
                    onChange={(e) => setHighlight(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-field-label">Subtitle Description</label>
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="e.g. Book certified electricians, plumbers, AC technicians & cleaning experts..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-field-label">Live Status Pill Badge</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. #1 ON-DEMAND HOME SERVICE PLATFORM"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-field-label">City / Region Tag</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 📍 INDORE & REGION"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-field-label">CTA Button Text</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Book Service Now ➔"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-field-label">CTA Button Link</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. /services or /category/cleaning"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-field-label">Quick Search Chips (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Electrician, AC Repair, Cleaning, Plumber, Salon at Home"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                />
              </div>

              <div className="form-group checkbox-group" style={{ marginTop: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#FF4D2D" }}
                  />
                  <div>
                    <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>
                      Make this Hero Banner Active
                    </strong>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>
                      Active banners will be available and displayed on the website homepage.
                    </p>
                  </div>
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="action-pill-btn secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-glow">
                  {editingBanner ? "💾 Save Changes" : "➕ Create Hero Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHeroBanners;
