import React from "react";
import { Link } from "react-router-dom";
import "../css/About.css";

function About() {
  const stats = [
    { number: "50K+", label: "Completed Bookings" },
    { number: "1,200+", label: "Verified Experts" },
    { number: "4.9/5", label: "Customer Rating" },
    { number: "25+", label: "Major Cities" },
  ];

  const values = [
    { icon: "🛡️", title: "Uncompromised Safety", desc: "Every professional is background checked, identity verified, and trained in customer safety." },
    { icon: "⚡", title: "Instant Convenience", desc: "Book reliable help at your fingertips with transparent pricing and real-time scheduling." },
    { icon: "💎", title: "Quality Guarantee", desc: "Top-tier craftsmanship with 100% satisfaction re-service warranty on every job." },
    { icon: "🤝", title: "Community First", desc: "Empowering local skilled service pros with fair earnings and respect." }
  ];

  return (
    <div className="about-page-wrapper">
      <div className="container-wrapper">
        
        {/* Hero Section */}
        <section className="about-hero-section">
          <div className="about-hero-badge animate-fade-in">
            <span>✨ Empowering Daily Lives</span>
          </div>
          <h1 className="about-main-title animate-fade-up">
            Simplifying Everyday Services with <span className="gradient-text">Trust & Excellence</span>
          </h1>
          <p className="about-lead-text animate-fade-up">
            Helper is an intelligent on-demand platform created to eliminate everyday stress by connecting homeowners and businesses with vetted, reliable, and skilled service professionals.
          </p>
        </section>

        {/* Stats Grid */}
        <section className="about-stats-grid">
          {stats.map((stat, i) => (
            <div className="stat-card" key={i}>
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </section>

        {/* Founder & Mission Card */}
        <section className="about-mission-section">
          <div className="mission-card-modern">
            <div className="mission-content">
              <span className="mission-tag">Our Story & Vision</span>
              <h2>Built by Passion to Solve Real Everyday Problems</h2>
              <p>
                Founded by <strong>Ajay Singh Banafer</strong>, Helper was born out of a simple observation: finding trustworthy, skilled, and prompt help for home repairs, cleaning, and daily chores was unnecessarily chaotic and stressful.
              </p>
              <p>
                Whether it's an emergency electrical failure, a leaky faucet, or arranging a dependable cook, Helper connects you directly with top local talent in your neighborhood within minutes.
              </p>
              <div className="mission-actions">
                <Link to="/services" className="btn-primary-glow">Explore All Services →</Link>
                <Link to="/contact" className="btn-secondary-glass">Get in Touch</Link>
              </div>
            </div>

            <div className="founder-quote-box">
              <span className="quote-mark">“</span>
              <p className="quote-text">
                Our mission is to save your precious time, bring peace of mind, and build a platform where both customers and service professionals flourish.
              </p>
              <div className="founder-sign">
                <strong>Ajay Singh Banafer</strong>
                <span>Founder & Lead Developer</span>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Grid */}
        <section className="about-values-section">
          <div className="values-header">
            <h2>Our Core Principles</h2>
            <p>The values that guide every service experience on Helper</p>
          </div>

          <div className="values-grid">
            {values.map((val, idx) => (
              <div className="value-card" key={idx}>
                <div className="value-icon">{val.icon}</div>
                <h3>{val.title}</h3>
                <p>{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default About;
