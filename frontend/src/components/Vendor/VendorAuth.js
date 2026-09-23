import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/VendorAuth.css";

const AVAILABLE_CATEGORIES = [
  { id: "plumber", name: "Plumber", icon: "🔧", defaultRate: 299 },
  { id: "electrician", name: "Electrician", icon: "💡", defaultRate: 249 },
  { id: "driver", name: "Driver (Chauffeur)", icon: "🚗", defaultRate: 199 },
  { id: "home-cleaner", name: "Home Cleaner", icon: "🧹", defaultRate: 399 },
  { id: "ac-repair", name: "AC Repair & Refill", icon: "🧊", defaultRate: 399 },
  { id: "carpenter", name: "Carpenter", icon: "🪚", defaultRate: 299 },
  { id: "painter", name: "Wall Painter", icon: "🎨", defaultRate: 350 },
  { id: "chef", name: "Home Cook / Chef", icon: "👨‍🍳", defaultRate: 399 },
  { id: "appliance", name: "Appliance Repair", icon: "🛠️", defaultRate: 299 },
  { id: "packers-movers", name: "Packers & Movers", icon: "🚚", defaultRate: 599 },
  { id: "pest-control", name: "Pest Control", icon: "🛡️", defaultRate: 349 },
];

function VendorAuth({ defaultTab = "register" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Registration form state
  const [formData, setFormData] = useState({
    name: "",
    shopName: "",
    category: "Plumber",
    hourlyRate: "299",
    location: "Sector 62, Noida, Delhi NCR",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    experience: "3+ Years",
    bio: ""
  });

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: ""
  });

  // Check if vendor already logged in
  useEffect(() => {
    const existing = localStorage.getItem("helper_vendor");
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed?.id) {
          navigate("/vendor/dashboard");
        }
      } catch (e) {}
    }
  }, [navigate]);

  useEffect(() => {
    if (location.pathname.includes("login")) {
      setActiveTab("login");
    } else if (location.pathname.includes("register")) {
      setActiveTab("register");
    }
  }, [location.pathname]);

  const handleCategoryChange = (e) => {
    const selectedCat = e.target.value;
    const matched = AVAILABLE_CATEGORIES.find(c => c.name.toLowerCase() === selectedCat.toLowerCase());
    setFormData(prev => ({
      ...prev,
      category: selectedCat,
      hourlyRate: matched ? String(matched.defaultRate) : prev.hourlyRate
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.name.trim() || !formData.phone.trim() || !formData.category) {
      setErrorMsg("Please fill in your name, mobile number, and select a service category.");
      return;
    }

    if (formData.password.length < 4) {
      setErrorMsg("Please create a password of at least 4 characters.");
      return;
    }

    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/providers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          shopName: formData.shopName || `${formData.name}'s ${formData.category} Works`,
          category: formData.category,
          hourlyRate: formData.hourlyRate,
          location: formData.location,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          experience: formData.experience,
          bio: formData.bio
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      // Save vendor session to localStorage
      localStorage.setItem("helper_vendor", JSON.stringify(data.vendor));
      localStorage.setItem("helper_vendor_token", data.token);

      setSuccessMsg("Registration successful! Redirecting to your Partner Dashboard...");
      setTimeout(() => {
        navigate("/vendor/dashboard");
      }, 1200);

    } catch (err) {
      setErrorMsg(err.message || "Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!loginData.identifier.trim() || !loginData.password) {
      setErrorMsg("Please enter your registered mobile number and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/providers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginData.identifier,
          password: loginData.password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed. Invalid credentials.");
      }

      localStorage.setItem("helper_vendor", JSON.stringify(data.vendor));
      localStorage.setItem("helper_vendor_token", data.token);

      setSuccessMsg("Login successful! Welcome back.");
      setTimeout(() => {
        navigate("/vendor/dashboard");
      }, 1000);

    } catch (err) {
      setErrorMsg(err.message || "Login failed. Check your mobile number and password.");
    } finally {
      setLoading(false);
    }
  };

  const loadDemoCredentials = () => {
    setLoginData({
      identifier: "9876500001",
      password: "password123"
    });
  };

  return (
    <div className="vendor-auth-wrapper">
      <div className="vendor-auth-container">
        
        <div className="vendor-auth-header">
          <div className="vendor-badge-pill">
            <span>🛠️</span>
            <span>Helper Partner & Vendor Network</span>
          </div>
          <h1 className="vendor-auth-title">
            {activeTab === "register" ? "Grow Your Service Business" : "Partner Portal Login"}
          </h1>
          <p className="vendor-auth-subtitle">
            {activeTab === "register" 
              ? "Join thousands of trusted plumbers, electricians, drivers & home service experts getting daily direct customers."
              : "Access your bookings, update your shop details, and track your daily earnings."}
          </p>
        </div>

        {/* Auth Tabs */}
        <div className="vendor-auth-tabs">
          <button 
            type="button"
            className={`vendor-tab-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => { setActiveTab("register"); setErrorMsg(""); }}
          >
            <span>📝</span>
            <span>Register as Partner</span>
          </button>
          <button 
            type="button"
            className={`vendor-tab-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => { setActiveTab("login"); setErrorMsg(""); }}
          >
            <span>🔑</span>
            <span>Partner Login</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="vendor-alert-banner error animate-fade-in">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="vendor-alert-banner success animate-fade-in">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* REGISTRATION FORM */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="vendor-form-grid animate-fade-in">
            
            <div className="vendor-form-row">
              <div className="vendor-input-group">
                <label>Your Full Name (Owner) *</label>
                <input 
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="vendor-input-group">
                <label>Shop / Business Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Ramesh Express Plumbing & Sanitary"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                />
              </div>
            </div>

            <div className="vendor-form-row">
              <div className="vendor-input-group">
                <label>Service Category *</label>
                <select 
                  value={formData.category}
                  onChange={handleCategoryChange}
                  required
                >
                  {AVAILABLE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="vendor-input-group">
                <label>1-Hour Service Charge (₹) *</label>
                <div className="vendor-rate-prefix">
                  <span>₹</span>
                  <input 
                    type="number"
                    min="50"
                    max="10000"
                    placeholder="e.g. 299"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="vendor-form-row">
              <div className="vendor-input-group">
                <label>Mobile Number (For Customer Calls) *</label>
                <input 
                  type="tel"
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="vendor-input-group">
                <label>Email Address (Optional)</label>
                <input 
                  type="email"
                  placeholder="partner@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="vendor-form-row">
              <div className="vendor-input-group">
                <label>Shop Location / Service Area *</label>
                <input 
                  type="text"
                  placeholder="e.g. Sector 62, Noida, Delhi NCR"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="vendor-input-group">
                <label>Work Experience</label>
                <select 
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                >
                  <option value="1+ Year">1+ Year Experience</option>
                  <option value="3+ Years">3+ Years Experience</option>
                  <option value="5+ Years">5+ Years Experience</option>
                  <option value="8+ Years">8+ Years Experience</option>
                  <option value="10+ Years">10+ Years (Senior Expert)</option>
                </select>
              </div>
            </div>

            <div className="vendor-form-row">
              <div className="vendor-input-group">
                <label>Create Password *</label>
                <input 
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="vendor-input-group">
                <label>Confirm Password *</label>
                <input 
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="vendor-input-group">
              <label>About Your Shop & Services (Short Bio)</label>
              <textarea 
                rows="2"
                placeholder="Describe your specialties (e.g. Expert in pipe leakage, bath fitting, 24x7 emergency callouts)..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn-primary-glow vendor-submit-btn"
              disabled={loading}
            >
              <span>{loading ? "Creating Your Partner Profile..." : "Register My Shop & Start Earning 🚀"}</span>
            </button>
          </form>
        )}

        {/* LOGIN FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="vendor-form-grid animate-fade-in">
            <div className="vendor-input-group">
              <label>Registered Mobile Number or Email</label>
              <input 
                type="text"
                placeholder="Enter 10-digit mobile number or email"
                value={loginData.identifier}
                onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                required
              />
            </div>

            <div className="vendor-input-group">
              <label>Password</label>
              <input 
                type="password"
                placeholder="Enter your account password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary-glow vendor-submit-btn"
              disabled={loading}
            >
              <span>{loading ? "Logging in..." : "Login to Partner Dashboard ⚡"}</span>
            </button>

            {/* Quick Demo Fill Box */}
            <div className="vendor-demo-box">
              <div>
                <strong>Quick Demo Partner Login:</strong>
                <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  Mobile: 9876500001 • Pass: password123
                </div>
              </div>
              <button 
                type="button" 
                className="btn-demo-quick"
                onClick={loadDemoCredentials}
              >
                Auto Fill
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default VendorAuth;
