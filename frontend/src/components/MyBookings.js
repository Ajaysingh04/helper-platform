import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
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
    return () => {
      window.removeEventListener("user_bookings_updated", handleUpdate);
      window.removeEventListener("new_booking_created", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

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
        ) : (
          <div className="bookings-cards-grid">
            {filteredBookings.map((b) => {
              const bookingId = b.bookingId || b.id || b.bookingCode || "HLP-10001";
              const otp = b.slotOtp || b.startOtp || b.doorOtp || "3459";
              const rawStatus = (b.status || "pending").toLowerCase();
              const isFinished = rawStatus === "completed" || rawStatus === "work_completed";
              const isCancelled = rawStatus === "cancelled";
              const isActive = !isFinished && !isCancelled;
              const providerName = b.assignedProviderName || b.assignedProvider?.name || b.provider || "Certified Specialist";
              const providerPhone = typeof b.assignedProvider === "object" ? b.assignedProvider?.phone : (b.assignedProviderPhone || b.providerPhone || "+91 98765 43210");
              const serviceTitle = b.serviceName || b.service || "Home Service Specialist";
              const schedDate = b.scheduledDate || b.bookingDate || "Today";
              const schedTime = b.scheduledTime || b.timeSlot || "11:00 AM - 12:00 PM";
              const priceDisplay = b.price ? (String(b.price).startsWith("₹") ? b.price : `₹${b.price}`) : (b.totalAmount ? `₹${b.totalAmount}` : "₹249");

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
                      ) : (
                        <span className="status-badge-pro dispatched">
                          <span className="pulse-dot-orange" /> Technician Assigned
                        </span>
                      )}
                    </div>
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

                      {/* Technician Card */}
                      <div className="pro-technician-card">
                        <div className="tech-avatar-circle">👨‍🔧</div>
                        <div className="tech-details-info">
                          <div className="tech-name-line">
                            <strong>{providerName}</strong>
                            <span className="tech-verified-badge">✓ Verified Partner</span>
                          </div>
                          <div className="tech-contact-line">
                            <span>📞 {providerPhone}</span>
                            <span className="tech-dot">•</span>
                            <span className="tech-addr">📍 {b.address || b.customerAddress || "Indore Area"}</span>
                          </div>
                        </div>
                        {providerPhone && (
                          <a href={`tel:${String(providerPhone).replace(/\s+/g, "")}`} className="btn-tech-call-pill">
                            <span>📞 Call</span>
                          </a>
                        )}
                      </div>
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
                            💡 <strong>Doorstep Verification:</strong> Share this 4-digit code with <strong>{providerName}</strong> upon arrival to begin work.
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
                          <a
                            href={`tel:${String(providerPhone).replace(/\s+/g, "")}`}
                            className="btn-action-contact"
                          >
                            <span>📞 Call Pro</span>
                          </a>

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
