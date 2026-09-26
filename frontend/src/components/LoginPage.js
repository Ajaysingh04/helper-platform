import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";
import OtpInput from "./OtpInput";
import "../css/LoginPage.css";

const SERVICE_WORK_CATEGORIES = [
  "Plumber",
  "Electrician",
  "Driver (Chauffeur)",
  "Home Cleaner",
  "AC Repair & Refill",
  "Carpenter",
  "Wall Painter",
  "Home Cook / Chef",
  "Appliance Repair",
  "Packers & Movers",
  "Pest Control",
  "Body Massage & Spa",
  "Salon & Grooming"
];

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  // Read role from query param ?role=admin | serviceman | user
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get("role") || "user";

  // Selected Portal Role: "admin" | "serviceman" | "user"
  const [selectedRole, setSelectedRole] = useState(initialRole);

  // Common UI State
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ==========================================
  // 1. ADMIN PORTAL STATE
  // ==========================================
  const [adminPin, setAdminPin] = useState("");

  // ==========================================
  // 2. SERVICE MAN / PARTNER STATE
  // ==========================================
  const [vendorData, setVendorData] = useState({
    name: "",
    phone: "",
    category: "Plumber",
    shopName: "",
    hourlyRate: "299",
    location: "Indore / Delhi NCR",
    password: "",
    confirmPassword: ""
  });
  const [vendorLoginData, setVendorLoginData] = useState({
    identifier: "",
    password: ""
  });

  // ==========================================
  // 3. USER (CUSTOMER) STATE
  // ==========================================
  const [authMethod, setAuthMethod] = useState("password"); // "password" | "otp"
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Customer OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState(false);

  useEffect(() => {
    const roleParam = queryParams.get("role");
    if (roleParam && ["admin", "serviceman", "user"].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // ----------------------------------------------------
  // ADMIN AUTH HANDLER
  // ----------------------------------------------------
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!adminPin) {
      setErrorMessage("Please enter Admin Access PIN");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/verify-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPin })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("helper_admin_auth", "true");
        localStorage.setItem("helper_admin_role", "superadmin");
        if (data.token) localStorage.setItem("helper_admin_token", data.token);
        setSuccessMessage("Super Admin authenticated successfully! Redirecting...");
        setTimeout(() => {
          navigate("/admin");
        }, 800);
      } else if (adminPin === "admin123" || adminPin === "1234") {
        // Fallback for instant local admin access
        localStorage.setItem("helper_admin_auth", "true");
        localStorage.setItem("helper_admin_role", "superadmin");
        setSuccessMessage("Admin Access Granted! Loading Admin Control Panel...");
        setTimeout(() => {
          navigate("/admin");
        }, 800);
      } else {
        setErrorMessage(data.message || "Invalid Admin Access PIN. Please try again.");
      }
    } catch (err) {
      if (adminPin === "admin123" || adminPin === "1234") {
        localStorage.setItem("helper_admin_auth", "true");
        localStorage.setItem("helper_admin_role", "superadmin");
        setSuccessMessage("Admin Access Granted! Loading Admin Control Panel...");
        setTimeout(() => {
          navigate("/admin");
        }, 800);
      } else {
        setErrorMessage("Could not connect to Admin verification server.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // SERVICE MAN (VENDOR) REGISTRATION HANDLER
  // ----------------------------------------------------
  const handleVendorRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!vendorData.name.trim() || !vendorData.phone.trim() || !vendorData.category) {
      setErrorMessage("Please fill in Service Man Name, Phone Number, and Service Category.");
      return;
    }

    if (vendorData.password.length < 4) {
      setErrorMessage("Password must be at least 4 characters long.");
      return;
    }

    if (vendorData.confirmPassword && vendorData.password !== vendorData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/providers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: vendorData.name.trim(),
          phone: vendorData.phone.trim(),
          category: vendorData.category,
          shopName: (vendorData.shopName || `${vendorData.name}'s ${vendorData.category} Works`).trim(),
          hourlyRate: vendorData.hourlyRate,
          location: vendorData.location,
          password: vendorData.password,
          franchiseActive: false // Requires franchise activation next
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Service Man registration failed.");
      }

      localStorage.setItem("helper_vendor", JSON.stringify(data.vendor));
      if (data.token) localStorage.setItem("helper_vendor_token", data.token);

      setSuccessMessage("Registration successful! Redirecting to Franchise Activation...");
      setTimeout(() => {
        navigate("/vendor/dashboard");
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || "Registration failed. Please check mobile number.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // SERVICE MAN (VENDOR) LOGIN HANDLER
  // ----------------------------------------------------
  const handleVendorLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!vendorLoginData.identifier.trim() || !vendorLoginData.password) {
      setErrorMessage("Please enter registered mobile number and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/providers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: vendorLoginData.identifier.trim(),
          password: vendorLoginData.password
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials for Service Man login.");
      }

      localStorage.setItem("helper_vendor", JSON.stringify(data.vendor));
      if (data.token) localStorage.setItem("helper_vendor_token", data.token);

      setSuccessMessage("Welcome back! Loading Service Man Panel...");
      setTimeout(() => {
        navigate("/vendor/dashboard");
      }, 800);
    } catch (err) {
      setErrorMessage(err.message || "Login failed. Check phone number and password.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // USER (CUSTOMER) AUTH HANDLER
  // ----------------------------------------------------
  const handleUserAuth = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (isRegister) {
      if (!userName || !userEmail || !userPassword) {
        setErrorMessage("Please provide your name, email, and password.");
        return;
      }
      // Save customer profile details
      const userProfile = {
        name: userName,
        email: userEmail,
        mobile: userPhone || "+91 98765 43210",
        address: userAddress || "Indore / Delhi NCR, India"
      };
      localStorage.setItem("helper_user_profile", JSON.stringify(userProfile));
      window.dispatchEvent(new Event("user_profile_updated"));
    } else {
      if (!userEmail || !userPassword) {
        setErrorMessage("Please enter email and password.");
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      login();
      setLoading(false);
      navigate("/");
    }, 600);
  };

  // User Google Sign-In
  const handleGoogleSignIn = () => {
    login();
    navigate("/");
  };

  // User Mobile OTP Dispatch
  const handleSendUserOtp = (e) => {
    e.preventDefault();
    if (!userPhone || userPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    setOtpSent(true);
    setOtpError(false);
  };

  // User Mobile OTP Verify
  const handleVerifyUserOtp = (e, customOtp) => {
    if (e) e.preventDefault();
    const code = customOtp || otpValue;
    if (code.length === 6 || code === "1234" || code.length === 4) {
      login();
      navigate("/");
    } else {
      setOtpError(true);
    }
  };

  return (
    <div className="pin-login-page-wrapper">
      {/* Ambient Cloud Effects */}
      <div className="sky-cloud sky-cloud-1" />
      <div className="sky-cloud sky-cloud-2" />
      <div className="sky-cloud sky-cloud-3" />

      {/* Center Floating Welcome Card */}
      <div className="pin-login-card-container animate-fade-up">
        
        {/* =========================================================================
            LEFT COLUMN: 3D YETI MASCOT ARTWORK CARD
            ========================================================================= */}
        <div className="pin-login-artwork-col">
          <img 
            src="/images/login-mascot.jpg" 
            alt="Helper Mascot" 
            className="yeti-mascot-img" 
          />
          <div className="yeti-artwork-overlay" />

          <div className="yeti-typography-box">
            <div className="yeti-tag-pill">
              <span>
                {selectedRole === "admin" 
                  ? "🛡️ ADMIN CONTROL HUB" 
                  : selectedRole === "serviceman" 
                  ? "👨‍🔧 HELPER PARTNER NETWORK" 
                  : "👋 HELPER ON-DEMAND"}
              </span>
            </div>
            <h1 className="yeti-big-heading">
              <span>
                {selectedRole === "admin" ? "CONTROL." : selectedRole === "serviceman" ? "GROW." : "EXPLORE."}
              </span>
              <span>
                {selectedRole === "admin" ? "MANAGE. DIRECT." : selectedRole === "serviceman" ? "EARN. SCALE." : "LEARN. GROW."}
              </span>
            </h1>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: WELCOME FORM CARD WITH 3-ROLE SELECTOR
            ========================================================================= */}
        <div className="pin-login-form-col">
          
          {/* Header & Logo */}
          <div className="pin-form-header">
            <div className="pin-brand-badge">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" fill={selectedRole === "admin" ? "#EF4444" : selectedRole === "serviceman" ? "#FF4D2D" : "#0284C7"} />
                <circle cx="9.5" cy="10.5" r="1.5" fill="#FFFFFF" />
                <circle cx="14.5" cy="10.5" r="1.5" fill="#FFFFFF" />
                <path d="M8.5 15C9.5 16.5 14.5 16.5 15.5 15" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            
            <div className="pin-brand-title">
              {selectedRole === "admin" 
                ? "HELPER • SUPER ADMIN" 
                : selectedRole === "serviceman" 
                ? "HELPER • SERVICE MAN PORTAL" 
                : "HELPER • CUSTOMER ACCESS"}
            </div>
          </div>

          {/* =========================================================================
              3 UNIFIED TOP ROLE SWITCHER TABS: ADMIN | SERVICE MAN PANEL | USER
              ========================================================================= */}
          <div className="login-role-selector">
            <button 
              type="button" 
              className={`role-tab-btn role-admin ${selectedRole === "admin" ? "active" : ""}`}
              onClick={() => { setSelectedRole("admin"); setErrorMessage(""); setSuccessMessage(""); }}
            >
              <span>🛡️</span>
              <span>Admin</span>
            </button>
            <button 
              type="button" 
              className={`role-tab-btn role-serviceman ${selectedRole === "serviceman" ? "active" : ""}`}
              onClick={() => { setSelectedRole("serviceman"); setErrorMessage(""); setSuccessMessage(""); }}
            >
              <span>👨‍🔧</span>
              <span>Service Man</span>
            </button>
            <button 
              type="button" 
              className={`role-tab-btn role-user ${selectedRole === "user" ? "active" : ""}`}
              onClick={() => { setSelectedRole("user"); setErrorMessage(""); setSuccessMessage(""); }}
            >
              <span>👤</span>
              <span>User</span>
            </button>
          </div>

          {/* Sub-heading according to selected role */}
          <h2 className="pin-form-title" style={{ marginTop: "-6px" }}>
            {selectedRole === "admin" 
              ? "ADMINISTRATOR ACCESS" 
              : selectedRole === "serviceman" 
              ? (isRegister ? "PARTNER SHOP REGISTRATION" : "SERVICE MAN LOGIN") 
              : (isRegister ? "CREATE USER ACCOUNT" : "WELCOME BACK USER")}
          </h2>
          
          <p className="pin-form-subtitle">
            {selectedRole === "admin" 
              ? "Exclusive management access for Categories, Providers & Platform Settings"
              : selectedRole === "serviceman"
              ? (isRegister ? "Register your shop details. Ek shop se up to 8 members use kar sakte hain." : "Login with registered mobile number to manage jobs & shop details")
              : (isRegister ? "Register to book verified home services & track doorstep arrivals" : "Enter credentials or mobile OTP to access your customer account")}
          </p>

          {/* Alerts */}
          {errorMessage && (
            <div style={{ background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
              ⚠️ {errorMessage}
            </div>
          )}
          {successMessage && (
            <div style={{ background: "#DCFCE7", color: "#16A34A", border: "1px solid #BBF7D0", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
              ✅ {successMessage}
            </div>
          )}

          {/* =========================================================================
              ROLE 1: ADMIN LOGIN FORM
              ========================================================================= */}
          {selectedRole === "admin" && (
            <form onSubmit={handleAdminSubmit} className="pin-form-body animate-fade-in">
              <div className="admin-login-box">
                <div style={{ fontSize: "12.5px", color: "#991B1B", fontWeight: 700, marginBottom: "8px" }}>
                  🔐 SUPER ADMINISTRATOR CREDENTIALS
                </div>
                <p style={{ fontSize: "12px", color: "#7F1D1D", margin: "0 0 12px 0" }}>
                  Admin privileges enable adding, editing, and deleting categories, hero banners, and service listings.
                </p>

                <div className="pin-input-group" style={{ marginBottom: 0 }}>
                  <label className="pin-input-label" style={{ color: "#991B1B" }}>Enter Admin Master PIN / Password</label>
                  <div className="pin-input-field-wrap">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="e.g. admin123"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      className="pin-input-field"
                      style={{ borderColor: "#FCA5A5", background: "#FFFFFF" }}
                      required
                      autoFocus
                    />
                    <button 
                      type="button" 
                      className="pin-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", color: "#64748B" }}>Demo PIN: <strong>admin123</strong> or <strong>1234</strong></span>
                <button
                  type="button"
                  onClick={() => setAdminPin("admin123")}
                  style={{ background: "transparent", border: "none", color: "#EF4444", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                >
                  ⚡ Autofill Demo PIN
                </button>
              </div>

              <button 
                type="submit" 
                className="pin-btn-signin" 
                style={{ background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)", boxShadow: "0 8px 20px rgba(239, 68, 68, 0.25)" }}
                disabled={loading}
              >
                {loading ? "Authenticating Admin..." : "Access Admin Control Panel 🛡️"}
              </button>
            </form>
          )}

          {/* =========================================================================
              ROLE 2: SERVICE MAN PANEL (LOGIN & SIGN UP)
              ========================================================================= */}
          {selectedRole === "serviceman" && (
            <div className="animate-fade-in">
              {/* Service Man Sub-toggle: Sign In vs Register Shop */}
              <div style={{ display: "flex", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "4px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setErrorMessage(""); }}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "12.5px",
                    background: !isRegister ? "#FFFFFF" : "transparent",
                    color: !isRegister ? "#FF4D2D" : "#64748B",
                    boxShadow: !isRegister ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    cursor: "pointer"
                  }}
                >
                  🔑 Service Man Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setErrorMessage(""); }}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "12.5px",
                    background: isRegister ? "#FFFFFF" : "transparent",
                    color: isRegister ? "#FF4D2D" : "#64748B",
                    boxShadow: isRegister ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    cursor: "pointer"
                  }}
                >
                  📝 Register New Shop
                </button>
              </div>

              {/* Capacity Banner */}
              <div className="shop-capacity-notice">
                <span style={{ fontSize: "20px" }}>🏪</span>
                <div>
                  <strong>Multi-Member Shop License:</strong> Ek shop se <strong>up to 8 members</strong> use kar sakte hain. Register hone ke baad franchise activate karein.
                </div>
              </div>

              {isRegister ? (
                /* Service Man REGISTRATION FORM */
                <form onSubmit={handleVendorRegister} className="pin-form-body">
                  <div className="pin-input-group">
                    <label className="pin-input-label">Service Man Full Name (Owner) *</label>
                    <div className="pin-input-field-wrap">
                      <input 
                        type="text" 
                        placeholder="e.g. Ramesh Kumar"
                        value={vendorData.name}
                        onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })}
                        className="pin-input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="pin-input-group">
                    <label className="pin-input-label">Mobile Number (Calling & Customer Contact) *</label>
                    <div className="pin-input-field-wrap">
                      <span style={{ position: "absolute", left: "14px", fontWeight: 700, color: "#64748B", fontSize: "14px" }}>+91</span>
                      <input 
                        type="tel" 
                        placeholder="98765 00001"
                        value={vendorData.phone}
                        onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        className="pin-input-field"
                        style={{ paddingLeft: "52px" }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="pin-input-group">
                      <label className="pin-input-label">Work / Profession *</label>
                      <div className="pin-input-field-wrap">
                        <select 
                          value={vendorData.category}
                          onChange={(e) => setVendorData({ ...vendorData, category: e.target.value })}
                          className="pin-input-field"
                          required
                          style={{ padding: "10px 12px" }}
                        >
                          {SERVICE_WORK_CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pin-input-group">
                      <label className="pin-input-label">Hourly Rate (₹) *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type="number" 
                          min="50"
                          max="10000"
                          placeholder="299"
                          value={vendorData.hourlyRate}
                          onChange={(e) => setVendorData({ ...vendorData, hourlyRate: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pin-input-group">
                    <label className="pin-input-label">Shop / Business Name (Capacity: 8 Members)</label>
                    <div className="pin-input-field-wrap">
                      <input 
                        type="text" 
                        placeholder="e.g. Ramesh Express Plumbing & Sanitary"
                        value={vendorData.shopName}
                        onChange={(e) => setVendorData({ ...vendorData, shopName: e.target.value })}
                        className="pin-input-field"
                      />
                    </div>
                  </div>

                  <div className="pin-input-group">
                    <label className="pin-input-label">Shop Location / Area *</label>
                    <div className="pin-input-field-wrap">
                      <input 
                        type="text" 
                        placeholder="e.g. Sector 62, Noida / Palasia, Indore"
                        value={vendorData.location}
                        onChange={(e) => setVendorData({ ...vendorData, location: e.target.value })}
                        className="pin-input-field"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="pin-input-group">
                      <label className="pin-input-label">Create Password *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type="password" 
                          placeholder="Min 4 chars"
                          value={vendorData.password}
                          onChange={(e) => setVendorData({ ...vendorData, password: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                      </div>
                    </div>
                    <div className="pin-input-group">
                      <label className="pin-input-label">Confirm Password *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type="password" 
                          placeholder="Repeat password"
                          value={vendorData.confirmPassword}
                          onChange={(e) => setVendorData({ ...vendorData, confirmPassword: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="pin-btn-signin"
                    style={{ background: "linear-gradient(135deg, #FF4D2D 0%, #E03E1F 100%)", boxShadow: "0 8px 20px rgba(255, 77, 45, 0.25)" }}
                    disabled={loading}
                  >
                    {loading ? "Registering Shop..." : "Register Shop & Unlock Franchise 🚀"}
                  </button>
                </form>
              ) : (
                /* Service Man SIGN IN FORM */
                <form onSubmit={handleVendorLogin} className="pin-form-body">
                  <div className="pin-input-group">
                    <label className="pin-input-label">Registered Mobile Number or Email *</label>
                    <div className="pin-input-field-wrap">
                      <input 
                        type="text" 
                        placeholder="10-digit mobile number"
                        value={vendorLoginData.identifier}
                        onChange={(e) => setVendorLoginData({ ...vendorLoginData, identifier: e.target.value })}
                        className="pin-input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="pin-input-group">
                    <label className="pin-input-label">Password *</label>
                    <div className="pin-input-field-wrap">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter password"
                        value={vendorLoginData.password}
                        onChange={(e) => setVendorLoginData({ ...vendorLoginData, password: e.target.value })}
                        className="pin-input-field"
                        required
                      />
                      <button 
                        type="button" 
                        className="pin-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>Demo: 9876500001 / password123</span>
                    <button
                      type="button"
                      onClick={() => setVendorLoginData({ identifier: "9876500001", password: "password123" })}
                      style={{ background: "transparent", border: "none", color: "#FF4D2D", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                    >
                      ⚡ Autofill Demo
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="pin-btn-signin"
                    style={{ background: "linear-gradient(135deg, #FF4D2D 0%, #E03E1F 100%)", boxShadow: "0 8px 20px rgba(255, 77, 45, 0.25)" }}
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login to Service Man Panel ⚡"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* =========================================================================
              ROLE 3: USER / CUSTOMER FORM
              ========================================================================= */}
          {selectedRole === "user" && (
            <div className="animate-fade-in">
              {authMethod === "password" ? (
                <form onSubmit={handleUserAuth} className="pin-form-body">
                  
                  {isRegister && (
                    <>
                      <div className="pin-input-group">
                        <label className="pin-input-label">Full Name</label>
                        <div className="pin-input-field-wrap">
                          <input 
                            type="text" 
                            placeholder="e.g. Rahul Sharma"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="pin-input-field"
                            required
                          />
                        </div>
                      </div>

                      <div className="pin-input-group">
                        <label className="pin-input-label">Home / Service Address</label>
                        <div className="pin-input-field-wrap">
                          <input 
                            type="text" 
                            placeholder="e.g. 14 Palm Avenue, Metro Zone"
                            value={userAddress}
                            onChange={(e) => setUserAddress(e.target.value)}
                            className="pin-input-field"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div className="pin-input-group">
                    <label className="pin-input-label">Email Address</label>
                    <div className="pin-input-field-wrap">
                      <input 
                        type="email" 
                        placeholder="user@example.com" 
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="pin-input-field"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="pin-input-group">
                    <label className="pin-input-label">Password</label>
                    <div className="pin-input-field-wrap">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter password" 
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        className="pin-input-field"
                        required
                      />
                      <button 
                        type="button" 
                        className="pin-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="pin-form-meta-row">
                    <label className="pin-remember-label">
                      <input 
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)} 
                      />
                      <span>Remember me</span>
                    </label>

                    {!isRegister && (
                      <Link to="/contact" className="pin-forgot-link">
                        Forgot Password?
                      </Link>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="pin-btn-signin"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : isRegister ? "Sign Up as Customer" : "Sign In as Customer"}
                  </button>

                  {/* Google Social Button */}
                  <button 
                    type="button" 
                    className="pin-btn-google"
                    onClick={handleGoogleSignIn}
                  >
                    <svg className="google-icon-svg" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  {/* OTP Alternative */}
                  <div className="pin-otp-toggle-wrap">
                    <button
                      type="button"
                      className="pin-otp-toggle-btn"
                      onClick={() => { setAuthMethod("otp"); setOtpSent(false); }}
                    >
                      📱 Or Sign in with Mobile OTP
                    </button>
                  </div>

                </form>
              ) : (
                /* Mobile OTP Mode */
                <div className="pin-form-body">
                  {!otpSent ? (
                    <form onSubmit={handleSendUserOtp}>
                      <div className="pin-input-group">
                        <label className="pin-input-label">10-Digit Mobile Number</label>
                        <div className="pin-input-field-wrap">
                          <span style={{ position: "absolute", left: "14px", fontWeight: 700, color: "#64748B", fontSize: "14px" }}>+91</span>
                          <input 
                            type="tel"
                            placeholder="98765 43210"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="pin-input-field"
                            style={{ paddingLeft: "52px" }}
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <button type="submit" className="pin-btn-signin" style={{ marginTop: "12px" }}>
                        Send Verification Code 📲
                      </button>

                      <div className="pin-otp-toggle-wrap" style={{ marginTop: "16px" }}>
                        <button
                          type="button"
                          className="pin-otp-toggle-btn"
                          onClick={() => setAuthMethod("password")}
                        >
                          ← Back to Password Sign In
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <OtpInput
                        length={6}
                        value={otpValue}
                        onChange={(v) => { setOtpValue(v); setOtpError(false); }}
                        onComplete={(v) => handleVerifyUserOtp(null, v)}
                        subtitle={`Enter the 6-digit verification code sent to +91 ${userPhone}`}
                        resendLabel="Resend Code"
                        onResend={() => alert(`Verification code resent to +91 ${userPhone}`)}
                        error={otpError}
                      />

                      {otpError && (
                        <p style={{ color: "#EF4444", fontSize: "12.5px", textAlign: "center", margin: "-6px 0 12px 0", fontWeight: 600 }}>
                          ⚠️ Invalid code. Please enter 6 digits.
                        </p>
                      )}

                      <button 
                        type="button" 
                        className="pin-btn-signin" 
                        onClick={(e) => handleVerifyUserOtp(e, otpValue)}
                      >
                        Verify & Access Customer Account ⚡
                      </button>

                      <div className="pin-otp-toggle-wrap" style={{ marginTop: "14px" }}>
                        <button 
                          type="button" 
                          className="pin-otp-toggle-btn"
                          onClick={() => setOtpSent(false)}
                        >
                          ← Change Mobile Number
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Footer Toggle */}
              <div className="pin-form-footer">
                <span>
                  {isRegister ? "Already have an account?" : "Don't have an account?"}
                </span>
                <span 
                  className="pin-switch-link" 
                  onClick={() => { setIsRegister(!isRegister); setAuthMethod("password"); }}
                >
                  {isRegister ? "Sign in" : "Sign up"}
                </span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default LoginPage;
