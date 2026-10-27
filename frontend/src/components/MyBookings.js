import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import { API_BASE, SOCKET_URL } from "../apiConfig";
import LiveTrackingModal from "./LiveTrackingModal";
import {
  calculateScheduleDetails,
  handleDemoVendorAccept,
  handleDemoWorkerAccept,
  DEMO_VENDOR,
  DEMO_WORKER
} from "../utils/bookingWorkflow";
import "../css/MyBookings.css";

function MyBookings() {
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useContext(AuthContext);
  const dataContext = useContext(DataContext);

  const [activeTab, setActiveTab] = useState("all"); // "all" | "active" | "completed"
  const [selectedBookingForTracking, setSelectedBookingForTracking] = useState(null);
  const [copiedOtpId, setCopiedOtpId] = useState(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [nowTime, setNowTime] = useState(Date.now());

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Synchronize local customer bookings
  const [localCustomerBookings, setLocalCustomerBookings] = useState(() => {
    try {
      const saved = localStorage.getItem("helper_user_bookings");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Live 1-second interval ticker for dynamic countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to local events, BroadcastChannel, and real-time Socket.IO events
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem("helper_user_bookings");
        if (saved) setLocalCustomerBookings(JSON.parse(saved));
      } catch (e) {}
    };

    window.addEventListener("user_bookings_updated", handleUpdate);
    window.addEventListener("new_booking_created", handleUpdate);
    window.addEventListener("booking_workflow_updated", handleUpdate);
    window.addEventListener("booking_updated", handleUpdate);
    window.addEventListener("worker_job_accepted", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // BroadcastChannel for instant cross-tab updates (User <-> Vendor <-> Worker)
    let syncCh = null;
    try {
      if (window.BroadcastChannel) {
        syncCh = new window.BroadcastChannel("helper_booking_sync");
        syncCh.onmessage = (ev) => {
          if (ev.data && ev.data.type === "BOOKING_WORKFLOW_UPDATE") {
            handleUpdate();
          }
        };
      }
    } catch (e) {}

    // Socket.io for live backend updates
    let socket = null;
    try {
      socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });

      socket.on("booking:status_changed", (data) => {
        if (!data) return;
        const targetId = data.bookingId || data.id;
        setLocalCustomerBookings((prev) => {
          const updated = prev.map((item) => {
            const itemId = item.bookingId || item.id || item._id || item.bookingCode;
            if (itemId === targetId || String(itemId) === String(targetId)) {
              return {
                ...item,
                status: data.status || item.status,
                workerStatus: data.workerStatus || item.workerStatus,
                assignedWorker: data.assignedWorker || item.assignedWorker,
                assignedWorkerName: data.assignedWorker?.name || item.assignedWorkerName,
                assignedWorkerPhone: data.assignedWorker?.phone || item.assignedWorkerPhone
              };
            }
            return item;
          });
          try { localStorage.setItem("helper_user_bookings", JSON.stringify(updated)); } catch (e) {}
          return updated;
        });
      });

      socket.on("worker:status_update", (data) => {
        if (!data) return;
        const targetId = data.bookingId || data.id;
        setLocalCustomerBookings((prev) => {
          const updated = prev.map((item) => {
            const itemId = item.bookingId || item.id || item._id || item.bookingCode;
            if (itemId === targetId || String(itemId) === String(targetId)) {
              return {
                ...item,
                status: data.status === "in_progress" ? "in_progress" : (data.workerStatus === "accepted" ? "slot_confirmed" : item.status),
                workerStatus: data.status || data.workerStatus || "accepted",
                assignedWorker: data.assignedWorker || (data.workerName ? { name: data.workerName, phone: data.workerPhone } : item.assignedWorker),
                assignedWorkerName: data.assignedWorker?.name || data.workerName || item.assignedWorkerName,
                assignedWorkerPhone: data.assignedWorker?.phone || data.workerPhone || item.assignedWorkerPhone
              };
            }
            return item;
          });
          try { localStorage.setItem("helper_user_bookings", JSON.stringify(updated)); } catch (e) {}
          return updated;
        });
      });
    } catch (err) {}

    return () => {
      window.removeEventListener("user_bookings_updated", handleUpdate);
      window.removeEventListener("new_booking_created", handleUpdate);
      window.removeEventListener("booking_workflow_updated", handleUpdate);
      window.removeEventListener("booking_updated", handleUpdate);
      window.removeEventListener("worker_job_accepted", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      if (syncCh) syncCh.close();
      if (socket) socket.disconnect();
    };
  }, []);

  // Quick Simulation Action: Demo Vendor Accepts
  const handleSimulateVendorAccept = async (b) => {
    try {
      await handleDemoVendorAccept(b);
      showToast("⚡ Demo Vendor Accepted! Request dispatched to Demo Worker (Sunil Verma).");
      const targetId = String(b.bookingId || b.id || b._id || b.bookingCode);
      setLocalCustomerBookings((prev) =>
        prev.map((item) => {
          const itemId = String(item.bookingId || item.id || item._id || item.bookingCode);
          if (itemId === targetId) {
            return {
              ...item,
              status: "ready_for_worker",
              workerStatus: "assigned",
              assignedProvider: `${DEMO_VENDOR.shopName} • ${DEMO_VENDOR.name}`,
              assignedProviderName: DEMO_VENDOR.name,
              assignedProviderPhone: DEMO_VENDOR.phone,
              assignedWorker: DEMO_WORKER,
              assignedWorkerName: DEMO_WORKER.name,
              assignedWorkerPhone: DEMO_WORKER.phone
            };
          }
          return item;
        })
      );
    } catch (e) {
      showToast("Action triggered: Demo Vendor Accepted.");
    }
  };

  // Quick Simulation Action: Demo Worker Accepts
  const handleSimulateWorkerAccept = async (b) => {
    try {
      await handleDemoWorkerAccept(b);
      showToast("🎉 Demo Worker Sunil Verma Accepted! Contact & hours calculation unlocked!");
      const targetId = String(b.bookingId || b.id || b._id || b.bookingCode);
      setLocalCustomerBookings((prev) =>
        prev.map((item) => {
          const itemId = String(item.bookingId || item.id || item._id || item.bookingCode);
          if (itemId === targetId) {
            return {
              ...item,
              status: "slot_confirmed",
              workerStatus: "accepted",
              slotConfirmed: true,
              assignedWorker: DEMO_WORKER,
              assignedWorkerName: DEMO_WORKER.name,
              assignedWorkerPhone: DEMO_WORKER.phone
            };
          }
          return item;
        })
      );
    } catch (e) {
      showToast("Action triggered: Demo Worker Accepted.");
    }
  };

  // Copy Technician Phone
  const handleCopyPhone = (phone, bookingId) => {
    if (!phone) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(phone).replace(/\s+/g, ""));
      setCopiedPhoneId(bookingId);
      showToast(`📞 Phone number copied: ${phone}`);
      setTimeout(() => setCopiedPhoneId(null), 2500);
    }
  };

  // Combine local customer bookings with DataContext bookings matching current user
  const allUserBookings = useMemo(() => {
    const contextBookings = dataContext?.bookings || [];
    const customerPhoneClean = (currentUser?.mobile || currentUser?.phone || "").replace(/\D/g, "");
    const customerNameClean = (currentUser?.name || "").toLowerCase().trim();

    // Filter context bookings that belong to this customer
    const filteredContextBookings = contextBookings.filter((b) => {
      const bPhone = (b.customerPhone || b.phone || "").replace(/\D/g, "");
      const bName = (b.customerName || b.name || "").toLowerCase().trim();
      if (customerPhoneClean && bPhone && (bPhone.includes(customerPhoneClean) || customerPhoneClean.includes(bPhone))) return true;
      if (customerNameClean && bName && bName.includes(customerNameClean)) return true;
      if (!customerPhoneClean && !customerNameClean) return true;
      return false;
    });

    const map = new Map();
    localCustomerBookings.forEach((b) => {
      const key = b.bookingId || b.id || b._id || b.bookingCode;
      if (key) map.set(String(key), b);
    });

    filteredContextBookings.forEach((b) => {
      const key = b.bookingId || b.id || b._id || b.bookingCode;
      if (key && !map.has(String(key))) {
        map.set(String(key), b);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const tA = new Date(a.createdAt || a.scheduledTimestamp || 0).getTime();
      const tB = new Date(b.createdAt || b.scheduledTimestamp || 0).getTime();
      return tB - tA;
    });
  }, [localCustomerBookings, dataContext?.bookings, currentUser]);

  // Filter based on active tab & search
  const filteredBookings = useMemo(() => {
    return allUserBookings.filter((b) => {
      const st = (b.status || "pending").toLowerCase();
      const isCompleted = st === "completed" || st === "work_completed" || st === "cancelled";
      const isActive = !isCompleted;

      if (activeTab === "active" && !isActive) return false;
      if (activeTab === "completed" && !isCompleted) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const service = (b.serviceName || b.service || "").toLowerCase();
        const code = (b.bookingId || b.id || b.bookingCode || "").toLowerCase();
        const provider = (b.assignedProviderName || b.assignedProvider?.name || b.provider || "").toLowerCase();
        if (!service.includes(q) && !code.includes(q) && !provider.includes(q)) return false;
      }
      return true;
    });
  }, [allUserBookings, activeTab, searchTerm]);

  // Copy OTP handler
  const handleCopyOtp = (otp, bookingId) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(otp));
      setCopiedOtpId(bookingId);
      showToast(`🔑 OTP ${otp} copied to clipboard!`);
      setTimeout(() => setCopiedOtpId(null), 2500);
    }
  };

  // Cancel booking handler
  const handleCancelBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        const updated = localCustomerBookings.map((b) => {
          if ((b.id || b.bookingId) === bookingId) {
            return { ...b, status: "Cancelled" };
          }
          return b;
        });
        setLocalCustomerBookings(updated);
        localStorage.setItem("helper_user_bookings", JSON.stringify(updated));
        if (dataContext?.updateBookingStatus) {
          dataContext.updateBookingStatus(bookingId, "Cancelled");
        }
        showToast("Booking cancelled successfully.");
      } catch (e) {
        showToast("Booking cancel update error: " + e.message);
      }
    }
  };

  // If user is not logged in:
  if (!isLoggedIn) {
    return (
      <div className="my-bookings-page-wrapper">
        <div className="my-bookings-container">
          <div className="bookings-not-logged-in-card">
            <div className="auth-lock-icon">🔒</div>
            <h2>Track Your Bookings &amp; Service Start OTPs</h2>
            <p>
              Please log in to your Helper account to monitor your service requests, track technician arrival,
              and verify your service start OTP.
            </p>
            <div className="auth-action-buttons">
              <Link to="/login" className="btn-primary-login">
                ⚡ Log In to View Bookings
              </Link>
              <Link to="/services" className="btn-browse-services">
                Browse Home Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page-wrapper">
      <div className="my-bookings-container">
        {toastMsg && <div className="bookings-toast-pill">{toastMsg}</div>}

        {/* Page Header */}
        <div className="bookings-header-row">
          <div className="bookings-title-box">
            <div className="bookings-breadcrumb">
              <Link to="/">Home</Link> <span>/</span> <span className="current">My Bookings</span>
            </div>
            <div className="bookings-title-and-badge">
              <h1 className="bookings-main-title">My Bookings &amp; Live Tracking</h1>
              <span className="bookings-live-status-badge">
                <span className="live-dot-pulse" /> Live Dispatch Active
              </span>
            </div>
            <p className="bookings-subtitle">
              Real-time 3-stage dispatch: <strong>Demo User</strong> booking goes to <strong>Demo Vendor</strong>, then to <strong>Demo Worker</strong>. 
              Once the worker confirms, contact details and exact duration calculations unlock instantly!
            </p>
          </div>

          <div className="bookings-header-actions">
            <Link to="/services" className="btn-book-new-service">
              <span>+</span> Book New Service
            </Link>
          </div>
        </div>

        {/* Search & Tabs Filter Bar */}
        <div className="bookings-filter-bar">
          <div className="bookings-tabs-group">
            <button
              type="button"
              className={`booking-tab-pill ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Orders ({allUserBookings.length})
            </button>
            <button
              type="button"
              className={`booking-tab-pill ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              Active Jobs
            </button>
            <button
              type="button"
              className={`booking-tab-pill ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              Completed
            </button>
          </div>

          <div className="bookings-search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by order ID, service or technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bookings-search-input"
            />
            {searchTerm && (
              <button type="button" className="search-clear-btn" onClick={() => setSearchTerm("")}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 ? (
          <div className="bookings-empty-state-card">
            <div className="empty-state-icon">📋</div>
            <h3>No Bookings Found</h3>
            <p>
              {searchTerm
                ? "No service orders match your search term. Try a different query."
                : "You don't have any orders in this category yet. Book an expert plumber, electrician, cleaner, or home service technician today."}
            </p>
            <Link to="/categories" className="btn-explore-services">
              Explore Available Categories
            </Link>
          </div>
        ) : (
          /* Bookings Card List */
          <div className="bookings-cards-grid">
            {filteredBookings.map((b) => {
              const bookingId = b.bookingId || b.id || b._id || b.bookingCode || "HLP-00000";
              const rawStatus = (b.status || "pending").toLowerCase();
              const workerStatus = (b.workerStatus || "").toLowerCase();
              const otp = b.slotOtp || b.doorOtp || b.startOtp || "3459";

              const isCancelled = rawStatus === "cancelled";
              const isFinished = rawStatus === "completed" || rawStatus === "work_completed" || workerStatus === "completed";
              const isActive = !isFinished && !isCancelled;

              // Worker Acceptance Check
              const isWorkerAccepted =
                workerStatus === "accepted" ||
                workerStatus === "traveling" ||
                workerStatus === "arrived" ||
                workerStatus === "in_progress" ||
                workerStatus === "completed" ||
                rawStatus === "slot_confirmed" ||
                rawStatus === "in_progress" ||
                rawStatus === "completed";

              // Vendor Acceptance Check
              const isVendorAccepted =
                isWorkerAccepted ||
                rawStatus === "ready_for_worker" ||
                rawStatus === "vendor_accepted" ||
                rawStatus === "assigned" ||
                workerStatus === "assigned";

              const vendorName = b.assignedProviderName || b.assignedProvider?.name || b.provider || `${DEMO_VENDOR.shopName} (${DEMO_VENDOR.name})`;
              const vendorPhone = typeof b.assignedProvider === "object" ? b.assignedProvider?.phone : (b.assignedProviderPhone || b.providerPhone || DEMO_VENDOR.phone);

              const assignedWorker = b.assignedWorker || {};
              const workerName = assignedWorker.name || b.assignedWorkerName || DEMO_WORKER.name;
              const workerPhone = assignedWorker.phone || b.assignedWorkerPhone || DEMO_WORKER.phone;
              const workerRole = assignedWorker.role || "Verified Master Specialist";
              const workerRating = assignedWorker.rating || 4.95;

              const serviceTitle = b.serviceName || b.service || "Home Service Specialist";
              const schedDate = b.scheduledDate || b.bookingDate || "Scheduled Date";
              const schedTime = b.scheduledTime || b.timeSlot || "Scheduled Slot";
              const priceDisplay = b.price ? (String(b.price).startsWith("₹") ? b.price : `₹${b.price}`) : (b.totalAmount ? `₹${b.totalAmount}` : "₹249");

              // Accurate schedule & hours calculations
              const scheduleDetails = calculateScheduleDetails(b, nowTime);

              return (
                <div
                  key={bookingId}
                  className={`booking-pro-card ${isActive ? "card-is-active" : "card-is-archived"} ${isWorkerAccepted ? "worker-active-glow" : ""}`}
                >
                  {/* Top Bar: Order ID, Date & Status */}
                  <div className="pro-card-top-bar">
                    <div className="pro-card-id-group">
                      <span className="pro-order-chip">BOOKING ID</span>
                      <strong className="pro-order-id-code">#{bookingId}</strong>
                      <span className="pro-date-pill">📅 {schedDate}</span>
                      <span className="pro-time-pill">⏰ {schedTime}</span>
                    </div>

                    <div className="pro-card-status-wrap">
                      {isCancelled ? (
                        <span className="status-badge-pro cancelled">✕ Cancelled</span>
                      ) : isFinished ? (
                        <span className="status-badge-pro completed">✓ Service Completed</span>
                      ) : rawStatus === "in_progress" ? (
                        <span className="status-badge-pro in-progress">
                          <span className="pulse-dot-green" /> Work in Progress
                        </span>
                      ) : isWorkerAccepted ? (
                        <span className="status-badge-pro worker-confirmed animated-pop">
                          <span className="pulse-dot-green" /> ✓ Demo Worker Confirmed
                        </span>
                      ) : isVendorAccepted ? (
                        <span className="status-badge-pro ready-worker">
                          <span className="pulse-dot-orange" /> ⚡ Demo Vendor Accepted • Dispatched to Worker
                        </span>
                      ) : (
                        <span className="status-badge-pro pending-vendor">
                          <span className="pulse-dot-orange" /> ⏳ Awaiting Demo Vendor Confirmation
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4-Stage Interactive Visual Pipeline Stepper */}
                  <div className="pro-pipeline-stepper">
                    <div className="stepper-step completed">
                      <span className="step-circle">✓</span>
                      <div className="step-label-group">
                        <span className="step-num">Step 1</span>
                        <span className="step-title">Demo User</span>
                        <span className="step-subtitle">Booked</span>
                      </div>
                    </div>

                    <div className={`stepper-connector ${isVendorAccepted ? "completed" : "pending"}`} />

                    <div className={`stepper-step ${isVendorAccepted ? "completed" : "active-pulse"}`}>
                      <span className="step-circle">{isVendorAccepted ? "✓" : "⏳"}</span>
                      <div className="step-label-group">
                        <span className="step-num">Step 2</span>
                        <span className="step-title">Demo Vendor</span>
                        <span className="step-subtitle">{isVendorAccepted ? "Accepted & Sent" : "Awaiting Review"}</span>
                      </div>
                    </div>

                    <div className={`stepper-connector ${isWorkerAccepted ? "completed" : isVendorAccepted ? "active" : "pending"}`} />

                    <div className={`stepper-step ${isWorkerAccepted ? "completed" : isVendorAccepted ? "active-pulse" : "pending"}`}>
                      <span className="step-circle">{isWorkerAccepted ? "✓" : isVendorAccepted ? "👨‍🔧" : "3"}</span>
                      <div className="step-label-group">
                        <span className="step-num">Step 3</span>
                        <span className="step-title">Demo Worker</span>
                        <span className="step-subtitle">{isWorkerAccepted ? "Confirmed & Locked" : isVendorAccepted ? "Awaiting Acceptance" : "Worker Queue"}</span>
                      </div>
                    </div>

                    <div className={`stepper-connector ${rawStatus === "in_progress" || isFinished ? "completed" : isWorkerAccepted ? "active" : "pending"}`} />

                    <div className={`stepper-step ${isFinished ? "completed" : rawStatus === "in_progress" ? "active-pulse" : "pending"}`}>
                      <span className="step-circle">{isFinished ? "✓" : "⚡"}</span>
                      <div className="step-label-group">
                        <span className="step-num">Step 4</span>
                        <span className="step-title">Service & OTP</span>
                        <span className="step-subtitle">{isFinished ? "Fulfilled" : rawStatus === "in_progress" ? "Working" : "Start Code Ready"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Real Date & Dynamic Countdown Banner */}
                  <div className={`pro-countdown-banner ${scheduleDetails?.isPast ? "is-active-now" : "is-future"}`}>
                    <div className="countdown-date-info">
                      <span>🗓️ <strong>Scheduled Date:</strong> {schedDate}</span>
                      <span>•</span>
                      <span>⏰ <strong>Time:</strong> {schedTime}</span>
                    </div>
                    {scheduleDetails && (
                      <span className={`countdown-timer-chip ${scheduleDetails.isPast ? "active-now" : scheduleDetails.days === 0 ? "urgent" : ""}`}>
                        {scheduleDetails.arrivalBadgeText}
                      </span>
                    )}
                  </div>

                  {/* 2-Column Split Body */}
                  <div className="pro-card-main-split">
                    {/* LEFT COLUMN: Service Info & Technician Profile / Hours Calculation */}
                    <div className="pro-split-left-col">
                      <div className="pro-service-header-row">
                        <div className="pro-service-avatar">⚡</div>
                        <div className="pro-service-text">
                          <h3 className="pro-service-title">{serviceTitle}</h3>
                          <div className="pro-price-and-tag-row">
                            <span className="pro-price-tag">Estimated: {priceDisplay}</span>
                            <span className="pro-guarantee-tag">🛡️ Safety Insured</span>
                          </div>
                        </div>
                      </div>

                      {b.problemDescription && (
                        <div className="pro-problem-box">
                          <span className="problem-label">Requirement:</span>
                          <span className="problem-text">{b.problemDescription}</span>
                        </div>
                      )}

                      {/* Technician Card OR Pending Stages */}
                      {isWorkerAccepted ? (
                        <div className="pro-technician-card worker-confirmed-glow animated-fade-in">
                          <div className="tech-main-profile-row">
                            <div className="tech-avatar-circle-wrap">
                              <span className="tech-avatar-circle">👨‍🔧</span>
                              <span className="tech-online-pulse-dot" title="Technician is Active & Online" />
                            </div>
                            <div className="tech-details-info">
                              <div className="tech-name-line">
                                <strong>{workerName}</strong>
                                <span className="tech-verified-badge">✓ Verified Technician Confirmed</span>
                              </div>
                              <div className="tech-meta-role-line">
                                <span>⭐ {workerRating} Rating</span>
                                <span className="tech-dot">•</span>
                                <span>{workerRole}</span>
                                <span className="tech-dot">•</span>
                                <span>148+ Jobs</span>
                              </div>
                              <div className="tech-contact-line">
                                <span className="tech-phone-text">📞 {workerPhone}</span>
                                <span className="tech-dot">•</span>
                                <span className="tech-addr">📍 {b.address || b.customerAddress || "Indore Area"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Contact Action Buttons: Direct Call & Copy */}
                          <div className="tech-contact-action-row">
                            {workerPhone && (
                              <a
                                href={`tel:${String(workerPhone).replace(/\s+/g, "")}`}
                                className="btn-tech-call-direct"
                              >
                                <span>📞 Direct Call {workerName.split(" ")[0]} ({workerPhone})</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopyPhone(workerPhone, bookingId)}
                              className={`btn-tech-copy-phone ${copiedPhoneId === bookingId ? "copied" : ""}`}
                              title="Copy Phone Number"
                            >
                              {copiedPhoneId === bookingId ? "✓ Copied!" : "📋 Copy Number"}
                            </button>
                          </div>

                          {/* "Kitne Ghante Lagenge" - Dynamic Hours & Duration Calculation Showcase */}
                          <div className="pro-hours-calc-widget">
                            <div className="calc-widget-header">
                              <span className="calc-icon">⏱️</span>
                              <strong>Arrival &amp; Service Duration Breakdown:</strong>
                            </div>

                            <div className="calc-time-grid">
                              <div className="calc-time-box">
                                <span className="calc-box-label">⏰ Arrival / Start Time</span>
                                <strong className="calc-box-value highlight">
                                  {scheduleDetails?.countdownTitle || "On Schedule"}
                                </strong>
                              </div>

                              <div className="calc-time-box">
                                <span className="calc-box-label">⏳ Expected Work Duration</span>
                                <strong className="calc-box-value duration">
                                  ~{scheduleDetails?.estimatedDurationText || "1.5 - 2 Hours"}
                                </strong>
                              </div>

                              <div className="calc-time-box">
                                <span className="calc-box-label">🕒 Total Time Required</span>
                                <strong className="calc-box-value total">
                                  ~{scheduleDetails?.estimatedServiceHours || 2} Hours Total
                                </strong>
                              </div>
                            </div>

                            <p className="calc-desc-note">
                              💡 <strong>Schedule Summary:</strong> {scheduleDetails?.fullExplanation || `Technician ${workerName} will arrive at your scheduled time.`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="pro-worker-unaccepted-box animated-fade-in">
                          <div className="pending-vendor-title">
                            <span>
                              {isVendorAccepted
                                ? "⚡ Demo Vendor Accepted • Dispatched to Demo Worker (Sunil Verma)"
                                : "⏳ Awaiting Demo Vendor Confirmation (Ramesh Express Plumbing)"}
                            </span>
                          </div>
                          <p className="pending-vendor-desc">
                            {isVendorAccepted ? (
                              <>
                                <strong>{vendorName}</strong> has accepted your booking and forwarded the request to <strong>Demo Worker (Sunil Verma)</strong>. 
                                As soon as the worker accepts, his direct phone number, name, and exact duration calculation will unlock right here with live animations!
                              </>
                            ) : (
                              <>
                                Your booking request has been forwarded to <strong>{vendorName}</strong>. 
                                Once the vendor accepts, it will be dispatched to the technician, unlocking direct contact details and live schedule calculations.
                              </>
                            )}
                          </p>

                          {/* Interactive Demo Simulation Controls */}
                          <div className="demo-simulation-action-bar">
                            <span className="demo-sim-title">⚡ Quick Demo Test Actions:</span>
                            {!isVendorAccepted ? (
                              <button
                                type="button"
                                onClick={() => handleSimulateVendorAccept(b)}
                                className="btn-demo-sim vendor"
                              >
                                ⚡ Simulate Vendor Accept ({DEMO_VENDOR.name})
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSimulateWorkerAccept(b)}
                                className="btn-demo-sim worker"
                              >
                                👨‍🔧 Simulate Worker Accept ({DEMO_WORKER.name})
                              </button>
                            )}
                            <span className="demo-sim-hint">
                              (Or open <code>/vendor/dashboard</code> or <code>/worker/dashboard</code> to accept live across tabs)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: Service Start OTP & Action Hub */}
                    <div className="pro-split-right-col">
                      {/* Highlighted OTP Box */}
                      {!isFinished && !isCancelled ? (
                        <div className="pro-otp-vault-card">
                          <div className="otp-vault-header">
                            <div className="otp-vault-badge">
                              <span>🔑</span>
                              <span>SERVICE START OTP</span>
                            </div>
                            <button
                              type="button"
                              className={`btn-otp-copy-inline ${copiedOtpId === bookingId ? "copied" : ""}`}
                              onClick={() => handleCopyOtp(otp, bookingId)}
                              title="Click to copy OTP"
                            >
                              {copiedOtpId === bookingId ? "✓ Copied!" : "📋 Copy"}
                            </button>
                          </div>

                          <div className="otp-vault-digits-row">
                            {String(otp).split("").map((digit, idx) => (
                              <span key={idx} className="otp-vault-digit">{digit}</span>
                            ))}
                          </div>

                          <p className="otp-vault-security-hint">
                            💡 <strong>Doorstep Verification:</strong> Share this 4-digit code with {isWorkerAccepted ? <strong>{workerName}</strong> : <strong>the technician</strong>} upon arrival to begin work.
                          </p>
                        </div>
                      ) : (
                        <div className="pro-archived-status-box">
                          <span className="archived-icon">{isCancelled ? "✕" : "✓"}</span>
                          <h4>{isCancelled ? "Order Cancelled" : "Service Completed"}</h4>
                          <p>{isCancelled ? "This appointment was cancelled." : "Completed with verified digital invoice."}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pro-card-action-buttons">
                        {isActive && (
                          <button
                            type="button"
                            className="btn-action-track-radar"
                            onClick={() => setSelectedBookingForTracking(b)}
                          >
                            <span>📡 Live Radar Track &amp; ETA</span>
                          </button>
                        )}

                        <div className="pro-secondary-actions-row">
                          {isWorkerAccepted ? (
                            <a
                              href={`tel:${String(workerPhone).replace(/\s+/g, "")}`}
                              className="btn-action-contact"
                            >
                              <span>📞 Call Worker</span>
                            </a>
                          ) : (
                            <a
                              href={`tel:${String(vendorPhone).replace(/\s+/g, "")}`}
                              className="btn-action-contact"
                              title="Call Vendor Support"
                            >
                              <span>📞 Call Vendor</span>
                            </a>
                          )}

                          {isActive && rawStatus !== "in_progress" && (
                            <button
                              type="button"
                              className="btn-action-cancel-order"
                              onClick={() => handleCancelBooking(bookingId)}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Telemetry / Tracking Modal */}
      {selectedBookingForTracking && (
        <LiveTrackingModal
          booking={selectedBookingForTracking}
          onClose={() => setSelectedBookingForTracking(null)}
        />
      )}
    </div>
  );
}

export default MyBookings;
