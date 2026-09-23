import React, { useState, useContext } from "react";
import { DataContext } from "../context/DataContext";
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

    if (!name || !email || !mobile || !message) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const submissionData = {
      name,
      email,
      phone: mobile,
      mobile: mobile,
      category,
      message
    };

    setLastSubmission(submissionData);

    // 1. Register with backend API (and triggers Nodemailer)
    try {
      const res = await fetch("http://localhost:5000/api/contact", {
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
        // Backend not reloaded yet
        setDeliveryStatus("needs_restart");
      }
    } catch (apiErr) {
      console.warn("Backend contact registration error:", apiErr);
      setDeliveryStatus("needs_restart");
    }

    // 2. Add to local DataContext tickets for Super Admin
    if (dataContext?.addTicket) {
      dataContext.addTicket({
        name,
        email,
        phone: mobile,
        subject: category,
        message
      });
    }

    setLoading(false);
    setSubmitted(true);
    setName("");
    setEmail("");
    setMobile("");
    setMessage("");
  };

  const contactCards = [
    { icon: "📞", title: "Customer Helpline", value: "+91 98765 43210", sub: "Mon-Sun: 8am - 10pm" },
    { icon: "✉️", title: "Support Email", value: "ajayworkon04@gmail.com", sub: "Direct Admin Inbox" },
    { icon: "🏢", title: "Headquarters", value: "Tech Hub Tower, New Delhi", sub: "Sector 62, Metro Corridor" }
  ];

  return (
    <div className="contact-page-wrapper">
      <div className="container-wrapper">
        
        {/* Studio Header */}
        <div className="contact-studio-header">
          <div className="pill-tag-coral animate-fade-in">
            <span>24/7 INTELLIGENT DISPATCH & SUPPORT</span>
          </div>

          <h1 className="contact-studio-title animate-fade-up">
            Let’s Talk Dispatch.<br />
            We’re Here Around the Clock.
          </h1>

          <p className="contact-studio-subtitle animate-fade-up">
            Connect with our core team for immediate emergency repair dispatch, corporate partnerships, or service feedback.
          </p>
        </div>

        {/* Studio Split Layout */}
        <div className="contact-studio-split">
          
          {/* Left Column: Direct Fast-Reach Cards */}
          <div className="contact-left-col">
            
            <div className="contact-bento-cards-stack">
              {contactCards.map((card, idx) => (
                <div className="contact-channel-card" key={idx}>
                  <div className="channel-icon-bubble">{card.icon}</div>
                  <div className="channel-meta">
                    <span className="channel-label">{card.title}</span>
                    <strong className="channel-val">{card.value}</strong>
                    <span className="channel-sub">{card.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Operational Status Box */}
            <div className="dispatch-live-status-box">
              <div className="status-indicator-row">
                <span className="live-pulse-dot" />
                <span className="status-text">DISPATCH ENGINE ACTIVE</span>
              </div>
              <p>Average technician response window currently at <strong>24 minutes</strong> across all active service zones.</p>
            </div>

          </div>

          {/* Right Column: High-End Inquiry Form */}
          <div className="contact-right-col">
            <div className="contact-studio-form-card">
              
              <div className="form-header-bar">
                <h3>Send Direct Inquiry</h3>
                <span className="form-sub-pill">FAST ROUTING</span>
              </div>

              {submitted ? (
                <div className="contact-success-box animate-fade-in">
                  <span className="success-emoji">🎉</span>
                  <h3>Inquiry Dispatched Successfully!</h3>
                  {deliveryStatus === "sent" ? (
                    <div className="delivery-status-alert success">
                      ✅ <strong>Direct Email Dispatched!</strong> Copy has been routed to <strong>ajayworkon04@gmail.com</strong> via SMTP.
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
                    className="btn-ghost-dark" 
                    style={{ marginTop: "24px", width: "100%" }}
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
                      {["General Inquiry", "Booking Help", "Become a Partner", "Feedback"].map((t) => (
                        <button
                          type="button"
                          key={t}
                          className={`topic-chip ${category === t ? "active" : ""}`}
                          onClick={() => setCategory(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-dual-row">
                    <div className="contact-input-wrap">
                      <label className="input-label">Your Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ajay Singh"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="studio-input"
                      />
                    </div>
                    <div className="contact-input-wrap">
                      <label className="input-label">Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        className="studio-input"
                      />
                    </div>
                  </div>

                  <div className="contact-input-wrap">
                    <label className="input-label">Email Address</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="studio-input"
                    />
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
                    className="btn-coral contact-submit-full" 
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1 }}
                  >
                    <span>{loading ? "DISPATCHING TO INBOX..." : "SEND INQUIRY"}</span>
                    <span>{loading ? "⏳" : "⚡"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ContactUs;
