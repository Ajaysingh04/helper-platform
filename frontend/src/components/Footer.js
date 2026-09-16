import React from "react";
import { Link } from "react-router-dom";
import "../css/Footer.css";

function Footer() {
  return (
    <footer className="footer-modern">
      <div className="container-wrapper">
        
        {/* Top Newsletter / Banner Area */}
        <div className="footer-newsletter-card">
          <div className="newsletter-text">
            <h3>Stay Updated with Exclusive Discounts</h3>
            <p>Subscribe to our weekly newsletter for service updates & seasonal discount coupons.</p>
          </div>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address..." />
            <button className="btn-primary-glow">Subscribe ⚡</button>
          </div>
        </div>

        {/* Main Columns Grid */}
        <div className="footer-columns-grid">
          
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-brand-logo">
              <div className="logo-badge">✨</div>
              <h2>Helper<span>.</span></h2>
            </Link>
            <p className="footer-desc-text">
              The premier on-demand network connecting you with trusted local service experts in minutes. Fast, transparent & guaranteed.
            </p>
            <div className="footer-social-icons">
              <a href="#twitter" aria-label="Twitter" className="social-link">𝕏</a>
              <a href="#facebook" aria-label="Facebook" className="social-link">f</a>
              <a href="#instagram" aria-label="Instagram" className="social-link">📷</a>
              <a href="#linkedin" aria-label="LinkedIn" className="social-link">in</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Popular Services</h4>
            <ul className="footer-nav-list">
              <li><Link to="/category/electrician">Electrician Services</Link></li>
              <li><Link to="/category/plumber">Plumbing & Sanitary</Link></li>
              <li><Link to="/category/home-cleaner">Full Home Cleaning</Link></li>
              <li><Link to="/category/ac-repair">AC Repair & Refill</Link></li>
              <li><Link to="/category/chef">Home Cooks & Chefs</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer-col">
            <h4>Company & Legal</h4>
            <ul className="footer-nav-list">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">All Services</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
              <li><Link to="/help">Help Center & FAQ</Link></li>
              <li><Link to="/security">Privacy & Terms</Link></li>
              <li><Link to="/admin" style={{ color: "#ef4444", fontWeight: 700 }}>⚡ Master Admin Portal</Link></li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div className="footer-col">
            <h4>Direct Contact</h4>
            <div className="footer-direct-contact">
              <p>📍 Tech Hub Sector 62, New Delhi</p>
              <p>📞 +91 98765 43210</p>
              <p>✉️ support@helper.com</p>
            </div>
            <div className="footer-badge-app">
              <span>🛡️ 100% Quality & Safety Insured</span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} Helper Inc. Crafted with passion by Ajay Singh Banafer.</p>
          <div className="footer-bottom-links">
            <Link to="/security">Security</Link>
            <span>•</span>
            <Link to="/help">Privacy Policy</Link>
            <span>•</span>
            <Link to="/contact">Support</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
