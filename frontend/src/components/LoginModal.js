import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "../css/LoginModal.css";

function LoginModal({ isOpen, onClose }) {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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

  const handleGoogleSignIn = () => {
    login();
    onClose();
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="pin-modal-card animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <button className="pin-modal-close" onClick={onClose} title="Close">✕</button>

        {/* Left Side: Mascot Card */}
        <div className="pin-modal-artwork">
          <img 
            src="/images/login-mascot.jpg" 
            alt="Helper Mascot" 
            className="pin-modal-yeti-img" 
          />
          <div className="pin-modal-overlay-gradient" />
          <div className="pin-modal-text-box">
            <span className="pin-modal-tag">👋 HELPER ON-DEMAND</span>
            <h3>EXPLORE.<br />LEARN. GROW.</h3>
          </div>
        </div>

        {/* Right Side: Welcome Back Form */}
        <div className="pin-modal-form-wrap">
          <div className="pin-modal-head">
            <div className="pin-brand-badge-mini">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <circle cx="12" cy="12" r="9" fill="#0284C7" />
                <circle cx="9.5" cy="10.5" r="1.5" fill="#FFFFFF" />
                <circle cx="14.5" cy="10.5" r="1.5" fill="#FFFFFF" />
                <path d="M8.5 15C9.5 16.5 14.5 16.5 15.5 15" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="pin-modal-subbrand">YETI.AI &bull; HELPER</span>
            <h2>WELCOME BACK</h2>
            <p>Enter your email and password to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="pin-modal-form">
            <div className="pin-modal-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="pin-modal-group">
              <label>Password</label>
              <div className="pin-modal-pwd-wrap">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="pin-modal-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="pin-modal-meta">
              <label>
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                />
                <span>Remember me</span>
              </label>
              <a href="/contact" onClick={(e) => { e.preventDefault(); onClose(); window.location.href = "/contact"; }}>
                Forgot Password
              </a>
            </div>

            <button type="submit" className="pin-modal-btn-signin">
              Sign In
            </button>

            <button type="button" className="pin-modal-btn-google" onClick={handleGoogleSignIn}>
              <svg className="google-icon-svg" viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>

          <div className="pin-modal-footer">
            Don't have an account? <span onClick={() => { onClose(); window.location.href = "/login"; }}>Sign up</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginModal;
