import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/Settings.css";

function Settings() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useContext(AuthContext);
  const [currentTheme, setCurrentTheme] = useState("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setCurrentTheme(savedTheme);
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  const changeTheme = (mode) => {
    setCurrentTheme(mode);
    if (mode === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("theme", mode);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="settings-page-wrapper">
      <div className="container-wrapper settings-inner-container">
        
        <div className="settings-page-header">
          <span className="settings-sub-badge">Preferences</span>
          <h1 className="settings-main-title">Account & App Settings</h1>
          <p className="settings-lead-text">Customize your theme, privacy preferences, and notifications.</p>
        </div>

        {saveSuccess && (
          <div className="settings-save-toast animate-fade-in">
            ✨ Settings updated successfully!
          </div>
        )}

        <div className="settings-cards-list">
          
          {/* Appearance / Theme */}
          <div className="settings-group-card">
            <div className="settings-card-icon">🎨</div>
            <div className="settings-card-body">
              <h3>Appearance & Theme</h3>
              <p>Choose your preferred interface aesthetic</p>
              
              <div className="theme-selector-grid">
                <button 
                  className={`theme-option-box ${currentTheme === "light" ? "active" : ""}`}
                  onClick={() => changeTheme("light")}
                >
                  <span className="theme-icon">☀️</span>
                  <strong>Light Theme</strong>
                  <span>Clean & crisp</span>
                </button>

                <button 
                  className={`theme-option-box ${currentTheme === "dark" ? "active" : ""}`}
                  onClick={() => changeTheme("dark")}
                >
                  <span className="theme-icon">🌙</span>
                  <strong>Dark Mode</strong>
                  <span>Deep slate & neon glows</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Quick Link */}
          <div className="settings-group-card">
            <div className="settings-card-icon">👤</div>
            <div className="settings-card-body">
              <h3>Profile Information</h3>
              <p>Manage your contact details, service address, and bio</p>
              <button className="btn-secondary-glass" onClick={() => navigate("/edit-profile")}>
                Edit Profile Details →
              </button>
            </div>
          </div>

          {/* Notifications Toggles */}
          <div className="settings-group-card">
            <div className="settings-card-icon">🔔</div>
            <div className="settings-card-body">
              <h3>Notifications & Alerts</h3>
              <p>Control what updates and service reminders you receive</p>
              
              <div className="toggles-list">
                <div className="toggle-row">
                  <div>
                    <strong>Push Notifications</strong>
                    <span>Real-time booking confirmations & pro arrivals</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="modern-toggle-switch"
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                  />
                </div>

                <div className="toggle-row">
                  <div>
                    <strong>Email Invoices & Discounts</strong>
                    <span>Weekly promo codes and official invoices</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="modern-toggle-switch"
                    checked={emailAlerts}
                    onChange={() => setEmailAlerts(!emailAlerts)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="settings-group-card">
            <div className="settings-card-icon">🔒</div>
            <div className="settings-card-body">
              <h3>Security & Privacy</h3>
              <p>Update password, 2-factor authentication, and GPS sharing</p>
              
              <div className="toggles-list">
                <div className="toggle-row">
                  <div>
                    <strong>Live Location Sharing</strong>
                    <span>Allows nearest providers to calculate distance</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="modern-toggle-switch"
                    checked={locationSharing}
                    onChange={() => setLocationSharing(!locationSharing)}
                  />
                </div>
              </div>

              <div className="action-buttons-group">
                <button className="btn-secondary-glass" onClick={() => navigate("/security")}>
                  Change Password 🔑
                </button>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="settings-group-card">
            <div className="settings-card-icon">💬</div>
            <div className="settings-card-body">
              <h3>Support & FAQs</h3>
              <p>Need assistance or have an inquiry regarding a past booking?</p>
              <div className="action-buttons-group">
                <button className="btn-secondary-glass" onClick={() => navigate("/contact-support")}>
                  Contact Support
                </button>
                <button className="btn-secondary-glass" onClick={() => navigate("/help")}>
                  Help Center
                </button>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          {isLoggedIn && (
            <div className="settings-logout-card">
              <div>
                <h3>Session & Logout</h3>
                <p>Sign out of your account on this browser</p>
              </div>
              <button className="logout-action-btn" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Settings;
