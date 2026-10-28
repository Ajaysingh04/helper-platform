import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import { API_BASE, SOCKET_URL } from "../apiConfig";
import LiveTrackingModal from "./LiveTrackingModal";
import {
  calculateScheduleDetails,
  getBookingDoorOtp,
  handleDemoVendorAccept,
  handleDemoWorkerAccept,
  handleDemoWorkerGoToLocation,
  handleDemoWorkerArrived,
  handleDemoWorkerVerifyOtp,
  handleDemoWorkerCompleteWork,
  handleDemoUserPayBooking,
  handleDemoUserSubmitFeedback,
  calculateDynamicWorkPricing,
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

  // Interactive Scanner & Payment Modal
  const [scannerModalBooking, setScannerModalBooking] = useState(null);
  const [scannerStep, setScannerStep] = useState("scan"); // "scan" | "scanned_bill" | "pay_qr"
  const [scannedBillDetails, setScannedBillDetails] = useState(null);
  const [payingNow, setPayingNow] = useState(false);

  // Optional Feedback Modal State
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(["Punctual ⏱️", "Expert Fix 🔧"]);
  const [feedbackComment, setFeedbackComment] = useState("");

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
      const full = await handleDemoVendorAccept(b);
      showToast("⚡ Demo Vendor Accepted! Request dispatched to Demo Worker (Sunil Verma).");
      const targetId = String(b.bookingId || b.id || b._id || b.bookingCode);
      setLocalCustomerBookings((prev) => {
        const updated = prev.map((item) => {
          const itemId = String(item.bookingId || item.id || item._id || item.bookingCode);
          if (itemId === targetId) {
            return {
              ...item,
              ...full,
              status: "ready_for_worker",
              workerStatus: "assigned",
              vendorAccepted: true
            };
          }
          return item;
        });
        try {
          localStorage.setItem("helper_user_bookings", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
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

  // Quick Simulation Action: Demo Worker - Go to Location
  const handleSimulateGoToLocation = async (b) => {
    try {
      await handleDemoWorkerGoToLocation(b);
      showToast("📍 Demo Worker clicked 'Go to Location' (Traveling status live)!");
      const targetId = String(b.bookingId || b.id || b._id || b.bookingCode);
      setLocalCustomerBookings((prev) =>
        prev.map((item) => {
          const itemId = String(item.bookingId || item.id || item._id || item.bookingCode);
          if (itemId === targetId) {
            return { ...item, workerStatus: "traveling" };
          }
          return item;
        })
      );
    } catch (e) {}
  };

  // Quick Simulation Action: Demo Worker - I am Arrived
  const handleSimulateArrived = async (b) => {
    try {
      await handleDemoWorkerArrived(b);
      showToast("🏁 Demo Worker clicked 'I am Arrived'! Door OTP verification active.");
      const targetId = String(b.bookingId || b.id || b._id || b.bookingCode);
      setLocalCustomerBookings((prev) =>
        prev.map((item) => {
          const itemId = String(item.bookingId || item.id || item._id || item.bookingCode);
          if (itemId === targetId) {
            return { ...item, workerStatus: "arrived" };
          }
          return item;
        })
      );
    } catch (e) {}
  };

  // Quick Simulation Action: Demo Worker - Enter OTP & Start Work
  const handleSimulateVerifyOtp = async (b) => {
    const otpToUse = getBookingDoorOtp(b);
    try {
      await handleDemoWorkerVerifyOtp(b, otpToUse);
      showToast("🔑 Demo Worker verified Door OTP! Countdown & live stopwatch active.");
      const targetId = String(b.bookingId || b.id || b._id || b.bookingCode);
      setLocalCustomerBookings((prev) =>
        prev.map((item) => {
          const itemId = String(item.bookingId || item.id || item._id || item.bookingCode);
          if (itemId === targetId) {
            return { ...item, status: "in_progress", workerStatus: "in_progress" };
          }
          return item;
        })
      );
    } catch (e) {}
  };

  // Quick Simulation Action: Demo Worker - Complete Work & Generate QR
  const handleSimulateCompleteWork = async (b) => {
    try {
      const calc = await handleDemoWorkerCompleteWork(b, 120);
      showToast(`✅ Demo Worker Completed Work! Dynamic bill calculated: ₹${calc.finalTotalAmount}. Worker QR active.`);
      const targetId = String(b.bookingId || b.id || b._id || b.bookingCode);
      setLocalCustomerBookings((prev) =>
        prev.map((item) => {
          const itemId = String(item.bookingId || item.id || item._id || item.bookingCode);
          if (itemId === targetId) {
            return {
              ...item,
              status: "awaiting_payment",
              workerStatus: "awaiting_payment",
              finalTotalAmount: calc.finalTotalAmount,
              price: `₹${calc.finalTotalAmount}`
            };
          }
          return item;
        })
      );
    } catch (e) {}
  };

  // Interactive Scanner Modal Open
  const handleOpenScanner = (b) => {
    const calc = calculateDynamicWorkPricing(b, 120);
    setScannedBillDetails(calc);
    setScannerStep("scan");
    setScannerModalBooking(b);
  };

  // Trigger Scanning of Worker QR
  const handleScanWorkerQr = () => {
    setScannerStep("scanned_bill");
  };

  // Proceed to Helper UPI Payment QR
  const handleProceedToHelperPay = () => {
    setScannerStep("pay_qr");
  };

  // Pay and complete booking (distributing 90% Worker / 5% Vendor / 5% Admin)
  const handleCompletePaymentNow = async () => {
    if (!scannerModalBooking) return;
    setPayingNow(true);
    try {
      const paidPatch = await handleDemoUserPayBooking(scannerModalBooking, "Helper UPI QR");
      setPayingNow(false);
      showToast(`🎉 Payment of ₹${scannedBillDetails?.totalAmount || 499} successful!`);
      const bObj = { ...scannerModalBooking, ...paidPatch };
      setScannerModalBooking(null);

      const targetId = String(bObj.bookingId || bObj.id || bObj._id || bObj.bookingCode);
      setLocalCustomerBookings((prev) =>
        prev.map((item) => {
          const itemId = String(item.bookingId || item.id || item._id || item.bookingCode);
          if (itemId === targetId) {
            return { ...item, ...paidPatch };
          }
          return item;
        })
      );

      // Open Optional Feedback Modal for Demo Worker
      setFeedbackBooking(bObj);
    } catch (e) {
      setPayingNow(false);
      showToast("Payment completed!");
      setScannerModalBooking(null);
    }
  };

  // Optional Feedback Submit
  const handleSubmitFeedback = async () => {
    if (!feedbackBooking) return;
    try {
      await handleDemoUserSubmitFeedback(feedbackBooking, {
        rating: feedbackRating,
        tags: selectedTags,
        comment: feedbackComment || "Punctual and expert work! Very satisfied."
      });
      showToast("⭐ Thank you! Feedback submitted for Demo Worker.");
    } catch (e) {}
    setFeedbackBooking(null);
    setFeedbackComment("");
  };

  // Skip Feedback (Customer decides whether to give feedback or not)
  const handleSkipFeedback = () => {
    showToast("Feedback skipped. Thank you for choosing Helper!");
    setFeedbackBooking(null);
    setFeedbackComment("");
  };

  const toggleFeedbackTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
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
              Track your service bookings, technician dispatch status, and doorstep verification OTP in real time.
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
              const otp = getBookingDoorOtp(b);

              const isCancelled = rawStatus === "cancelled";
              const isPaid = b.paymentStatus === "paid";
              const isAwaitingPayment = rawStatus === "awaiting_payment" || workerStatus === "awaiting_payment" || (rawStatus === "completed" && !isPaid);
              const isFinished = (rawStatus === "completed" || rawStatus === "work_completed") && isPaid;
              const isActive = !isFinished && !isCancelled;

              // Worker Acceptance Check
              const isWorkerAccepted =
                workerStatus === "accepted" ||
                workerStatus === "traveling" ||
                workerStatus === "arrived" ||
                workerStatus === "in_progress" ||
                workerStatus === "awaiting_payment" ||
                workerStatus === "completed" ||
                rawStatus === "slot_confirmed" ||
                rawStatus === "in_progress" ||
                rawStatus === "awaiting_payment" ||
                rawStatus === "completed";

              // Vendor Acceptance Check
              const isVendorAccepted =
                isWorkerAccepted ||
                Boolean(b.vendorAccepted) ||
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
                  {/* Top Bar: Order ID & Status */}
                  <div className="pro-card-top-bar">
                    <div className="pro-card-id-group">
                      <span className="pro-order-chip">ORDER</span>
                      <strong className="pro-order-id-code">#{bookingId}</strong>
                    </div>

                    <div className="pro-card-status-wrap">
                      {isCancelled ? (
                        <span className="status-badge-pro cancelled">✕ Cancelled</span>
                      ) : isPaid ? (
                        <span className="status-badge-pro completed" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                          ✓ Paid &amp; Completed
                        </span>
                      ) : isAwaitingPayment ? (
                        <span className="status-badge-pro animated-pop" style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", color: "#FFFFFF", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)" }}>
                          📷 Scan QR &amp; Pay Bill
                        </span>
                      ) : rawStatus === "in_progress" || workerStatus === "in_progress" ? (
                        <span className="status-badge-pro in-progress">
                          <span className="pulse-dot-green" /> Work in Progress
                        </span>
                      ) : workerStatus === "arrived" ? (
                        <span className="status-badge-pro" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#D97706" }}>
                          <span className="pulse-dot-orange" /> 📍 Worker Arrived • Enter OTP
                        </span>
                      ) : workerStatus === "traveling" ? (
                        <span className="status-badge-pro" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#7C3AED" }}>
                          <span className="pulse-dot-orange" /> 🛵 Worker on the Way
                        </span>
                      ) : isWorkerAccepted ? (
                        <span className="status-badge-pro worker-confirmed animated-pop">
                          <span className="pulse-dot-green" /> ✓ Worker Confirmed
                        </span>
                      ) : isVendorAccepted ? (
                        <span className="status-badge-pro ready-worker">
                          <span className="pulse-dot-orange" /> ⚡ Dispatched to Worker
                        </span>
                      ) : (
                        <span className="status-badge-pro pending-vendor">
                          <span className="pulse-dot-orange" /> ⏳ Awaiting Vendor Confirmation
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 5-Stage Interactive Visual Pipeline Stepper */}
                  <div className="pro-pipeline-stepper">
                    <div className="stepper-step completed">
                      <span className="step-circle">✓</span>
                      <div className="step-label-group">
                        <span className="step-num">Step 1</span>
                        <span className="step-title">Booked</span>
                        <span className="step-subtitle">Requested</span>
                      </div>
                    </div>

                    <div className={`stepper-connector ${isVendorAccepted ? "completed" : "pending"}`} />

                    <div className={`stepper-step ${isVendorAccepted ? "completed" : "active-pulse"}`}>
                      <span className="step-circle">{isVendorAccepted ? "✓" : "⏳"}</span>
                      <div className="step-label-group">
                        <span className="step-num">Step 2</span>
                        <span className="step-title">Vendor</span>
                        <span className="step-subtitle">{isVendorAccepted ? "Accepted" : "Reviewing"}</span>
                      </div>
                    </div>

                    <div className={`stepper-connector ${isWorkerAccepted ? "completed" : isVendorAccepted ? "active" : "pending"}`} />

                    <div className={`stepper-step ${isWorkerAccepted ? "completed" : isVendorAccepted ? "active-pulse" : "pending"}`}>
                      <span className="step-circle">{isWorkerAccepted ? "✓" : isVendorAccepted ? "👨‍🔧" : "3"}</span>
                      <div className="step-label-group">
                        <span className="step-num">Step 3</span>
                        <span className="step-title">Technician</span>
                        <span className="step-subtitle">{isWorkerAccepted ? "Confirmed" : "Dispatching"}</span>
                      </div>
                    </div>

                    <div className={`stepper-connector ${workerStatus === "arrived" || rawStatus === "in_progress" || isAwaitingPayment || isPaid ? "completed" : isWorkerAccepted ? "active" : "pending"}`} />

                    <div className={`stepper-step ${isAwaitingPayment || isPaid ? "completed" : (rawStatus === "in_progress" || workerStatus === "arrived") ? "active-pulse" : "pending"}`}>
                      <span className="step-circle">{(isAwaitingPayment || isPaid) ? "✓" : "⚡"}</span>
                      <div className="step-label-group">
                        <span className="step-num">Step 4</span>
                        <span className="step-title">Service &amp; OTP</span>
                        <span className="step-subtitle">{isAwaitingPayment || isPaid ? "Completed" : rawStatus === "in_progress" ? "Working" : "Location / OTP"}</span>
                      </div>
                    </div>

                    <div className={`stepper-connector ${isPaid ? "completed" : isAwaitingPayment ? "active" : "pending"}`} />

                    <div className={`stepper-step ${isPaid ? "completed" : isAwaitingPayment ? "active-pulse" : "pending"}`}>
                      <span className="step-circle">{isPaid ? "✓" : "💳"}</span>
                      <div className="step-label-group">
                        <span className="step-num">Step 5</span>
                        <span className="step-title">Payment</span>
                        <span className="step-subtitle">{isPaid ? "Paid" : isAwaitingPayment ? "Scan QR" : "Due"}</span>
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

                  {/* Awaiting Payment Hero Callout (Worker QR Generated) */}
                  {isAwaitingPayment && (
                    <div style={{
                      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                      borderRadius: "16px",
                      padding: "16px 20px",
                      color: "#FFFFFF",
                      margin: "14px 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                      border: "2px solid #10B981",
                      boxShadow: "0 10px 25px rgba(16, 185, 129, 0.25)"
                    }}>
                      <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#10B981", fontWeight: 800, fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", animation: "pulseDot 1.2s infinite" }} />
                          <span>WORK COMPLETE • TECHNICIAN QR READY</span>
                        </div>
                        <h4 style={{ margin: "2px 0", fontSize: "16px", color: "#FFFFFF" }}>
                          Sunil Verma has completed your service!
                        </h4>
                        <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8" }}>
                          Scan worker's QR to view timing-based calculated bill and pay via Helper Secure UPI.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenScanner(b)}
                        className="btn-scan-trigger-pill"
                        style={{ width: "auto", padding: "12px 24px" }}
                      >
                        <span>📷 Scan Worker QR &amp; Pay Bill</span>
                      </button>
                    </div>
                  )}

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

                          {/* 5-Step Demo Simulation Controls */}
                          <div className="demo-simulation-action-bar">
                            <span className="demo-sim-title">⚡ Interactive Demo Step-by-Step Flow:</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "6px" }}>
                              {!isVendorAccepted && (
                                <button
                                  type="button"
                                  onClick={() => handleSimulateVendorAccept(b)}
                                  className="btn-demo-sim vendor"
                                >
                                  ⚡ Step 2: Vendor Accept ({DEMO_VENDOR.name})
                                </button>
                              )}
                              {isVendorAccepted && !isWorkerAccepted && (
                                <button
                                  type="button"
                                  onClick={() => handleSimulateWorkerAccept(b)}
                                  className="btn-demo-sim worker"
                                >
                                  👨‍🔧 Step 3: Worker Accept ({DEMO_WORKER.name})
                                </button>
                              )}
                              {isWorkerAccepted && workerStatus === "accepted" && (
                                <button
                                  type="button"
                                  onClick={() => handleSimulateGoToLocation(b)}
                                  className="btn-demo-sim worker"
                                  style={{ background: "#2563EB", color: "#fff" }}
                                >
                                  📍 Step 4a: Worker Go to Location
                                </button>
                              )}
                              {workerStatus === "traveling" && (
                                <button
                                  type="button"
                                  onClick={() => handleSimulateArrived(b)}
                                  className="btn-demo-sim worker"
                                  style={{ background: "#7C3AED", color: "#fff" }}
                                >
                                  🏁 Step 4b: Worker Arrived
                                </button>
                              )}
                              {workerStatus === "arrived" && (
                                <button
                                  type="button"
                                  onClick={() => handleSimulateVerifyOtp(b)}
                                  className="btn-demo-sim worker"
                                  style={{ background: "#D97706", color: "#fff" }}
                                >
                                  🔑 Step 4c: Worker Enter Door OTP ({otp})
                                </button>
                              )}
                              {(rawStatus === "in_progress" || workerStatus === "in_progress") && (
                                <button
                                  type="button"
                                  onClick={() => handleSimulateCompleteWork(b)}
                                  className="btn-demo-sim worker"
                                  style={{ background: "#059669", color: "#fff" }}
                                >
                                  ✅ Step 4d: Worker Complete &amp; Generate QR
                                </button>
                              )}
                              {isAwaitingPayment && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenScanner(b)}
                                  className="btn-demo-sim vendor"
                                  style={{ background: "#10B981", color: "#fff" }}
                                >
                                  📷 Step 5: Demo User Scan QR &amp; Pay
                                </button>
                              )}
                            </div>
                            <span className="demo-sim-hint">
                              (Real-time synchronized across User, Vendor, and Worker tabs!)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: Service Start OTP & Action Hub */}
                    <div className="pro-split-right-col">
                      {/* Highlighted OTP Box */}
                      {!isFinished && !isCancelled && !isAwaitingPayment ? (
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
                      ) : isAwaitingPayment ? (
                        <div className="pro-otp-vault-card" style={{ borderColor: "#10B981" }}>
                          <div className="otp-vault-header">
                            <div className="otp-vault-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                              <span>📷</span>
                              <span>PAYMENT DUE</span>
                            </div>
                          </div>
                          <div style={{ textAlign: "center", padding: "10px 0" }}>
                            <div style={{ fontSize: "28px", fontWeight: 900, color: "#10B981" }}>
                              {priceDisplay}
                            </div>
                            <p style={{ margin: "4px 0 12px", fontSize: "12.5px", color: "var(--text-muted, #64748B)" }}>
                              Calculated based on actual work timing
                            </p>
                            <button
                              type="button"
                              onClick={() => handleOpenScanner(b)}
                              className="btn-scan-trigger-pill"
                            >
                              📷 Scan Worker QR &amp; Pay
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pro-archived-status-box">
                          <span className="archived-icon">{isCancelled ? "✕" : "✓"}</span>
                          <h4>{isCancelled ? "Order Cancelled" : "Service Completed"}</h4>
                          <p>{isCancelled ? "This appointment was cancelled." : "Completed with verified digital invoice."}</p>
                          {isPaid && (
                            <button
                              type="button"
                              onClick={() => {
                                setFeedbackBooking(b);
                                setFeedbackRating(b.workerRating || 5);
                              }}
                              style={{
                                marginTop: "10px",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "1px solid #10B981",
                                background: "rgba(16, 185, 129, 0.12)",
                                color: "#059669",
                                fontSize: "12.5px",
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              ⭐ {b.workerRating ? `Rating: ${b.workerRating}★ (Update)` : "Give Worker Feedback"}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pro-card-action-buttons">
                        {isAwaitingPayment && (
                          <button
                            type="button"
                            className="btn-scan-trigger-pill"
                            style={{ marginBottom: "8px" }}
                            onClick={() => handleOpenScanner(b)}
                          >
                            <span>📷 Scan Worker QR &amp; Pay Bill</span>
                          </button>
                        )}

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

                          {isActive && rawStatus !== "in_progress" && !isAwaitingPayment && (
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

      {/* Interactive QR Scanner & Helper UPI Pay Modal */}
      {scannerModalBooking && (
        <div className="scanner-modal-backdrop" onClick={() => setScannerModalBooking(null)}>
          <div className="scanner-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="scanner-modal-header">
              <div className="scanner-modal-title">
                <span>📷</span>
                <span>
                  {scannerStep === "scan"
                    ? "Scan Worker Completion QR"
                    : scannerStep === "scanned_bill"
                    ? "Service Duration & Invoice"
                    : "Helper Official UPI Pay"}
                </span>
              </div>
              <button
                type="button"
                className="scanner-modal-close"
                onClick={() => setScannerModalBooking(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              {scannerStep === "scan" && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: "0 0 12px", fontSize: "13.5px", color: "var(--text-muted, #64748b)" }}>
                    Apne phone camera se <strong>Demo Worker (Sunil Verma)</strong> ki screen par dikh raha Service QR scan karein:
                  </p>

                  <div className="scanner-viewfinder-box">
                    <div className="scanner-reticle-corner tl" />
                    <div className="scanner-reticle-corner tr" />
                    <div className="scanner-reticle-corner bl" />
                    <div className="scanner-reticle-corner br" />
                    <div className="scanner-laser-line" />
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.75)", fontSize: "12px", zIndex: 1 }}>
                      <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>⚡</span>
                      Scanning for Worker QR...
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-scan-trigger-pill"
                    onClick={handleScanWorkerQr}
                  >
                    <span>⚡ Simulate Scan Worker Completion QR</span>
                  </button>
                </div>
              )}

              {scannerStep === "scanned_bill" && (
                <div>
                  <div style={{ textAlign: "center", marginBottom: "16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.15)", color: "#10B981", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 800 }}>
                      ✓ WORKER QR VERIFIED • TIMING LOGGED
                    </span>
                    <h3 style={{ margin: "10px 0 2px", fontSize: "28px", color: "var(--text-main, #0F172A)", fontWeight: 900 }}>
                      ₹{scannedBillDetails?.totalAmount || 499}
                    </h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted, #64748B)" }}>
                      Work timing ke hisab se dynamically calculate kiya gaya bill
                    </p>
                  </div>

                  {/* Pricing Breakdown */}
                  <div style={{ background: "rgba(0,0,0,0.04)", borderRadius: "14px", padding: "14px 16px", fontSize: "13.5px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "#64748B" }}>Visiting &amp; Inspection Fee:</span>
                      <strong>₹149</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "#64748B" }}>Labor Charge ({scannedBillDetails?.billedHours || 1.5} hrs logged):</span>
                      <strong>₹{scannedBillDetails?.basePrice || 350}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed rgba(0,0,0,0.15)", paddingTop: "8px", marginTop: "6px", fontWeight: 800, fontSize: "15px" }}>
                      <span>Total Payable Amount:</span>
                      <span style={{ color: "#FF4D2D" }}>₹{scannedBillDetails?.totalAmount || 499}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-scan-trigger-pill"
                    style={{ background: "linear-gradient(135deg, #FF4D2D 0%, #E03E1A 100%)", boxShadow: "0 4px 16px rgba(255, 77, 45, 0.4)" }}
                    onClick={handleProceedToHelperPay}
                  >
                    <span>Generate Helper Payment QR ➔</span>
                  </button>
                </div>
              )}

              {scannerStep === "pay_qr" && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255, 77, 45, 0.12)", color: "#FF4D2D", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 800, marginBottom: "12px" }}>
                    <span>🛡️ OFFICIAL HELPER ESCROW PAYMENT QR</span>
                  </div>

                  <h4 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: 800 }}>
                    Scan &amp; Pay via Any UPI App
                  </h4>
                  <p style={{ margin: "0 0 14px", fontSize: "13px", color: "var(--text-muted, #64748B)" }}>
                    UPI ID: <strong>helper.pay@icici</strong> • Amount: <strong>₹{scannedBillDetails?.totalAmount || 499}</strong>
                  </p>

                  {/* Official Helper UPI Payment QR Code */}
                  <div style={{
                    width: "200px",
                    height: "200px",
                    margin: "0 auto 16px",
                    background: "#FFFFFF",
                    borderRadius: "16px",
                    padding: "10px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                    border: "2px solid #FF4D2D"
                  }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=helper.pay@icici&pn=HelperPlatform&am=${scannedBillDetails?.totalAmount || 499}&cu=INR`)}`}
                      alt="Helper Official Payment QR"
                      style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px", fontSize: "12px", color: "#64748B" }}>
                    <span>Supported Apps:</span>
                    <span style={{ fontWeight: 700, color: "var(--text-main, #0F172A)" }}>Google Pay • PhonePe • Paytm • BHIM</span>
                  </div>

                  <button
                    type="button"
                    className="btn-scan-trigger-pill"
                    disabled={payingNow}
                    onClick={handleCompletePaymentNow}
                  >
                    <span>{payingNow ? "Verifying Payment..." : `⚡ Pay Now (₹${scannedBillDetails?.totalAmount || 499}) & Complete`}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Optional Demo Worker Feedback / Review Modal */}
      {feedbackBooking && (
        <div className="scanner-modal-backdrop" onClick={handleSkipFeedback}>
          <div className="scanner-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="scanner-modal-header">
              <div className="scanner-modal-title">
                <span>⭐</span>
                <span>Worker Feedback (Optional)</span>
              </div>
              <button type="button" className="scanner-modal-close" onClick={handleSkipFeedback}>✕</button>
            </div>

            <div style={{ padding: "20px", textAlign: "center" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                margin: "0 auto 12px"
              }}>
                👨‍🔧
              </div>

              <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800 }}>
                {feedbackBooking.assignedWorkerName || DEMO_WORKER.name}
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--text-muted, #64748B)" }}>
                Aap technician ke kaam ko review de sakte hain ya skip kar sakte hain.
              </p>

              {/* 5-Star Interactive Selector */}
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "18px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "32px",
                      cursor: "pointer",
                      color: star <= feedbackRating ? "#F59E0B" : "#CBD5E1",
                      transition: "transform 0.15s ease",
                      padding: 0
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* Quick Compliment Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
                {["Punctual ⏱️", "Clean Work 🧹", "Expert Fix 🔧", "Polite 🤝", "Fair Price 💰"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`feedback-tag-chip ${selectedTags.includes(tag) ? "active" : ""}`}
                    onClick={() => toggleFeedbackTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Optional Comment */}
              <textarea
                rows={3}
                placeholder="Technician ke baare me koi feedback (optional)..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  padding: "10px 14px",
                  fontSize: "13px",
                  boxSizing: "border-box",
                  resize: "none",
                  marginBottom: "18px",
                  background: "var(--bg-card, #ffffff)",
                  color: "var(--text-main, #0F172A)"
                }}
              />

              {/* 2 Buttons: Submit Feedback or Skip (Customer Decides!) */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleSkipFeedback}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    background: "transparent",
                    color: "var(--text-muted, #64748B)",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Skip Feedback
                </button>
                <button
                  type="button"
                  onClick={handleSubmitFeedback}
                  style={{
                    flex: 2,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)"
                  }}
                >
                  Submit Feedback ⭐
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
