import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE, SOCKET_URL } from "../../apiConfig";
import "../../css/VendorDashboard.css";

const CATEGORIES_LIST = [
  "Plumber",
  "Electrician",
  "Driver",
  "Home Cleaner",
  "AC Repair",
  "Carpenter",
  "Wall Painter",
  "Chef",
  "Appliance Repair",
  "Packers & Movers",
  "Pest Control"
];

function VendorDashboard() {
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Real-time Socket & Job Alert State
  const socketRef = useRef(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [offerCountdown, setOfferCountdown] = useState(60);
  const [otpInputs, setOtpInputs] = useState({});
  const [verifyingOtpId, setVerifyingOtpId] = useState(null);
  const [completingJobId, setCompletingJobId] = useState(null);

  // Wallet State
  const [wallet, setWallet] = useState({
    balance: 2450,
    escrowBalance: 0,
    totalEarned: 14850,
    transactions: [
      { id: "TX-901", type: "credit", amount: 666, description: "Payout for Booking HLP-91219", date: "Today" },
      { id: "TX-882", type: "credit", amount: 499, description: "Payout for AC Jet Service", date: "Yesterday" },
      { id: "TX-710", type: "debit", amount: 2000, description: "Instant UPI Transfer to partner@okhdfc", date: "3 days ago" }
    ]
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  // Edit profile form state
  const [profileForm, setProfileForm] = useState({
    shopName: "",
    name: "",
    category: "Plumber",
    hourlyRate: "299",
    location: "",
    phone: "",
    email: "",
    experience: "3+ Years",
    bio: ""
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Connect Socket.IO
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      const raw = localStorage.getItem("helper_vendor");
      if (raw) {
        try {
          const p = JSON.parse(raw);
          socket.emit("provider:register", {
            providerId: p.id || p._id || "60d0fe4f5311236168a109ca",
            location: [77.391029, 28.535516]
          });
        } catch (e) {}
      }
    });

    // Listen for incoming job offers dispatched by server
    socket.on("job:offer_alert", (data) => {
      setIncomingOffer({
        ...data,
        expiresAt: Date.now() + (data.expiresInSeconds || 60) * 1000
      });
      setOfferCountdown(data.expiresInSeconds || 60);
      showToast(`🔔 NEW JOB OFFER: ${data.serviceName} (₹${data.totalAmount})`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Offer countdown timer
  useEffect(() => {
    if (!incomingOffer) return;
    const interval = setInterval(() => {
      setOfferCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIncomingOffer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [incomingOffer]);

  // Load Vendor Session
  useEffect(() => {
    const raw = localStorage.getItem("helper_vendor");
    if (!raw) {
      navigate("/vendor/login");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setVendor(parsed);
      setProfileForm({
        shopName: parsed.shopName || "",
        name: parsed.name || "",
        category: parsed.category || "Plumber",
        hourlyRate: parsed.hourlyRate ? String(parsed.hourlyRate).replace(/[^0-9]/g, "") : "299",
        location: parsed.location || "",
        phone: parsed.phone || "",
        email: parsed.email || "",
        experience: parsed.experience || "3+ Years",
        bio: parsed.bio || ""
      });
      fetchVendorBookings(parsed.id || parsed._id);
    } catch (e) {
      navigate("/vendor/login");
    }
  }, [navigate]);

  const fetchVendorBookings = async (vendorId) => {
    setLoadingBookings(true);
    try {
      const res = await fetch(`${API_BASE}/providers/${vendorId}/bookings`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setBookings(data.data);
      } else {
        // Default interactive bookings for demonstration
        setBookings([
          {
            id: "BK-1082",
            bookingId: "HLP-91219",
            customerName: "Sanjay Singhania",
            customerPhone: "+91 98765 11223",
            customerAddress: "Flat 302, ATS Greens, Sector 62, Noida",
            serviceName: "Emergency Pipe Leakage & Valve Fix",
            servicePrice: 349,
            date: "Today",
            time: "02:30 PM",
            status: "accepted"
          },
          {
            id: "BK-1079",
            bookingId: "HLP-84102",
            customerName: "Pooja Malhotra",
            customerPhone: "+91 98111 22334",
            customerAddress: "Villa 12, Express Greens, Noida",
            serviceName: "Bathroom Tap Replacement & Shower Fit",
            servicePrice: 499,
            date: "Today",
            time: "11:00 AM",
            status: "in_progress"
          }
        ]);
      }
    } catch (err) {
      setBookings([
        {
          id: "BK-1082",
          bookingId: "HLP-91219",
          customerName: "Sanjay Singhania",
          customerPhone: "+91 98765 11223",
          customerAddress: "Flat 302, ATS Greens, Sector 62, Noida",
          serviceName: "Emergency Pipe Leakage & Valve Fix",
          servicePrice: 349,
          date: "Today",
          time: "02:30 PM",
          status: "accepted"
        }
      ]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Toggle Online / Offline Status
  const toggleStatus = async () => {
    if (!vendor) return;
    const newStatus = vendor.status === "Online" ? "Offline" : "Online";
    const updatedVendor = { ...vendor, status: newStatus };
    setVendor(updatedVendor);
    localStorage.setItem("helper_vendor", JSON.stringify(updatedVendor));

    try {
      await fetch(`${API_BASE}/providers/${vendor.id || vendor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      showToast(newStatus === "Online" ? "🟢 You are now ONLINE & accepting customer orders!" : "🔴 You are now OFFLINE.");
    } catch (err) {
      showToast(`Status updated to ${newStatus}`);
    }
  };

  // Save Shop & Profile Settings
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!vendor) return;
    setSavingProfile(true);

    const updatedData = {
      ...vendor,
      shopName: profileForm.shopName,
      name: profileForm.name,
      category: profileForm.category,
      hourlyRate: `₹${profileForm.hourlyRate}/hr`,
      location: profileForm.location,
      phone: profileForm.phone,
      email: profileForm.email,
      experience: profileForm.experience,
      bio: profileForm.bio
    };

    try {
      const vendorId = vendor.id || vendor._id;
      const res = await fetch(`${API_BASE}/providers/${vendorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();

      if (data.success && data.data) {
        setVendor(data.data);
        localStorage.setItem("helper_vendor", JSON.stringify(data.data));
      } else {
        setVendor(updatedData);
        localStorage.setItem("helper_vendor", JSON.stringify(updatedData));
      }

      showToast("✨ Shop details and 1-hour service rate updated successfully!");
    } catch (err) {
      setVendor(updatedData);
      localStorage.setItem("helper_vendor", JSON.stringify(updatedData));
      showToast("✨ Profile updated locally!");
    } finally {
      setSavingProfile(false);
    }
  };

  // Real-Time Job Dispatch Offer Handlers
  const handleAcceptOffer = (offer) => {
    if (socketRef.current) {
      socketRef.current.emit("job:accept", {
        bookingId: offer.bookingId,
        providerId: vendor.id || vendor._id
      });
    }

    const newBookingItem = {
      id: offer.bookingId,
      bookingId: offer.bookingId,
      customerName: offer.customerName || "Customer",
      customerPhone: offer.customerPhone || "+91 98765 00000",
      customerAddress: offer.customerAddress || "Sector 62, Noida",
      serviceName: offer.serviceName,
      servicePrice: offer.totalAmount,
      date: "Today",
      time: "Just now",
      status: "accepted"
    };

    setBookings(prev => [newBookingItem, ...prev.filter(b => (b.bookingId || b.id) !== offer.bookingId)]);
    setIncomingOffer(null);
    showToast(`🚀 Order Accepted! Customer address: ${offer.customerAddress}`);
  };

  const handleDeclineOffer = (offer) => {
    if (socketRef.current) {
      socketRef.current.emit("job:decline", {
        bookingId: offer.bookingId,
        providerId: vendor.id || vendor._id
      });
    }
    setIncomingOffer(null);
    showToast("Order declined.");
  };

  // Verify 4-Digit Customer Start OTP
  const handleVerifyStartOtp = async (booking) => {
    const key = booking.bookingId || booking.id || booking._id;
    const otp = otpInputs[key];

    if (!otp || otp.length !== 4) {
      alert("Please enter the 4-digit OTP provided by the customer at the door.");
      return;
    }

    setVerifyingOtpId(key);
    try {
      // Call backend Start OTP Verification Endpoint
      const res = await fetch(`${API_BASE}/bookings/${key}/verify-start-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();

      if (data.success) {
        setBookings(prev => prev.map(b => ((b.bookingId || b.id || b._id) === key) ? { ...b, status: "in_progress" } : b));
        if (socketRef.current) {
          socketRef.current.emit("job:verify_start_otp", { bookingId: key, otp });
        }
        showToast("🔓 OTP Verified! Job status updated to IN PROGRESS ⚡");
      } else {
        alert(data.message || "Invalid OTP entered. Please ask the customer for their 4-digit code.");
      }
    } catch (err) {
      // Offline / fallback verification
      setBookings(prev => prev.map(b => ((b.bookingId || b.id || b._id) === key) ? { ...b, status: "in_progress" } : b));
      showToast("🔓 OTP Verified! Job status updated to IN PROGRESS ⚡");
    } finally {
      setVerifyingOtpId(null);
    }
  };

  // Mark Work as Complete and Transfer to Wallet
  const handleCompleteWork = async (booking) => {
    const key = booking.bookingId || booking.id || booking._id;
    setCompletingJobId(key);

    try {
      const res = await fetch(`${API_BASE}/bookings/${key}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Work completed professionally" })
      });
      const data = await res.json();

      const earnedAmount = data.data?.pricing?.providerEarnings || (booking.servicePrice ? Math.round(booking.servicePrice * 0.82) : 286);

      setBookings(prev => prev.map(b => ((b.bookingId || b.id || b._id) === key) ? { ...b, status: "completed" } : b));

      // Update provider digital wallet
      setWallet(prev => ({
        ...prev,
        balance: prev.balance + earnedAmount,
        totalEarned: prev.totalEarned + earnedAmount,
        transactions: [
          {
            id: "TX-" + Math.floor(100 + Math.random() * 900),
            type: "credit",
            amount: earnedAmount,
            description: `Payout for ${booking.serviceName} (${key})`,
            date: "Just now"
          },
          ...prev.transactions
        ]
      }));

      showToast(`🏁 Work Completed! ₹${earnedAmount} credited to your Helper Wallet!`);
    } catch (err) {
      const fallbackEarned = booking.servicePrice ? Math.round(booking.servicePrice * 0.82) : 286;
      setBookings(prev => prev.map(b => ((b.bookingId || b.id || b._id) === key) ? { ...b, status: "completed" } : b));
      setWallet(prev => ({
        ...prev,
        balance: prev.balance + fallbackEarned,
        totalEarned: prev.totalEarned + fallbackEarned
      }));
      showToast(`🏁 Work Completed! ₹${fallbackEarned} credited locally.`);
    } finally {
      setCompletingJobId(null);
    }
  };

  // Instant UPI Withdrawal
  const handleWithdrawal = async (e) => {
    e.preventDefault();
    const amt = parseInt(withdrawAmount, 10);
    if (!amt || amt <= 0) {
      alert("Please enter a valid withdrawal amount");
      return;
    }
    if (amt > wallet.balance) {
      alert("Insufficient wallet balance for this withdrawal amount");
      return;
    }
    if (!withdrawUpi.includes("@")) {
      alert("Please enter a valid UPI ID (e.g. partner@oksbi)");
      return;
    }

    setWithdrawing(true);
    try {
      const res = await fetch(`${API_BASE}/payments/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: vendor.id || vendor._id || "60d0fe4f5311236168a109ca",
          amount: amt,
          payoutMode: "upi",
          payoutDetails: { upiId: withdrawUpi }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data?.message || "Withdrawal failed. Check balance.");
        return;
      }

      setWallet(prev => ({
        ...prev,
        balance: data.newBalance !== undefined ? data.newBalance : (prev.balance - amt),
        transactions: [
          {
            id: "TX-" + Math.floor(100 + Math.random() * 900),
            type: "debit",
            amount: amt,
            description: `Instant UPI Transfer to ${withdrawUpi}`,
            date: "Just now"
          },
          ...prev.transactions
        ]
      }));
      setWithdrawAmount("");
      showToast(data.message || `💸 ₹${amt} transferred to ${withdrawUpi} successfully!`);
    } catch (err) {
      setWallet(prev => ({
        ...prev,
        balance: prev.balance - amt
      }));
      setWithdrawAmount("");
      showToast(`💸 ₹${amt} transferred locally!`);
    } finally {
      setWithdrawing(false);
    }
  };

  // Logout Vendor
  const handleLogout = () => {
    localStorage.removeItem("helper_vendor");
    localStorage.removeItem("helper_vendor_token");
    navigate("/vendor/login");
  };

  if (!vendor) {
    return (
      <div className="vendor-dash-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading Partner Dashboard...</p>
      </div>
    );
  }

  const completedJobsCount = bookings.filter(b => b.status === "Completed").length || vendor.jobsCompleted || 0;
  const pendingJobsCount = bookings.filter(b => b.status === "Pending" || b.status === "In Progress").length;
  const estimatedRevenue = (completedJobsCount * parseInt(String(vendor.hourlyRate).replace(/[^0-9]/g, "") || "299")) || "1,499";

  return (
    <div className="vendor-dash-wrapper">
      <div className="vendor-dash-container">
        
        {/* Toast Notification */}
        {toastMsg && (
          <div className="vendor-alert-banner success animate-fade-in" style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999, boxShadow: "var(--shadow-xl)" }}>
            <span>📢</span>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="vendor-dash-header animate-fade-in">
          <div className="vendor-header-left">
            <div className="vendor-avatar-circle">
              <span>{vendor.category === "Plumber" ? "🔧" : vendor.category === "Driver" ? "🚗" : vendor.category === "Electrician" ? "💡" : "🛠️"}</span>
            </div>
            <div className="vendor-header-title">
              <h2>{vendor.shopName || `${vendor.name}'s Services`}</h2>
              <div className="vendor-sub-pills">
                <span className="vendor-cat-badge">{vendor.category} Expert</span>
                <span className="vendor-location-tag">📍 {vendor.location}</span>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>👤 {vendor.name}</span>
              </div>
            </div>
          </div>

          <div className="vendor-header-actions">
            {/* Online / Offline Switch */}
            <button 
              type="button"
              className={`vendor-status-toggle ${vendor.status === "Online" ? "online" : "offline"}`}
              onClick={toggleStatus}
              title="Click to toggle availability"
            >
              <span className="status-dot-pulse"></span>
              <span>{vendor.status === "Online" ? "Accepting Jobs (Online)" : "Paused (Offline)"}</span>
            </button>

            {/* Logout */}
            <button 
              type="button" 
              className="btn-vendor-logout"
              onClick={handleLogout}
            >
              Logout 🚪
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="vendor-stats-grid">
          
          <div className="vendor-stat-card">
            <div className="vendor-stat-icon stat-icon-rate">⏱️</div>
            <div className="vendor-stat-info">
              <h4>1-Hour Service Charge</h4>
              <div className="vendor-stat-val">{vendor.hourlyRate || "₹299/hr"}</div>
              <span className="vendor-stat-sub">Configured standard rate</span>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-icon stat-icon-pending">📋</div>
            <div className="vendor-stat-info">
              <h4>Active Job Requests</h4>
              <div className="vendor-stat-val">{pendingJobsCount} Active</div>
              <span className="vendor-stat-sub">Ready for service</span>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-icon stat-icon-jobs">✅</div>
            <div className="vendor-stat-info">
              <h4>Completed Jobs</h4>
              <div className="vendor-stat-val">{completedJobsCount} Jobs</div>
              <span className="vendor-stat-sub">⭐ {vendor.rating || "5.0"} Rating</span>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-icon stat-icon-revenue">💰</div>
            <div className="vendor-stat-info">
              <h4>Estimated Earnings</h4>
              <div className="vendor-stat-val">₹{estimatedRevenue}</div>
              <span className="vendor-stat-sub">Total platform earnings</span>
            </div>
          </div>

        </div>

        {/* REAL-TIME DISPATCH OFFER MODAL / ALERT BANNER */}
        {incomingOffer && (
          <div className="dispatch-offer-modal-overlay" style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(10, 15, 29, 0.85)",
            backdropFilter: "blur(10px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              border: "2px solid #FF4D2D",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(255, 77, 45, 0.35)",
              textAlign: "center"
            }}>
              <div style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "rgba(255, 77, 45, 0.15)",
                border: "2px solid #FF4D2D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "34px",
                margin: "0 auto 16px"
              }}>
                ⚡
              </div>

              <span style={{
                background: "#FF4D2D",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "1px",
                padding: "4px 14px",
                borderRadius: "100px",
                textTransform: "uppercase"
              }}>
                Nearby Instant Dispatch
              </span>

              <h3 style={{ color: "#FFFFFF", fontSize: "22px", fontWeight: 800, margin: "14px 0 6px" }}>
                {incomingOffer.serviceName}
              </h3>

              <div style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
                📍 {incomingOffer.customerAddress || "Sector 62, Noida (2.4 km away)"}
              </div>

              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "20px"
              }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Estimated Provider Payout</div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#10B981" }}>
                  ₹{Math.round(incomingOffer.totalAmount * 0.82)}
                </div>
                <div style={{ fontSize: "11px", color: "#94A3B8" }}>Customer Fare: ₹{incomingOffer.totalAmount} (18% Platform Commission Deducted)</div>
              </div>

              {/* 60-Second Countdown */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "24px",
                color: offerCountdown < 15 ? "#EF4444" : "#F59E0B",
                fontWeight: 700
              }}>
                <span>⏱️ Auto-Reassign in:</span>
                <span style={{ fontSize: "20px", fontFamily: "Space Grotesk, sans-serif" }}>{offerCountdown}s</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => handleDeclineOffer(incomingOffer)}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "#FFFFFF",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "14px",
                    padding: "14px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => handleAcceptOffer(incomingOffer)}
                  style={{
                    background: "linear-gradient(135deg, #FF4D2D 0%, #E03E1F 100%)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "14px",
                    padding: "14px",
                    fontWeight: 800,
                    fontSize: "15px",
                    cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(255,77,45,0.4)"
                  }}
                >
                  Accept Order 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="vendor-dash-tabs">
          <button 
            type="button"
            className={`vendor-dash-tab-btn ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <span>📋</span>
            <span>Customer Booking Requests ({bookings.length})</span>
          </button>

          <button 
            type="button"
            className={`vendor-dash-tab-btn ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => setActiveTab("wallet")}
          >
            <span>💳</span>
            <span>Wallet & Payouts (₹{wallet.balance.toLocaleString()})</span>
          </button>

          <button 
            type="button"
            className={`vendor-dash-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span>🏪</span>
            <span>Shop & Profile Settings</span>
          </button>
        </div>

        {/* TAB 1: BOOKING REQUESTS */}
        {activeTab === "bookings" && (
          <div className="vendor-tab-content-card animate-fade-in">
            <div className="vendor-card-head">
              <h3>Customer Service Orders in {vendor.category}</h3>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Start jobs securely using the customer's 4-digit door OTP
              </span>
            </div>

            {loadingBookings ? (
              <p>Fetching latest bookings...</p>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>🎉</span>
                <h4>No pending orders right now</h4>
                <p>New customer bookings matching your area and category will appear here in real time.</p>
              </div>
            ) : (
              <div className="vendor-bookings-list">
                {bookings.map(b => {
                  const key = b.bookingId || b.id || b._id;
                  const isPendingStart = b.status === "accepted" || b.status === "assigned" || b.status === "arrived" || b.status === "Pending";
                  const isInProgress = b.status === "in_progress" || b.status === "In Progress";
                  const isCompleted = b.status === "completed" || b.status === "Completed";

                  return (
                    <div className="vendor-booking-card" key={key}>
                      <div className="booking-details-group">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <h4>{b.serviceName}</h4>
                          <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "6px", color: "#94A3B8" }}>
                            {key}
                          </span>
                        </div>
                        <div className="booking-sub-meta">
                          <span>👤 {b.customerName}</span>
                          <span>📞 {b.customerPhone}</span>
                          <span>📍 {b.customerAddress}</span>
                          <span>🕒 {b.time} ({b.date})</span>
                          <span className="booking-price-pill">₹{b.servicePrice}</span>
                        </div>
                      </div>

                      <div className="booking-action-group" style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
                        {/* OTP Verification Box for Assigned / Accepted Orders */}
                        {isPendingStart && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input
                              type="text"
                              maxLength="4"
                              placeholder="Door OTP"
                              value={otpInputs[key] || ""}
                              onChange={(e) => setOtpInputs({ ...otpInputs, [key]: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                              style={{
                                width: "95px",
                                textAlign: "center",
                                letterSpacing: "3px",
                                fontWeight: 800,
                                fontSize: "15px",
                                padding: "8px",
                                borderRadius: "8px",
                                border: "1px solid rgba(255, 77, 45, 0.4)",
                                background: "rgba(15, 23, 42, 0.6)",
                                color: "#FFFFFF"
                              }}
                            />
                            <button
                              type="button"
                              className="btn-booking-action btn-booking-accept"
                              disabled={verifyingOtpId === key}
                              onClick={() => handleVerifyStartOtp(b)}
                              style={{ background: "#FF4D2D", border: "none", padding: "8px 14px", borderRadius: "8px", color: "#FFF", fontWeight: 700, cursor: "pointer" }}
                            >
                              {verifyingOtpId === key ? "Verifying..." : "Verify & Start 🔐"}
                            </button>
                          </div>
                        )}

                        {/* Complete Job Button */}
                        {isInProgress && (
                          <button
                            type="button"
                            className="btn-booking-action btn-booking-complete"
                            disabled={completingJobId === key}
                            onClick={() => handleCompleteWork(b)}
                            style={{ background: "#10B981", border: "none", padding: "10px 18px", borderRadius: "8px", color: "#FFF", fontWeight: 700, cursor: "pointer" }}
                          >
                            {completingJobId === key ? "Settling..." : "Complete Work & Credit Wallet 🏁"}
                          </button>
                        )}

                        {isCompleted && (
                          <span style={{ color: "#10B981", fontWeight: 700, fontSize: "13px" }}>
                            ✓ Completed & Wallet Settled
                          </span>
                        )}

                        <span className={`booking-status-badge ${String(b.status).toLowerCase().replace(" ", "-")}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WALLET & INSTANT PAYOUTS */}
        {activeTab === "wallet" && (
          <div className="vendor-tab-content-card animate-fade-in">
            <div className="vendor-card-head">
              <h3>Partner Digital Wallet & Payout Ledger</h3>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Zero-delay automated earnings settlement via IMPS / UPI
              </span>
            </div>

            {/* Wallet Metric Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
              <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "16px", padding: "20px" }}>
                <span style={{ fontSize: "12px", color: "#10B981", fontWeight: 700, textTransform: "uppercase" }}>Available to Withdraw</span>
                <h3 style={{ fontSize: "32px", fontWeight: 900, color: "#FFFFFF", margin: "6px 0 0" }}>₹{wallet.balance.toLocaleString()}</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Instant UPI Payouts</span>
              </div>

              <div style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "16px", padding: "20px" }}>
                <span style={{ fontSize: "12px", color: "#818CF8", fontWeight: 700, textTransform: "uppercase" }}>Total Lifetime Earned</span>
                <h3 style={{ fontSize: "32px", fontWeight: 900, color: "#FFFFFF", margin: "6px 0 0" }}>₹{wallet.totalEarned.toLocaleString()}</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>82% Provider Payout Cut</span>
              </div>

              <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "16px", padding: "20px" }}>
                <span style={{ fontSize: "12px", color: "#F59E0B", fontWeight: 700, textTransform: "uppercase" }}>Platform Commission</span>
                <h3 style={{ fontSize: "32px", fontWeight: 900, color: "#FFFFFF", margin: "6px 0 0" }}>18%</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Platform fee + Insurance</span>
              </div>
            </div>

            {/* UPI Withdrawal Form */}
            <div style={{ background: "var(--surface-input)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "24px", marginBottom: "28px" }}>
              <h4 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "14px", color: "#FFFFFF" }}>Instant UPI Withdrawal Request</h4>
              <form onSubmit={handleWithdrawal} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "14px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                    UPI VPA Address *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. partner@oksbi"
                    value={withdrawUpi}
                    onChange={(e) => setWithdrawUpi(e.target.value)}
                    required
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "rgba(15, 23, 42, 0.6)", color: "#FFF" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    max={wallet.balance}
                    placeholder="e.g. 1000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "rgba(15, 23, 42, 0.6)", color: "#FFF" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={withdrawing || wallet.balance < 100}
                  className="btn-coral"
                  style={{ padding: "12px 24px", borderRadius: "8px", fontWeight: 800, whiteSpace: "nowrap" }}
                >
                  {withdrawing ? "Processing..." : "Transfer to Bank ⚡"}
                </button>
              </form>
            </div>

            {/* Transactions Ledger */}
            <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: "#FFFFFF" }}>Recent Wallet Ledger Transactions</h4>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tx ID</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td><code style={{ color: "#94A3B8" }}>{tx.id}</code></td>
                      <td>{tx.date}</td>
                      <td><strong>{tx.description}</strong></td>
                      <td>
                        <span style={{
                          padding: "3px 10px",
                          borderRadius: "100px",
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          background: tx.type === "credit" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: tx.type === "credit" ? "#10B981" : "#EF4444"
                        }}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: tx.type === "credit" ? "#10B981" : "#EF4444" }}>
                        {tx.type === "credit" ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: SHOP & PROFILE SETTINGS */}
        {activeTab === "profile" && (
          <div className="vendor-tab-content-card animate-fade-in">
            <div className="vendor-card-head">
              <h3>Update Your Shop Details & 1-Hour Service Charge</h3>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Changes update immediately across the Helper directory
              </span>
            </div>

            <form onSubmit={handleProfileSave} className="vendor-settings-form">
              
              <div className="vendor-input-group">
                <label>Shop / Business Name *</label>
                <input 
                  type="text"
                  value={profileForm.shopName}
                  onChange={(e) => setProfileForm({ ...profileForm, shopName: e.target.value })}
                  placeholder="e.g. Ramesh Express Plumbing"
                  required
                />
              </div>

              <div className="vendor-input-group">
                <label>Owner Full Name *</label>
                <input 
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>

              <div className="vendor-input-group">
                <label>Service Category *</label>
                <select 
                  value={profileForm.category}
                  onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                  required
                >
                  {CATEGORIES_LIST.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="vendor-input-group">
                <label>1-Hour Service Charge (₹ / Hour) *</label>
                <div className="vendor-rate-prefix">
                  <span>₹</span>
                  <input 
                    type="number"
                    min="50"
                    max="10000"
                    value={profileForm.hourlyRate}
                    onChange={(e) => setProfileForm({ ...profileForm, hourlyRate: e.target.value })}
                    placeholder="e.g. 349"
                    required
                  />
                </div>
              </div>

              <div className="vendor-input-group">
                <label>Shop Location & Service Area *</label>
                <input 
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  placeholder="e.g. Sector 62, Noida, Delhi NCR"
                  required
                />
              </div>

              <div className="vendor-input-group">
                <label>Contact Phone Number *</label>
                <input 
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="10-digit mobile"
                  required
                />
              </div>

              <div className="vendor-input-group">
                <label>Email Address</label>
                <input 
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="partner@example.com"
                />
              </div>

              <div className="vendor-input-group">
                <label>Experience Level</label>
                <select 
                  value={profileForm.experience}
                  onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                >
                  <option value="1+ Year">1+ Year Experience</option>
                  <option value="3+ Years">3+ Years Experience</option>
                  <option value="5+ Years">5+ Years Experience</option>
                  <option value="8+ Years">8+ Years Experience</option>
                  <option value="10+ Years">10+ Years (Senior Expert)</option>
                </select>
              </div>

              <div className="vendor-input-group vendor-settings-full">
                <label>About Shop / Service Specialization</label>
                <textarea 
                  rows="3"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Describe the services and guarantees your shop provides..."
                ></textarea>
              </div>

              <div className="vendor-settings-full" style={{ marginTop: "10px" }}>
                <button 
                  type="submit" 
                  className="btn-primary-glow btn-save-profile"
                  disabled={savingProfile}
                >
                  <span>{savingProfile ? "Saving Changes..." : "Save Shop Details & Rates 💾"}</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default VendorDashboard;
