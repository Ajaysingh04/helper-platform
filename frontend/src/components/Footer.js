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
    <footer className="tech-footer-root">
      {/* Subtle Ambient Background Lighting */}
      <div className="tech-footer-ambient-glow" />

      <div className="tech-footer-container">
        
        {/* Main 3-Column Grid */}
        <div className="tech-footer-main-grid">
          
          {/* ================= COLUMN 1: BRANDING & CONTACT INFO ================= */}
          <div className="tech-footer-col tech-col-brand">
            {/* Brand Logo & Title */}
            <Link to="/" className="tech-footer-logo-wrap" onClick={scrollToTop}>
              <div className="tech-footer-logo-badge">
                <span className="logo-badge-icon">H</span>
              </div>
              <div className="tech-footer-logo-text">
                <span className="tech-brand-title">Helper</span>
                <span className="tech-brand-subtitle">TECHNOLOGIES</span>
              </div>
            </Link>

            {/* Tagline / Description */}
            <p className="tech-brand-desc">
              Helper builds on-demand service and technician solutions that help your household and business get verified local assistance in real-time.
            </p>

            {/* Platform Trust & Quality Highlights */}
            <div className="tech-trust-highlights">
              <div className="tech-trust-item">
                <div className="trust-icon-box cyan-glow">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <div className="trust-item-text">
                  <span className="trust-item-heading">100% Verified Experts</span>
                  <span className="trust-item-sub">Police & Skill Background Checked</span>
                </div>
              </div>

              <div className="tech-trust-item">
                <div className="trust-icon-box amber-glow">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div className="trust-item-text">
                  <span className="trust-item-heading">30-Min Fast Dispatch</span>
                  <span className="trust-item-sub">Real-time GPS tracking & rapid arrival</span>
                </div>
              </div>

              <div className="tech-trust-item">
                <div className="trust-icon-box emerald-glow">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div className="trust-item-text">
                  <span className="trust-item-heading">Service Warranty & Cover</span>
                  <span className="trust-item-sub">Up to ₹10,000 insurance damage cover</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="tech-brand-cta-wrap">
              <Link to="/services" className="tech-brand-action-btn" onClick={scrollToTop}>
                <span>Book A Verified Service</span>
                <span className="btn-arrow">➔</span>
              </Link>
            </div>
          </div>

          {/* ================= COLUMN 2: SERVICES (TWO SUB-COLUMNS) ================= */}
          <div className="tech-footer-col tech-col-services">
            <div className="tech-section-header">
              <span className="tech-section-dot cyan-dot" />
              <h3>HELPER SERVICES</h3>
            </div>

            <div className="tech-services-subgrid">
              {/* Left Sub-column */}
              <div className="tech-sub-col">
                <Link to="/category/electricians" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>Electrician Services</span>
                </Link>
                <Link to="/category/plumbers" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>Plumber & Sanitary</span>
                </Link>
                <Link to="/category/ac-repair-services" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>AC Repair & Gas Refill</span>
                </Link>
                <Link to="/category/deep-home-cleaning" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>Deep Home Cleaning</span>
                </Link>
                <Link to="/category/wall-painter" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>House Painting & Decor</span>
                </Link>
                <Link to="/category/carpenters" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>Carpenter & Woodcraft</span>
                </Link>
                <Link to="/category/electrical-shops" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>Appliance Repair</span>
                </Link>
              </div>

              {/* Right Sub-column */}
              <div className="tech-sub-col">
                <Link to="/category/hospitals" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>Doctors & Healthcare</span>
                </Link>
                <Link to="/category/beauty-parlours" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>Beauty Parlours & Salon</span>
                </Link>
                <Link to="/category/packers-and-movers" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>Packers & Movers</span>
                </Link>
                <Link to="/category/car-repair-services" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>Car & Bike Mechanics</span>
                </Link>
                <Link to="/category/pest-control" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>Pest Control Service</span>
                </Link>
                <Link to="/category/cooks-on-hire" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>Cooks & Chefs On Hire</span>
                </Link>
                <Link to="/category/interior-designers" className="tech-service-link" onClick={scrollToTop}>
                  <span className="chevron">›</span>
                  <span>Interior Designers</span>
                </Link>
              </div>
            </div>

            {/* Catalog CTA Link */}
            <div className="tech-catalog-link-wrap">
              <Link to="/categories" className="tech-catalog-btn" onClick={scrollToTop}>
                <span>View Full Categories Catalog</span>
                <span className="catalog-arrow">→</span>
              </Link>
            </div>
          </div>

          {/* ================= COLUMN 3: PLATFORM STATUS & SOCIALS ================= */}
          <div className="tech-footer-col tech-col-company">
            <div className="tech-section-header">
              <span className="tech-section-dot cyan-dot" />
              <h3>PLATFORM STATUS</h3>
            </div>

            {/* Operational SLA Card */}
            <div className="tech-operational-card" style={{ marginTop: 0 }}>
              <div className="operational-status-header">
                <span className="pulsing-green-dot" />
                <span className="operational-title">OPERATIONAL</span>
              </div>
              <p className="operational-desc">
                Production architecture SLA: <strong>99.99%</strong> uptime verified. Instant dispatch and verified servicemen network active 24/7.
              </p>
            </div>

            {/* Social Icons Section */}
            <div className="tech-socials-wrap">
              <span className="tech-social-label">CONNECT WITH US</span>
              <div className="tech-social-icons-row">
                {/* Instagram */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="tech-social-btn"
                  title="Instagram"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="tech-social-btn"
                  title="LinkedIn"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="tech-social-btn"
                  title="Facebook"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="tech-footer-bottom-bar">
          <div className="tech-bottom-left">
            <span className="copyright-text">
              © {new Date().getFullYear()} - All Rights Reserved by Helper Technologies
            </span>
            <span className="dot-divider">•</span>
            <span className="tech-sub-note">Hyperlocal Services & Verified Pro Network</span>
          </div>

          <div className="tech-bottom-right">
            <div className="tech-soc2-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              <span>SOC-2 Ready</span>
            </div>

            <Link to="/contact-support" className="bottom-nav-link" onClick={scrollToTop}>
              Technical Support
            </Link>
            <Link to="/security" className="bottom-nav-link" onClick={scrollToTop}>
              Privacy Policy
            </Link>
            <Link to="/security" className="bottom-nav-link" onClick={scrollToTop}>
              Terms of Service
            </Link>

            {/* Back To Top Arrow Button */}
            <button 
              type="button" 
              className="tech-back-to-top-btn" 
              onClick={scrollToTop}
              title="Back to Top"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
