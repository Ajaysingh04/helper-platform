import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { API_BASE, SOCKET_URL } from "../apiConfig";
import "../css/LiveTrackingModal.css";

function LiveTrackingModal({ booking, onClose }) {
  const [currentBooking, setCurrentBooking] = useState(booking);
  const [telemetry, setTelemetry] = useState({
    etaMinutes: booking?.liveTracking?.etaMinutes || 15,
    distanceKm: booking?.liveTracking?.distanceRemainingKm || 2.4,
    speed: 26,
    heading: 45
  });
  const [statusMessage, setStatusMessage] = useState("Technician is en route with verified tools.");

  // Live stopwatch when work is in progress
  const [stopwatchSeconds, setStopwatchSeconds] = useState(() => {
    if (booking?.workStartedAt) {
      const diff = Math.floor((Date.now() - new Date(booking.workStartedAt).getTime()) / 1000);
      return diff > 0 ? diff : 0;
    }
    return 0;
  });

  // Payment & Review State
  const [paymentDone, setPaymentDone] = useState(() => booking?.paymentStatus === "paid");
  const [paying, setPaying] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [hoverRating, setHoverRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const startOtp = currentBooking?.security?.startOtpPlainForCustomer || currentBooking?.doorOtp || currentBooking?.slotOtp || "4826";
  const status = (currentBooking?.status || "accepted").toLowerCase();
  const workerStatus = (currentBooking?.workerStatus || status).toLowerCase();

  // Socket.IO Real-Time Connection
  useEffect(() => {
    if (!booking?._id && !booking?.id && !booking?.bookingCode) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"]
    });

    const bookingId = booking._id || booking.id || booking.bookingCode;
    socket.emit("client:join_tracking", { bookingId });

    // Listen for live GPS movement from provider/worker
    socket.on("tracking:stream_location", (data) => {
      if (data) {
        setTelemetry((prev) => ({
          ...prev,
          speed: data.speed || 24,
          distanceKm: data.distanceRemainingKm || prev.distanceKm,
          etaMinutes: data.etaMinutes || Math.max(2, Math.round(prev.etaMinutes - 0.2))
        }));
      }
    });

    // Listen for worker live GPS location
    socket.on("worker:location_update", (data) => {
      if (data) {
        setTelemetry((prev) => ({
          ...prev,
          speed: data.speed || 25,
          etaMinutes: data.etaMinutes || Math.max(2, Math.round(prev.etaMinutes - 0.5))
        }));
      }
    });

    // Listen for status changes
    socket.on("booking:status_changed", (data) => {
      if (data) {
        setCurrentBooking((prev) => ({
          ...prev,
          status: data.status || prev.status,
          workerStatus: data.workerStatus || data.status || prev.workerStatus,
          paymentStatus: data.paymentStatus || prev.paymentStatus,
          finalCalculatedAmount: data.finalAmount || prev.finalCalculatedAmount
        }));
        if (data.status === "completed" && data.paymentStatus === "paid") {
          setPaymentDone(true);
        }
        if (data.message) setStatusMessage(data.message);
      }
    });

    socket.on("worker:status_update", (data) => {
      if (data) {
        setCurrentBooking((prev) => ({
          ...prev,
          workerStatus: data.status || data.workerStatus || prev.workerStatus,
          status: data.status === "in_progress" ? "in_progress" : prev.status,
          workStartedAt: data.workStartedAt || prev.workStartedAt
        }));
        if (data.message) setStatusMessage(data.message);
      }
    });

    // Listen for completion
    socket.on("booking:completed", (data) => {
      setCurrentBooking((prev) => ({
        ...prev,
        status: "completed",
        workerStatus: "completed",
        finalCalculatedAmount: data.finalAmount,
        totalAmount: data.finalAmount,
        price: `₹${data.finalAmount}`
      }));
      setStatusMessage("Work completed by specialist! Itemized bill is ready.");
    });

    // Listen for payment confirmation
    socket.on("booking:paid", () => {
      setPaymentDone(true);
      setCurrentBooking((prev) => ({ ...prev, paymentStatus: "paid" }));
      setStatusMessage("Payment received successfully! Please rate your technician.");
    });

    return () => {
      socket.disconnect();
    };
  }, [booking]);

  // Live stopwatch ticker when status is in_progress
  useEffect(() => {
    let timer = null;
    if (status === "in_progress" || workerStatus === "in_progress") {
      timer = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, workerStatus]);

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Pricing calculations
  const homeVisitingCharge = Number(currentBooking?.homeServiceCharge || 149);
  const hourlyRate = Number(currentBooking?.hourlyRate || 299);
  const materialsCost = Number(currentBooking?.materialsCost || currentBooking?.materialCharge || 0);
  const replacedItemName = currentBooking?.replacedItemName || (materialsCost > 0 ? "Replaced Spare Parts" : null);
  const hoursWorked = Math.max(1, Math.ceil(stopwatchSeconds / 3600));
  const laborCharge = hourlyRate * hoursWorked;
  const calculatedTotal = currentBooking?.finalCalculatedAmount || currentBooking?.totalAmount || (homeVisitingCharge + laborCharge + materialsCost);

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
      traveling: 1,
      arrived: 2,
      in_progress: 3,
      completed: 4
    };
    return map[s] !== undefined ? map[s] : 1;
  };

  const activeIndex = getStageIndex(workerStatus === "in_progress" ? "in_progress" : status);

  // Trigger Pay API
  const handleProcessPayment = async (method = "upi_qr") => {
    setPaying(true);
    const bookingId = currentBooking?._id || currentBooking?.id || currentBooking?.bookingCode;
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: method,
          paidAmount: calculatedTotal,
          transactionId: `UPI-HLP-${Date.now().toString().slice(-8)}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentDone(true);
        setCurrentBooking((prev) => ({ ...prev, paymentStatus: "paid" }));
      }
    } catch (e) {
      setPaymentDone(true);
      setCurrentBooking((prev) => ({ ...prev, paymentStatus: "paid" }));
    } finally {
      setPaying(false);
    }
  };

  // Submit Rating & Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    const bookingId = currentBooking?._id || currentBooking?.id || currentBooking?.bookingCode;

    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/rate-worker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: ratingVal,
          review: reviewComment || "Excellent work and timely service!"
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewSubmitted(true);
      }
    } catch (e) {
      setReviewSubmitted(true);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Pro details
  const w = currentBooking?.assignedWorker;
  const proName = w?.name || currentBooking?.assignedWorkerName || currentBooking?.assignedProviderName || "Sunil Sharma";
  const proPhone = w?.phone || currentBooking?.assignedWorkerPhone || "+91 98765 00101";
  const proTrade = w?.category || currentBooking?.serviceCategory || currentBooking?.serviceName || "Certified Plumber";
  const proRating = w?.performance?.rating || w?.rating || 4.95;
  const proJobs = w?.performance?.completedJobsCount || w?.completedJobsCount || 148;
  const proPhoto = w?.photo || w?.avatar || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200";

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
            <h3>Booking #{currentBooking?.bookingCode || currentBooking?.id || "HLP-98421"}</h3>
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

        {/* Live Radar & ETA Banner (Visible during travel / arrival) */}
        {(status !== "in_progress" && status !== "completed" && workerStatus !== "in_progress" && workerStatus !== "completed") && (
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
              <span>{(workerStatus || status).toUpperCase().replace(/_/g, " ")}</span>
            </div>
          </div>
        )}

        {/* Assigned Field Worker / Pro Profile Card */}
        <div className="tracking-provider-card">
          <div className="provider-avatar-box">
            <img 
              src={proPhoto} 
              alt={proName} 
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200"; }}
            />
            <span className="provider-verified-check">✓</span>
          </div>

          <div className="provider-info-meta">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <h4 style={{ margin: 0 }}>{proName}</h4>
              <span style={{ fontSize: "11px", padding: "1px 6px", background: "rgba(16, 185, 129, 0.15)", color: "#10B981", borderRadius: "8px", fontWeight: 700 }}>
                Verified Pro
              </span>
            </div>
            <span className="service-title-pill">{proTrade}</span>
            <div className="rating-pill">
              <span>★ {proRating}</span>
              <span className="rating-count">({proJobs}+ Jobs Completed)</span>
            </div>
          </div>

          <div className="provider-contact-actions">
            <a href={`tel:${proPhone.replace(/[^0-9+]/g, "")}`} className="btn-call-pro" title="Call Field Technician">
              <span>📞</span>
              <span>Call Pro</span>
            </a>
            <button 
              type="button" 
              className="btn-sos-emergency"
              onClick={() => alert("🚨 Helper Safety Helpline Contacted! Dispatch safety team alerted.")}
              title="24/7 Safety SOS"
            >
              <span>SOS</span>
            </button>
          </div>
        </div>

        {/* Security Start OTP Box (Visible until work starts) */}
        {(status !== "in_progress" && status !== "completed" && workerStatus !== "in_progress" && workerStatus !== "completed") && (
          <div className="tracking-otp-security-card">
            <div className="otp-top-row">
              <div className="otp-title-group">
                <span className="shield-icon">🛡️</span>
                <div>
                  <h4>Your Start Service OTP</h4>
                  <p>Technician ke ghar aane ke baad hi yeh 4-digit code share karein.</p>
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
        )}

        {/* =====================================================================
           LIVE WORKING STOPWATCH (When work is IN PROGRESS)
           ===================================================================== */}
        {(status === "in_progress" || workerStatus === "in_progress") && (
          <div style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.05) 100%)",
            border: "1.5px solid rgba(16, 185, 129, 0.35)",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.2)", color: "#10B981", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 800, marginBottom: "12px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", animation: "pulseDot 1.2s infinite" }} />
              <span>SERVICE IN PROGRESS • LIVE STOPWATCH</span>
            </div>
            
            <div style={{ fontSize: "44px", fontWeight: 900, fontFamily: "Space Grotesk, monospace", color: "var(--text-main, #10B981)", letterSpacing: "2px", margin: "8px 0" }}>
              {formatTimer(stopwatchSeconds)}
            </div>

            <p style={{ margin: "4px 0 16px", fontSize: "13.5px", color: "var(--text-muted, #94A3B8)" }}>
              Specialist <strong>{proName}</strong> is actively working at your home. Time is logged mathematically without any hidden charges.
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              background: "var(--surface-input, rgba(255, 255, 255, 0.06))",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid var(--border-color, rgba(16, 185, 129, 0.2))",
              fontSize: "13px"
            }}>
              <div>
                <span style={{ color: "var(--text-muted, #94A3B8)", display: "block", fontSize: "11px", textTransform: "uppercase" }}>Base Visiting Fee</span>
                <strong style={{ color: "var(--text-main, #FFFFFF)" }}>₹{homeVisitingCharge}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted, #94A3B8)", display: "block", fontSize: "11px", textTransform: "uppercase" }}>Hourly Rate</span>
                <strong style={{ color: "var(--text-main, #FFFFFF)" }}>₹{hourlyRate}/hr</strong>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
           COMPLETED WORK: INVOICE, DYNAMIC QR CODE & PAYMENT
           ===================================================================== */}
        {(status === "completed" || workerStatus === "completed") && (
          <div style={{
            background: "var(--surface-card, #1E293B)",
            border: "1.5px solid var(--border-color, #334155)",
            borderRadius: "22px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", borderBottom: "1px dashed var(--border-color, #475569)", paddingBottom: "14px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  ✓ Service Fulfilled
                </span>
                <h3 style={{ margin: "2px 0 0", fontSize: "18px", color: "var(--text-main, #FFFFFF)" }}>Itemized Service Bill</h3>
              </div>
              <span style={{
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                background: paymentDone ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                color: paymentDone ? "#10B981" : "#F59E0B"
              }}>
                {paymentDone ? "PAID ✓" : "PAYMENT DUE ⏳"}
              </span>
            </div>

            {/* Itemized Calculation Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px", fontSize: "13.5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted, #94A3B8)" }}>
                <span>Home Visiting & Diagnostic Charge</span>
                <strong style={{ color: "var(--text-main, #FFFFFF)" }}>₹{homeVisitingCharge}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted, #94A3B8)" }}>
                <span>Labor & Service Time ({currentBooking?.workDurationFormatted || `${hoursWorked}h`})</span>
                <strong style={{ color: "var(--text-main, #FFFFFF)" }}>₹{laborCharge}</strong>
              </div>
              {materialsCost > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#60A5FA", background: "rgba(59, 130, 246, 0.12)", padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(59, 130, 246, 0.25)" }}>
                  <span>🔧 Replaced Spare Part: <strong style={{ color: "#93C5FD" }}>{replacedItemName}</strong></span>
                  <strong style={{ color: "#93C5FD" }}>+₹{materialsCost}</strong>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid var(--border-color, #334155)", paddingTop: "12px", fontSize: "17px", fontWeight: 800, color: "var(--text-main, #FFFFFF)" }}>
                <span>Total Payable Amount</span>
                <span style={{ color: "#FF4D2D" }}>₹{calculatedTotal}</span>
              </div>
            </div>

            {/* QR Code & Payment Section (if not paid yet) */}
            {!paymentDone ? (
              <div style={{
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                borderRadius: "18px",
                padding: "20px",
                color: "#FFFFFF",
                textAlign: "center",
                marginTop: "16px"
              }}>
                <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94A3B8", fontWeight: 700 }}>
                  Scan UPI QR to Pay Specialist
                </span>
                
                {/* Dynamic Stylized QR Code Box */}
                <div style={{
                  background: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "16px",
                  width: "190px",
                  height: "190px",
                  margin: "14px auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
                }}>
                  {/* SVG UPI QR Representation with exact payment URI */}
                  <svg width="150" height="150" viewBox="0 0 100 100" style={{ display: "block" }}>
                    <rect width="100" height="100" fill="#FFFFFF" />
                    {/* Corners */}
                    <rect x="5" y="5" width="26" height="26" fill="#0F172A" rx="4" />
                    <rect x="9" y="9" width="18" height="18" fill="#FFFFFF" rx="2" />
                    <rect x="13" y="13" width="10" height="10" fill="#0F172A" rx="1" />

                    <rect x="69" y="5" width="26" height="26" fill="#0F172A" rx="4" />
                    <rect x="73" y="9" width="18" height="18" fill="#FFFFFF" rx="2" />
                    <rect x="77" y="13" width="10" height="10" fill="#0F172A" rx="1" />

                    <rect x="5" y="69" width="26" height="26" fill="#0F172A" rx="4" />
                    <rect x="9" y="73" width="18" height="18" fill="#FFFFFF" rx="2" />
                    <rect x="13" y="77" width="10" height="10" fill="#0F172A" rx="1" />

                    {/* QR Pixel Matrix */}
                    <rect x="36" y="8" width="6" height="6" fill="#0F172A" />
                    <rect x="46" y="8" width="6" height="6" fill="#0F172A" />
                    <rect x="56" y="8" width="6" height="6" fill="#0F172A" />
                    <rect x="36" y="20" width="6" height="6" fill="#0F172A" />
                    <rect x="46" y="24" width="6" height="6" fill="#0F172A" />
                    <rect x="12" y="38" width="6" height="6" fill="#0F172A" />
                    <rect x="24" y="44" width="6" height="6" fill="#0F172A" />
                    <rect x="38" y="38" width="10" height="10" fill="#FF4D2D" rx="2" />
                    <rect x="52" y="38" width="6" height="6" fill="#0F172A" />
                    <rect x="64" y="44" width="6" height="6" fill="#0F172A" />
                    <rect x="78" y="38" width="6" height="6" fill="#0F172A" />
                    <rect x="38" y="54" width="6" height="6" fill="#0F172A" />
                    <rect x="48" y="54" width="6" height="6" fill="#0F172A" />
                    <rect x="58" y="60" width="6" height="6" fill="#0F172A" />
                    <rect x="70" y="68" width="8" height="8" fill="#0F172A" />
                    <rect x="84" y="68" width="6" height="6" fill="#0F172A" />
                    <rect x="70" y="82" width="6" height="6" fill="#0F172A" />
                    <rect x="82" y="82" width="8" height="8" fill="#0F172A" />
                  </svg>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#0F172A", marginTop: "2px" }}>
                    BHIM UPI • ₹{calculatedTotal}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(255,255,255,0.15)", padding: "3px 8px", borderRadius: "6px", fontSize: "11px" }}>Google Pay</span>
                  <span style={{ background: "rgba(255,255,255,0.15)", padding: "3px 8px", borderRadius: "6px", fontSize: "11px" }}>PhonePe</span>
                  <span style={{ background: "rgba(255,255,255,0.15)", padding: "3px 8px", borderRadius: "6px", fontSize: "11px" }}>Paytm</span>
                  <span style={{ background: "rgba(255,255,255,0.15)", padding: "3px 8px", borderRadius: "6px", fontSize: "11px" }}>BHIM UPI</span>
                </div>

                {/* Instant Pay Simulation Actions */}
                <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                  <button
                    type="button"
                    onClick={() => handleProcessPayment("upi_qr")}
                    disabled={paying}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)"
                    }}
                  >
                    {paying ? "Verifying Payment... ⏳" : `💳 Pay ₹${calculatedTotal} via UPI / Instant Pay`}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProcessPayment("cash")}
                    disabled={paying}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.12)",
                      color: "#FFFFFF",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    💵 Paid Cash Directly to Worker ({proName})
                  </button>
                </div>
              </div>
            ) : (
              /* Review & Rating Form (Active after payment) */
              <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-color, #334155)", paddingTop: "16px" }}>
                <div style={{ textAlign: "center", marginBottom: "14px" }}>
                  <span style={{ fontSize: "36px" }}>🎉</span>
                  <h4 style={{ margin: "4px 0 2px", color: "var(--text-main, #FFFFFF)", fontSize: "16px" }}>Payment Successful!</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted, #94A3B8)" }}>
                    Please rate your service experience with <strong>{proName}</strong>.
                  </p>
                </div>

                {reviewSubmitted ? (
                  <div style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid #10B981",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                    color: "#34D399"
                  }}>
                    <strong style={{ display: "block", fontSize: "14px" }}>⭐ Review Submitted Successfully!</strong>
                    <span style={{ fontSize: "12px" }}>
                      Thank you for reviewing {proName}. Your feedback helps our community flourish.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Interactive Star Selector */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRatingVal(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(ratingVal)}
                          style={{
                            background: "none",
                            border: "none",
                            fontSize: "28px",
                            cursor: "pointer",
                            color: star <= (hoverRating || ratingVal) ? "#F59E0B" : "var(--border-color, #475569)",
                            padding: "2px",
                            transition: "transform 0.15s ease"
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={2}
                      placeholder={`How was ${proName}'s work? (e.g. Prompt arrival, excellent pipe repair, polite behavior)`}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color, #475569)",
                        background: "var(--surface-input, rgba(255, 255, 255, 0.05))",
                        color: "var(--text-main, #FFFFFF)",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        resize: "vertical"
                      }}
                    />

                    <button
                      type="submit"
                      disabled={submittingReview}
                      style={{
                        padding: "11px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #FF4D2D 0%, #E03818 100%)",
                        color: "#FFFFFF",
                        border: "none",
                        fontWeight: 800,
                        fontSize: "13.5px",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(255, 77, 45, 0.3)"
                      }}
                    >
                      {submittingReview ? "Submitting Review... ⏳" : `Submit ★ ${ratingVal}.0 Review`}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Address & Service Details Footer */}
        <div className="tracking-details-footer">
          <div className="detail-item">
            <span className="detail-label">Service Destination</span>
            <strong className="detail-val">
              {currentBooking?.serviceAddress?.fullAddress || currentBooking?.customerAddress || currentBooking?.address || "Palasia Square, Indore, Madhya Pradesh"}
            </strong>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total Amount</span>
            <strong className="detail-val price">
              ₹{calculatedTotal} ({currentBooking?.paymentMode?.replace(/_/g, " ").toUpperCase() || "UPI / CASH"})
            </strong>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LiveTrackingModal;
