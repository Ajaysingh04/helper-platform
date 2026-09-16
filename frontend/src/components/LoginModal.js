import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { LocationContext } from "../context/LocationContext";
import "../css/LoginModal.css";

function LoginModal({ isOpen, onClose }) {
  const { login } = useContext(AuthContext);
  const { location, fetchLocation, setManualLocation, locationError } = useContext(LocationContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [manualLoc, setManualLoc] = useState("");
  const [locDetecting, setLocDetecting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      login();
      onClose();
    } else {
      alert("Please enter email and password");
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
    ? (location.address || `${location.lat?.toFixed(3)}, ${location.lng?.toFixed(3)}`)
    : "";

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose}>✕</button>
        
        <div className="login-modal-header">
          <div className="modal-logo-badge">✨</div>
          <h2>Welcome to Helper</h2>
          <p>Sign in to unlock personalized nearby services</p>
        </div>

        <form onSubmit={handleLogin} className="login-modal-form">
          <div className="modal-input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div className="modal-input-group">
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

          {/* Location setup */}
          <div className="modal-location-group">
            <label>📍 Service Location</label>
            <div className="location-box-mini">
              {location ? (
                <div className="location-active-badge">
                  <span>✅</span>
                  <strong>{displayLocation}</strong>
                </div>
              ) : (
                <>
                  <button 
                    type="button" 
                    className="location-detect-btn-mini" 
                    onClick={handleFetchGPS}
                  >
                    <span>📍 {locDetecting ? "Detecting GPS..." : "Auto-Detect Current GPS"}</span>
                  </button>
                  {locationError && <p className="location-err-text">{locationError}</p>}
                  
                  <div className="or-manual-wrap-mini">
                    <input 
                      type="text" 
                      placeholder="Or enter city name" 
                      value={manualLoc}
                      onChange={(e) => setManualLoc(e.target.value)}
                    />
                    <button type="button" onClick={handleManualLocationSubmit}>Set</button>
                  </div>
                </>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary-glow modal-submit-btn">
            <span>Sign In to Continue</span>
            <span>⚡</span>
          </button>
        </form>

        <div className="modal-quick-skip">
          <button type="button" onClick={onClose}>
            Continue as Guest →
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
