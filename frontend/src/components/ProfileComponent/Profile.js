import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/Profile/Profile.css";
import EditProfile from "./EditProfile";
import { LocationContext } from "../../context/LocationContext";
import { AuthContext } from "../../context/AuthContext";

function Profile({ isOpen, onClose, isPage }) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const { location, fetchLocation } = useContext(LocationContext);
  const { isLoggedIn, logout } = useContext(AuthContext);

  const isStandalonePage = isPage || isOpen === undefined;

  const [storedProfile, setStoredProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("helper_user_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: "Ajay Singh Banafer",
      mobile: "+91 98765 43210",
      email: "ajay@example.com",
      altPhone: "+91 98111 22233",
      gender: "Male",
      bio: "Helper verified member • Booking routine home services & care",
      address: "14 Palm Avenue, Metro Zone, City Central",
      city: "Indore, MP",
      pincode: "452001",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
    };
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem("helper_user_profile");
        if (saved) setStoredProfile(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener("user_profile_updated", handleUpdate);
    return () => window.removeEventListener("user_profile_updated", handleUpdate);
  }, []);

  const user = {
    name: storedProfile.name || "Ajay Singh Banafer",
    mobile: storedProfile.mobile || "+91 98765 43210",
    email: storedProfile.email || "ajay@example.com",
    altPhone: storedProfile.altPhone || "+91 98111 22233",
    gender: storedProfile.gender || "Male",
    bio: storedProfile.bio || "Helper verified member",
    avatar: storedProfile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    role: "Verified Premium Member",
    address: storedProfile.address || (location ? (location.address || `${location.lat?.toFixed(3)}, ${location.lng?.toFixed(3)}`) : "Indore, Madhya Pradesh"),
    city: storedProfile.city || "Indore, MP",
    pincode: storedProfile.pincode || "452001",
    bookingsCount: "14 Services Completed"
  };

  const goToPage = (path) => {
    if (onClose) onClose();
    navigate(path);
  };

  const goToLogin = () => {
    if (onClose) onClose();
    navigate("/login");
  };

  // Profile Card & Info Component
  const profileDetailsPane = (
    <div className="logged-in-profile-pane animate-fade-in">
      {/* Profile Avatar Card */}
      <div className="profile-avatar-card">
        <div className="avatar-wrapper" onClick={() => setEditOpen(true)} title="Click to Change Photo" style={{ cursor: "pointer" }}>
          <img
            src={user.avatar}
            alt={user.name}
          />
          <div className="online-status-dot"></div>
          <span className="avatar-edit-overlay-hint">✏️</span>
        </div>
        <h3>{user.name}</h3>
        <span className="user-role-badge">⭐ {user.role}</span>
        <span className="user-bookings-badge">{user.bookingsCount}</span>
        {user.bio && (
          <p className="profile-bio-text">{user.bio}</p>
        )}
      </div>

      {/* Info Block */}
      <div className="profile-details-group">
        <div className="detail-item">
          <span className="detail-label">📞 Mobile Phone</span>
          <span className="detail-val">{user.mobile}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">✉️ Email Address</span>
          <span className="detail-val">{user.email}</span>
        </div>

        {user.altPhone && (
          <div className="detail-item">
            <span className="detail-label">📱 Alternate Phone</span>
            <span className="detail-val">{user.altPhone}</span>
          </div>
        )}

        <div className="detail-item">
          <span className="detail-label">⚧ Gender</span>
          <span className="detail-val">{user.gender}</span>
        </div>

        <div className="detail-item location-item-box">
          <div className="loc-label-row">
            <span className="detail-label">📍 Service & Delivery Address</span>
            <button className="loc-refresh-btn" onClick={fetchLocation} title="Refresh GPS">
              ⚡ Refresh
            </button>
          </div>
          <span className="detail-val loc-val">{user.address}</span>
          {user.city && (
            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              {user.city} • PIN: {user.pincode}
            </span>
          )}
        </div>

        <button className="edit-profile-btn" onClick={() => setEditOpen(true)}>
          <span>✏️ Edit Profile & Change Photo</span>
        </button>
      </div>

      {/* Settings navigation */}
      <div className="profile-quick-nav">
        <h4>Account Quick Actions</h4>
        <button 
          className="nav-menu-item" 
          onClick={() => goToPage("/my-bookings")}
          style={{ 
            background: "linear-gradient(135deg, rgba(255, 77, 45, 0.08) 0%, rgba(255, 120, 94, 0.06) 100%)",
            border: "1px solid rgba(255, 77, 45, 0.25)"
          }}
        >
          <span style={{ fontWeight: 700, color: "var(--primary)" }}>📋 My Bookings &amp; Service OTPs</span>
          <span style={{ fontSize: "11px", fontWeight: 800, background: "#FF4D2D", color: "#FFF", padding: "2px 8px", borderRadius: "10px" }}>OTP Live ›</span>
        </button>
        <button className="nav-menu-item" onClick={() => goToPage("/edit-profile")}>
          <span>✏️ Full Edit Profile Page</span>
          <span>›</span>
        </button>
        <button className="nav-menu-item" onClick={() => goToPage("/notifications")}>
          <span>🔔 Notifications & Alerts</span>
          <span>›</span>
        </button>
        <button className="nav-menu-item" onClick={() => goToPage("/settings")}>
          <span>⚙️ App Settings & Theme</span>
          <span>›</span>
        </button>
        <button className="nav-menu-item" onClick={() => goToPage("/security")}>
          <span>🔒 Security & Password</span>
          <span>›</span>
        </button>
        <button className="nav-menu-item" onClick={() => goToPage("/help")}>
          <span>❓ Help Center & Customer Care</span>
          <span>›</span>
        </button>
      </div>
    </div>
  );

  // Standalone Full-Page Mode (when visiting /profile directly)
  if (isStandalonePage) {
    return (
      <div className="profile-fullpage-wrapper">
        <div className="profile-fullpage-container animate-fade-in">
          
          <div className="profile-breadcrumb">
            <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Home</span>
            <span>›</span>
            <span style={{ color: "var(--primary)", fontWeight: 700 }}>User Account Profile</span>
          </div>

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
                  <span className="hero-pill bookings">✓ {user.bookingsCount}</span>
                </div>
                <p>{user.bio}</p>
              </div>
            </div>

            <div className="profile-hero-actions">
              <button
                type="button"
                className="btn-hero-edit-profile"
                onClick={() => setEditOpen(true)}
              >
                ✏️ Edit Profile Info
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

          {/* Stats Bar */}
          <div className="profile-stats-grid">
            <div className="profile-stat-box">
              <span className="stat-icon">📅</span>
              <div>
                <h4>Total Bookings</h4>
                <div className="stat-val">14 Services</div>
              </div>
            </div>
            <div className="profile-stat-box">
              <span className="stat-icon">🏷️</span>
              <div>
                <h4>Coupons & Rewards</h4>
                <div className="stat-val">3 Active Discounts</div>
              </div>
            </div>
            <div className="profile-stat-box">
              <span className="stat-icon">🛡️</span>
              <div>
                <h4>Account Verification</h4>
                <div className="stat-val" style={{ color: "#10B981" }}>100% Verified</div>
              </div>
            </div>
            <div className="profile-stat-box">
              <span className="stat-icon">⭐</span>
              <div>
                <h4>Helper Rating</h4>
                <div className="stat-val" style={{ color: "#F59E0B" }}>5.0 Star Member</div>
              </div>
            </div>
          </div>

          <div className="profile-fullpage-cards-grid">
            {/* Left Col: Contact & Location */}
            <div className="profile-page-card">
              <div className="page-card-header">
                <h3>Personal & Contact Information</h3>
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
                  <span className="val address-val">{user.address}</span>
                </div>
              </div>
            </div>

            {/* Right Col: Quick Actions & Settings */}
            <div className="profile-page-card">
              <div className="page-card-header">
                <h3>Account Shortcuts & Security</h3>
              </div>
              <div className="page-shortcuts-list">
                <button 
                  className="shortcut-card-btn" 
                  onClick={() => navigate("/my-bookings")}
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 77, 45, 0.08) 0%, rgba(255, 120, 94, 0.06) 100%)",
                    border: "1.5px solid rgba(255, 77, 45, 0.3)"
                  }}
                >
                  <div className="shortcut-icon" style={{ background: "rgba(255, 77, 45, 0.15)", color: "#FF4D2D" }}>📋</div>
                  <div>
                    <h4 style={{ color: "#FF4D2D", fontWeight: 800 }}>My Bookings &amp; Service OTPs</h4>
                    <p>Track live technicians, view 4-digit door OTP &amp; bookings</p>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 800, background: "#FF4D2D", color: "#FFF", padding: "3px 8px", borderRadius: "10px" }}>View OTP ›</span>
                </button>
                <button className="shortcut-card-btn" onClick={() => navigate("/edit-profile")}>
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
                    <h4>Security & Password</h4>
                    <p>Manage login credentials and PIN</p>
                  </div>
                  <span>›</span>
                </button>
                <button className="shortcut-card-btn" onClick={() => navigate("/help")}>
                  <div className="shortcut-icon">❓</div>
                  <div>
                    <h4>Help & Support</h4>
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
        
        <div className="profile-header">
          <div className="profile-header-title">
            <span className="profile-header-badge">Helper</span>
            <h2>{isLoggedIn ? "Account Profile" : "Welcome Guest"}</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close Drawer">✕</button>
        </div>

        <div className="profile-content">
          {!isLoggedIn ? (
            <div className="guest-profile-box animate-fade-in">
              <div className="guest-avatar-icon">👤</div>
              <h3>Join the Helper Community</h3>
              <p>Sign in to unlock personalized nearby services, booking history, and 20% discount coupons.</p>
              
              <button 
                className="btn-primary-glow"
                onClick={goToLogin}
                style={{ width: "100%", marginTop: "14px" }}
              >
                Sign In / Register →
              </button>
            </div>
          ) : (
            profileDetailsPane
          )}
        </div>

        {isLoggedIn && (
          <div className="drawer-footer-logout">
            <button 
              className="drawer-logout-btn" 
              onClick={() => {
                logout();
                if (onClose) onClose();
                navigate("/login");
              }}
            >
              Sign Out of Account 🚪
            </button>
          </div>
        )}
      </div>

      {/* Edit Profile modal / drawer */}
      <EditProfile isOpen={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}

export default Profile;
