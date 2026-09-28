import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/About.css";

function About() {
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { 
      number: "100%", 
      label: "Direct Response Rate",
      sublabel: "Automated instant routing",
      accent: "stat-emerald",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    },
    { 
      number: "120x", 
      label: "Dispatch Velocity",
      sublabel: "Sub-30s pro assignment",
      accent: "stat-coral",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    },
    { 
      number: "50,000+", 
      label: "Homes Served",
      sublabel: "Across 15+ metropolitan zones",
      accent: "stat-blue",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    { 
      number: "4.9 / 5", 
      label: "Customer Trust Rating",
      sublabel: "From 38,000+ verified reviews",
      accent: "stat-amber",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    },
  ];

  const values = [
    { 
      id: "01",
      badge: "SECURITY & VETTING",
      title: "Uncompromised Safety", 
      desc: "Every technician undergoes 7-step vetting: national Aadhaar/ID validation, background checks, and rigorous hands-on technical bench evaluations before taking their first job.",
      color: "badge-blue",
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )
    },
    { 
      id: "02",
      badge: "ALGORITHMIC DISPATCH",
      title: "Intelligent Matching", 
      desc: "Our geo-spatial dispatch algorithm evaluates pro proximity, live traffic, past skill ratings, and issue specifics to deploy the ideal specialist in less than 30 seconds.",
      color: "badge-coral",
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 14 14" />
        </svg>
      )
    },
    { 
      id: "03",
      badge: "ZERO-RISK WARRANTY",
      title: "100% Quality Guarantee", 
      desc: "Every completed repair, installation, or cleaning is backed by Helper's 30-day revisit warranty and up to ₹10,000 property protection with zero hidden deductibles.",
      color: "badge-purple",
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6 2 18 2 22 8 12 22 2 8 6 2" />
        </svg>
      )
    },
    { 
      id: "04",
      badge: "ETHICAL WORKFLOWS",
      title: "Fair Pro Economics", 
      desc: "We eliminate exploitative middleman fees. Technicians take home maximum transparent earnings with instant payouts, dignity, and automated workflow support.",
      color: "badge-emerald",
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Select Service & Describe",
      desc: "Pick your required repair, cleaning, or maintenance service with upfront flat-rate estimates."
    },
    {
      num: "02",
      title: "Autonomous Pro Dispatch",
      desc: "Our engine dispatches the nearest certified technician. Track arrival live with GPS."
    },
    {
      num: "03",
      title: "Inspected & Guaranteed",
      desc: "Pay securely after flawless completion. Covered by our 30-day revisit warranty."
    }
  ];

  const faqs = [
    {
      q: "How are Helper technicians verified and trained?",
      a: "Every service partner must pass a 3-tier validation protocol: Govt. ID & criminal record checks, an in-person bench skill evaluation, and digital customer etiquette training before onboarding."
    },
    {
      q: "What is Helper's 30-Day Revisit Warranty?",
      a: "If an issue reoccurs or if the repair wasn't done to perfection, simply report it via your dashboard. A senior technician will revisit and resolve it completely free of charge within 30 days."
    },
    {
      q: "Are the prices transparent with no surprise charges?",
      a: "Yes! Helper provides standard rate cards for all base labors before you confirm. If any replacement parts are required, technicians present genuine MRP receipts with your upfront approval."
    },
    {
      q: "How do technicians benefit from Helper?",
      a: "Helper operates on ethical pro economics. Unlike legacy broker networks, our professionals receive fast direct payouts, flexible scheduling, and tools to run an independent, dignified business."
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="about-page-wrapper">
      {/* Background ambient lighting */}
      <div className="about-ambient-glow" aria-hidden="true">
        <div className="glow-sphere glow-1" />
        <div className="glow-sphere glow-2" />
      </div>

      <div className="about-container">
        
        {/* ================= Hero Section ================= */}
        <section className="about-studio-hero">
          <div className="hero-pill-badge">
            <span className="live-status-dot" />
            <span>OUR VISION & ARCHITECTURE</span>
          </div>
          
          <h1 className="about-studio-title">
            Intelligent Home Care.<br />
            <span className="title-gradient-accent">Built with Trust & Craft.</span>
          </h1>

          <p className="about-studio-subtitle">
            Helper is engineered to eliminate household friction by replacing phone call chaos 
            with autonomous dispatch, transparent pricing, and certified master technicians.
          </p>

          <div className="hero-trust-chips">
            <span className="trust-chip">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              100% Background-Checked
            </span>
            <span className="trust-chip">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              Fast 30-Min Dispatch
            </span>
            <span className="trust-chip">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              ₹10,000 Damage Cover
            </span>
          </div>

          <div className="hero-cta-actions">
            <Link to="/services" className="btn-hero-primary">
              <span>Book Verified Service</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
            <a href="#dispatch-architecture" className="btn-hero-secondary">
              <span>How It Works</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </a>
          </div>
        </section>

        {/* ================= Studio Metric Counters Stack ================= */}
        <section className="about-metrics-row">
          {stats.map((stat, i) => (
            <div className={`about-metric-card ${stat.accent}`} key={i}>
              <div className="metric-header-row">
                <div className="metric-icon-box">{stat.icon}</div>
                <span className="metric-accent-indicator" />
              </div>
              <span className="metric-huge-num">{stat.number}</span>
              <span className="metric-dim-label">{stat.label}</span>
              <span className="metric-micro-detail">{stat.sublabel}</span>
            </div>
          ))}
        </section>

        {/* ================= Bento Story & Mission Section ================= */}
        <section className="about-bento-section">
          
          {/* Main Story Card */}
          <div className="about-bento-main">
            <div className="bento-main-top">
              <div className="pill-tag-subtle">
                <span className="subtle-dot" />
                <span>FOUNDING PHILOSOPHY & GENESIS</span>
              </div>
              <h2>Built by Passion to Solve Real Everyday Household Problems</h2>
              <p>
                Founded by <strong>Mr. Narendra Modi</strong>, Helper was born out of a simple observation: finding trustworthy, skilled, and prompt help for home repairs, cleaning, and daily chores was unnecessarily chaotic, opaque, and stressful.
              </p>
              <p>
                Whether it’s an emergency electrical failure at midnight, a stubborn plumbing clog, or arranging a dependable daily home chef, Helper bridges the trust gap by deploying verified local experts straight to your doorstep.
              </p>

              {/* Value highlights checklist */}
              <div className="bento-feature-points">
                <div className="feature-point-item">
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>Transparent Upfront Pricing</strong>
                    <span>No unvetted labor charges or unexpected end-of-job markups.</span>
                  </div>
                </div>
                <div className="feature-point-item">
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>Zero Middleman Delay</strong>
                    <span>Direct automated dispatch directly to the nearest specialist.</span>
                  </div>
                </div>
                <div className="feature-point-item">
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>End-to-End Work Protection</strong>
                    <span>Standard 30-day revisit warranty backed by dedicated support.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-actions-group">
              <Link to="/services" className="btn-coral">
                <span>EXPLORE CAPABILITIES</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
              <Link to="/contact" className="btn-ghost-dark">
                <span>Talk to Team</span>
                <span className="arrow-sym">→</span>
              </Link>
            </div>
          </div>

          {/* Founder Quote Card */}
          <div className="about-bento-side">
            <div className="founder-card-ambient" />
            
            <div className="quote-badge-row">
              <div className="founder-tag-pill">
                <span className="founder-live-dot" />
                <span>FOUNDER NOTE</span>
              </div>
              <div className="verified-leadership-badge">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>VERIFIED</span>
              </div>
            </div>

            <div className="quote-content-wrap">
              <span className="quote-mark-icon">“</span>
              <p className="founder-quote-text">
                Our mission is to save your precious hours, bring unshakeable peace of mind to families, and provide skilled technicians the dignified livelihood they deserve.
              </p>
            </div>

            <div className="founder-footer-row">
              <div className="founder-avatar-wrapper">
                <div className="founder-avatar-circle">NM</div>
                <div className="avatar-status-ring" />
              </div>
              <div className="founder-meta">
                <div className="founder-name-row">
                  <strong>Mr. Narendra Modi</strong>
                  <span className="founder-flag">🇮🇳</span>
                </div>
                <span>Founder & Lead Developer</span>
              </div>
            </div>
          </div>

        </section>

        {/* ================= How Helper Operates (Architecture) ================= */}
        <section id="dispatch-architecture" className="about-process-section">
          <div className="section-header-box">
            <span className="pill-tag-coral">AUTONOMOUS DISPATCH SYSTEM</span>
            <h2>How Helper Sets the Standard</h2>
            <p>From instant problem diagnostics to verified doorstep completion in three frictionless steps.</p>
          </div>

          <div className="process-cards-grid">
            {steps.map((st, i) => (
              <div className="process-card" key={i}>
                <div className="process-step-num">{st.num}</div>
                <h3>{st.title}</h3>
                <p>{st.desc}</p>
                <div className="process-card-glow" />
              </div>
            ))}
          </div>
        </section>

        {/* ================= Core Principles Grid ================= */}
        <section className="about-principles-section">
          <div className="principles-heading-box">
            <span className="pill-tag-coral">ENGINEERED FOR EXCELLENCE</span>
            <h2>Principles That Power Every Dispatch</h2>
            <p>How we maintain benchmark safety, transparency, and satisfaction across thousands of daily requests.</p>
          </div>

          <div className="principles-bento-grid">
            {values.map((val, idx) => (
              <div className="principle-card" key={idx}>
                <div className="principle-top">
                  <div className={`principle-icon-wrapper ${val.color}`}>
                    {val.icon}
                  </div>
                  <span className={`principle-chip ${val.color}`}>
                    {val.badge}
                  </span>
                </div>
                <h3>{val.title}</h3>
                <p>{val.desc}</p>
                <div className="principle-hover-accent" />
              </div>
            ))}
          </div>
        </section>

        {/* ================= FAQ Section ================= */}
        <section className="about-faq-section">
          <div className="faq-header-box">
            <span className="pill-tag-coral">TRANSPARENCY FIRST</span>
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about our standards, warranty, and technician network.</p>
          </div>

          <div className="faq-accordion-list">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  className={`faq-item ${isOpen ? "open" : ""}`} 
                  key={index}
                  onClick={() => toggleFaq(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleFaq(index);
                    }
                  }}
                >
                  <div className="faq-question-row">
                    <span className="faq-q-text">{faq.q}</span>
                    <span className={`faq-toggle-icon ${isOpen ? "rotated" : ""}`}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>
                  {isOpen && (
                    <div className="faq-answer-row">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= Bottom Conversion Banner ================= */}
        <section className="about-cta-banner">
          <div className="cta-banner-content">
            <span className="cta-badge">GET STARTED TODAY</span>
            <h2>Experience Stress-Free Home Maintenance</h2>
            <p>Join over 50,000 satisfied households who never worry about home repairs or daily chores again.</p>
            <div className="cta-buttons-group">
              <Link to="/services" className="btn-cta-primary">
                Book a Verified Service Now
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
              <Link to="/grow-business" className="btn-cta-secondary">
                Partner as a Professional
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default About;
