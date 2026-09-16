import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LocationContext } from "../context/LocationContext";
import "../css/LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { location, fetchLocation, setManualLocation, locationError } = useContext(LocationContext);

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [manualLoc, setManualLoc] = useState("");
  const [locDetecting, setLocDetecting] = useState(false);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      login();
      navigate("/");
    } else {
      alert("Please fill in the required fields");
    }
  };

  const handleFetchGPS = () => {
    setLocDetecting(true);
    fetchLocation();
    setTimeout(() => setLocDetecting(false), 2000);
  };

  const handleManualLocationSubmit = () => {
    if (manualLoc.trim()) {
      setManualLocation(manualLoc.trim());
    }
  };

  const displayLocation = location 
    ? (location.address || `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`)
    : "";

  return (
    <div className="login-page-wrapper">
      {/* Ambient background glows */}
      <div className="ambient-background">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
      </div>

      <div className="container-wrapper login-content-container">
        <div className="login-glass-card animate-fade-up">
          
          {/* Logo & Header */}
          <div className="login-card-header">
            <Link to="/" className="login-brand-logo">
              <div className="logo-badge">✨</div>
              <h2>Helper<span>.</span></h2>
            </Link>
            <h3>{isRegister ? "Create Your Account" : "Welcome Back"}</h3>
            <p>{isRegister ? "Join thousands of satisfied service seekers" : "Log in to manage bookings and track services"}</p>
          </div>

          {/* Auth Switch Tabs */}
          <div className="auth-tab-switch">
            <button 
              type="button" 
              className={`auth-tab ${!isRegister ? "active" : ""}`}
              onClick={() => setIsRegister(false)}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className={`auth-tab ${isRegister ? "active" : ""}`}
              onClick={() => setIsRegister(true)}
            >
              Create Account
            </button>
          </div>

          {/* Social Logins */}
          <div className="social-auth-grid">
            <button type="button" className="social-btn" onClick={login}>
              <span>🌐 Google</span>
            </button>
            <button type="button" className="social-btn" onClick={login}>
              <span>🍏 Apple</span>
            </button>
          </div>

          <div className="auth-divider-line">
            <span>OR WITH EMAIL</span>
          </div>

          <form onSubmit={handleAuthSubmit} className="login-form-modern">
            {isRegister && (
              <div className="login-input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rahul Sharma" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="login-input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="login-input-group">
              <label>Password</label>
              <div className="password-input-wrap">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="pwd-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Location Selector Setup */}
            <div className="login-location-group">
              <label>📍 Set Default Service Location</label>
              <div className="location-box-modern">
                {location ? (
                  <div className="location-active-badge">
                    <span>✅ Location Set:</span>
                    <strong>{displayLocation}</strong>
                  </div>
                ) : (
                  <>
                    <button 
                      type="button" 
                      className="location-detect-btn" 
                      onClick={handleFetchGPS}
                    >
                      <span>📍 {locDetecting ? "Detecting GPS..." : "Auto-Detect Current Location"}</span>
                    </button>
                    {locationError && <p className="location-err-text">{locationError}</p>}
                    
                    <div className="or-manual-wrap">
                      <input 
                        type="text" 
                        placeholder="Or enter city name (e.g. Mumbai)" 
                        value={manualLoc}
                        onChange={(e) => setManualLoc(e.target.value)}
                      />
                      <button type="button" onClick={handleManualLocationSubmit}>Set</button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary-glow login-submit-btn">
              <span>{isRegister ? "Create Account & Continue" : "Sign In to Helper"}</span>
              <span>→</span>
            </button>
          </form>
          
          <div className="login-card-footer">
            <p>
              {isRegister ? "Already have an account? " : "Don't have an account yet? "}
              <span className="switch-auth-link" onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? "Sign In" : "Register now"}
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
