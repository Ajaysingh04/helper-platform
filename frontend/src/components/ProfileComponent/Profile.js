import React, { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/Profile/Profile.css";
import EditProfile from "./EditProfile";
import { LocationContext } from "../../context/LocationContext";
import { AuthContext } from "../../context/AuthContext";
import { DataContext } from "../../context/DataContext";

function Profile({ isOpen, onClose, isPage }) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [copiedOtpId, setCopiedOtpId] = useState(null);
  const [activeBookingIndex, setActiveBookingIndex] = useState(0);

  const { location, fetchLocation } = useContext(LocationContext);
  const { isLoggedIn, logout, currentUser } = useContext(AuthContext);
  const dataContext = useContext(DataContext);

  const isStandalonePage = isPage || isOpen === undefined;

  // Stored profile from localStorage
  const [storedProfile, setStoredProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("helper_user_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: "Rahul Sharma",
      mobile: "+91 98765 43210",
      email: "rahul@example.com",
      altPhone: "+91 98111 22233",
      gender: "Male",
      bio: "Helper verified member • Booking home repairs & maintenance",
      address: "Vijay Nagar, Indore, Madhya Pradesh",
      city: "Indore, MP",
      pincode: "452010",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"
    };
  });

  // Local customer bookings sync
  const [localBookings, setLocalBookings] = useState(() => {
    try {
      const saved = localStorage.getItem("helper_user_bookings");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const saved = localStorage.getItem("helper_user_profile");
        if (saved) setStoredProfile(JSON.parse(saved));
      } catch (e) {}
    };

    const handleBookingsUpdate = () => {
      try {
        const saved = localStorage.getItem("helper_user_bookings");
        if (saved) setLocalBookings(JSON.parse(saved));
      } catch (e) {}
    };

    window.addEventListener("user_profile_updated", handleProfileUpdate);
    window.addEventListener("user_bookings_updated", handleBookingsUpdate);
    window.addEventListener("new_booking_created", handleBookingsUpdate);
    window.addEventListener("storage", handleProfileUpdate);

    return () => {
      window.removeEventListener("user_profile_updated", handleProfileUpdate);
      window.removeEventListener("user_bookings_updated", handleBookingsUpdate);
      window.removeEventListener("new_booking_created", handleBookingsUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);

  // Merge customer bookings from localStorage + DataContext
  const allBookings = useMemo(() => {
    const ctxBookings = dataContext?.bookings || [];
    const map = new Map();

    localBookings.forEach((b) => {
      const key = b.id || b.bookingId || b._id || b.bookingCode;
      if (key) map.set(String(key), b);
    });

    ctxBookings.forEach((b) => {
      const key = b.id || b.bookingId || b._id || b.bookingCode;
      if (key && !map.has(String(key))) {
        map.set(String(key), b);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const tA = new Date(a.scheduledTimestamp || a.createdAt || 0).getTime();
      const tB = new Date(b.scheduledTimestamp || b.createdAt || 0).getTime();
      return tB - tA;
    });
  }, [localBookings, dataContext?.bookings]);

  // Filter Active / Upcoming Bookings
  const activeBookings = useMemo(() => {
    return allBookings.filter((b) => {
      const st = (b.status || "assigned").toLowerCase();
      return st !== "completed" && st !== "work_completed" && st !== "cancelled";
    });
  }, [allBookings]);

  const user = {
    name: currentUser?.name || storedProfile.name || "Rahul Sharma",
    mobile: currentUser?.mobile || currentUser?.phone || storedProfile.mobile || "+91 98765 43210",
    email: currentUser?.email || storedProfile.email || "rahul@example.com",
    altPhone: storedProfile.altPhone || "+91 98111 22233",
    gender: storedProfile.gender || "Male",
    bio: storedProfile.bio || "Helper verified member • Booking home repairs & care",
    avatar: currentUser?.avatar || storedProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250",
    role: "Verified Premium Customer",
    address: storedProfile.address || (location ? (location.address || `${location.lat?.toFixed(3)}, ${location.lng?.toFixed(3)}`) : "Vijay Nagar, Indore, Madhya Pradesh"),
    city: storedProfile.city || "Indore, MP",
    pincode: storedProfile.pincode || "452010"
  };

  const goToPage = (path) => {
    if (onClose) onClose();
    navigate(path);
  };

  const handleCopyOtp = (otp, bId) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(otp));
      setCopiedOtpId(bId);
      setTimeout(() => setCopiedOtpId(null), 2500);
    }
  };

  // Currently focused active booking for OTP display
  const currentActiveBooking = activeBookings[activeBookingIndex] || activeBookings[0] || null;

  // Render Upcoming Booking & OTP widget
  const renderUpcomingBookingWidget = () => {
    if (activeBookings.length === 0) {
      return (
        <div className="profile-no-bookings-card animate-fade-in">
          <div className="no-bookings-top">
            <span className="no-bookings-icon">📋</span>
            <div>
              <h4 className="no-bookings-title">My Bookings &amp; Orders</h4>
              <p className="no-bookings-sub">No active upcoming services. Book anytime!</p>
            </div>
          </div>
          <div className="no-bookings-action-row">
            <button
              type="button"
              className="btn-open-bookings-history"
              onClick={() => goToPage("/my-bookings")}
            >
              <span>View Past Orders History</span>
              <span>›</span>
            </button>
            <button
              type="button"
              className="btn-book-new-service"
              onClick={() => goToPage("/categories")}
            >
              <span>Book Service ⚡</span>
            </button>
          </div>
        </div>
      );
    }

    const b = currentActiveBooking;
    const otp = b.slotOtp || b.startOtp || b.doorOtp || "3459";
    const bookingCode = b.bookingCode || b.bookingId || b.id || "HLP-BOOKING";
    const serviceTitle = b.serviceName || b.service || "Home Service";
    const providerName = b.assignedProviderName || b.assignedProvider || b.provider || "Technician Dispatched";
    const providerPhone = typeof b.assignedProvider === "object" ? b.assignedProvider?.phone : (b.providerPhone || "+91 98765 43210");
    const schedDate = b.scheduledDate || b.bookingDate || "Scheduled Date";
    const schedTime = b.scheduledTime || b.timeSlot || "Standard Time Slot";

    return (
      <div className="profile-upcoming-booking-card animate-fade-in">
        {/* Card Header with count switcher if multiple active */}
        <div className="upcoming-card-header">
          <div className="upcoming-badge-pill">
            <span className="pulsing-live-dot" />
            <span>UPCOMING SCHEDULED SERVICE</span>
          </div>
          {activeBookings.length > 1 && (
            <div className="active-booking-counter-pill">
              <span>{activeBookingIndex + 1} of {activeBookings.length}</span>
              <button
                type="button"
                className="counter-cycle-btn"
                onClick={() => setActiveBookingIndex((prev) => (prev + 1) % activeBookings.length)}
                title="Next upcoming booking"
              >
                Next ↻
              </button>
            </div>
          )}
        </div>

        {/* Appointment Schedule & Worker Info */}
        <div className="upcoming-booking-meta-box">
          <div className="meta-schedule-row">
            <div className="meta-schedule-item">
              <span className="schedule-label">📅 SCHEDULED DATE</span>
              <strong className="schedule-date-val">{schedDate}</strong>
            </div>
            <div className="meta-schedule-item">
              <span className="schedule-label">⏰ TIME SLOT</span>
              <strong className="schedule-time-val">{schedTime}</strong>
            </div>
          </div>

          <div className="meta-service-row">
            <div className="meta-service-info">
              <h4 className="meta-service-title">{serviceTitle}</h4>
              <span className="meta-worker-tag">👨‍🔧 {providerName}</span>
            </div>
            {providerPhone && (
              <a
                href={`tel:${providerPhone}`}
                className="btn-call-worker-quick"
                title="Call Assigned Technician"
              >
                <span>📞 Call</span>
              </a>
            )}
          </div>
        </div>

        {/* GIANT GLOWING SERVICE START OTP BOX */}
        <div className="profile-otp-glowing-box">
          <div className="otp-box-top-label">
            <span className="otp-lock-icon">🔑</span>
            <span>DOORSTEP SERVICE START OTP</span>
          </div>

          <div className="otp-digits-display">
            <span className="otp-code-large">{otp}</span>
            <button
              type="button"
              className={`btn-copy-otp-chip ${copiedOtpId === bookingCode ? "copied" : ""}`}
              onClick={() => handleCopyOtp(otp, bookingCode)}
              title="Copy OTP to clipboard"
            >
              {copiedOtpId === bookingCode ? "✓ Copied!" : "📋 Copy OTP"}
            </button>
          </div>

          <p className="otp-instruction-text">
            💡 <strong>Jab technician aaye:</strong> Jab worker aapke doorstep par service ke din aaye, toh ye 4-digit OTP bataiye aur kaam shuru karwaiye!
          </p>
        </div>

        {/* Card Actions */}
        <div className="upcoming-card-footer-actions">
          <button
            type="button"
            className="btn-manage-all-bookings"
            onClick={() => goToPage("/my-bookings")}
          >
            <span>📋 View All Orders &amp; Live Tracking</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    );
  };

  // Full Profile Pane (Used in drawer)
  const profileDetailsPane = (
    <div className="logged-in-profile-pane animate-fade-in">
      {/* 1. Profile Hero Identity Header */}
      <div className="profile-hero-card-pro">
        <div className="profile-hero-banner" />

        <div className="profile-avatar-stack">
          <div
            className="avatar-wrapper-pro"
            onClick={() => setEditOpen(true)}
            title="Click to Edit Profile Photo"
          >
            <img src={user.avatar} alt={user.name} />
            <div className="online-status-dot-pro" />
            <span className="avatar-camera-btn">📷</span>
          </div>

          <div className="profile-identity-info">
            <div className="name-and-badge-row">
              <h3 className="profile-display-name">{user.name}</h3>
              <span className="customer-verified-tick" title="Verified Customer Account">✓</span>
            </div>
            <span className="profile-tier-badge">⭐ {user.role}</span>
            <div className="profile-contact-chips">
              <span className="contact-chip">📞 {user.mobile}</span>
              <span className="contact-chip">✉️ {user.email}</span>
            </div>
          </div>
        </div>

        {/* 3-Column Metrics Bar */}
        <div className="profile-stats-bar-pro">
          <div
            className="stat-metric-item highlight"
            onClick={() => goToPage("/my-bookings")}
            style={{ cursor: "pointer" }}
            title="View Active Orders"
          >
            <span className="stat-metric-num">{activeBookings.length}</span>
            <span className="stat-metric-lbl">Active Orders</span>
          </div>
          <div
            className="stat-metric-item"
            onClick={() => goToPage("/my-bookings")}
            style={{ cursor: "pointer" }}
            title="View All Bookings"
          >
            <span className="stat-metric-num">{allBookings.length || "1"}</span>
            <span className="stat-metric-lbl">Total Bookings</span>
          </div>
          <div className="stat-metric-item">
            <span className="stat-metric-num">250</span>
            <span className="stat-metric-lbl">Helper Coins</span>
          </div>
        </div>
      </div>

      {/* 2. UPCOMING BOOKING & DOORSTEP OTP WIDGET */}
      {renderUpcomingBookingWidget()}

      {/* 3. Saved Address Bar */}
      <div className="profile-saved-address-card">
        <div className="saved-addr-header">
          <div className="saved-addr-label">
            <span>📍 Doorstep Service Address</span>
          </div>
          <button
            type="button"
            className="saved-addr-refresh-btn"
            onClick={fetchLocation}
            title="Refresh GPS Coordinates"
          >
            ⚡ Refresh GPS
          </button>
        </div>
        <p className="saved-addr-text">{user.address}</p>
        <span className="saved-addr-sub">{user.city} • PIN {user.pincode}</span>
      </div>

      {/* 4. Navigation Menu Quick Actions */}
      <div className="profile-quick-nav-pro">
        <span className="nav-group-heading">ACCOUNT DASHBOARD &amp; SERVICES</span>

        {/* PRIMARY LINK: My Bookings & Orders */}
        <button
          type="button"
          className="nav-action-btn-pro active-bookings-btn-pro"
          onClick={() => goToPage("/my-bookings")}
        >
          <div className="nav-btn-icon-wrap" style={{ background: "rgba(255, 77, 45, 0.12)", color: "#FF4D2D" }}>
            <span>📋</span>
          </div>
          <div className="nav-btn-text-wrap">
            <div className="nav-btn-title-row">
              <span className="nav-btn-title">My Bookings &amp; Orders</span>
              {activeBookings.length > 0 && (
                <span className="active-orders-pill">
                  {activeBookings.length} Active • OTP Ready
                </span>
              )}
            </div>
            <span className="nav-btn-sub">View scheduled dates, worker OTP &amp; live radar map</span>
          </div>
          <span className="nav-btn-arrow">➔</span>
        </button>

        {/* Edit Profile */}
        <button
          type="button"
          className="nav-action-btn-pro"
          onClick={() => setEditOpen(true)}
        >
          <div className="nav-btn-icon-wrap">
            <span>✏️</span>
          </div>
          <div className="nav-btn-text-wrap">
            <span className="nav-btn-title">Edit Profile Information</span>
            <span className="nav-btn-sub">Change name, mobile number, photo and address</span>
          </div>
          <span className="nav-btn-arrow">›</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="nav-action-btn-pro"
          onClick={() => goToPage("/notifications")}
        >
          <div className="nav-btn-icon-wrap">
            <span>🔔</span>
          </div>
          <div className="nav-btn-text-wrap">
            <span className="nav-btn-title">Notifications &amp; Alerts</span>
            <span className="nav-btn-sub">Real-time status updates and arrival alerts</span>
          </div>
          <span className="nav-btn-arrow">›</span>
        </button>

        {/* Settings & Theme */}
        <button
          type="button"
          className="nav-action-btn-pro"
          onClick={() => goToPage("/settings")}
        >
          <div className="nav-btn-icon-wrap">
            <span>⚙️</span>
          </div>
          <div className="nav-btn-text-wrap">
            <span className="nav-btn-title">App Settings &amp; Dark Mode</span>
            <span className="nav-btn-sub">Theme toggle, languages &amp; app preferences</span>
          </div>
          <span className="nav-btn-arrow">›</span>
        </button>

        {/* Security */}
        <button
          type="button"
          className="nav-action-btn-pro"
          onClick={() => goToPage("/security")}
        >
          <div className="nav-btn-icon-wrap">
            <span>🔒</span>
          </div>
          <div className="nav-btn-text-wrap">
            <span className="nav-btn-title">Security &amp; PIN</span>
            <span className="nav-btn-sub">Password, login activity &amp; session security</span>
          </div>
          <span className="nav-btn-arrow">›</span>
        </button>

        {/* Help Center */}
        <button
          type="button"
          className="nav-action-btn-pro"
          onClick={() => goToPage("/help")}
        >
          <div className="nav-btn-icon-wrap">
            <span>❓</span>
          </div>
          <div className="nav-btn-text-wrap">
            <span className="nav-btn-title">Help Center &amp; 24/7 Helpline</span>
            <span className="nav-btn-sub">Customer support, FAQs &amp; dispute resolution</span>
          </div>
          <span className="nav-btn-arrow">›</span>
        </button>
      </div>
    </div>
  );

  // Standalone Full-Page Mode (when visiting /profile directly)
  if (isStandalonePage) {
    return (
      <div className="profile-fullpage-wrapper">
        <div className="profile-fullpage-container animate-fade-in">
          {/* Breadcrumb */}
          <div className="profile-breadcrumb">
            <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Home</span>
            <span>›</span>
            <span style={{ color: "var(--primary)", fontWeight: 700 }}>Account Profile</span>
          </div>

          {/* Hero Banner Header */}
          <div className="profile-fullpage-hero">
            <div className="profile-hero-content">
              <div className="profile-hero-avatar-box">
                <img src={user.avatar} alt={user.name} />
                <button
                  type="button"
                  className="hero-avatar-edit-btn"
                  onClick={() => setEditOpen(true)}
                  title="Change Photo"
                >
                  📷
                </button>
              </div>
              <div className="profile-hero-text">
                <h2>{user.name}</h2>
                <div className="hero-pills-row">
                  <span className="hero-pill role">⭐ {user.role}</span>
                  <span className="hero-pill location">📍 {user.city}</span>
                  <span className="hero-pill bookings">
                    ✓ {activeBookings.length} Active • {allBookings.length} Total Bookings
                  </span>
                </div>
                <p>{user.bio}</p>
              </div>
            </div>

            <div className="profile-hero-actions">
              <button
                type="button"
                className="btn-hero-my-bookings"
                onClick={() => navigate("/my-bookings")}
              >
                📋 My Bookings &amp; OTPs
              </button>
              <button
                type="button"
                className="btn-hero-edit-profile"
                onClick={() => setEditOpen(true)}
              >
                ✏️ Edit Profile
              </button>
              <button
                type="button"
                className="btn-hero-logout"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout 🚪
              </button>
            </div>
          </div>

          {/* UPCOMING SERVICE & OTP WIDGET ON FULL PAGE */}
          <div style={{ marginBottom: "24px" }}>
            {renderUpcomingBookingWidget()}
          </div>

          {/* Fullpage Cards Grid */}
          <div className="profile-fullpage-cards-grid">
            {/* Left Col: Contact & Location */}
            <div className="profile-page-card">
              <div className="page-card-header">
                <h3>Personal &amp; Contact Details</h3>
                <button
                  type="button"
                  className="btn-card-edit-action"
                  onClick={() => setEditOpen(true)}
                >
                  ✏️ Edit
                </button>
              </div>
              <div className="page-details-list">
                <div className="page-detail-row">
                  <span className="label">Full Name:</span>
                  <span className="val"><strong>{user.name}</strong></span>
                </div>
                <div className="page-detail-row">
                  <span className="label">Primary Phone:</span>
                  <span className="val">{user.mobile}</span>
                </div>
                <div className="page-detail-row">
                  <span className="label">Alternate Phone:</span>
                  <span className="val">{user.altPhone || "Not provided"}</span>
                </div>
                <div className="page-detail-row">
                  <span className="label">Email Address:</span>
                  <span className="val">{user.email}</span>
                </div>
                <div className="page-detail-row">
                  <span className="label">Gender:</span>
                  <span className="val">{user.gender}</span>
                </div>
                <div className="page-detail-row">
                  <span className="label">Service Address:</span>
                  <span className="val">{user.address}</span>
                </div>
              </div>
            </div>

            {/* Right Col: Shortcuts & Operations */}
            <div className="profile-page-card">
              <div className="page-card-header">
                <h3>Account Shortcuts &amp; Security</h3>
              </div>
              <div className="page-shortcuts-list">
                <button
                  className="shortcut-card-btn shortcut-primary-highlight"
                  onClick={() => navigate("/my-bookings")}
                >
                  <div className="shortcut-icon" style={{ background: "rgba(255, 77, 45, 0.15)", color: "#FF4D2D" }}>
                    📋
                  </div>
                  <div>
                    <h4 style={{ color: "#FF4D2D", fontWeight: 800 }}>My Bookings &amp; Service OTPs</h4>
                    <p>Track live technicians, view 4-digit door OTP &amp; bookings</p>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 800, background: "#FF4D2D", color: "#FFF", padding: "3px 8px", borderRadius: "10px" }}>
                    {activeBookings.length} Active ›
                  </span>
                </button>
                <button className="shortcut-card-btn" onClick={() => setEditOpen(true)}>
                  <div className="shortcut-icon">✏️</div>
                  <div>
                    <h4>Edit Profile Details</h4>
                    <p>Change photo, mobile, and address</p>
                  </div>
                  <span>›</span>
                </button>
                <button className="shortcut-card-btn" onClick={() => navigate("/notifications")}>
                  <div className="shortcut-icon">🔔</div>
                  <div>
                    <h4>Notifications</h4>
                    <p>Booking alerts and offers</p>
                  </div>
                  <span>›</span>
                </button>
                <button className="shortcut-card-btn" onClick={() => navigate("/security")}>
                  <div className="shortcut-icon">🔒</div>
                  <div>
                    <h4>Security &amp; Password</h4>
                    <p>Manage login credentials and PIN</p>
                  </div>
                  <span>›</span>
                </button>
                <button className="shortcut-card-btn" onClick={() => navigate("/help")}>
                  <div className="shortcut-icon">❓</div>
                  <div>
                    <h4>Help &amp; Support</h4>
                    <p>24/7 Customer assistance helpline</p>
                  </div>
                  <span>›</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <EditProfile isOpen={editOpen} onClose={() => setEditOpen(false)} />
      </div>
    );
  }

  // Drawer View (when opened from Header)
  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`profile-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      {/* Side drawer */}
      <div className={`profile-side-drawer ${isOpen ? "open" : ""}`}>
        {/* Drawer Header */}
        <div className="profile-header-pro">
          <div className="profile-header-branding">
            <span className="profile-header-pill">HELPER CUSTOMER</span>
            <h2 className="profile-header-heading">Account Profile</h2>
          </div>
          <button
            className="profile-drawer-close-btn"
            onClick={onClose}
            aria-label="Close Profile Drawer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="profile-content-pro">
          {!isLoggedIn ? (
            <div className="guest-profile-box animate-fade-in">
              <div className="guest-avatar-icon">👤</div>
              <h3>Join Helper Today</h3>
              <p>Sign in to view your booked services, technician Doorstep OTPs, and exclusive member discounts.</p>
              <button
                className="btn-primary-glow"
                onClick={() => goToPage("/login")}
                style={{ width: "100%", marginTop: "16px", padding: "14px" }}
              >
                Sign In or Create Account →
              </button>
            </div>
          ) : (
            profileDetailsPane
          )}
        </div>

        {/* Drawer Sticky Footer */}
        {isLoggedIn && (
          <div className="profile-drawer-footer-pro">
            <button
              type="button"
              className="drawer-logout-btn-pro"
              onClick={() => {
                logout();
                if (onClose) onClose();
                navigate("/login");
              }}
            >
              <span>Sign Out of Account</span>
              <span>🚪</span>
            </button>
            <div className="drawer-security-tag">
              <span>🔒 256-bit SSL Verified &amp; Encrypted</span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfile isOpen={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}

export default Profile;
