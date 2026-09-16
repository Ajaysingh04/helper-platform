import React, { useState, useContext, useEffect } from "react";
import Profile from "./ProfileComponent/Profile";
import Search from "./Search";
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

  return (
    <>
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-container container-wrapper">
          
          {/* Brand Logo & Profile Quick Access */}
          <div className="header-left">
            <Link to="/" className="app-logo-link">
              <div className="logo-badge">
                <span className="logo-sparkle">✨</span>
              </div>
              <h2 className="app-name">
                Helper<span className="dot">.</span>
              </h2>
            </Link>
          </div>

          {/* Center Search Bar */}
          <div className="header-center">
            <Search />
          </div>

          {/* Right Navigation & Controls */}
          <div className="header-right">
            <nav className={`header-nav ${mobileNavOpen ? "mobile-open" : ""}`}>
              <Link to="/" className={`nav-link ${isActive("/")}`} onClick={() => setMobileNavOpen(false)}>
                <span>Home</span>
              </Link>
              <Link to="/services" className={`nav-link ${isActive("/services")}`} onClick={() => setMobileNavOpen(false)}>
                <span>Services</span>
              </Link>
              <Link to="/about" className={`nav-link ${isActive("/about")}`} onClick={() => setMobileNavOpen(false)}>
                <span>About</span>
              </Link>
              <Link to="/contact" className={`nav-link ${isActive("/contact")}`} onClick={() => setMobileNavOpen(false)}>
                <span>Contact</span>
              </Link>
              <Link to="/admin" className={`nav-link ${isActive("/admin")}`} onClick={() => setMobileNavOpen(false)} style={{ color: "#ef4444", fontWeight: 700 }}>
                <span>⚡ Admin</span>
              </Link>
            </nav>

            <div className="header-actions">
              {/* Theme Toggle Button */}
              <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme"
              >
                {isDark ? "☀️" : "🌙"}
              </button>

              {/* Profile / Account Button */}
              {isLoggedIn ? (
                <div className="user-profile-btn" onClick={() => setDrawerOpen(true)}>
                  <div className="user-avatar-mini">
                    <span>👤</span>
                  </div>
                  <span className="user-name-text">My Account</span>
                </div>
              ) : (
                <button
                  className="login-header-btn"
                  onClick={() => navigate("/login")}
                >
                  <span>Sign In</span>
                  <span className="arrow-icon">→</span>
                </button>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                className="mobile-menu-toggle"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                aria-label="Toggle Menu"
              >
                {mobileNavOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile drawer */}
      <Profile isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

export default Header;
