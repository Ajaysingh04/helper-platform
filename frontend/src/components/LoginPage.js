import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import OtpInput from "./OtpInput";
import "../css/LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [isRegister, setIsRegister] = useState(false);
  const [authMethod, setAuthMethod] = useState("password"); // "password" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Login State
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle Standard Email/Password Login & Register
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      // Direct login simulation or API integration
      setTimeout(() => {
        login();
        navigate("/");
      }, 500);
    } catch (err) {
      alert("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Social Sign-in
  const handleGoogleSignIn = () => {
    login();
    navigate("/");
  };

  // Handle Mobile OTP Dispatch
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    setOtpSent(true);
    setOtpError(false);
  };

  // Verify OTP Code
  const handleVerifyOtp = (e, customOtp) => {
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
            alt="Helper Yeti Mascot" 
            className="yeti-mascot-img" 
          />

          <div className="yeti-artwork-overlay" />

          <div className="yeti-typography-box">
            <div className="yeti-tag-pill">
              <span>👋 HELPER ON-DEMAND</span>
            </div>
            <h1 className="yeti-big-heading">
              <span>EXPLORE.</span>
              <span>LEARN. GROW.</span>
            </h1>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: WELCOME FORM CARD
            ========================================================================= */}
        <div className="pin-login-form-col">
          
          {/* Header & Logo */}
          <div className="pin-form-header">
            <div className="pin-brand-badge">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" fill="#0284C7" />
                <circle cx="9.5" cy="10.5" r="1.5" fill="#FFFFFF" />
                <circle cx="14.5" cy="10.5" r="1.5" fill="#FFFFFF" />
                <path d="M8.5 15C9.5 16.5 14.5 16.5 15.5 15" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            
            <div className="pin-brand-title">YETI.AI &bull; HELPER</div>
            
            <h2 className="pin-form-title">
              {isRegister ? "CREATE ACCOUNT" : "WELCOME BACK"}
            </h2>
            
            <p className="pin-form-subtitle">
              {isRegister 
                ? "Enter your details to access verified doorstep services" 
                : "Enter your email and password to access your account"}
            </p>
          </div>

          {/* Form Body: Password Mode */}
          {authMethod === "password" ? (
            <form onSubmit={handleAuthSubmit} className="pin-form-body">
              
              {isRegister && (
                <div className="pin-input-group">
                  <label className="pin-input-label">Full Name</label>
                  <div className="pin-input-field-wrap">
                    <input 
                      type="text" 
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pin-input-field"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="pin-input-group">
                <label className="pin-input-label">Email</label>
                <div className="pin-input-field-wrap">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pin-input-field"
                    required
                  />
                  <button 
                    type="button" 
                    className="pin-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Meta: Remember Me & Forgot Password */}
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
                    Forgot Password
                  </Link>
                )}
              </div>

              {/* Solid Black Primary Action Button */}
              <button 
                type="submit" 
                className="pin-btn-signin"
                disabled={loading}
              >
                {loading ? "Signing in..." : isRegister ? "Sign Up" : "Sign In"}
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

              {/* OTP Alternative Link */}
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
            /* Form Body: Mobile OTP Mode */
            <div className="pin-form-body">
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <div className="pin-input-group">
                    <label className="pin-input-label">10-Digit Mobile Number</label>
                    <div className="pin-input-field-wrap">
                      <span style={{ position: "absolute", left: "14px", fontWeight: 700, color: "#64748B", fontSize: "14px" }}>+91</span>
                      <input 
                        type="tel"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
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
                    onComplete={(v) => handleVerifyOtp(null, v)}
                    subtitle={`Enter the 6-digit verification code sent to +91 ${phone}`}
                    resendLabel="Resend Code"
                    onResend={() => alert(`Verification code resent to +91 ${phone}`)}
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
                    onClick={(e) => handleVerifyOtp(e, otpValue)}
                  >
                    Verify & Access Account ⚡
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

          {/* Footer: Toggle Sign In / Sign Up */}
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

      </div>

    </div>
  );
}

export default LoginPage;
