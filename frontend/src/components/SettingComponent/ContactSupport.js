import React from "react";
import "../../css/SettingsCss/ContactSupport.css";

function ContactSupport() {
  return (
    <div className="contact-support-wrapper">
      <h2>Contact Support</h2>
      <p className="contact-subtitle">
        You can reach our dedicated support team using the channels below
      </p>

      <div className="contact-cards-grid">
        {/* Phone Support */}
        <div className="contact-card">
          <h4>📞 Phone Helpline</h4>
          <p style={{ fontWeight: 700, color: "var(--primary)" }}>+91 98765 43210</p>
          <p>Available: Mon – Sun (8:00 AM – 10:00 PM)</p>
        </div>

        {/* Email Support */}
        <div className="contact-card">
          <h4>📧 Email Support</h4>
          <p style={{ fontWeight: 700, color: "var(--primary)" }}>support@helper.com</p>
          <p>Average response within 2 hours</p>
        </div>

        {/* WhatsApp Support */}
        <div className="contact-card">
          <h4>💬 WhatsApp Assistance</h4>
          <p style={{ fontWeight: 700, color: "var(--primary)" }}>+91 98765 43210</p>
          <p>Instant live chat support</p>
        </div>

        {/* Office Address */}
        <div className="contact-card">
          <h4>📍 Corporate Headquarters</h4>
          <p>
            Helper Technologies Pvt Ltd<br />
            Tech Sector 62, New Delhi, India
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContactSupport;
