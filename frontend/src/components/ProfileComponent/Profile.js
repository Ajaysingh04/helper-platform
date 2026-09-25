import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/Profile/Profile.css";
import EditProfile from "./EditProfile";
import { LocationContext } from "../../context/LocationContext";
import { AuthContext } from "../../context/AuthContext";

function Profile({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [profileImg] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const { location, fetchLocation } = useContext(LocationContext);
  const { isLoggedIn, logout } = useContext(AuthContext);

  const [storedProfile, setStoredProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("helper_user_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: "Ajay Singh Banafer",
      mobile: "+91 98765 43210",
      email: "ajay@example.com",
      address: "14 Palm Avenue, Metro Zone, City Central"
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
    role: "Verified Premium Member",
    address: storedProfile.address || (location ? (location.address || `${location.lat?.toFixed(3)}, ${location.lng?.toFixed(3)}`) : "New Delhi, India"),
    bookingsCount: "14 Services Completed"
  };

  const goToPage = (path) => {
    onClose();
    navigate(path);
  };

  const goToLogin = () => {
    onClose();
    navigate("/login");
  };

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
            <div className="logged-in-profile-pane animate-fade-in">
              
              {/* Profile Avatar Card */}
              <div className="profile-avatar-card">
                <div className="avatar-wrapper">
                  <img
                    src={profileImg || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
                    alt="Profile"
                  />
                  <div className="online-status-dot"></div>
                </div>
                <h3>{user.name}</h3>
                <span className="user-role-badge">⭐ {user.role}</span>
                <span className="user-bookings-badge">{user.bookingsCount}</span>
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

                <div className="detail-item location-item-box">
                  <div className="loc-label-row">
                    <span className="detail-label">📍 Current Location</span>
                    <button className="loc-refresh-btn" onClick={fetchLocation} title="Refresh GPS">
                      ⚡ Refresh
                    </button>
                  </div>
                  <span className="detail-val loc-val">{user.address}</span>
                </div>

                <button className="edit-profile-btn" onClick={() => setEditOpen(true)}>
                  <span>✏️ Edit Profile Info</span>
                </button>
              </div>

              {/* Settings navigation */}
              <div className="profile-quick-nav">
                <h4>Quick Navigation</h4>
                <button className="nav-menu-item" onClick={() => goToPage("/notifications")}>
                  <span>🔔 Notifications & Alerts</span>
                  <span>›</span>
                </button>
                <button className="nav-menu-item" onClick={() => goToPage("/settings")}>
                  <span>⚙️ App Settings & Theme</span>
                  <span>›</span>
                </button>
                <button className="nav-menu-item" onClick={() => goToPage("/security")}>
                  <span>🔒 Security & Privacy</span>
                  <span>›</span>
                </button>
                <button className="nav-menu-item" onClick={() => goToPage("/help")}>
                  <span>❓ Help Center & Support</span>
                  <span>›</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {isLoggedIn && (
          <div className="drawer-footer-logout">
            <button className="drawer-logout-btn" onClick={logout}>
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
