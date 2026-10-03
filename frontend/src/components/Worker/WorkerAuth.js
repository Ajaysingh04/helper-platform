import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../../apiConfig";
import "../../css/Admin/Admin.css";
import "../../css/VendorDashboard.css";
import "../../css/WorkerDashboard.css";

const CATEGORIES = [
  { id: "Plumber", label: "🔧 Plumber (Sanitary & Pipes)", emoji: "🔧" },
  { id: "Electrician", label: "💡 Electrician (Wiring & Appliances)", emoji: "💡" },
  { id: "Driver", label: "🚗 Driver (Chauffeur & Fleet)", emoji: "🚗" },
  { id: "AC Repair", label: "🧊 AC Repair & HVAC Specialist", emoji: "🧊" },
  { id: "Wall Painter", label: "🎨 Wall Painter & Deco", emoji: "🎨" },
  { id: "Carpenter", label: "🪚 Carpenter & Furniture Maker", emoji: "🪚" },
  { id: "Cleaner", label: "🧹 Home & Deep Cleaner", emoji: "🧹" },
  { id: "Chef", label: "👨‍🍳 Chef & Home Cook", emoji: "👨‍🍳" },
  { id: "Doctor", label: "🩺 Home Visit Doctor / Nurse", emoji: "🩺" },
  { id: "Nanny", label: "👶 Baby Care & Elderly Nanny", emoji: "👶" }
];

const DEMO_WORKERS = [
  { name: "Sunil Sharma", phone: "9876500101", trade: "Plumber", role: "Master Specialist" },
  { name: "Amit Verma", phone: "9876500102", trade: "Electrician", role: "Senior Wireman" },
  { name: "Manoj Chauffeur", phone: "9876500103", trade: "Driver", role: "Executive Chauffeur" },
  { name: "Imran Khan", phone: "9876500104", trade: "AC Repair", role: "HVAC Specialist" },
  { name: "Priya Sharma", phone: "9876500106", trade: "Cleaner", role: "Hygiene Lead" }
];

function WorkerAuth() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  
  // Login State
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("worker123");

  // Registration State
  const [regForm, setRegForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    category: "Plumber",
    skillsText: "",
    experienceYears: "3",
    city: "Noida",
    address: "",
    aadhaarNumber: "",
    panNumber: "",
    preferredVendorId: "auto"
  });

  const [vendorsList, setVendorsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  // Fetch registered providers / shops for the nearest vendor selector
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/providers`);
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setVendorsList(data);
        } else if (data && data.providers && Array.isArray(data.providers)) {
          setVendorsList(data.providers);
        }
      } catch (e) {
        // Fallback demo vendors
        setVendorsList([
          { id: "VND-101", name: "Amritam Services Hub", category: "Plumbing & All Home Services", location: "Sector 18, Central Zone", rating: 4.9 },
          { id: "VND-102", name: "Urban Fix Pro Franchise", category: "Electrical & AC", location: "Sector 62, Metro Hub", rating: 4.8 }
        ]);
      }
    };
    fetchVendors();
  }, []);

  // Handle Login
  const handleLogin = async (e, customPhone) => {
    if (e) e.preventDefault();
    const loginPhone = customPhone || phone;
    if (!loginPhone) {
      setErrorMsg("Please enter your registered 10-digit mobile number");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/workers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone, password })
      });
      const data = await res.json();

      if (data.success && data.worker) {
        localStorage.setItem("helper_worker", JSON.stringify(data.worker));
        localStorage.setItem("helper_worker_token", data.token || "wrk_token_123");
        navigate("/worker/dashboard");
      } else {
        setErrorMsg(data.message || "Login failed. Please check credentials.");
      }
    } catch (err) {
      // Offline fallback
      const found = DEMO_WORKERS.find(w => w.phone === loginPhone);
      if (found) {
        const fallbackWorker = {
          workerId: "WRK-101",
          id: "WRK-101",
          name: found.name,
          phone: found.phone,
          category: found.trade,
          vendorName: "Amritam Services Hub",
          status: "active",
          verificationStatus: "verified",
          availability: { isOnline: true, isEmergencyAvailable: true }
        };
        localStorage.setItem("helper_worker", JSON.stringify(fallbackWorker));
        localStorage.setItem("helper_worker_token", "wrk_demo_token");
        navigate("/worker/dashboard");
      } else {
        setErrorMsg("Unable to connect to server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Worker Self-Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!regForm.name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    const cleanPhone = regForm.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (regForm.password && regForm.password.length < 4) {
      setErrorMsg("Password must be at least 4 characters.");
      return;
    }
    if (regForm.password && regForm.password !== regForm.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const skillsArray = regForm.skillsText
        ? regForm.skillsText.split(",").map(s => s.trim()).filter(Boolean)
        : [regForm.category, `${regForm.category} Maintenance`];

      const payload = {
        name: regForm.name.trim(),
        phone: cleanPhone.slice(-10),
        password: regForm.password || "worker123",
        category: regForm.category,
        skills: skillsArray,
        experienceYears: Number(regForm.experienceYears) || 3,
        city: regForm.city,
        address: regForm.address || `${regForm.city} Territory`,
        aadhaarNumber: regForm.aadhaarNumber,
        panNumber: regForm.panNumber,
        preferredVendorId: regForm.preferredVendorId !== "auto" ? regForm.preferredVendorId : undefined
      };

      const res = await fetch(`${API_BASE}/api/workers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.worker) {
        localStorage.setItem("helper_worker", JSON.stringify(data.worker));
        localStorage.setItem("helper_worker_token", data.token || "wrk_token_reg");
        setSuccessInfo({
          worker: data.worker,
          vendor: data.assignedVendor || { name: data.worker.vendorName || "Nearest Partner Hub", address: "City Services Hub" }
        });
      } else {
        setErrorMsg(data.message || "Registration failed. Please check inputs.");
      }
    } catch (err) {
      // Offline registration simulation
      const mockVendor = vendorsList.length > 0 ? vendorsList[0] : { name: "Amritam Services Hub", address: "Sector 18 Hub" };
      const fallbackWorker = {
        workerId: "WRK-" + Math.floor(10000 + Math.random() * 90000),
        id: "WRK-NEW",
        name: regForm.name,
        phone: regForm.phone,
        category: regForm.category,
        vendorId: mockVendor.id || "VND-101",
        vendorName: mockVendor.name || "Amritam Services Hub",
        status: "inactive",
        verificationStatus: "pending",
        earnings: { currentBalance: 0, pendingPayout: 0, totalEarnings: 0 },
        availability: { isOnline: false }
      };
      localStorage.setItem("helper_worker", JSON.stringify(fallbackWorker));
      setSuccessInfo({
        worker: fallbackWorker,
        vendor: mockVendor
      });
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Approval simulator for tester convenience
  const handleQuickApprove = async () => {
    if (!successInfo?.worker) return;
    try {
      const res = await fetch(`${API_BASE}/api/workers/${successInfo.worker.workerId || successInfo.worker.id}/approve`, {
        method: "PUT"
      });
      const data = await res.json();
      if (data.success && data.worker) {
        localStorage.setItem("helper_worker", JSON.stringify(data.worker));
      } else {
        const approved = { ...successInfo.worker, verificationStatus: "verified", status: "active", availability: { isOnline: true } };
        localStorage.setItem("helper_worker", JSON.stringify(approved));
      }
    } catch (e) {
      const approved = { ...successInfo.worker, verificationStatus: "verified", status: "active", availability: { isOnline: true } };
      localStorage.setItem("helper_worker", JSON.stringify(approved));
    }
    navigate("/worker/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 10% 20%, rgba(255, 77, 45, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 40%), #0A0F1D",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "30px 16px",
      fontFamily: "var(--font-main, sans-serif)",
      color: "#FFFFFF"
    }}>
      <div style={{
        maxWidth: successInfo ? "580px" : (authMode === "register" ? "740px" : "480px"),
        width: "100%",
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.98) 100%)",
        border: "1.5px solid rgba(16, 185, 129, 0.3)",
        borderRadius: "24px",
        padding: "36px 32px",
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.12)",
        backdropFilter: "blur(20px)",
        transition: "all 0.3s ease"
      }}>

        {/* =========================================================================
            SUCCESS SCREEN (AFTER REGISTRATION -> SENT TO NEAREST VENDOR)
           ========================================================================= */}
        {successInfo ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              boxShadow: "0 8px 30px rgba(16, 185, 129, 0.4)",
              marginBottom: "16px"
            }}>
              ✓
            </div>

            <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 8px 0", color: "#FFFFFF" }}>
              Application Submitted to Nearest Vendor! 🎉
            </h2>
            <p style={{ fontSize: "14px", color: "#94A3B8", margin: "0 0 24px 0", lineHeight: 1.5 }}>
              Aapka technician profile <strong>nearest authorized vendor</strong> ke paas verification aur approval ke liye bhej diya gaya hai.
            </p>

            {/* Vendor Card */}
            <div style={{
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "16px",
              padding: "20px",
              textAlign: "left",
              marginBottom: "24px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#10B981", fontWeight: 700 }}>
                  Assigned Nearest Vendor Shop
                </span>
                <span style={{ fontSize: "11px", padding: "2px 8px", background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", borderRadius: "10px", fontWeight: 700 }}>
                  ⏳ Approval Pending
                </span>
              </div>

              <h4 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#FFFFFF" }}>
                🏪 {successInfo.vendor?.shopName || successInfo.vendor?.name || "Amritam Services Hub"}
              </h4>
              <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#94A3B8" }}>
                📍 {successInfo.vendor?.address || successInfo.vendor?.location || "City Services Hub"}
              </p>
              <div style={{ fontSize: "12.5px", color: "#CBD5E1", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <span>📞 {successInfo.vendor?.phone || "+91 98765 00001"}</span>
                <span>⭐ Rating: 4.9/5.0</span>
                <span>⚡ Category: {successInfo.worker?.category}</span>
              </div>
            </div>

            {/* Next Steps Tracker */}
            <div style={{
              background: "rgba(30, 41, 59, 0.5)",
              borderRadius: "14px",
              padding: "16px",
              textAlign: "left",
              marginBottom: "24px",
              fontSize: "13px",
              lineHeight: 1.6
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#10B981", fontWeight: 700, marginBottom: "8px" }}>
                <span>✓ Step 1:</span> Worker registration details & KYC submitted
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#F59E0B", fontWeight: 700, marginBottom: "8px" }}>
                <span>⏳ Step 2:</span> Nearest vendor reviews your Aadhaar, trade skills & accepts
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94A3B8", fontWeight: 600 }}>
                <span>🔓 Step 3:</span> Full 90% payout Worker Panel unlocks for live dispatch
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                type="button"
                onClick={() => navigate("/worker/dashboard")}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)"
                }}
              >
                Go to Worker Panel (View Status) 👷
              </button>

              <button
                type="button"
                onClick={handleQuickApprove}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(255, 77, 45, 0.15)",
                  border: "1px solid rgba(255, 77, 45, 0.4)",
                  color: "#FF4D2D",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
                title="Instant test approval by vendor"
              >
                ⚡ Quick Test: Simulate Vendor One-Click Approval (Instant)
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header Brand */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                boxShadow: "0 8px 24px rgba(16, 185, 129, 0.35)",
                marginBottom: "12px"
              }}>
                👷
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0", color: "#FFFFFF" }}>
                Helper Worker Portal
              </h2>
              <p style={{ fontSize: "13.5px", color: "#94A3B8", margin: 0 }}>
                Technician & Field Operations Dashboard (90% Direct Pay)
              </p>
            </div>

            {/* Mode Switcher Tabs: Sign In vs Sign Up */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              background: "rgba(15, 23, 42, 0.8)",
              padding: "4px",
              borderRadius: "14px",
              marginBottom: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setErrorMsg(""); }}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: authMode === "login" ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" : "transparent",
                  color: authMode === "login" ? "#FFFFFF" : "#94A3B8",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                🔑 Sign In (Existing Worker)
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setErrorMsg(""); }}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: authMode === "register" ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" : "transparent",
                  color: authMode === "register" ? "#FFFFFF" : "#94A3B8",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                📝 Sign Up (New Worker)
              </button>
            </div>

            {errorMsg && (
              <div style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#FCA5A5",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                marginBottom: "18px",
                textAlign: "center"
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* =========================================================================
                TAB 1: SIGN IN (EXISTING WORKER)
               ========================================================================= */}
            {authMode === "login" && (
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                    Registered Mobile Number *
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "14px", fontWeight: 700 }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="e.g. 9876500101"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 50px",
                        borderRadius: "12px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "15px",
                        fontWeight: 700,
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                    Worker Password / PIN *
                  </label>
                  <input
                    type="password"
                    placeholder="worker123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#FFFFFF",
                      fontSize: "15px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: "15px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                    marginTop: "6px"
                  }}
                >
                  {loading ? "Logging in..." : "Open Worker Dashboard 🚀"}
                </button>

                {/* Quick Demo Access Bar */}
                <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <span style={{ fontSize: "12px", color: "#94A3B8", display: "block", marginBottom: "10px", fontWeight: 700 }}>
                    ⚡ 1-Click Fast Demo Logins:
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {DEMO_WORKERS.slice(0, 4).map((w) => (
                      <button
                        key={w.phone}
                        type="button"
                        onClick={() => {
                          setPhone(w.phone);
                          setPassword("worker123");
                          handleLogin(null, w.phone);
                        }}
                        style={{
                          padding: "8px 10px",
                          borderRadius: "8px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "#E2E8F0",
                          fontSize: "12px",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        <strong style={{ color: "#10B981" }}>{w.trade}</strong>
                        <span style={{ fontSize: "11px", color: "#94A3B8" }}>{w.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}

            {/* =========================================================================
                TAB 2: SIGN UP (NEW WORKER REGISTRATION UNDER NEAREST VENDOR)
               ========================================================================= */}
            {authMode === "register" && (
              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Mobile Number *
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "13px", fontWeight: 700 }}>
                        +91
                      </span>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) })}
                        required
                        style={{
                          width: "100%",
                          padding: "11px 14px 11px 45px",
                          borderRadius: "10px",
                          background: "rgba(15, 23, 42, 0.6)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          color: "#FFFFFF",
                          fontSize: "14px",
                          fontWeight: 700,
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Primary Trade / Category *
                    </label>
                    <select
                      value={regForm.category}
                      onChange={(e) => setRegForm({ ...regForm, category: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        background: "#0F172A",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        cursor: "pointer"
                      }}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Field Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={regForm.experienceYears}
                      onChange={(e) => setRegForm({ ...regForm, experienceYears: e.target.value })}
                      placeholder="e.g. 4"
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                {/* Location & Preferred Nearest Vendor */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      City / Work Territory *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Noida / Indirapuram"
                      value={regForm.city}
                      onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Nearest Vendor Assignment 🏪
                    </label>
                    <select
                      value={regForm.preferredVendorId}
                      onChange={(e) => setRegForm({ ...regForm, preferredVendorId: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        background: "#0F172A",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#10B981",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        boxSizing: "border-box",
                        cursor: "pointer"
                      }}
                    >
                      <option value="auto">🤖 Auto-Detect Nearest Verified Vendor</option>
                      {vendorsList.map(v => (
                        <option key={v.id || v._id} value={v.id || v._id}>
                          🏪 {v.shopName || v.name} ({v.location || v.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Identity & Aadhaar KYC */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Aadhaar Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4567 8901 2345"
                      value={regForm.aadhaarNumber}
                      onChange={(e) => setRegForm({ ...regForm, aadhaarNumber: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      PAN Card Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={regForm.panNumber}
                      onChange={(e) => setRegForm({ ...regForm, panNumber: e.target.value.toUpperCase() })}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Create Password *
                    </label>
                    <input
                      type="password"
                      placeholder="Min 4 characters"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      placeholder="Re-enter password"
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  padding: "12px",
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#A7F3D0",
                  lineHeight: 1.5
                }}>
                  ℹ️ <strong>Approval Workflow:</strong> Registration submit karte hi aapki application aapke <strong>nearest vendor partner</strong> ke pass approval ke liye chali jayegi. Vendor dwara verify hote hi aapka Worker Panel dispatch ke liye activate ho jayega.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: "15px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                    marginTop: "6px"
                  }}
                >
                  {loading ? "Submitting to Nearest Vendor..." : "Register & Send for Vendor Approval 🚀"}
                </button>
              </form>
            )}

            {/* Footer Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", fontSize: "12.5px" }}>
              <Link to="/" style={{ color: "#94A3B8", textDecoration: "none" }}>
                ← Public Home
              </Link>
              <Link to="/vendor/login" style={{ color: "#FF4D2D", textDecoration: "none", fontWeight: 700 }}>
                Vendor & Shop Portal →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WorkerAuth;
