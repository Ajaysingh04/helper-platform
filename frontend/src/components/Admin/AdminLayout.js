import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../../context/DataContext";
import AdminDashboard from "./AdminDashboard";
import AdminBookings from "./AdminBookings";
import AdminServices from "./AdminServices";
import AdminCategories from "./AdminCategories";
import AdminProviders from "./AdminProviders";
import AdminUsers from "./AdminUsers";
import AdminPromotions from "./AdminPromotions";
import AdminHeroBanners from "./AdminHeroBanners";
import AdminSupport from "./AdminSupport";
import AdminSettings from "./AdminSettings";
import OtpInput from "../OtpInput";
import "../../css/Admin/Admin.css";

function AdminLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { bookings, tickets } = useContext(DataContext);

  const pendingBookingsCount = bookings.filter(b => b.status === "Pending").length;
  const openTicketsCount = tickets.filter(t => t.status === "Open").length;

  useEffect(() => {
    const adminAuth = localStorage.getItem("helper_admin_auth");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
    }
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.body.classList.add("dark");
    }
  }, []);

  const handlePinSubmit = (e, customPin) => {
    if (e) e.preventDefault();
    const pin = customPin !== undefined ? customPin : pinInput;
    if (pin === "admin123" || pin === "1234" || pin === "123456" || pin.length >= 4) {
      setIsAuthenticated(true);
      localStorage.setItem("helper_admin_auth", "true");
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleQuickUnlock = () => {
    setIsAuthenticated(true);
    localStorage.setItem("helper_admin_auth", "true");
    setPinError(false);
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("helper_admin_auth");
  };

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  // If not unlocked, render security lock screen
  if (!isAuthenticated) {
    return (
      <div className="admin-lock-screen">
        <div className="admin-lock-card animate-fade-up">
          <div className="lock-shield-icon">🔐</div>
          <h2>Verify Your Identity</h2>
          <p style={{ margin: "4px 0 16px 0", color: "var(--text-muted)", fontSize: "14px" }}>
            Helper Master Admin Security Check
          </p>

          <form onSubmit={handlePinSubmit}>
            <OtpInput
              length={6}
              value={pinInput}
              onChange={(val) => {
                setPinInput(val);
                if (pinError) setPinError(false);
              }}
              onComplete={(val) => handlePinSubmit(null, val)}
              subtitle="Enter the 6-digit administrative security PIN to unlock platform control system."
              resendLabel="Resend PIN"
              onResend={() => alert("Admin Demo PIN: 123456 (or 'admin123')")}
              error={pinError}
            />

            {pinError && (
              <p style={{ color: "var(--danger)", fontSize: "12.5px", margin: "-12px 0 16px 0", fontWeight: 600 }}>
                ⚠️ Incorrect Security PIN. Default: 123456
              </p>
            )}

            <button type="submit" className="btn-primary-glow" style={{ width: "100%", padding: "12px" }}>
              Unlock Control Center ⚡
            </button>
          </form>

          <button type="button" className="quick-unlock-btn" onClick={handleQuickUnlock}>
            Quick Unlock (1-Click Demo Access) →
          </button>

          <div style={{ marginTop: "20px" }}>
            <Link to="/" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-wrapper">
      
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
          title="Close Navigation"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
        <Link to="/" className="admin-sidebar-header" title="Go to Helper Home Page" onClick={() => setSidebarOpen(false)}>
          <div className="admin-logo-badge">⚡</div>
          <div className="admin-brand-text">
            <h2>Helper</h2>
            <span className="admin-tag">Super Admin v2.0</span>
          </div>
        </Link>

        <nav className="admin-nav-menu">
          <span className="admin-nav-category-title">Core Management</span>
          
          <button 
            className={`admin-nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">📊</span>
              <span>Overview Dashboard</span>
            </div>
          </button>

          <button 
            className={`admin-nav-btn ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("bookings");
              setSidebarOpen(false);
            }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">📦</span>
              <span>Bookings & Orders</span>
            </div>
            {pendingBookingsCount > 0 && (
              <span className="admin-nav-count alert">{pendingBookingsCount}</span>
            )}
          </button>

          <button 
            className={`admin-nav-btn ${activeTab === "services" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("services");
              setSidebarOpen(false);
            }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">🛠️</span>
              <span>Services Catalog</span>
            </div>
          </button>

          <button 
            className={`admin-nav-btn ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("categories");
              setSidebarOpen(false);
            }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">🏷️</span>
              <span>Categories Directory</span>
            </div>
          </button>

          <span className="admin-nav-category-title">Partners & Users</span>

          <button 
            className={`admin-nav-btn ${activeTab === "providers" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("providers");
              setSidebarOpen(false);
            }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">🛡️</span>
              <span>Verified Experts</span>
            </div>
          </button>

          <button 
            className={`admin-nav-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("users");
              setSidebarOpen(false);
            }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">👥</span>
              <span>Customer Accounts</span>
            </div>
          </button>

          <span className="admin-nav-category-title">Marketing & Hero</span>

          <button 
            className={`admin-nav-btn ${activeTab === "hero" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("hero");
              setSidebarOpen(false);
            }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">🖼️</span>
              <span>Hero Section</span>
            </div>
          </button>

          <button 
            className={`admin-nav-btn ${activeTab === "promotions" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("promotions");
              setSidebarOpen(false);
            }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">🎁</span>
              <span>Offers & Deals</span>
            </div>
          </button>

          <button 
            className={`admin-nav-btn ${activeTab === "support" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("support");
              setSidebarOpen(false);
            }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">💬</span>
              <span>Support & Tickets</span>
            </div>
            {openTicketsCount > 0 && (
              <span className="admin-nav-count alert">{openTicketsCount}</span>
            )}
          </button>

          <button 
            className={`admin-nav-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("settings");
              setSidebarOpen(false);
            }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">⚙️</span>
              <span>Platform Settings</span>
            </div>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-back-site-btn" onClick={() => setSidebarOpen(false)}>
            <span>🌐 View Website</span>
          </Link>
          <button 
            className="table-action-btn delete" 
            onClick={handleLock}
            style={{ padding: "4px 8px", fontSize: "11px" }}
            title="Lock Session"
          >
            🔒 Lock
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="admin-main-viewport">
        
        {/* Top Navbar */}
        <header className="admin-top-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button 
              type="button" 
              className="admin-mobile-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Navigation Menu"
            >
              ☰
            </button>

            <div className="admin-search-wrap">
              <span className="admin-search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search bookings, pros, services..."
              />
            </div>
          </div>

          <div className="admin-top-actions">
            <Link to="/" className="admin-live-badge" title="Go to Helper Home Page">
              <div className="live-pulse-dot"></div>
              <span>Live Platform ↗</span>
            </Link>

            <button 
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            <div className="admin-profile-pill">
              <div className="admin-avatar-small">
                <span>👑</span>
              </div>
              <span className="admin-name-text">Super Admin</span>
            </div>
          </div>
        </header>

        {/* View Content Body */}
        <div className="admin-view-body">
          {activeTab === "dashboard" && <AdminDashboard onNavigateTab={(tab) => setActiveTab(tab)} />}
          {activeTab === "bookings" && <AdminBookings />}
          {activeTab === "services" && <AdminServices />}
          {activeTab === "categories" && <AdminCategories />}
          {activeTab === "providers" && <AdminProviders />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "hero" && <AdminHeroBanners />}
          {activeTab === "promotions" && <AdminPromotions />}
          {activeTab === "support" && <AdminSupport />}
          {activeTab === "settings" && <AdminSettings />}
        </div>

      </main>

    </div>
  );
}

export default AdminLayout;
