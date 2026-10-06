import React, { useState, useContext, useEffect, useRef } from "react";
import Profile from "./ProfileComponent/Profile";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import SmartSearchModal from "./SmartSearchModal";
import "../css/Header.css";

function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { isLoggedIn, currentUser, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const accountMenuRef = useRef(null);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K) & custom open_search_modal event
  useEffect(() => {
    const handleGlobalSearchKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    const handleOpenModal = () => setSearchModalOpen(true);

    window.addEventListener("keydown", handleGlobalSearchKey);
    window.addEventListener("open_search_modal", handleOpenModal);
    return () => {
      window.removeEventListener("keydown", handleGlobalSearchKey);
      window.removeEventListener("open_search_modal", handleOpenModal);
    };
  }, []);

  // Vendor Session Detection and live synchronization
  const [vendorData, setVendorData] = useState(() => {
    try {
      const raw = localStorage.getItem("helper_vendor");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  // Worker Session Detection and live synchronization
  const [workerData, setWorkerData] = useState(() => {
    try {
      const raw = localStorage.getItem("helper_worker");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  // Admin Session Detection and live synchronization
  const [adminAuth, setAdminAuth] = useState(() => {
    return localStorage.getItem("helper_admin_auth") === "true";
  });

  // Location state (e.g. Indore -> Palasia)
  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem("helper_user_city") || "Indore");
  const [selectedArea, setSelectedArea] = useState(() => localStorage.getItem("helper_user_area") || "Palasia");
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const handleSelectArea = (city, area) => {
    setSelectedCity(city);
    setSelectedArea(area);
    localStorage.setItem("helper_user_city", city);
    localStorage.setItem("helper_user_area", area);
    const full = `${area} Square, ${city}, Madhya Pradesh`;
    localStorage.setItem("helper_user_full_address", full);
    window.dispatchEvent(new CustomEvent("location_changed", { detail: { city, area, fullAddress: full } }));
    setLocationModalOpen(false);
  };

  useEffect(() => {
    const syncSessions = () => {
      try {
        const raw = localStorage.getItem("helper_vendor");
        setVendorData(raw ? JSON.parse(raw) : null);
      } catch (e) {}
      try {
        const rawW = localStorage.getItem("helper_worker");
        setWorkerData(rawW ? JSON.parse(rawW) : null);
      } catch (e) {}
      setAdminAuth(localStorage.getItem("helper_admin_auth") === "true");
    };
    window.addEventListener("vendor_updated", syncSessions);
    window.addEventListener("storage", syncSessions);
    window.addEventListener("auth_state_changed", syncSessions);
    return () => {
      window.removeEventListener("vendor_updated", syncSessions);
      window.removeEventListener("storage", syncSessions);
      window.removeEventListener("auth_state_changed", syncSessions);
    };
  }, []);

  const isAdmin = Boolean(
    adminAuth ||
    localStorage.getItem("helper_admin_auth") === "true" ||
    (currentUser?.role && ["admin", "administrator", "superadmin"].includes(currentUser.role.toLowerCase()))
  );

  const isVendor = !isAdmin && Boolean(
    vendorData ||
    localStorage.getItem("helper_vendor") ||
    localStorage.getItem("helper_vendor_token") ||
    (currentUser?.role && ["partner", "vendor", "serviceman", "provider"].includes(currentUser.role.toLowerCase()))
  );

  const isWorker = !isAdmin && !isVendor && Boolean(
    workerData ||
    localStorage.getItem("helper_worker") ||
    (currentUser?.role && ["worker", "technician"].includes(currentUser.role.toLowerCase()))
  );

  let displayName = "Verified User";
  let displayFirstName = "Account";
  let displayBadge = "Active Account";

  if (isAdmin) {
    displayName = currentUser?.name || "Super Admin";
    displayFirstName = "Admin";
    displayBadge = "Master Administrator 🛡️";
  } else if (isVendor) {
    displayName = vendorData?.shopName || vendorData?.name || currentUser?.name || "Service Partner";
    displayFirstName = displayName.trim().split(" ")[0] || "Vendor";
    displayBadge = `${vendorData?.category || "Service"} Partner Pro`;
  } else if (isWorker) {
    displayName = workerData?.name || currentUser?.name || "Technician";
    displayFirstName = displayName.trim().split(" ")[0] || "Worker";
    displayBadge = `${workerData?.category || "Field"} Technician ⚡`;
  } else {
    displayName = currentUser?.name || "Verified User";
    displayFirstName = displayName.trim().split(" ")[0] || "Account";
    displayBadge = currentUser?.role || "Active Account";
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto close menus on route change
  useEffect(() => {
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    if (accountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [accountMenuOpen]);

  // Close mobile nav on escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.body.classList.add("dark");
    } else {
      setIsDark(false);
      document.body.classList.remove("dark");
    }
  }, []);

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

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const isHome = location.pathname === "/";

  return (
    <>
      <header className={`header-floating-wrapper ${isHome ? "home-header" : ""} ${scrolled ? "scrolled" : ""}`}>
        <div className="header-pill-bar nexora-header-bar">
          
          {/* Desktop Navigation Links */}

          {/* Desktop Center Navigation Links */}
          <nav className="header-nav header-nav-desktop" aria-label="Main Navigation">
            <Link to="/" className={`nav-link ${isActive("/")}`}>
              <span>HOME</span>
            </Link>
            <Link to="/about" className={`nav-link ${isActive("/about")}`}>
              <span>ABOUT US</span>
            </Link>
            <Link to="/services" className={`nav-link ${isActive("/services")}`}>
              <span>SERVICES</span>
            </Link>
            <Link to="/categories" className={`nav-link ${isActive("/categories")}`}>
              <span>CATEGORIES</span>
            </Link>
            <Link to="/worker/dashboard" className={`nav-link ${isActive("/worker") || isActive("/worker/login") || isActive("/worker/dashboard")}`} title="Technician & Field Worker Dashboard">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <span>WORKER DASHBOARD</span>
                <span style={{ fontSize: "10px", padding: "1px 6px", background: "rgba(16, 185, 129, 0.2)", color: "#10B981", borderRadius: "10px", fontWeight: 800 }}>PRO</span>
              </span>
            </Link>
            <Link to="/contact" className={`nav-link ${isActive("/contact")}`}>
              <span>CONTACT</span>
            </Link>
          </nav>

          {/* Right Section: Location Pill + Cart + Account + Theme */}
          <div className="header-right">
            {/* Location Selector Pill (Clickable City & Area Picker) */}
            <div 
              className="header-location-pill" 
              onClick={() => setLocationModalOpen(true)}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              title="Click to select City & Area (e.g. Indore, Palasia)"
            >
              <span className="loc-pin-icon">📍</span>
              <span className="loc-text">{selectedArea}, {selectedCity}</span>
              <span style={{ fontSize: "9px", opacity: 0.7 }}>▼</span>
            </div>

            {/* Quick Smart Search Icon & Button */}
            <button
              type="button"
              className="header-quick-search-btn"
              onClick={() => setSearchModalOpen(true)}
              title="Search services, categories, car rentals & pros (Ctrl + K)"
              aria-label="Open Search"
            >
              <span className="search-btn-icon">🔍</span>
              <span className="search-btn-label">Search...</span>
              <kbd className="search-btn-kbd">⌘K</kbd>
            </button>

            {/* Shopping Cart Icon */}
            <Link to="/services" className="header-cart-btn" title="View Services & Cart" aria-label="View Cart">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="cart-badge-dot"></span>
            </Link>

              {/* Account / Sign In with Dropdown Menu */}
            <div className="profile-container" ref={accountMenuRef}>
              {isLoggedIn ? (
                <>
                  <button 
                    type="button" 
                    className={`nexora-account-btn logged-in ${accountMenuOpen ? "active" : ""}`}
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    title={isAdmin ? "Admin Control Options" : isVendor ? "Vendor Account Options" : "Account Options"}
                    aria-label={isAdmin ? "Admin Control Options" : isVendor ? "Vendor Account Options" : "Account Options"}
                    aria-expanded={accountMenuOpen}
                  >
                    <div 
                      className="profile-avatar-circle" 
                      style={
                        isAdmin
                          ? { background: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)", color: "#FFFFFF", fontSize: "16px", boxShadow: "0 0 10px rgba(220, 38, 38, 0.4)" }
                          : isVendor
                          ? { background: "linear-gradient(135deg, #FF4D2D 0%, #FF8C38 100%)", color: "#FFFFFF", fontSize: "16px" }
                          : {}
                      }
                    >
                      {isAdmin ? (
                        <span>🛡️</span>
                      ) : isVendor ? (
                        <span>🛠️</span>
                      ) : currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <span>{(currentUser?.name?.trim()?.charAt(0) || "A").toUpperCase()}</span>
                      )}
                    </div>
                    <div className="account-btn-text">
                      <span className="acc-label">{isAdmin ? "ADMIN" : isVendor ? "VENDOR" : "ACCOUNT"}</span>
                      <span className="acc-action">
                        {displayFirstName} 
                        <span className={`acc-chevron ${accountMenuOpen ? "open" : ""}`}>▾</span>
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {accountMenuOpen && (
                    <div className="account-dropdown-menu animate-fade-up">
                      <div className="dropdown-user-header">
                        <div 
                          className="dropdown-avatar-circle" 
                          style={
                            isAdmin
                              ? { background: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)", color: "#FFFFFF", fontSize: "18px", boxShadow: "0 0 12px rgba(220, 38, 38, 0.4)" }
                              : isVendor
                              ? { background: "linear-gradient(135deg, #FF4D2D 0%, #FF8C38 100%)", color: "#FFFFFF", fontSize: "18px" }
                              : {}
                          }
                        >
                          {isAdmin ? (
                            <span>🛡️</span>
                          ) : isVendor ? (
                            <span>🛠️</span>
                          ) : currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            <span>{(currentUser?.name?.trim()?.charAt(0) || "A").toUpperCase()}</span>
                          )}
                        </div>
                        <div className="dropdown-user-info">
                          <strong className="dropdown-user-name">{displayName}</strong>
                          <span className="dropdown-user-badge">
                            <span className="active-green-dot" />
                            {displayBadge}
                          </span>
                        </div>
                      </div>

                      <div className="dropdown-menu-divider" />

                      <div className="dropdown-menu-list">
                        {/* Option 1: Profile / Dashboard */}
                        <button
                          type="button"
                          className="dropdown-menu-item"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            if (isAdmin) {
                              navigate("/admin");
                            } else if (isVendor) {
                              navigate("/vendor/dashboard?tab=profile");
                            } else if (isWorker) {
                              navigate("/worker/dashboard?tab=profile");
                            } else {
                              setDrawerOpen(true);
                            }
                          }}
                        >
                          <div className="item-icon-box profile-icon">
                            <span>{isAdmin ? "🛡️" : isVendor ? "🛠️" : isWorker ? "👷" : "👤"}</span>
                          </div>
                          <div className="item-text-box">
                            <span className="item-title">
                              {isAdmin ? "Admin Control Panel" : isVendor ? "Vendor Profile & Shop" : isWorker ? "Worker Profile & Trade" : "Profile"}
                            </span>
                            <span className="item-sub">
                              {isAdmin
                                ? "Platform stats, bookings, providers & master controls"
                                : isVendor
                                ? "Edit shop details, rate, work & categories"
                                : isWorker
                                ? "Skills, documents, shift hours & attendance"
                                : "View bookings, address & edit profile"}
                            </span>
                          </div>
                          <span className="item-arrow">›</span>
                        </button>

                        {/* If Admin: Direct link to Bookings Management */}
                        {isAdmin && (
                          <button
                            type="button"
                            className="dropdown-menu-item"
                            onClick={() => {
                              setAccountMenuOpen(false);
                              navigate("/admin/bookings");
                            }}
                          >
                            <div className="item-icon-box" style={{ background: "rgba(220, 38, 38, 0.12)", color: "#DC2626" }}>
                              <span>📊</span>
                            </div>
                            <div className="item-text-box">
                              <span className="item-title">All Customer Bookings</span>
                              <span className="item-sub">Review, assign and dispatch platform orders</span>
                            </div>
                            <span className="item-arrow">›</span>
                          </button>
                        )}

                        {/* If Vendor: Quick link to Orders & Jobs */}
                        {isVendor && (
                          <button
                            type="button"
                            className="dropdown-menu-item"
                            onClick={() => {
                              setAccountMenuOpen(false);
                              navigate("/vendor/dashboard?tab=bookings");
                            }}
                          >
                            <div className="item-icon-box" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
                              <span>📋</span>
                            </div>
                            <div className="item-text-box">
                              <span className="item-title">Vendor Orders & Bookings</span>
                              <span className="item-sub">View customer orders, OTP & dispatch</span>
                            </div>
                            <span className="item-arrow">›</span>
                          </button>
                        )}

                        {/* If Worker: Direct link to Active Jobs Console */}
                        {isWorker && (
                          <button
                            type="button"
                            className="dropdown-menu-item"
                            onClick={() => {
                              setAccountMenuOpen(false);
                              navigate("/worker/dashboard?tab=active_jobs");
                            }}
                          >
                            <div className="item-icon-box" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
                              <span>⚡</span>
                            </div>
                            <div className="item-text-box">
                              <span className="item-title">Worker Jobs & Radar</span>
                              <span className="item-sub">Accept orders, GPS travel, OTP & 90% payout</span>
                            </div>
                            <span className="item-arrow">›</span>
                          </button>
                        )}

                        {/* Become Worker / Technician option */}
                        {!isWorker && !isVendor && !isAdmin && (
                          <button
                            type="button"
                            className="dropdown-menu-item"
                            onClick={() => {
                              setAccountMenuOpen(false);
                              navigate("/worker/login");
                            }}
                          >
                            <div className="item-icon-box" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366F1" }}>
                              <span>👷</span>
                            </div>
                            <div className="item-text-box">
                              <span className="item-title">Worker & Technician Login</span>
                              <span className="item-sub">Work with top vendors & earn 90% per booking</span>
                            </div>
                            <span className="item-arrow">›</span>
                          </button>
                        )}

                        {/* Option 2: Help */}
                        <button
                          type="button"
                          className="dropdown-menu-item"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            navigate("/help");
                          }}
                        >
                          <div className="item-icon-box help-icon">
                            <span>❓</span>
                          </div>
                          <div className="item-text-box">
                            <span className="item-title">Help & Support</span>
                            <span className="item-sub">FAQ, contact helpline & customer care</span>
                          </div>
                          <span className="item-arrow">›</span>
                        </button>

                        <div className="dropdown-menu-divider" />

                        {/* Option 3: Logout */}
                        <button
                          type="button"
                          className="dropdown-menu-item logout-item"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            localStorage.removeItem("helper_worker");
                            localStorage.removeItem("helper_worker_token");
                            logout();
                            if (isAdmin) {
                              navigate("/login?role=admin");
                            } else if (isVendor) {
                              navigate("/login?role=serviceman");
                            } else if (isWorker) {
                              navigate("/worker/login");
                            } else {
                              navigate("/login");
                            }
                          }}
                        >
                          <div className="item-icon-box logout-icon">
                            <span>🚪</span>
                          </div>
                          <div className="item-text-box">
                            <span className="item-title">Logout</span>
                            <span className="item-sub">
                              {isAdmin
                                ? "Sign out from admin control panel"
                                : isVendor
                                ? "Sign out from vendor panel"
                                : isWorker
                                ? "Sign out from technician workplace"
                                : "Sign out from your account"}
                            </span>
                          </div>
                          <span className="item-arrow logout-arrow">➔</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="nexora-account-btn"
                  onClick={() => navigate("/login")}
                  title="Sign In / Register"
                  aria-label="Sign In"
                >
                  <div className="account-user-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="account-btn-text">
                    <span className="acc-label">ACCOUNT</span>
                    <span className="acc-action">Sign In</span>
                  </div>
                </button>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Dark/Light Mode"
            >
              <span>{isDark ? "☀️" : "🌙"}</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button 
              type="button" 
              className={`mobile-nav-toggle ${mobileNavOpen ? "open" : ""}`}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileNavOpen}
            >
              <span className="hamburger-box">
                <span className="hamburger-inner" />
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Backdrop Overlay */}
        {mobileNavOpen && (
          <div 
            className="mobile-nav-backdrop" 
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ================= Mobile Slide-Down Menu ================= */}
        <div 
          ref={menuRef}
          className={`mobile-nav-drawer ${mobileNavOpen ? "open" : ""}`}
          aria-hidden={!mobileNavOpen}
        >
          {/* Mobile Location Card */}
          <div className="mobile-drawer-location">
            <div className="mobile-loc-icon">📍</div>
            <div className="mobile-loc-info">
              <span className="mobile-loc-label">SERVICE LOCATION</span>
              <strong className="mobile-loc-val">Musakhedi, Indore, MP</strong>
            </div>
            <span className="mobile-loc-badge">Active Zone</span>
          </div>

          {/* Main Mobile Navigation Links */}
          <nav className="mobile-drawer-links" aria-label="Mobile Navigation">
            <button
              type="button"
              className="mobile-nav-item"
              onClick={() => {
                setMobileNavOpen(false);
                setSearchModalOpen(true);
              }}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(255, 77, 45, 0.08) 100%)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <span className="item-icon">🔍</span>
              <span className="item-text" style={{ color: "#4F46E5", fontWeight: 700 }}>SMART SEARCH & ANALYZER</span>
              <span className="item-arrow">➔</span>
            </button>

            <Link to="/" className={`mobile-nav-item ${isActive("/")}`} onClick={() => setMobileNavOpen(false)}>
              <span className="item-icon">🏠</span>
              <span className="item-text">HOME</span>
              <span className="item-arrow">→</span>
            </Link>
            <Link to="/about" className={`mobile-nav-item ${isActive("/about")}`} onClick={() => setMobileNavOpen(false)}>
              <span className="item-icon">ℹ️</span>
              <span className="item-text">ABOUT US</span>
              <span className="item-arrow">→</span>
            </Link>
            <Link to="/services" className={`mobile-nav-item ${isActive("/services")}`} onClick={() => setMobileNavOpen(false)}>
              <span className="item-icon">⚡</span>
              <span className="item-text">SERVICES</span>
              <span className="item-arrow">→</span>
            </Link>
            <Link to="/categories" className={`mobile-nav-item ${isActive("/categories")}`} onClick={() => setMobileNavOpen(false)}>
              <span className="item-icon">📂</span>
              <span className="item-text">CATEGORIES</span>
              <span className="item-arrow">→</span>
            </Link>
            <Link to="/worker/dashboard" className={`mobile-nav-item ${isActive("/worker") || isActive("/worker/login") || isActive("/worker/dashboard")}`} onClick={() => setMobileNavOpen(false)}>
              <span className="item-icon">👷</span>
              <span className="item-text" style={{ color: "#10B981", fontWeight: 700 }}>WORKER DASHBOARD (90% PAY)</span>
              <span className="item-arrow">→</span>
            </Link>
            <Link to="/contact" className={`mobile-nav-item ${isActive("/contact")}`} onClick={() => setMobileNavOpen(false)}>
              <span className="item-icon">📞</span>
              <span className="item-text">CONTACT</span>
              <span className="item-arrow">→</span>
            </Link>
          </nav>

          {/* Mobile Footer Quick Actions */}
          <div className="mobile-drawer-footer">
            {!isLoggedIn ? (
              <button 
                type="button" 
                className="btn-mobile-login"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigate("/login");
                }}
              >
                <span>Sign In or Create Account</span>
                <span>→</span>
              </button>
            ) : (
              <div className="mobile-logged-section">
                <div className="mobile-user-card">
                  <div 
                    className="dropdown-avatar-circle" 
                    style={
                      isAdmin
                        ? { background: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)", color: "#FFFFFF", fontSize: "18px" }
                        : isVendor
                        ? { background: "linear-gradient(135deg, #FF4D2D 0%, #FF8C38 100%)", color: "#FFFFFF", fontSize: "18px" }
                        : {}
                    }
                  >
                    {isAdmin ? (
                      <span>🛡️</span>
                    ) : isVendor ? (
                      <span>🛠️</span>
                    ) : currentUser?.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <span>{(currentUser?.name?.trim()?.charAt(0) || "A").toUpperCase()}</span>
                    )}
                  </div>
                  <div className="dropdown-user-info">
                    <strong className="dropdown-user-name">{displayName}</strong>
                    <span className="dropdown-user-badge">
                      <span className="active-green-dot" />
                      {displayBadge}
                    </span>
                  </div>
                </div>

                <div className="mobile-action-buttons">
                  {/* Option 1: Profile / Dashboard */}
                  <button 
                    type="button" 
                    className="mobile-acc-btn profile"
                    onClick={() => {
                      setMobileNavOpen(false);
                      if (isAdmin) {
                        navigate("/admin");
                      } else if (isVendor) {
                        navigate("/vendor/dashboard?tab=profile");
                      } else if (isWorker) {
                        navigate("/worker/dashboard?tab=profile");
                      } else {
                        setDrawerOpen(true);
                      }
                    }}
                  >
                    <span>
                      {isAdmin ? "🛡️ Admin Control Panel" : isVendor ? "🛠️ Vendor Profile & Shop" : isWorker ? "👷 Worker Profile & Trade" : "👤 Profile & Bookings"}
                    </span>
                    <span>›</span>
                  </button>

                  {/* Worker Active Jobs */}
                  {isWorker && (
                    <button 
                      type="button" 
                      className="mobile-acc-btn"
                      style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)" }}
                      onClick={() => {
                        setMobileNavOpen(false);
                        navigate("/worker/dashboard?tab=active_jobs");
                      }}
                    >
                      <span>⚡ Assigned Field Jobs & Radar</span>
                      <span>›</span>
                    </button>
                  )}

                  {/* Admin Bookings / Operations */}
                  {isAdmin && (
                    <button 
                      type="button" 
                      className="mobile-acc-btn"
                      style={{ background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.2)" }}
                      onClick={() => {
                        setMobileNavOpen(false);
                        navigate("/admin/bookings");
                      }}
                    >
                      <span>📊 All Customer Orders</span>
                      <span>›</span>
                    </button>
                  )}

                  {/* Vendor Orders */}
                  {isVendor && !isAdmin && (
                    <button 
                      type="button" 
                      className="mobile-acc-btn"
                      style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)" }}
                      onClick={() => {
                        setMobileNavOpen(false);
                        navigate("/vendor/dashboard?tab=bookings");
                      }}
                    >
                      <span>📋 Vendor Orders & Bookings</span>
                      <span>›</span>
                    </button>
                  )}

                  {/* Option 2: Help */}
                  <button 
                    type="button" 
                    className="mobile-acc-btn help"
                    onClick={() => {
                      setMobileNavOpen(false);
                      navigate("/help");
                    }}
                  >
                    <span>❓ Help & Support</span>
                    <span>›</span>
                  </button>

                  {/* Option 3: Logout */}
                  <button 
                    type="button" 
                    className="mobile-acc-btn logout"
                    onClick={() => {
                      setMobileNavOpen(false);
                      localStorage.removeItem("helper_worker");
                      localStorage.removeItem("helper_worker_token");
                      logout();
                      if (isAdmin) {
                        navigate("/login?role=admin");
                      } else if (isVendor) {
                        navigate("/login?role=serviceman");
                      } else if (isWorker) {
                        navigate("/worker/login");
                      } else {
                        navigate("/login");
                      }
                    }}
                  >
                    <span>🚪 Logout (Sign Out)</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            )}

            <a href="tel:+919876543210" className="mobile-emergency-call">
              <span className="call-icon">📞</span>
              <span>24/7 Helpline: <strong>+91 98765 43210</strong></span>
            </a>
          </div>
        </div>

      </header>

      {/* Slide-in Profile Drawer */}
      <Profile
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        toggleTheme={toggleTheme}
        isDark={isDark}
      />

      {/* Smart Search Spotlight Modal with Real-time AI Query Analyzer */}
      <SmartSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Interactive City & Area Selection Modal (e.g. Indore -> Palasia) */}
      {locationModalOpen && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 29, 0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setLocationModalOpen(false)}
        >
          <div 
            style={{
              background: "var(--surface-card, #FFFFFF)",
              color: "var(--text-main, #0F172A)",
              borderRadius: "20px",
              padding: "26px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.5)",
              border: "1px solid var(--border-color, #E2E8F0)",
              animation: "adminScaleUp 0.25s ease"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>📍</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Choose Your Service Location</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--text-muted, #64748B)" }}>
                    Select your city and neighborhood to connect with nearest verified vendors.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setLocationModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-muted, #64748B)" }}
              >
                ✕
              </button>
            </div>

            {/* City Selector */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted, #64748B)", display: "block", marginBottom: "6px" }}>
                Select City:
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { id: "Indore", label: "Indore (MP)", popular: true },
                  { id: "Bhopal", label: "Bhopal (MP)" },
                  { id: "Delhi NCR", label: "Delhi NCR" },
                  { id: "Mumbai", label: "Mumbai" },
                  { id: "Bengaluru", label: "Bengaluru" }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCity(c.id)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "10px",
                      border: selectedCity === c.id ? "1.5px solid #FF4D2D" : "1px solid var(--border-color, #E2E8F0)",
                      background: selectedCity === c.id ? "rgba(255, 77, 45, 0.12)" : "var(--surface-input, #F8FAFC)",
                      color: selectedCity === c.id ? "#FF4D2D" : "var(--text-main, #0F172A)",
                      fontWeight: selectedCity === c.id ? 800 : 600,
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    {c.label} {c.popular && "⭐"}
                  </button>
                ))}
              </div>
            </div>

            {/* Neighborhood / Area Selector (Indore Focused) */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted, #64748B)", display: "block", marginBottom: "6px" }}>
                Select Area in {selectedCity}:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxHeight: "240px", overflowY: "auto" }}>
                {(selectedCity === "Indore" ? [
                  { name: "Palasia", detail: "Palasia Square, Old Palasia, Greater Palasia", recommended: true },
                  { name: "Vijay Nagar", detail: "Scheme 54, Scheme 78, Apollo DB City" },
                  { name: "Bhawarkua", detail: "Holkar Science, IT Park, Vishnu Puri" },
                  { name: "Rajwada", detail: "Sarafa, MG Road, Khajuri Market" },
                  { name: "Musakhedi", detail: "Ring Road, Azad Nagar, Navlakha" },
                  { name: "Annapurna", detail: "Sudama Nagar, Usha Nagar, Ranjeet Hanuman" },
                  { name: "Geeta Bhawan", detail: "Manorama Ganj, Kanchan Bagh" },
                  { name: "Rau / Silicon City", detail: "AB Road, Cat Road, Silicon City" }
                ] : [
                  { name: "Central Market", detail: "Sector 18 Hub" },
                  { name: "North Zone", detail: "Civil Lines Area" },
                  { name: "Tech Zone", detail: "Cyber City Sector" },
                  { name: "Metro Hub", detail: "Station Road Circle" }
                ]).map(area => (
                  <button
                    key={area.name}
                    type="button"
                    onClick={() => handleSelectArea(selectedCity, area.name)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "12px",
                      border: selectedArea === area.name ? "1.5px solid #10B981" : "1px solid var(--border-color, #E2E8F0)",
                      background: selectedArea === area.name ? "rgba(16, 185, 129, 0.12)" : "var(--surface-input, #F8FAFC)",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "13.5px", color: selectedArea === area.name ? "#10B981" : "var(--text-main, #0F172A)" }}>
                        📍 {area.name}
                      </strong>
                      {area.recommended && (
                        <span style={{ fontSize: "9.5px", padding: "1px 5px", background: "#FF4D2D", color: "#FFFFFF", borderRadius: "6px", fontWeight: 700 }}>
                          NEAR YOU
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted, #64748B)", lineHeight: 1.2 }}>
                      {area.detail}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border-color, #E2E8F0)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted, #64748B)" }}>
                Current: <strong>{selectedArea}, {selectedCity}</strong>
              </span>
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="btn-primary-glow"
                style={{ padding: "8px 18px", fontSize: "12.5px" }}
              >
                Confirm Location ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
