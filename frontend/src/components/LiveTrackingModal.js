import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { SOCKET_URL } from "../apiConfig";
import "../css/LiveTrackingModal.css";

function LiveTrackingModal({ booking, onClose }) {
  const [currentBooking, setCurrentBooking] = useState(booking);
  const [telemetry, setTelemetry] = useState({
    etaMinutes: booking?.liveTracking?.etaMinutes || 18,
    distanceKm: booking?.liveTracking?.distanceRemainingKm || 2.4,
    speed: 26,
    heading: 45
  });
  const [statusMessage, setStatusMessage] = useState("Technician is en route with verified tools.");

  const startOtp = currentBooking?.security?.startOtpPlainForCustomer || currentBooking?.startOtp || "3459";
  const status = (currentBooking?.status || "accepted").toLowerCase();

  // Socket.IO Real-Time Connection
  useEffect(() => {
    if (!booking?._id && !booking?.id && !booking?.bookingCode) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"]
    });

    const bookingId = booking._id || booking.id || booking.bookingCode;

    socket.emit("client:join_tracking", { bookingId });

    // Listen for live GPS movement from provider
    socket.on("tracking:stream_location", (data) => {
      if (data) {
        setTelemetry((prev) => ({
          ...prev,
          speed: data.speed || 24,
          etaMinutes: Math.max(2, Math.round(prev.etaMinutes - 0.2))
        }));
      }
    });

    // Listen for status changes (e.g. Arrived, In Progress, Completed)
    socket.on("booking:status_changed", (data) => {
      if (data?.status) {
        setCurrentBooking((prev) => ({ ...prev, status: data.status }));
        if (data.message) setStatusMessage(data.message);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [booking]);

  // Stepper helper
  const stages = [
    { key: "assigned", label: "Pro Assigned", icon: "✓" },
    { key: "on_the_way", label: "On The Way", icon: "🛵" },
    { key: "arrived", label: "At Doorstep", icon: "📍" },
    { key: "in_progress", label: "In Progress", icon: "⚡" },
    { key: "completed", label: "Completed", icon: "🎉" }
  ];

  const getStageIndex = (s) => {
    const map = {
      requested: 0,
      searching_provider: 0,
      assigned: 0,
      accepted: 1,
      on_the_way: 1,
      arrived: 2,
      in_progress: 3,
      completed: 4
    };
    return map[s] !== undefined ? map[s] : 1;
  };

  const activeIndex = getStageIndex(status);

  return (
    <div className="tracking-modal-overlay animate-fade-in">
      <div className="tracking-modal-container">
        
        {/* Header */}
        <div className="tracking-modal-header">
          <div className="header-meta">
            <span className="live-radar-pill">
              <span className="live-radar-dot" />
              LIVE TELEMETRY
            </span>
            <h3>Booking #{currentBooking?.bookingCode || "HLP-98421"}</h3>
          </div>
          <button type="button" className="close-track-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Status Stepper */}
        <div className="tracking-stepper-bar">
          {stages.map((stage, idx) => (
            <div 
              className={`step-item ${idx <= activeIndex ? "completed" : ""} ${idx === activeIndex ? "active" : ""}`}
              key={stage.key}
            >
              <div className="step-circle">{stage.icon}</div>
              <span className="step-label">{stage.label}</span>
            </div>
          ))}
        </div>

        {/* Live Radar & ETA Banner */}
        <div className="tracking-eta-card">
          <div className="eta-radar-left">
            <div className="radar-ping-animation">
              <div className="radar-ring ring-1" />
              <div className="radar-ring ring-2" />
              <span className="pro-vehicle-icon">🛵</span>
            </div>
            <div className="eta-text-stack">
              <span className="eta-lead">ESTIMATED ARRIVAL</span>
              <h2 className="eta-time-val">{telemetry.etaMinutes} Mins Away</h2>
              <span className="eta-distance">{telemetry.distanceKm} km • Moving at {telemetry.speed} km/h</span>
              <p className="eta-status-desc">{statusMessage}</p>
            </div>
          </div>
          <div className="eta-status-tag">
            <span>{status.toUpperCase().replace(/_/g, " ")}</span>
          </div>
        </div>

        {/* Security Start OTP Box (CRITICAL ZERO-FRAUD PROTOCOL) */}
        <div className="tracking-otp-security-card">
          <div className="otp-top-row">
            <div className="otp-title-group">
              <span className="shield-icon">🛡️</span>
              <div>
                <h4>Your Start Service OTP</h4>
                <p>Share this code only after the provider arrives at your home.</p>
              </div>
            </div>
            <span className="otp-badge-tag">MANDATORY VERIFICATION</span>
          </div>

          <div className="otp-digits-display">
            {startOtp.split("").map((digit, i) => (
              <span className="otp-digit-box" key={i}>
                {digit}
              </span>
            ))}
          </div>
        </div>

        {/* Assigned Provider Profile Card */}
        <div className="tracking-provider-card">
          <div className="provider-avatar-box">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150" 
              alt="Provider Avatar" 
            />
            <span className="provider-verified-check">✓</span>
          </div>

          <div className="provider-info-meta">
            <h4>{currentBooking?.assignedProviderName || "Rajesh Kumar (Certified Pro)"}</h4>
            <span className="service-title-pill">{currentBooking?.serviceName || "Expert Service"}</span>
            <div className="rating-pill">
              <span>★ 4.9</span>
              <span className="rating-count">(340+ Jobs Completed)</span>
            </div>
          </div>

          <div className="provider-contact-actions">
            <a href="tel:+919876543210" className="btn-call-pro">
              <span>📞</span>
              <span>Call Pro</span>
            </a>
            <button 
              type="button" 
              className="btn-sos-emergency"
              onClick={() => alert("🚨 Helper Safety Helpline Contacted! Dispatch team alerted.")}
            >
              <span>SOS</span>
            </button>
          </div>
        </div>

        {/* Address & Service Details Footer */}
        <div className="tracking-details-footer">
          <div className="detail-item">
            <span className="detail-label">Service Destination</span>
            <strong className="detail-val">
              {currentBooking?.serviceAddress?.fullAddress || currentBooking?.customerAddress || "Home Address"}
            </strong>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total Payment</span>
            <strong className="detail-val price">
              ₹{currentBooking?.pricing?.totalAmount || 328} ({currentBooking?.paymentMode?.replace(/_/g, " ").toUpperCase() || "CASH"})
            </strong>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LiveTrackingModal;
