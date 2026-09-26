import React, { useState, useContext, useEffect } from "react";
import Profile from "./ProfileComponent/Profile";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/Header.css";

function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <Link to="/" className="nexora-logo-link">
              <div className="nexora-brand-mark">
                <span className="nexora-brand-text">HELPER</span>
                <span className="nexora-go-badge">GO ➔</span>
              </div>
              <span className="nexora-sub-tag">EVERYTHING YOU NEED, ONE PLACE</span>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className={`header-nav ${mobileNavOpen ? "mobile-open" : ""}`}>
            <Link to="/" className={`nav-link ${isActive("/")}`} onClick={() => setMobileNavOpen(false)}>
              <span>HOME</span>
            </Link>
            <Link to="/about" className={`nav-link ${isActive("/about")}`} onClick={() => setMobileNavOpen(false)}>
              <span>ABOUT US</span>
            </Link>
            <Link to="/services" className={`nav-link ${isActive("/services")}`} onClick={() => setMobileNavOpen(false)}>
              <span>SERVICES</span>
            </Link>
            <Link to="/categories" className={`nav-link ${isActive("/categories")}`} onClick={() => setMobileNavOpen(false)}>
              <span>CATEGORIES</span>
            </Link>
            <Link to="/contact" className={`nav-link ${isActive("/contact")}`} onClick={() => setMobileNavOpen(false)}>
              <span>CONTACT</span>
            </Link>
          </nav>

          {/* Right Section: Location Pill + Cart + Account */}
          <div className="header-right">
            {/* Location Selector Pill */}
            <div className="header-location-pill" title="Current Service Location">
              <span className="loc-pin-icon">📍</span>
              <span className="loc-text">Musakhedi, Indore, Madhya Pra...</span>
            </div>

            {/* Shopping Cart Icon */}
            <Link to="/services" className="header-cart-btn" title="View Cart">
              <span className="cart-icon">🛒</span>
              <span className="cart-badge-dot"></span>
            </Link>

            {/* Account / Sign In */}
            <div className="profile-container">
              {isLoggedIn ? (
                <div className="profile-logged-wrap" onClick={() => setDrawerOpen(!drawerOpen)}>
                  <div className="profile-avatar-circle">
                    <span>A</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="nexora-account-btn"
                  onClick={() => navigate("/login")}
                >
                  <span className="account-user-icon">👤</span>
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
            >
              <span>{isDark ? "☀️" : "🌙"}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              type="button" 
              className="mobile-nav-toggle"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle navigation menu"
            >
              <span>{mobileNavOpen ? "✕" : "☰"}</span>
            </button>
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
