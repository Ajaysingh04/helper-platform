import React, { useState, useContext } from "react";
import { DataContext } from "../context/DataContext";
import { API_BASE } from "../apiConfig";
import "../css/ContactUs.css";

function ContactUs() {
  const dataContext = useContext(DataContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [category, setCategory] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !mobile.trim() || !message.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    const submissionData = {
      name: name.trim(),
      email: email.trim(),
      phone: mobile.trim(),
      mobile: mobile.trim(),
      category,
      message: message.trim()
    };

    setLastSubmission(submissionData);

    // 1. Register with backend API (and trigger Nodemailer)
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.emailSent) {
          setDeliveryStatus("sent");
        } else {
          setDeliveryStatus("logged");
        }
      } else {
        setDeliveryStatus("needs_restart");
      }
    } catch (apiErr) {
      console.warn("Backend contact registration error:", apiErr);
      setDeliveryStatus("needs_restart");
    }

    // 2. Add to local DataContext tickets for Super Admin
    if (dataContext?.addTicket) {
      dataContext.addTicket({
        name: submissionData.name,
        email: submissionData.email,
        phone: submissionData.mobile,
        subject: category,
        message: submissionData.message
      });
    }

    setLoading(false);
    setSubmitted(true);
    setName("");
    setEmail("");
    setMobile("");
    setMessage("");
  };

  const contactChannels = [
    {
      type: "phone",
      label: "Customer Helpline",
      val: "+91 98765 43210",
      sub: "Mon–Sun: 8:00 AM – 10:00 PM",
      status: "Open Now",
      href: "tel:+919876543210",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      )
    },
    {
      type: "email",
      label: "Support & Grievance Email",
      val: "ajayworkon04@gmail.com",
      sub: "Average response: < 15 mins",
      status: "Direct Admin Inbox",
      href: "mailto:ajayworkon04@gmail.com",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      )
    },
    {
      type: "whatsapp",
      label: "Official WhatsApp Support",
      val: "+91 98765 43210",
      sub: "Instant chat & photo diagnosis",
      status: "24/7 Available",
      href: "https://wa.me/919876543210?text=Hi%20Helper,%20I%20need%20assistance%20with%20a%20service%20booking.",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      )
    },
    {
      type: "hq",
      label: "Operational Headquarters",
      val: "Tech Hub Tower, Metro Corridor",
      sub: "Sector 62, New Delhi NCR, 201301",
      status: "HQ Campus",
      href: "https://maps.google.com/?q=Sector+62+Noida",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="9" y1="22" x2="9" y2="2" />
          <path d="M8 6h4M8 10h4M8 14h4M8 18h4M16 6h2M16 10h2M16 14h2M16 18h2" />
        </svg>
      )
    }
  ];

  const inquiryTopics = [
    { id: "General Inquiry", label: "General Inquiry" },
    { id: "Emergency Repair", label: "Emergency Repair" },
    { id: "Booking Help", label: "Booking Help" },
    { id: "Become a Partner", label: "Become a Partner" },
    { id: "Corporate / Society", label: "Corporate / Society" },
    { id: "Feedback", label: "Feedback" }
  ];

  return (
    <div className="contact-page-wrapper">
      {/* Background ambient radial glow */}
      <div className="contact-ambient-glow" aria-hidden="true">
        <div className="cnt-glow cnt-glow-1" />
        <div className="cnt-glow cnt-glow-2" />
      </div>

      <div className="contact-container">
        
        {/* ================= Studio Header ================= */}
        <section className="contact-studio-hero">
          <div className="hero-pill-badge">
            <span className="live-status-dot" />
            <span>24/7 INTELLIGENT DISPATCH & SUPPORT</span>
          </div>

          <h1 className="contact-studio-title">
            Let’s Talk Dispatch.<br />
            <span className="title-gradient-accent">We’re Here Around the Clock.</span>
          </h1>

          <p className="contact-studio-subtitle">
            Connect with our core team for immediate emergency repair dispatch, corporate SLA partnerships, technician onboarding, or service feedback.
          </p>

          <div className="hero-trust-chips">
            <span className="trust-chip">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 14 14" /></svg>
              &lt; 15 Min Avg Response
            </span>
            <span className="trust-chip">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              100% Verified Resolution
            </span>
            <span className="trust-chip">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              Autonomous Dispatch Active
            </span>
          </div>
        </section>

        {/* ================= Studio Split Layout ================= */}
        <div className="contact-studio-split">
          
          {/* Left Column: Direct Fast-Reach Cards */}
          <div className="contact-left-col">
            
            <div className="contact-bento-cards-stack">
              {contactChannels.map((card, idx) => (
                <a
                  href={card.href}
                  target={card.type === "whatsapp" || card.type === "hq" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="contact-channel-card"
                  key={idx}
                >
                  <div className={`channel-icon-bubble ${card.type}`}>
                    {card.icon}
                  </div>
                  
                  <div className="channel-meta">
                    <div className="channel-meta-top">
                      <span className="channel-label">{card.label}</span>
                      <span className={`channel-status-pill ${card.type}`}>{card.status}</span>
                    </div>
                    <strong className="channel-val">{card.val}</strong>
                    <span className="channel-sub">{card.sub}</span>
                  </div>

                  <span className="channel-action-arrow">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </span>
                </a>
              ))}
            </div>

            {/* Live Operational Status Box */}
            <div className="dispatch-live-status-box">
              <div className="status-indicator-row">
                <span className="live-pulse-dot" />
                <span className="status-text">DISPATCH NETWORK ACTIVE</span>
              </div>
              <p>
                Average technician doorstep arrival currently at <strong>24 minutes</strong> across 15+ metro hubs. Emergency technicians standby 24/7.
              </p>
              <div className="live-status-tags">
                <span className="mini-tag">⚡ 99.9% Uptime</span>
                <span className="mini-tag">🛡️ Real-time GPS</span>
                <span className="mini-tag">🔒 Escrow Protected</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-End Inquiry Form */}
          <div className="contact-right-col">
            <div className="contact-studio-form-card">
              
              <div className="form-header-bar">
                <div>
                  <h3>Send Direct Inquiry</h3>
                  <p className="form-header-sub">Routed immediately to our priority response queue</p>
                </div>
                <span className="form-sub-pill">FAST ROUTING</span>
              </div>

              {submitted ? (
                <div className="contact-success-box">
                  <div className="success-icon-badge">
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <h3>Inquiry Dispatched Successfully!</h3>

                  {deliveryStatus === "sent" ? (
                    <div className="delivery-status-alert success">
                      ✅ <strong>Direct Email Dispatched!</strong> A copy has been routed to <strong>ajayworkon04@gmail.com</strong> via SMTP.
                    </div>
                  ) : deliveryStatus === "needs_restart" ? (
                    <div className="delivery-status-alert warning">
                      ⚠️ <strong>Logged to Database!</strong> Terminal restart needed for automatic SMTP. You can also click <strong>Open in Gmail</strong> below for immediate transmission!
                    </div>
                  ) : (
                    <p className="success-desc">
                      Thank you! Your inquiry has been registered into our system for <strong>ajayworkon04@gmail.com</strong>.
                    </p>
                  )}

                  {lastSubmission && (
                    <div className="instant-email-actions">
                      <p>Send an instant copy directly from your email app:</p>
                      <div className="instant-btn-row">
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=ajayworkon04@gmail.com&su=${encodeURIComponent(`[Helper Inquiry] ${lastSubmission.category} - ${lastSubmission.name}`)}&body=${encodeURIComponent(`Customer Name: ${lastSubmission.name}\nMobile: ${lastSubmission.phone}\nEmail: ${lastSubmission.email}\nTopic: ${lastSubmission.category}\n\nMessage:\n${lastSubmission.message}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-coral-sm"
                        >
                          📧 Open in Gmail
                        </a>

                        <a
                          href={`mailto:ajayworkon04@gmail.com?subject=${encodeURIComponent(`[Helper Inquiry] ${lastSubmission.category} - ${lastSubmission.name}`)}&body=${encodeURIComponent(`Customer Name: ${lastSubmission.name}\nMobile: ${lastSubmission.phone}\nEmail: ${lastSubmission.email}\nTopic: ${lastSubmission.category}\n\nMessage:\n${lastSubmission.message}`)}`}
                          className="btn-ghost-dark-sm"
                        >
                          📨 Open Mail App
                        </a>
                      </div>
                    </div>
                  )}

                  <button 
                    type="button" 
                    className="btn-send-another" 
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form-modern">
                  
                  {/* Topic Pill Selector */}
                  <div className="topic-selector-group">
                    <label className="input-label">Select Inquiry Topic</label>
                    <div className="topic-pill-chips">
                      {inquiryTopics.map((t) => (
                        <button
                          type="button"
                          key={t.id}
                          className={`topic-chip ${category === t.id ? "active" : ""}`}
                          onClick={() => setCategory(t.id)}
                        >
                          <span>{t.label}</span>
                          {category === t.id && <span className="active-chip-dot" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-dual-row">
                    <div className="contact-input-wrap">
                      <label className="input-label">Your Full Name</label>
                      <div className="input-with-icon">
                        <span className="input-icon">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. Ajay Singh"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="studio-input"
                        />
                      </div>
                    </div>

                    <div className="contact-input-wrap">
                      <label className="input-label">Mobile Number</label>
                      <div className="input-with-icon">
                        <span className="input-icon">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        </span>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          required
                          className="studio-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="contact-input-wrap">
                    <label className="input-label">Email Address</label>
                    <div className="input-with-icon">
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                      </span>
                      <input
                        type="email"
                        placeholder="e.g. name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="studio-input"
                      />
                    </div>
                  </div>

                  <div className="contact-input-wrap">
                    <label className="input-label">Your Message or Issue Details</label>
                    <textarea
                      rows={4}
                      placeholder="Please describe what assistance you need, preferred service time, or questions..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="studio-textarea"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="contact-submit-btn" 
                    disabled={loading}
                  >
                    <span>{loading ? "DISPATCHING INQUIRY..." : "SEND INQUIRY NOW"}</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* ================= Emergency & Enterprise Quick Strip ================= */}
        <section className="contact-bottom-strip">
          <div className="bottom-strip-card emergency">
            <div className="strip-icon-circle">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            </div>
            <div className="strip-info">
              <h4>Emergency Midnight Breakdown?</h4>
              <p>For urgent water bursts, spark failures, or lockouts, call our priority SOS helpline directly.</p>
            </div>
            <a href="tel:+919876543210" className="btn-strip-action">
              Call Emergency SOS
            </a>
          </div>

          <div className="bottom-strip-card corporate">
            <div className="strip-icon-circle">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div className="strip-info">
              <h4>Commercial Fleet & Society SLA</h4>
              <p>Custom recurring maintenance, office sanitization, and bulk resident contracts.</p>
            </div>
            <a href="/grow-business" className="btn-strip-action secondary">
              Partner With Us
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}

export default ContactUs;
