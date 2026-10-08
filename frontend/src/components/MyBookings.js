import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import LiveTrackingModal from "./LiveTrackingModal";
import "../css/MyBookings.css";

function MyBookings() {
  const navigate = useNavigate();
  const { isLoggedIn, isCustomer, isAdmin, isVendor, isWorker, currentUser } = useContext(AuthContext);
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
    return () => {
      window.removeEventListener("user_bookings_updated", handleUpdate);
      window.removeEventListener("new_booking_created", handleUpdate);
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

    // Merge without duplicates (by bookingId or id)
    const map = new Map();
    [...localCustomerBookings, ...filteredContextBookings].forEach((item) => {
      const key = item.id || item.bookingId || item.bookingCode;
      if (key && !map.has(key)) {
        map.set(key, item);
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
        const provider = (b.assignedProvider || b.provider || "").toLowerCase();
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
    if (window.confirm("Kya aap sach me ye booking cancel karna chahte hain?")) {
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
              Aapki active bookings aur technician start OTPs dekhne ke liye kripya apne registered customer account se log in karein.
            </p>
            <div className="not-logged-actions">
              <button 
                type="button" 
                className="btn-login-redirect"
                onClick={() => navigate("/login?role=user")}
              >
                Customer Sign In / Register →
              </button>
              <Link to="/" className="btn-browse-services">
                Browse Services First
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
              Ye page customer service bookings aur OTP tracking ke liye hai. Aapka current account <strong>{currentUser?.role || "Staff"}</strong> hai.
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

        {/* Toast Notification */}
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
            <h1 className="bookings-main-title">
              <span>📋</span> My Service Bookings &amp; OTPs
            </h1>
            <p className="bookings-subtitle">
              Yahan aapki sabhi active bookings, assigned technician details aur unka <strong>4-Digit Service Start OTP</strong> hamesha safely available hai.
            </p>
          </div>

          <div className="bookings-header-quick-action">
            <Link to="/categories" className="btn-book-new-service">
              <span>➕</span> Book New Service
            </Link>
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
              Active &amp; Dispatched ({activeCount})
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
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by ID, service, provider..."
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
            <h3>Koi Booking Nahi Mili</h3>
            <p>
              {searchTerm
                ? "Aapke search query ke anusaar koi booking nahi mili."
                : activeTab === "active"
                ? "Filhal aapki koi active booking nahi hai. Naye professional ko book karein!"
                : "Aapne abhi tak koi service book nahi ki hai."}
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
              const providerPhone = b.assignedProviderPhone || b.assignedProvider?.phone || b.providerPhone || "+91 98765 43210";

              return (
                <div key={bookingId} className={`booking-order-card ${isActive ? "card-active" : "card-archived"}`}>
                  
                  {/* Card Header */}
                  <div className="card-top-bar">
                    <div className="card-id-block">
                      <span className="order-chip">ORDER ID</span>
                      <strong className="order-id-text">#{bookingId}</strong>
                    </div>

                    <div className="card-status-badge-wrap">
                      {isCancelled ? (
                        <span className="status-badge cancelled">✕ Cancelled</span>
                      ) : isFinished ? (
                        <span className="status-badge completed">✓ Work Completed</span>
                      ) : rawStatus === "in_progress" ? (
                        <span className="status-badge in-progress">
                          <span className="pulse-dot-green" /> Work in Progress
                        </span>
                      ) : (
                        <span className="status-badge dispatched">
                          <span className="pulse-dot-orange" /> Technician Assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Service Details */}
                  <div className="card-body-section">
                    <div className="service-info-row">
                      <div className="service-icon-box">⚡</div>
                      <div className="service-text-group">
                        <h3 className="service-name-heading">{b.serviceName || b.service || "Home Service Specialist"}</h3>
                        <div className="service-meta-pills">
                          <span className="meta-pill">📅 {b.scheduledDate || b.bookingDate || "Today"}</span>
                          <span className="meta-pill">⏰ {b.scheduledTime || b.timeSlot || "11:00 AM"}</span>
                          {b.price && <span className="meta-pill price">💰 {b.price}</span>}
                        </div>
                      </div>
                    </div>

                    {b.problemDescription && (
                      <div className="problem-notes-box">
                        <span className="problem-label">Reported Issue:</span>
                        <span className="problem-val">{b.problemDescription}</span>
                      </div>
                    )}

                    {/* KEY FEATURE: PROMINENT HIGHLIGHTED SERVICE START OTP CARD */}
                    {!isFinished && !isCancelled && (
                      <div className="booking-otp-spotlight-box animate-fade-in">
                        <div className="otp-spotlight-top">
                          <div className="otp-label-group">
                            <span className="otp-key-icon">🔐</span>
                            <div>
                              <span className="otp-heading-tag">YOUR SERVICE START OTP</span>
                              <span className="otp-sub-hint">Show this to technician upon doorstep arrival</span>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            className="btn-copy-otp"
                            onClick={() => handleCopyOtp(otp, bookingId)}
                            title="Click to copy OTP"
                          >
                            {copiedOtpId === bookingId ? "✓ Copied!" : "📋 Copy"}
                          </button>
                        </div>

                        <div className="otp-code-giant-display">
                          {String(otp).split("").map((digit, idx) => (
                            <span key={idx} className="otp-single-digit">{digit}</span>
                          ))}
                        </div>

                        <div className="otp-safety-note">
                          <span>🛡️</span>
                          <span>
                            <strong>Safety Guarantee:</strong> Jab technician aapke ghar pahunche aur work verify kare, tabhi ye OTP unko batayein. Bina OTP ke koi extra charge nahi lagta.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Assigned Technician & Location Row */}
                    <div className="provider-dispatch-details-row">
                      <div className="provider-avatar-badge">
                        <span>👤</span>
                      </div>
                      <div className="provider-info-block">
                        <div className="provider-header-line">
                          <strong>{providerName}</strong>
                          <span className="verified-check-tag">✓ Verified Pro</span>
                        </div>
                        <div className="provider-phone-line">
                          <span>📞 {providerPhone}</span>
                          <span className="address-line">📍 {b.address || b.customerAddress || "Local Home Address"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="card-footer-actions">
                    {/* Call Technician */}
                    <a href={`tel:${providerPhone.replace(/\s+/g, "")}`} className="btn-action-call">
                      <span>📞</span> Call Technician
                    </a>

                    {/* Live Tracking / Status */}
                    {isActive && (
                      <button
                        type="button"
                        className="btn-action-track"
                        onClick={() => setSelectedBookingForTracking(b)}
                      >
                        <span>⚡</span> Live Status &amp; ETA
                      </button>
                    )}

                    {/* Cancel Booking (only when still pending/assigned) */}
                    {isActive && rawStatus !== "in_progress" && (
                      <button
                        type="button"
                        className="btn-action-cancel"
                        onClick={() => handleCancelBooking(bookingId)}
                      >
                        Cancel
                      </button>
                    )}
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
