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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !mobile || !message) {
      alert("Please fill in all fields.");
      return;
    }

    if (dataContext?.addTicket) {
      dataContext.addTicket({
        name,
        email,
        phone: mobile,
        subject: category,
        message
      });
    }

    setSubmitted(true);
    setName("");
    setEmail("");
    setMobile("");
    setMessage("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  const contactCards = [
    { icon: "📞", title: "Customer Helpline", value: "+91 98765 43210", sub: "Mon-Sun: 8am - 10pm" },
    { icon: "✉️", title: "Support Email", value: "support@helper.com", sub: "Response within 2 hours" },
    { icon: "🏢", title: "Headquarters", value: "Tech Hub Tower, New Delhi", sub: "Sector 62, Metro Corridor" }
  ];

  return (
    <div className="contact-page-wrapper">
      <div className="container-wrapper">
        
        {/* Header */}
        <div className="contact-header-section">
          <span className="contact-sub-tag">Get in Touch</span>
          <h1 className="contact-main-heading">We're Here to Help You 24/7</h1>
          <p className="contact-subtext">Have a question or feedback? Reach out to our dedicated support team.</p>
        </div>

        {/* Contact Info Cards */}
        <div className="contact-cards-row">
          {contactCards.map((card, idx) => (
            <div className="contact-info-card" key={idx}>
              <div className="info-icon-box">{card.icon}</div>
              <h3>{card.title}</h3>
              <p className="card-main-val">{card.value}</p>
              <span className="card-sub-val">{card.sub}</span>
            </div>
          ))}
        </div>

        {/* Main Form & FAQ Section */}
        <div className="contact-main-grid">
          
          {/* Form */}
          <div className="contact-form-card">
            <h2>Send us a Message</h2>
            <p className="form-lead">Fill out the form below and our team will get back to you swiftly.</p>

            {submitted ? (
              <div className="contact-success-box animate-fade-in">
                <span className="success-emoji">🎉</span>
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for contacting us. A support representative will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form-modern">
                <div className="form-dual-row">
                  <div className="contact-input-wrap">
                    <label>Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="contact-input-wrap">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-dual-row">
                  <div className="contact-input-wrap">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="contact-input-wrap">
                    <label>Topic / Query</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Booking Help">Booking Assistance</option>
                      <option value="Become a Partner">Join as Service Partner</option>
                      <option value="Feedback">Feedback / Suggestions</option>
                    </select>
                  </div>
                </div>

                <div className="contact-input-wrap">
                  <label>Your Message</label>
                  <textarea
                    rows={4}
                    placeholder="How can we assist you today?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary-glow contact-submit-btn">
                  <span>Send Message</span>
                  <span>⚡</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick FAQs */}
          <div className="contact-faq-card">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-items-list">
              <div className="faq-item">
                <h4>⏱️ How fast will an expert arrive?</h4>
                <p>Most on-demand services arrive within 30 to 45 minutes of booking confirmation.</p>
              </div>
              <div className="faq-item">
                <h4>🛡️ Are service professionals verified?</h4>
                <p>Yes, 100% of our pros undergo strict background checks, skill verification, and identity audits.</p>
              </div>
              <div className="faq-item">
                <h4>💳 What payment methods are supported?</h4>
                <p>You can pay safely after work completion using UPI (GPay, PhonePe, Paytm), Cards, or Cash.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ContactUs;
