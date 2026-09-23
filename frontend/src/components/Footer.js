import React from "react";
import { Link } from "react-router-dom";
import "../css/Footer.css";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="nexora-footer-wrapper">
      <div className="nexora-footer-container">
        
        {/* Main Footer Top Row */}
        <div className="nexora-footer-top">
          
          {/* Left: Brand info */}
          <div className="nexora-footer-brand">
            <Link to="/" className="nexora-logo-link" onClick={scrollToTop}>
              <div className="nexora-brand-mark">
                <span className="nexora-brand-text">HELPER</span>
                <span className="nexora-go-badge">GO ➔</span>
              </div>
              <span className="nexora-sub-tag">EVERYTHING YOU NEED, ONE PLACE</span>
            </Link>
            <p className="nexora-footer-about">
              Helper is your one-stop destination for all home services. From electrical repairs to premium salon services, we bring the experts to your doorstep.
            </p>
          </div>

          {/* Right: Support & Services */}
          <div className="nexora-footer-support">
            <h4 className="support-heading">SUPPORT & SERVICES</h4>
            <div className="support-items-list">
              <a href="mailto:helperplatform@gmail.com" className="support-link">
                <span className="support-icon">✉️</span>
                <span>helperplatform@gmail.com</span>
              </a>
              <a href="tel:9808058107" className="support-link">
                <span className="support-icon">📞</span>
                <span>9808058107</span>
              </a>
            </div>
            
            {/* Quick access links for admin & partner */}
            <div className="footer-quick-portals">
              <Link to="/vendor" onClick={scrollToTop}>Partner Hub</Link>
              <span className="dot-sep">•</span>
              <Link to="/services" onClick={scrollToTop}>Services</Link>
              <span className="dot-sep">•</span>
              <Link to="/admin" onClick={scrollToTop}>Admin</Link>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="nexora-footer-bottom">
          <p className="copyright-text">
            © 2026 Helper Platform. All rights reserved.
          </p>
          <div className="legal-links">
            <Link to="/security" onClick={scrollToTop}>Privacy Policy</Link>
            <span className="pipe-sep">|</span>
            <Link to="/security" onClick={scrollToTop}>Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
