import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";
import { getRegisteredUsers } from "./LoginPage";
import "../css/LoginModal.css";

function LoginModal({ isOpen, onClose }) {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setErrorMessage("");
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanEmail, password: password })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const userObj = data.user || { name: "Customer", email: cleanEmail, role: "customer" };
        localStorage.setItem("helper_user_profile", JSON.stringify(userObj));
        window.dispatchEvent(new Event("user_profile_updated"));
        login({ name: userObj.name, email: userObj.email, role: "Customer" });
        onClose();
        return;
      }

      if (data.isNotRegistered || response.status === 404) {
        setErrorMessage("❌ This account is not registered! Only registered users can log in. Please register first.");
        return;
      }

      // Check registered users in local repository
      const registeredList = getRegisteredUsers();
      const match = registeredList.find(u => u.email && u.email.toLowerCase() === cleanEmail);

      if (!match) {
        setErrorMessage("❌ This account is not registered! Only registered users can log in. Please register first.");
      } else {
        localStorage.setItem("helper_user_profile", JSON.stringify(match));
        window.dispatchEvent(new Event("user_profile_updated"));
        login({ name: match.name, email: match.email, role: "Customer" });
        onClose();
      }
    } catch (err) {
      const registeredList = getRegisteredUsers();
      const match = registeredList.find(u => u.email && u.email.toLowerCase() === cleanEmail);

      if (!match) {
        setErrorMessage("❌ This account is not registered! Only registered users can log in. Please register first.");
      } else {
        localStorage.setItem("helper_user_profile", JSON.stringify(match));
        window.dispatchEvent(new Event("user_profile_updated"));
        login({ name: match.name, email: match.email, role: "Customer" });
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const list = getRegisteredUsers();
    const demoUser = list[0] || { name: "Ajay Singh", email: "ajay@example.com", role: "customer" };
    localStorage.setItem("helper_user_profile", JSON.stringify(demoUser));
    window.dispatchEvent(new Event("user_profile_updated"));
    login({ name: demoUser.name, email: demoUser.email, role: "Customer" });
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

          {errorMessage && (
            <div style={{ background: "#FEF2F2", color: "#B91C1C", border: "1.5px solid #FCA5A5", padding: "10px 14px", borderRadius: "10px", fontSize: "12.5px", fontWeight: 600, marginBottom: "14px" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                <span>🚫</span>
                <div style={{ flex: 1 }}>{errorMessage}</div>
              </div>
              <div style={{ marginTop: "8px", paddingTop: "6px", borderTop: "1px dashed #FCA5A5" }}>
                <a 
                  href="/login" 
                  onClick={(e) => { e.preventDefault(); onClose(); window.location.href = "/login"; }}
                  style={{ color: "#0284C7", fontWeight: 700, textDecoration: "none", fontSize: "12px" }}
                >
                  📝 Create New Account (Register Now) ➔
                </a>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="pin-modal-form">
            <div className="pin-modal-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMessage(""); }}
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
                  onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); }}
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11.5px", color: "#64748B" }}>Registered: rahul.sharma@example.com</span>
              <button
                type="button"
                onClick={() => {
                  setEmail("rahul.sharma@example.com");
                  setPassword("password123");
                  setErrorMessage("");
                }}
                style={{ background: "transparent", border: "none", color: "#0284C7", fontSize: "11.5px", fontWeight: 700, cursor: "pointer" }}
              >
                ⚡ Demo User
              </button>
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

            <button type="submit" className="pin-modal-btn-signin" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
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
