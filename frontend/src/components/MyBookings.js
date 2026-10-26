import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import { API_BASE, SOCKET_URL } from "../apiConfig";
import LiveTrackingModal from "./LiveTrackingModal";
import "../css/MyBookings.css";

function MyBookings() {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, isVendor, isWorker, currentUser } = useContext(AuthContext);
  const dataContext = useContext(DataContext);

  const [activeTab, setActiveTab] = useState("all"); // "all" | "active" | "completed"
  const [selectedBookingForTracking, setSelectedBookingForTracking] = useState(null);
  const [copiedOtpId, setCopiedOtpId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [nowTime, setNowTime] = useState(Date.now());

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
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

  // Listen to local events and real-time Socket.IO events from backend
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem("helper_user_bookings");
        if (saved) setLocalCustomerBookings(JSON.parse(saved));
      } catch (e) {}
    };

    window.addEventListener("user_bookings_updated", handleUpdate);
    window.addEventListener("new_booking_created", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Socket.io for live updates when vendor or worker accepts
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
      window.removeEventListener("storage", handleUpdate);
      if (socket) socket.disconnect();
    };
  }, []);

  // Parse date and calculate exact days, remaining hours, and countdown text
  const getCountdownData = (b, currentNow) => {
    let targetMs = b.scheduledTimestamp ? Number(b.scheduledTimestamp) : 0;
    const dateStr = b.scheduledDate || b.bookingDate || "";
    const timeStr = b.scheduledTime || b.timeSlot || "";

    if (!targetMs || isNaN(targetMs)) {
      if (dateStr) {
        const monthMap = {
          jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
          jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        };
        let year = 2026;
        let month = 9;
        let day = 29;

        const isoMatch = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (isoMatch) {
          year = parseInt(isoMatch[1], 10);
          month = parseInt(isoMatch[2], 10) - 1;
          day = parseInt(isoMatch[3], 10);
        } else {
          const dMatch = dateStr.match(/(\d{1,2})\s+([a-zA-Z]{3})/i) || dateStr.match(/([a-zA-Z]{3})\s+(\d{1,2})/i);
          if (dMatch) {
            const first = dMatch[1];
            const second = dMatch[2];
            const num = isNaN(parseInt(first, 10)) ? parseInt(second, 10) : parseInt(first, 10);
            const monStr = (isNaN(parseInt(first, 10)) ? first : second).toLowerCase();
            if (monthMap[monStr] !== undefined) {
              month = monthMap[monStr];
              day = num;
            }
          } else if (dateStr.toLowerCase().includes("tomorrow")) {
            const tm = new Date(currentNow + 86400000);
            year = tm.getFullYear();
            month = tm.getMonth();
            day = tm.getDate();
          } else if (dateStr.toLowerCase().includes("today")) {
            const td = new Date(currentNow);
            year = td.getFullYear();
            month = td.getMonth();
            day = td.getDate();
          }
        }

        let hours = 11;
        let minutes = 0;
        const tMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
        if (tMatch) {
          let h = parseInt(tMatch[1], 10);
          const m = tMatch[2] ? parseInt(tMatch[2], 10) : 0;
          const ampm = tMatch[3].toLowerCase();
          if (ampm === "pm" && h < 12) h += 12;
          if (ampm === "am" && h === 12) h = 0;
          hours = h;
          minutes = m;
        }
        targetMs = new Date(year, month, day, hours, minutes, 0).getTime();
      }
    }

    if (!targetMs || isNaN(targetMs)) return null;

    const diffMs = targetMs - currentNow;
    if (diffMs <= 0) {
      return { isPast: true, badgeText: "🟢 Slot is active now", totalHours: 0, days: 0 };
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const remHours = totalHours % 24;
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    let badgeText = "";
    if (days > 0) {
      badgeText = `⏳ ${days} Day${days > 1 ? "s" : ""} ${remHours} Hr${remHours !== 1 ? "s" : ""} left (${totalHours} hrs left)`;
    } else if (totalHours > 0) {
      badgeText = `⏳ ${totalHours} Hour${totalHours > 1 ? "s" : ""} ${minutes}m ${seconds}s left`;
    } else {
      badgeText = `⏳ ${minutes} Min${minutes !== 1 ? "s" : ""} ${seconds}s left`;
    }

    return {
      isPast: false,
      days,
      totalHours,
      remHours,
      minutes,
      seconds,
      badgeText
    };
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
          <div className="not-logged-in-card animate-fade-in">
            <div className="not-logged-icon">🔒</div>
            <h2>Sign In to View Your Bookings &amp; Service OTPs</h2>
            <p>
              Please log in to your registered customer account to track your scheduled services and access your 4-digit Doorstep Start OTP.
            </p>
            <div className="not-logged-actions">
              <button 
                type="button" 
                className="btn-login-redirect"
                onClick={() => navigate("/login?role=user")}
              >
                Sign In to Customer Account →
              </button>
              <Link to="/" className="btn-browse-services">
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is Admin or Vendor or Worker:
  if (isAdmin || isVendor || isWorker) {
    return (
      <div className="my-bookings-page-wrapper">
        <div className="my-bookings-container">
          <div className="not-logged-in-card animate-fade-in">
            <div className="not-logged-icon">{isAdmin ? "🛡️" : isVendor ? "🛠️" : "👷"}</div>
            <h2>{isAdmin ? "Admin Account Detected" : isVendor ? "Vendor Account Detected" : "Worker Account Detected"}</h2>
            <p>
              This console is dedicated to customer service orders and doorstep OTPs. Your current role is <strong>{currentUser?.role || "Staff Member"}</strong>.
            </p>
            <div className="not-logged-actions">
              {isAdmin && (
                <button type="button" className="btn-login-redirect" onClick={() => navigate("/admin/bookings")}>
                  Open Admin Bookings Dashboard →
                </button>
              )}
              {isVendor && (
                <button type="button" className="btn-login-redirect" onClick={() => navigate("/vendor/dashboard?tab=bookings")}>
                  Open Vendor Orders Console →
                </button>
              )}
              {isWorker && (
                <button type="button" className="btn-login-redirect" onClick={() => navigate("/worker/dashboard?tab=active_jobs")}>
                  Open Technician Jobs Console →
                </button>
              )}
              <Link to="/" className="btn-browse-services">Home Page</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeCount = allUserBookings.filter((b) => !["completed", "work_completed", "cancelled"].includes((b.status || "").toLowerCase())).length;
  const completedCount = allUserBookings.filter((b) => ["completed", "work_completed", "cancelled"].includes((b.status || "").toLowerCase())).length;

  return (
    <div className="my-bookings-page-wrapper">
      <div className="my-bookings-container animate-fade-in">

        {/* Floating Toast Notification */}
        {toastMsg && <div className="bookings-toast-pill animate-fade-up">{toastMsg}</div>}

        {/* Top Header & Breadcrumbs */}
        <div className="bookings-header-row">
          <div className="bookings-title-box">
            <div className="bookings-breadcrumb">
              <Link to="/">Home</Link>
              <span>›</span>
              <Link to="/profile">Profile</Link>
              <span>›</span>
              <span className="current">My Bookings</span>
            </div>
            <div className="bookings-title-and-badge">
              <h1 className="bookings-main-title">
                My Service Bookings &amp; OTPs
              </h1>
              <span className="bookings-live-status-badge">
                <span className="pulse-dot-green" />
                <span>{activeCount} Active</span>
              </span>
            </div>
            <p className="bookings-subtitle">
              Manage your scheduled doorstep services, view assigned technician details, and access your <strong>4-Digit Service Start OTP</strong> anytime.
            </p>
          </div>

          <div className="bookings-header-quick-action">
            <Link to="/categories" className="btn-book-new-service">
              <span>➕</span> Book Another Service
            </Link>
          </div>
        </div>

        {/* Quick Stats Summary Grid */}
        <div className="bookings-stats-strip">
          <div className={`stats-strip-box ${activeTab === "all" ? "selected" : ""}`} onClick={() => setActiveTab("all")}>
            <span className="stats-strip-icon">📋</span>
            <div className="stats-strip-text">
              <strong className="stats-strip-val">{allUserBookings.length}</strong>
              <span className="stats-strip-label">Total Orders</span>
            </div>
          </div>
          <div className={`stats-strip-box ${activeTab === "active" ? "selected" : ""}`} onClick={() => setActiveTab("active")}>
            <span className="stats-strip-icon highlight-orange">⚡</span>
            <div className="stats-strip-text">
              <strong className="stats-strip-val highlight-orange">{activeCount}</strong>
              <span className="stats-strip-label">Active &amp; Dispatched</span>
            </div>
          </div>
          <div className={`stats-strip-box ${activeTab === "completed" ? "selected" : ""}`} onClick={() => setActiveTab("completed")}>
            <span className="stats-strip-icon highlight-green">✓</span>
            <div className="stats-strip-text">
              <strong className="stats-strip-val highlight-green">{completedCount}</strong>
              <span className="stats-strip-label">Completed</span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs & Search */}
        <div className="bookings-controls-bar">
          <div className="bookings-tabs-group">
            <button
              type="button"
              className={`booking-tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Orders ({allUserBookings.length})
            </button>
            <button
              type="button"
              className={`booking-tab-btn ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              <span className="active-dot" />
              Active &amp; Scheduled ({activeCount})
            </button>
            <button
              type="button"
              className={`booking-tab-btn ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              Completed ({completedCount})
            </button>
          </div>

          <div className="bookings-search-input-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by ID, service, technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button type="button" className="clear-search-btn" onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>
        </div>

        {/* Bookings List Section */}
        {filteredBookings.length === 0 ? (
          <div className="empty-bookings-card animate-fade-in">
            <div className="empty-icon">🛋️</div>
            <h3>No Bookings Found</h3>
            <p>
              {searchTerm
                ? "No service orders match your search query."
                : activeTab === "active"
                ? "You do not have any active appointments at the moment."
                : "You haven't placed any bookings yet. Book certified doorstep professionals in seconds!"}
            </p>
            <Link to="/categories" className="btn-empty-action">
              Explore 85+ Services &amp; Specialists →
            </Link>
          </div>
             {filteredBookings.map((b) => {
              const bookingId = b.bookingId || b.id || b.bookingCode || "HLP-10001";
              const otp = b.slotOtp || b.startOtp || b.doorOtp || "3459";
              const rawStatus = (b.status || "pending").toLowerCase();
              const workerStatus = (b.workerStatus || "").toLowerCase();
              const isFinished = rawStatus === "completed" || rawStatus === "work_completed";
              const isCancelled = rawStatus === "cancelled";
              const isActive = !isFinished && !isCancelled;

              // Worker accepted status:
              // Only when worker accepts (or subsequent active states), worker name & phone are visible!
              const isWorkerAccepted = 
                workerStatus === "accepted" || 
                workerStatus === "traveling" || 
                workerStatus === "arrived" || 
                workerStatus === "in_progress" || 
                workerStatus === "completed" ||
                rawStatus === "slot_confirmed" ||
                rawStatus === "in_progress" ||
                rawStatus === "completed";

              const isVendorAccepted = 
                isWorkerAccepted || 
                rawStatus === "ready_for_worker" || 
                rawStatus === "assigned" || 
                workerStatus === "assigned";

              const vendorName = b.assignedProviderName || b.assignedProvider?.name || b.provider || "Ramesh Express Plumbing & Home Care (Demo Vendor)";
              const vendorPhone = typeof b.assignedProvider === "object" ? b.assignedProvider?.phone : (b.assignedProviderPhone || b.providerPhone || "+91 98765 00001");
              
              const assignedWorker = b.assignedWorker || {};
              const workerName = assignedWorker.name || b.assignedWorkerName || "Sunil Verma";
              const workerPhone = assignedWorker.phone || b.assignedWorkerPhone || "+91 98765 00101";

              const serviceTitle = b.serviceName || b.service || "Home Service Specialist";
              const schedDate = b.scheduledDate || b.bookingDate || "Scheduled Date";
              const schedTime = b.scheduledTime || b.timeSlot || "Scheduled Slot";
              const priceDisplay = b.price ? (String(b.price).startsWith("₹") ? b.price : `₹${b.price}`) : (b.totalAmount ? `₹${b.totalAmount}` : "₹249");

              // Dynamic real date countdown calculation:
              const countdown = getCountdownData(b, nowTime);

              return (
                <div key={bookingId} className={`booking-pro-card ${isActive ? "card-is-active" : "card-is-archived"}`}>
                  
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
                        <span className="status-badge-pro worker-confirmed">
                          <span className="pulse-dot-green" /> ✓ Technician Confirmed
                        </span>
                      ) : isVendorAccepted ? (
                        <span className="status-badge-pro ready-worker">
                          <span className="pulse-dot-orange" /> ⚡ Vendor Accepted • Ready for Worker
                        </span>
                      ) : (
                        <span className="status-badge-pro pending-vendor">
                          <span className="pulse-dot-orange" /> ⏳ Awaiting Vendor Acceptance
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Real Date & Dynamic Countdown Banner */}
                  <div className={`pro-countdown-banner ${countdown?.isPast ? "is-active-now" : "is-future"}`}>
                    <div className="countdown-date-info">
                      <span>🗓️ <strong>Scheduled Date:</strong> {schedDate}</span>
                      <span>•</span>
                      <span>⏰ <strong>Time:</strong> {schedTime}</span>
                    </div>
                    {countdown && (
                      <span className={`countdown-timer-chip ${countdown.isPast ? "active-now" : countdown.days === 0 ? "urgent" : ""}`}>
                        {countdown.badgeText}
                      </span>
                    )}
                  </div>

                  {/* 2-Column Split Body */}
                  <div className="pro-card-main-split">
                    {/* LEFT COLUMN: Service Info & Technician Profile */}
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

                      {/* Technician Card or Pending Vendor Notice */}
                      {isWorkerAccepted ? (
                        <div className="pro-technician-card">
                          <div className="tech-avatar-circle">👨‍🔧</div>
                          <div className="tech-details-info">
                            <div className="tech-name-line">
                              <strong>{workerName}</strong>
                              <span className="tech-verified-badge">✓ Technician Confirmed</span>
                            </div>
                            <div className="tech-contact-line">
                              <span>📞 {workerPhone}</span>
                              <span className="tech-dot">•</span>
                              <span className="tech-addr">📍 {b.address || b.customerAddress || "Indore Area"}</span>
                            </div>
                          </div>
                          {workerPhone && (
                            <a href={`tel:${String(workerPhone).replace(/\s+/g, "")}`} className="btn-tech-call-pill">
                              <span>📞 Call</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="pro-worker-unaccepted-box">
                          <div className="pending-vendor-title">
                            <span>{isVendorAccepted ? "⚡ Vendor Accepted • Assigning Field Technician" : "⏳ Awaiting Demo Vendor Confirmation"}</span>
                          </div>
                          <p className="pending-vendor-desc">
                            {isVendorAccepted ? (
                              <>
                                <strong>{vendorName}</strong> has accepted your booking and dispatched it to the field worker. 
                                Technician name, phone number, and direct call button will unlock here automatically once the technician accepts.
                              </>
                            ) : (
                              <>
                                Your booking request has been forwarded to <strong>{vendorName}</strong>. 
                                Technician details and call contact will appear here after the vendor accepts and the technician confirms the slot.
                              </>
                            )}
                          </p>
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
