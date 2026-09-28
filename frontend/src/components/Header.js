import React, { useState, useContext, useEffect, useRef } from "react";
import Profile from "./ProfileComponent/Profile";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/Header.css";

function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isLoggedIn, currentUser, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const accountMenuRef = useRef(null);

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
          
          {/* Brand Logo: HELPER GO */}
          <div className="header-left">
            <Link to="/" className="nexora-logo-link" aria-label="Helper Home">
              <div className="nexora-brand-mark">
                <span className="nexora-brand-text">HELPER</span>
                <span className="nexora-go-badge">GO ➔</span>
              </div>
              <span className="nexora-sub-tag">EVERYTHING YOU NEED, ONE PLACE</span>
            </Link>
          </div>

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
            <Link to="/contact" className={`nav-link ${isActive("/contact")}`}>
              <span>CONTACT</span>
            </Link>
          </nav>

          {/* Right Section: Location Pill + Cart + Account + Theme */}
          <div className="header-right">
            {/* Location Selector Pill (Desktop only) */}
            <div className="header-location-pill" title="Current Service Location: Musakhedi, Indore">
              <span className="loc-pin-icon">📍</span>
              <span className="loc-text">Musakhedi, Indore</span>
            </div>

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
                    title="Account Options"
                    aria-label="Account Options"
                    aria-expanded={accountMenuOpen}
                  >
                    <div className="profile-avatar-circle">
                      <span>{(currentUser?.name?.trim()?.charAt(0) || "A").toUpperCase()}</span>
                    </div>
                    <div className="account-btn-text">
                      <span className="acc-label">ACCOUNT</span>
                      <span className="acc-action">
                        {(currentUser?.name?.trim()?.split(" ")[0] || "My Account")} 
                        <span className={`acc-chevron ${accountMenuOpen ? "open" : ""}`}>▾</span>
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {accountMenuOpen && (
                    <div className="account-dropdown-menu animate-fade-up">
                      <div className="dropdown-user-header">
                        <div className="dropdown-avatar-circle">
                          <span>{(currentUser?.name?.trim()?.charAt(0) || "A").toUpperCase()}</span>
                        </div>
                        <div className="dropdown-user-info">
                          <strong className="dropdown-user-name">{currentUser?.name || "Verified User"}</strong>
                          <span className="dropdown-user-badge">
                            <span className="active-green-dot" />
                            {currentUser?.role || "Active Account"}
                          </span>
                        </div>
                      </div>

                      <div className="dropdown-menu-divider" />

                      <div className="dropdown-menu-list">
                        {/* Option 1: Profile */}
                        <button
                          type="button"
                          className="dropdown-menu-item"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            setDrawerOpen(true);
                          }}
                        >
                          <div className="item-icon-box profile-icon">
                            <span>👤</span>
                          </div>
                          <div className="item-text-box">
                            <span className="item-title">Profile</span>
                            <span className="item-sub">View bookings, address & edit profile</span>
                          </div>
                          <span className="item-arrow">›</span>
                        </button>

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
                            logout();
                            navigate("/login");
                          }}
                        >
                          <div className="item-icon-box logout-icon">
                            <span>🚪</span>
                          </div>
                          <div className="item-text-box">
                            <span className="item-title">Logout</span>
                            <span className="item-sub">Sign out from your account</span>
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
              <span className="item-text">SERVICES & CAPABILITIES</span>
              <span className="item-arrow">→</span>
            </Link>
            <Link to="/categories" className={`mobile-nav-item ${isActive("/categories")}`} onClick={() => setMobileNavOpen(false)}>
              <span className="item-icon">📂</span>
              <span className="item-text">ALL CATEGORIES (85+)</span>
              <span className="item-arrow">→</span>
            </Link>
            <Link to="/contact" className={`mobile-nav-item ${isActive("/contact")}`} onClick={() => setMobileNavOpen(false)}>
              <span className="item-icon">📞</span>
              <span className="item-text">CONTACT DISPATCH</span>
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
                  <div className="dropdown-avatar-circle">
                    <span>{(currentUser?.name?.trim()?.charAt(0) || "A").toUpperCase()}</span>
                  </div>
                  <div className="dropdown-user-info">
                    <strong className="dropdown-user-name">{currentUser?.name || "Verified User"}</strong>
                    <span className="dropdown-user-badge">
                      <span className="active-green-dot" />
                      {currentUser?.role || "Active Account"}
                    </span>
                  </div>
                </div>

                <div className="mobile-action-buttons">
                  {/* Option 1: Profile */}
                  <button 
                    type="button" 
                    className="mobile-acc-btn profile"
                    onClick={() => {
                      setMobileNavOpen(false);
                      setDrawerOpen(true);
                    }}
                  >
                    <span>👤 Profile & Bookings</span>
                    <span>›</span>
                  </button>

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
                      logout();
                      navigate("/login");
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
    </>
  );
}

export default Header;
