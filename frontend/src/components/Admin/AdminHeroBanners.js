import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../../context/DataContext";
import { HERO_IMAGE_PRESETS, DEFAULT_HERO_IMAGE } from "../../data/heroBannersData";

function AdminHeroBanners() {
  const dataContext = useContext(DataContext);
  const heroBanners = dataContext?.heroBanners || [];
  const addHeroBanner = dataContext?.addHeroBanner;
  const updateHeroBanner = dataContext?.updateHeroBanner;
  const toggleHeroBannerActive = dataContext?.toggleHeroBannerActive;
  const setActiveHeroBanner = dataContext?.setActiveHeroBanner;
  const deleteHeroBanner = dataContext?.deleteHeroBanner;
  const heroSettings = dataContext?.heroSettings || {
    slideSpeed: 2500,
    continuousSlide: true,
    showIndicators: false,
    imagePosition: "center 20%"
  };
  const updateHeroSettings = dataContext?.updateHeroSettings;

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form State
  const [title, setTitle] = useState("");
  const [highlight, setHighlight] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("⚡ #1 ON-DEMAND HOME SERVICE PLATFORM");
  const [city, setCity] = useState("📍 INDORE & REGION");
  const [image, setImage] = useState(DEFAULT_HERO_IMAGE);
  const [ctaText, setCtaText] = useState("Book Service Now ➔");
  const [ctaLink, setCtaLink] = useState("/services");
  const [tagsText, setTagsText] = useState("Electrician, AC Repair, Cleaning, Plumber, Salon at Home");
  const [active, setActive] = useState(true);
  const [fileError, setFileError] = useState("");
  const [imgSourceTab, setImgSourceTab] = useState("presets");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [imgLoadStatus, setImgLoadStatus] = useState("idle");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const openAdd = () => {
    setEditingBanner(null);
    setTitle("Everything Your Home Needs.");
    setHighlight("Delivered In 15 Mins.");
    setSubtitle("Book certified electricians, plumbers, AC technicians, salon pros & cleaning experts. Guaranteed upfront rates with live GPS tracking.");
    setBadge("⚡ #1 ON-DEMAND HOME SERVICE PLATFORM");
    setCity("📍 INDORE & REGION");
    setImage(DEFAULT_HERO_IMAGE);
    setCtaText("Book Service Now ➔");
    setCtaLink("/services");
    setTagsText("Electrician, AC Repair, Cleaning, Plumber, Salon at Home");
    setActive(true);
    setFileError("");
    setImgSourceTab("presets");
    setUploadedFileName("");
    setPreviewDevice("desktop");
    setImgLoadStatus("idle");
    setShowModal(true);
  };

  const openEdit = (banner) => {
    setEditingBanner(banner);
    setTitle(banner.title || "");
    setHighlight(banner.highlight || "");
    setSubtitle(banner.subtitle || "");
    setBadge(banner.badge || "⚡ #1 ON-DEMAND HOME SERVICE PLATFORM");
    setCity(banner.city || "📍 INDORE & REGION");
    const imgUrl = banner.image || DEFAULT_HERO_IMAGE;
    setImage(imgUrl);
    setCtaText(banner.ctaText || "Book Service Now ➔");
    setCtaLink(banner.ctaLink || "/services");
    setTagsText(Array.isArray(banner.tags) ? banner.tags.join(", ") : "");
    setActive(banner.active !== false);
    setFileError("");
    setPreviewDevice("desktop");
    setImgLoadStatus("idle");

    if (imgUrl.startsWith("data:")) {
      setImgSourceTab("upload");
      setUploadedFileName("Uploaded Custom Image");
    } else if (HERO_IMAGE_PRESETS.some(p => p.url === imgUrl)) {
      setImgSourceTab("presets");
      setUploadedFileName("");
    } else {
      setImgSourceTab("url");
      setUploadedFileName("");
    }

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
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result);
        setImgSourceTab("upload");
        showToast(`Uploaded "${file.name}" selected!`);
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
              src={primaryActiveBanner.image || DEFAULT_HERO_IMAGE}
              alt="Active Hero Preview"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_HERO_IMAGE;
              }}
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

      {/* Hero Display Preferences & Automation Controls (Admin Master Access) */}
      <div
        style={{
          marginBottom: "24px",
          padding: "22px 26px",
          borderRadius: "18px",
          background: "var(--bg-card, #FFFFFF)",
          border: "1.5px solid var(--border-color, #E2E8F0)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
          transition: "all 0.3s ease"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "10px", color: "var(--text-main)" }}>
              <span style={{ fontSize: "20px" }}>⚙️</span> Hero Slider & Framing Preferences
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
              Live administrative controls for slide speed, hover behavior, camera framing & interactive indicators. Changes instantly update the homepage and persist to the database.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pref-live-sync-badge">
              <span className="pref-sync-dot" />
              DATABASE & LIVE SYNC ACTIVE
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {/* 1. Slide Speed */}
          <div className="pref-control-box">
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 800, marginBottom: "8px", color: "var(--text-main)" }}>
                <span>⏱️</span> Auto-Slide Duration
              </label>
              <select
                className="pref-select-styled"
                value={heroSettings.slideSpeed || 2500}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (updateHeroSettings) updateHeroSettings({ slideSpeed: val });
                  showToast(`⚡ Slide interval updated to ${val / 1000}s`);
                }}
              >
                <option value={1500}>1.5 Seconds (Ultra Rapid)</option>
                <option value={2000}>2.0 Seconds (Fast)</option>
                <option value={2500}>2.5 Seconds (Smooth & Recommended)</option>
                <option value={3500}>3.5 Seconds (Relaxed)</option>
                <option value={5000}>5.0 Seconds (Extended)</option>
              </select>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
              Current: <strong>{(heroSettings.slideSpeed || 2500) / 1000}s per slide</strong>
            </div>
          </div>

          {/* 2. Hover Behavior */}
          <div className="pref-control-box">
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 800, marginBottom: "8px", color: "var(--text-main)" }}>
                <span>🔄</span> Hover Motion Mode
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className={`pref-anim-btn ${heroSettings.continuousSlide ? "active" : "inactive"}`}
                  style={{ flex: 1, padding: "9px 6px", fontSize: "11px" }}
                  onClick={() => {
                    if (updateHeroSettings) updateHeroSettings({ continuousSlide: true });
                    showToast("⚡ Continuous Mode Enabled (Slide never pauses)");
                  }}
                >
                  ⚡ Continuous
                </button>
                <button
                  type="button"
                  className={`pref-anim-btn ${!heroSettings.continuousSlide ? "active" : "inactive"}`}
                  style={{ flex: 1, padding: "9px 6px", fontSize: "11px" }}
                  onClick={() => {
                    if (updateHeroSettings) updateHeroSettings({ continuousSlide: false });
                    showToast("⏸️ Pause on Hover Enabled");
                  }}
                >
                  ⏸️ Pause Hover
                </button>
              </div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
              {heroSettings.continuousSlide ? "Keeps rotating non-stop" : "Stops rotating when customer hovers"}
            </div>
          </div>

          {/* 3. Image Framing Headroom */}
          <div className="pref-control-box">
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 800, marginBottom: "8px", color: "var(--text-main)" }}>
                <span>👤</span> Image Framing Headroom
              </label>
              <select
                className="pref-select-styled"
                value={heroSettings.imagePosition || "center top"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (updateHeroSettings) updateHeroSettings({ imagePosition: val });
                  showToast(`👤 Camera headroom updated to ${val}`);
                }}
              >
                <option value="center top">Center Top (Zero Cutoff - Recommended)</option>
                <option value="center 10%">Top 10% Headroom</option>
                <option value="center 20%">Top 20% Headroom</option>
                <option value="center center">Center 50% (Standard View)</option>
                <option value="center bottom">Bottom Aligned</option>
              </select>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
              Focus: <strong>{heroSettings.imagePosition || "center top"}</strong>
            </div>
          </div>
        </div>

        {/* Live Interactive Preview Box inside Admin */}
        <div className="hero-pref-preview-card">
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div className="preview-thumbnail-stage" title="Interactive preview of current framing">
              <img
                src={heroBanners[0]?.image || DEFAULT_HERO_IMAGE}
                alt="Framing Preview"
                className="preview-thumbnail-img"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                style={{ objectPosition: heroSettings.imagePosition || "center top" }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_HERO_IMAGE;
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#F8FAFC", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Live Framing & Motion Simulation</span>
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "6px", background: "rgba(99,102,241,0.25)", color: "#A5B4FC" }}>
                  {(heroSettings.slideSpeed || 2500) / 1000}s
                </span>
              </div>
              <div style={{ fontSize: "11.5px", color: "#94A3B8", marginTop: "3px" }}>
                Framing: <strong>{heroSettings.imagePosition || "center top"}</strong> • Mode:{" "}
                <strong>{heroSettings.continuousSlide ? "Continuous" : "Pause on Hover"}</strong> • Layout: <strong>Clean Panoramic</strong>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="action-pill-btn success-glow"
              style={{ padding: "8px 16px", fontSize: "12px", textDecoration: "none", color: "#FFFFFF" }}
            >
              👁️ View Live on Homepage ↗
            </Link>
          </div>
        </div>
      </div>
      <div className="table-controls-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div className="search-box-wrap" style={{ flex: "1 1 260px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title, highlight, city or tag..."
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

        <div className="filters-group" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div className="segmented-control">
            <button
              type="button"
              className={`seg-all ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              <span>All</span>
              <span className="seg-count-badge">{heroBanners.length}</span>
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
              className={`seg-inactive ${statusFilter === "inactive" ? "active" : ""}`}
              onClick={() => setStatusFilter("inactive")}
            >
              <span>Inactive</span>
              <span className="seg-count-badge">{heroBanners.length - activeCount}</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-primary-glow"
            onClick={openAdd}
            style={{
              padding: "7px 16px",
              fontSize: "12.5px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "10px",
              whiteSpace: "nowrap"
            }}
          >
            <span>➕ Add Hero Banner</span>
          </button>
        </div>
      </div>

      {/* Grid of Banners */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
          gap: "20px",
          marginTop: "16px"
        }}
      >
        {/* Quick Add Hero Banner Action Card */}
        <div
          className="admin-card-base add-banner-quick-card"
          onClick={openAdd}
          title="Click to create and configure a new homepage hero banner"
          style={{
            border: "2px dashed rgba(255, 77, 45, 0.4)",
            borderRadius: "16px",
            minHeight: "360px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "28px 20px",
            cursor: "pointer",
            background: "rgba(255, 77, 45, 0.03)"
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(255, 77, 45, 0.2) 0%, rgba(249, 115, 22, 0.15) 100%)",
              border: "1.5px solid rgba(255, 77, 45, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              marginBottom: "16px",
              color: "#FF4D2D"
            }}
          >
            ➕
          </div>
          <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 6px 0", color: "var(--text-main)" }}>
            Add New Hero Banner
          </h3>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "0 0 18px 0", maxWidth: "260px", lineHeight: 1.4 }}>
            Upload custom image, select preset photography, or enter a live direct URL for your homepage.
          </p>
          <span
            className="btn-primary-glow"
            style={{ padding: "8px 20px", fontSize: "12.5px" }}
          >
            Create Banner ➔
          </span>
        </div>

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
                  src={banner.image || DEFAULT_HERO_IMAGE}
                  alt={banner.title}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: banner.active !== false ? "none" : "grayscale(80%) opacity(0.7)"
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_HERO_IMAGE;
                  }}
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

      {/* Add / Edit Modal - Modern Split SaaS Design */}
      {showModal && (
        <div className="hero-editor-overlay" onClick={() => setShowModal(false)}>
          <div
            className="hero-editor-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="hero-editor-header">
              <div className="hero-editor-header-title">
                <div className="hero-editor-header-icon">
                  {editingBanner ? "✏️" : "✨"}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "var(--text-main)" }}>
                    {editingBanner ? "Edit Hero Banner" : "Create Hero Banner"}
                  </h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                    Configure typography, badges, CTA routing and panoramic background photography.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="hero-editor-close-btn"
                onClick={() => setShowModal(false)}
                title="Close editor (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Split 2-Column Grid */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="hero-editor-body">
                {/* Left Column: Live Preview & Image Selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                      <label style={{ fontSize: "12.5px", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>👁️</span> Real-time Simulation
                      </label>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          type="button"
                          className={`action-pill-btn ${previewDevice === "desktop" ? "primary" : "secondary"}`}
                          style={{ padding: "3px 8px", fontSize: "10.5px" }}
                          onClick={() => setPreviewDevice("desktop")}
                        >
                          💻 Desktop
                        </button>
                        <button
                          type="button"
                          className={`action-pill-btn ${previewDevice === "mobile" ? "primary" : "secondary"}`}
                          style={{ padding: "3px 8px", fontSize: "10.5px" }}
                          onClick={() => setPreviewDevice("mobile")}
                        >
                          📱 Mobile
                        </button>
                      </div>
                    </div>

                    {/* Preview Stage */}
                    <div className={`hero-preview-stage ${previewDevice === "mobile" ? "mobile-device" : ""}`}>
                      <img
                        src={image || DEFAULT_HERO_IMAGE}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onLoad={() => setImgLoadStatus("loaded")}
                        onError={(e) => {
                          setImgLoadStatus("error");
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_HERO_IMAGE;
                        }}
                      />
                      <div className="hero-preview-scrim" />
                      <div className="hero-preview-content">
                        <div className="hero-preview-badge-row">
                          <span className="hero-preview-badge-pill">
                            {badge || "⚡ #1 ON-DEMAND SERVICE"}
                          </span>
                          <span className="hero-preview-city-tag">
                            {city || "📍 INDORE & REGION"}
                          </span>
                        </div>

                        <div>
                          <div className="hero-preview-title">
                            {title || "Everything Your Home Needs."}{" "}
                            <span style={{ color: "#FF4D2D" }}>{highlight || "Delivered In 15 Mins."}</span>
                          </div>
                          <div className="hero-preview-subtitle">
                            {subtitle || "Book verified professionals with guaranteed upfront rates and 30-day warranty."}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                            <div className="hero-preview-cta-btn">
                              <span>{ctaText || "Book Service Now ➔"}</span>
                            </div>
                            {tagsText && (
                              <span style={{ fontSize: "9.5px", color: "#94A3B8", background: "rgba(255,255,255,0.1)", padding: "3px 8px", borderRadius: "999px" }}>
                                {tagsText.split(",")[0]?.trim()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Source Selector */}
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>🖼️</span> Hero Background Photo
                    </label>

                    <div className="hero-img-tabs">
                      <button
                        type="button"
                        className={`hero-img-tab-btn ${imgSourceTab === "presets" ? "active" : ""}`}
                        onClick={() => setImgSourceTab("presets")}
                      >
                        <span>🌟</span> Presets ({HERO_IMAGE_PRESETS.length})
                      </button>
                      <button
                        type="button"
                        className={`hero-img-tab-btn ${imgSourceTab === "upload" ? "active" : ""}`}
                        onClick={() => setImgSourceTab("upload")}
                      >
                        <span>📁</span> Upload File
                      </button>
                      <button
                        type="button"
                        className={`hero-img-tab-btn ${imgSourceTab === "url" ? "active" : ""}`}
                        onClick={() => setImgSourceTab("url")}
                      >
                        <span>🔗</span> Direct URL
                      </button>
                    </div>

                    {/* Tab 1: Presets */}
                    {imgSourceTab === "presets" && (
                      <div className="hero-preset-grid">
                        {HERO_IMAGE_PRESETS.map((preset, idx) => {
                          const isSelected = image === preset.url;
                          return (
                            <div
                              key={idx}
                              className={`hero-preset-card ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                setImage(preset.url);
                                setUploadedFileName("");
                                setImgLoadStatus("idle");
                              }}
                            >
                              <img
                                src={preset.url}
                                alt={preset.name}
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                className="hero-preset-thumb"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = DEFAULT_HERO_IMAGE;
                                }}
                              />
                              <div style={{ overflow: "hidden", minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-main)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                                  {preset.name}
                                </div>
                                <div style={{ fontSize: "9.5px", color: "var(--text-dim)", marginTop: "2px" }}>
                                  {preset.badge}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="hero-preset-check">✓</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Tab 2: Upload */}
                    {imgSourceTab === "upload" && (
                      <div>
                        <label className="hero-upload-dropzone" style={{ cursor: "pointer" }}>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                          />
                          <span style={{ fontSize: "30px" }}>📁</span>
                          <div>
                            <strong style={{ fontSize: "13px", color: "var(--text-main)", display: "block" }}>
                              {uploadedFileName ? `Selected: ${uploadedFileName}` : "Click to Browse or Drag Image Here"}
                            </strong>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              Recommended: 1920×1080 landscape, JPG, PNG or WebP (Max 8MB)
                            </span>
                          </div>
                          <span className="btn-primary-glow" style={{ padding: "6px 16px", fontSize: "12px", marginTop: "4px" }}>
                            {uploadedFileName ? "Replace Image" : "Select File From Computer"}
                          </span>
                        </label>
                        {fileError && (
                          <div style={{ color: "#EF4444", fontSize: "12px", marginTop: "6px" }}>⚠️ {fileError}</div>
                        )}
                      </div>
                    )}

                    {/* Tab 3: URL */}
                    {imgSourceTab === "url" && (
                      <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div className="admin-form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                            <span>Paste Public Image URL or CDN Link:</span>
                            <span style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: imgLoadStatus === "error" ? "#EF4444" : (imgLoadStatus === "loaded" ? "#16A34A" : "var(--text-muted)")
                            }}>
                              {imgLoadStatus === "error" ? "⚠️ Link Error / Blocked" : (imgLoadStatus === "loaded" ? "🟢 Live Image Loaded" : "Checking...")}
                            </span>
                          </label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/... or direct image link"
                            value={image.startsWith("data:") ? "" : image}
                            onChange={(e) => {
                              setImage(e.target.value.trim());
                              setUploadedFileName("");
                              setImgLoadStatus("idle");
                            }}
                          />
                        </div>

                        {imgLoadStatus === "error" && (
                          <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", fontSize: "11.5px", color: "#EF4444" }}>
                            ⚠️ Could not load this image URL directly. Some websites block external embeds. Try a direct image URL (ending in .jpg, .png, .webp) or click one of the verified 4K links below:
                          </div>
                        )}

                        <div>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                            ✨ Quick Curated Live 4K Photography Links:
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {[
                              { label: "🛋️ Clean Living Room", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920" },
                              { label: "⚡ Electrician Pro", url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1920" },
                              { label: "🚰 Master Plumber", url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=1920" },
                              { label: "🧹 Deep Cleaning", url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1920" }
                            ].map((sample, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                className="action-pill-btn secondary"
                                style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "8px" }}
                                onClick={() => {
                                  setImage(sample.url);
                                  setImgLoadStatus("idle");
                                  setUploadedFileName("");
                                }}
                              >
                                {sample.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Copy, Badges, Routing & State */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Panel 1: Copywriting */}
                  <div className="hero-form-panel">
                    <div className="hero-form-panel-title">
                      <span>✍️</span> Headline & Marketing Copy
                    </div>

                    <div className="admin-form-row-2">
                      <div className="admin-form-group">
                        <label>Headline Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Everything Your Home Needs."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="admin-form-group">
                        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span>Highlight Accent Word</span>
                          <span style={{ fontSize: "10px", color: "#FF4D2D", fontWeight: 700 }}>Orange Accent</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Delivered In 15 Mins."
                          value={highlight}
                          onChange={(e) => setHighlight(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ margin: 0 }}>
                      <label>Subtitle Description</label>
                      <textarea
                        rows="2"
                        placeholder="e.g. Book certified electricians, plumbers, AC technicians & cleaning experts with live GPS tracking..."
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Panel 2: Badges & Localization */}
                  <div className="hero-form-panel">
                    <div className="hero-form-panel-title">
                      <span>🏷️</span> Pill Badge & Location Dispatch
                    </div>

                    <div className="admin-form-row-2">
                      <div className="admin-form-group">
                        <label>Top Pill Badge Text</label>
                        <input
                          type="text"
                          placeholder="e.g. ⚡ #1 ON-DEMAND HOME SERVICE"
                          value={badge}
                          onChange={(e) => setBadge(e.target.value)}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>City / Regional Coverage Tag</label>
                        <input
                          type="text"
                          placeholder="e.g. 📍 INDORE & SURROUNDING REGIONS"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Panel 3: Action & Search Chips */}
                  <div className="hero-form-panel">
                    <div className="hero-form-panel-title">
                      <span>🚀</span> Call to Action & Fast Search
                    </div>

                    <div className="admin-form-row-2">
                      <div className="admin-form-group">
                        <label>CTA Button Label</label>
                        <input
                          type="text"
                          placeholder="e.g. Book Service Now ➔"
                          value={ctaText}
                          onChange={(e) => setCtaText(e.target.value)}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>CTA Route / Destination</label>
                        <input
                          type="text"
                          placeholder="e.g. /services or /category/cleaning"
                          value={ctaLink}
                          onChange={(e) => setCtaLink(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ margin: 0 }}>
                      <label>Quick Search Chips (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Electrician, AC Repair, Cleaning, Plumber, Salon at Home"
                        value={tagsText}
                        onChange={(e) => setTagsText(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Panel 4: Active Switch */}
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "14px",
                      background: active ? "rgba(22, 163, 74, 0.06)" : "var(--surface-card, #F8FAFC)",
                      border: active ? "1.5px solid rgba(22, 163, 74, 0.35)" : "1px solid var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onClick={() => setActive(!active)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>{active ? "🟢" : "⚪"}</span>
                      <div>
                        <strong style={{ fontSize: "13px", color: "var(--text-main)", display: "block" }}>
                          {active ? "Active in Homepage Hero Carousel" : "Inactive / Draft (Hidden from Customers)"}
                        </strong>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {active
                            ? "This banner will actively rotate in the customer hero slider."
                            : "This banner is saved in the directory but won't be shown to visitors."}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        width: "44px",
                        height: "24px",
                        borderRadius: "999px",
                        background: active ? "#16A34A" : "var(--border-color, #CBD5E1)",
                        position: "relative",
                        transition: "background 0.2s ease",
                        flexShrink: 0
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "#FFFFFF",
                          position: "absolute",
                          top: "3px",
                          left: active ? "23px" : "3px",
                          transition: "left 0.2s ease",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Fixed Footer */}
              <div className="hero-editor-footer">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Instant Live Sync with Customer Homepage
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setShowModal(false)}
                    style={{ padding: "9px 18px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-glow"
                    style={{ padding: "9px 24px", fontSize: "13px", fontWeight: 800 }}
                  >
                    {editingBanner ? "💾 Save & Apply Banner" : "➕ Create & Publish Banner"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHeroBanners;
