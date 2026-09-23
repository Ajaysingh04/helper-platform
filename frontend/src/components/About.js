import React from "react";
import { Link } from "react-router-dom";
import "../css/About.css";

function About() {
  const stats = [
    { number: "100%", label: "Response Rate" },
    { number: "120x", label: "Dispatch Speed" },
    { number: "50K+", label: "Homes Served" },
    { number: "4.9/5", label: "Customer Trust Rating" },
  ];

  const values = [
    { 
      icon: "🛡️", 
      tag: "SECURITY",
      title: "Uncompromised Safety", 
      desc: "Every technician undergoes national ID validation, criminal background verification, and rigorous hands-on skill evaluation." 
    },
    { 
      icon: "⚡", 
      tag: "REAL-TIME",
      title: "Intelligent Matching", 
      desc: "Our dispatch routing engine pairs your exact issue with the closest available certified professional in less than 30 seconds." 
    },
    { 
      icon: "💎", 
      tag: "WARRANTY",
      title: "100% Quality Guarantee", 
      desc: "Every completed repair or cleaning job is protected by Helper's 30-day revisit warranty with zero hidden fees." 
    },
    { 
      icon: "🤝", 
      tag: "COMMUNITY",
      title: "Fair Pro Economics", 
      desc: "We ensure local electricians, plumbers, and technicians take home maximum earnings with respectful digital workflows." 
    }
  ];

  return (
    <div className="about-page-wrapper">
      <div className="container-wrapper">
        
        {/* Studio Hero Section */}
        <section className="about-studio-hero">
          <div className="pill-tag-coral animate-fade-in">
            <span>OUR VISION & ARCHITECTURE</span>
          </div>
          
          <h1 className="about-studio-title animate-fade-up">
            Intelligent Home Care.<br />
            Built with Trust & Craft.
          </h1>

          <p className="about-studio-subtitle animate-fade-up">
            Helper is engineered to eliminate household friction by replacing phone call chaos with autonomous dispatch and certified service craft.
          </p>
        </section>

        {/* Studio Metric Counters Stack */}
        <section className="about-metrics-row animate-fade-up">
          {stats.map((stat, i) => (
            <div className="about-metric-card" key={i}>
              <span className="metric-huge-num">{stat.number}</span>
              <span className="metric-dim-label">{stat.label}</span>
            </div>
          ))}
        </section>

        {/* Bento Story & Mission Section */}
        <section className="about-bento-section">
          
          {/* Main Story Card */}
          <div className="about-bento-main">
            <div className="pill-tag-subtle">
              <span>FOUNDING PHILOSOPHY</span>
            </div>
            <h2>Built by Passion to Solve Real Everyday Household Problems</h2>
            <p>
              Founded by <strong>Mr. Narendra Modi</strong>, Helper was born out of a simple observation: finding trustworthy, skilled, and prompt help for home repairs, cleaning, and daily chores was unnecessarily chaotic, opaque, and stressful.
            </p>
            <p>
              Whether it’s an emergency electrical failure at midnight, a stubborn plumbing clog, or arranging a dependable daily home chef, Helper bridges the trust gap by deploying verified local experts straight to your doorstep.
            </p>
            <div className="about-actions-group">
              <Link to="/services" className="btn-coral">
                <span>EXPLORE CAPABILITIES</span>
              </Link>
              <Link to="/contact" className="btn-ghost-dark">
                <span>Talk to Team →</span>
              </Link>
            </div>
          </div>

          {/* Founder Quote Card */}
          <div className="about-bento-side">
            <div className="quote-badge-row">
              <span className="founder-tag">FOUNDER NOTE</span>
              <span className="live-dot" />
            </div>
            
            <p className="founder-quote-text">
              “Our mission is to save your precious hours, bring unshakeable peace of mind to families, and provide skilled technicians the dignified livelihood they deserve.”
            </p>

            <div className="founder-footer-row">
              <div className="founder-avatar-circle">NM</div>
              <div className="founder-meta">
                <strong>Mr. Narendra Modi</strong>
                <span>Founder & Lead Developer</span>
              </div>
            </div>
          </div>

        </section>

        {/* Core Principles Grid */}
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
                  <span className="principle-icon">{val.icon}</span>
                  <span className="principle-chip">{val.tag}</span>
                </div>
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
