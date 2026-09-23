import React, { useRef, useState, useEffect } from "react";
import "../css/OtpInput.css";

function OtpInput({
  length = 6,
  value = "",
  onChange,
  onComplete,
  autoFocus = true,
  isMasked = false,
  error = false,
  resendCountdown = 30,
  onResend,
  resendLabel = "Resend Code",
  subtitle = "A verification code has been sent. Enter the code to continue."
}) {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const [timer, setTimer] = useState(resendCountdown);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef([]);

  // Sync external value if provided
  useEffect(() => {
    if (value) {
      const chars = value.split("").slice(0, length);
      while (chars.length < length) chars.push("");
      setOtp(chars);
    }
  }, [value, length]);

  // Countdown timer for Resend Code
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Auto focus first input
  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index, e) => {
    const val = e.target.value;
    // Allow single digit / char
    const char = val.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    const fullStr = newOtp.join("");
    if (onChange) onChange(fullStr);

    // Auto move to next input if filled
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // Trigger onComplete if all boxes are filled
    if (newOtp.every((c) => c !== "")) {
      if (onComplete) onComplete(fullStr);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move back and clear previous
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputsRef.current[index - 1]?.focus();
        if (onChange) onChange(newOtp.join(""));
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        if (onChange) onChange(newOtp.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!pastedData) return;

    const chars = pastedData.slice(0, length).split("");
    const newOtp = [...otp];
    chars.forEach((char, idx) => {
      newOtp[idx] = char;
    });
    setOtp(newOtp);

    const fullStr = newOtp.join("");
    if (onChange) onChange(fullStr);

    const nextIndex = Math.min(chars.length, length - 1);
    inputsRef.current[nextIndex]?.focus();

    if (newOtp.every((c) => c !== "")) {
      if (onComplete) onComplete(fullStr);
    }
  };

  const handleResendClick = () => {
    if (!canResend) return;
    setTimer(resendCountdown);
    setCanResend(false);
    if (onResend) onResend();
  };

  return (
    <div className="otp-container">
      {subtitle && <p className="otp-subtitle">{subtitle}</p>}

      {/* Resend button / countdown pill */}
      <div className="otp-resend-wrapper">
        <button
          type="button"
          className={`otp-resend-btn ${canResend ? "active" : "disabled"}`}
          onClick={handleResendClick}
          disabled={!canResend}
        >
          {canResend ? resendLabel : `${resendLabel} (${timer}s)`}
        </button>
      </div>

      {/* 6 Box Inputs split into 3 and 3 */}
      <div className="otp-boxes-grid">
        <div className="otp-box-group">
          {otp.slice(0, Math.ceil(length / 2)).map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              type={isMasked ? "password" : "text"}
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`otp-box ${digit ? "filled" : ""} ${error ? "error" : ""}`}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <div className="otp-group-divider" />

        <div className="otp-box-group">
          {otp.slice(Math.ceil(length / 2)).map((digit, idx) => {
            const actualIdx = idx + Math.ceil(length / 2);
            return (
              <input
                key={actualIdx}
                ref={(el) => (inputsRef.current[actualIdx] = el)}
                type={isMasked ? "password" : "text"}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(actualIdx, e)}
                onKeyDown={(e) => handleKeyDown(actualIdx, e)}
                onPaste={handlePaste}
                className={`otp-box ${digit ? "filled" : ""} ${error ? "error" : ""}`}
                autoComplete="one-time-code"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OtpInput;
