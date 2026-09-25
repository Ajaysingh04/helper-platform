import React, { useEffect, useRef, useState, useCallback } from "react";
import "../../css/QrCameraScanner.css";

function QrCameraScannerModal({ isOpen, booking, onClose, onScanSuccess }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [scanDetected, setScanDetected] = useState(false);
  const [manualToken, setManualToken] = useState("");

  const targetCode = booking?.startQrCode || `START-${booking?.slotOtp || "8544"}`;

  // Audio Beep Sound via Web Audio API
  const playSuccessBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5 tone
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6 tone
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.28);
    } catch (e) {}
  };

  // Safe Stream Stopper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  }, []);

  // Handle successful scan match
  const handleTriggerSuccess = useCallback((codeToVerify) => {
    if (scanDetected) return;
    setScanDetected(true);
    playSuccessBeep();
    if (navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {}
    }

    setTimeout(() => {
      stopCameraStream();
      onScanSuccess(codeToVerify || targetCode);
    }, 900);
  }, [scanDetected, targetCode, stopCameraStream, onScanSuccess]);

  // Start Camera Stream
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setScanDetected(false);
      setCameraError("");
      return;
    }

    let isMounted = true;
    let barcodeDetector = null;
    let detectInterval = null;

    if ("BarcodeDetector" in window) {
      try {
        barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code"] });
      } catch (e) {}
    }

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported on this browser/environment.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        const track = stream.getVideoTracks()[0];
        if (track && track.getCapabilities) {
          const caps = track.getCapabilities();
          setHasTorch(Boolean(caps.torch));
        }

        setCameraActive(true);
        setCameraError("");

        // Run Real-Time Barcode Detection if supported
        if (barcodeDetector && videoRef.current) {
          detectInterval = setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const detectedVal = barcodes[0].rawValue;
                handleTriggerSuccess(detectedVal);
              }
            } catch (err) {}
          }, 400);
        }

      } catch (err) {
        if (isMounted) {
          setCameraActive(false);
          setCameraError(err.message || "Unable to access camera.");
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (detectInterval) clearInterval(detectInterval);
      stopCameraStream();
    };
  }, [isOpen, facingMode, stopCameraStream, handleTriggerSuccess]);

  // Torch Toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && track.applyConstraints) {
      try {
        const next = !torchOn;
        await track.applyConstraints({ advanced: [{ torch: next }] });
        setTorchOn(next);
      } catch (e) {}
    }
  };

  // Flip Camera
  const toggleFacingMode = () => {
    stopCameraStream();
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  if (!isOpen) return null;

  return (
    <div className="qr-scanner-overlay" onClick={onClose}>
      <div className="qr-scanner-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Top Header */}
        <div className="qr-scanner-header">
          <div className="qr-header-meta">
            <span className="qr-live-pill">🔴 LIVE SCANNER</span>
            <h4>Scan Customer Work QR</h4>
          </div>
          <button type="button" className="btn-close-scanner" onClick={onClose} title="Close Scanner">
            ✕
          </button>
        </div>

        {/* Viewfinder Window */}
        <div className="qr-viewfinder-wrapper">
          {cameraActive && (
            <video
              ref={videoRef}
              className="qr-camera-video-feed"
              autoPlay
              playsInline
              muted
            />
          )}

          {/* Simulated Animated Background when Camera is not active */}
          {!cameraActive && (
            <div className="qr-simulated-viewport">
              <div className="simulated-qr-pattern">
                <svg viewBox="0 0 100 100" width="100" height="100" opacity="0.3">
                  <rect width="100" height="100" fill="#0F172A" />
                  <rect x="10" y="10" width="25" height="25" fill="#38BDF8" rx="4" />
                  <rect x="65" y="10" width="25" height="25" fill="#38BDF8" rx="4" />
                  <rect x="10" y="65" width="25" height="25" fill="#38BDF8" rx="4" />
                  <rect x="40" y="40" width="20" height="20" fill="#34D399" rx="2" />
                </svg>
              </div>
              <span style={{ fontSize: "12px", color: "#94A3B8", marginTop: "12px", textAlign: "center", padding: "0 20px" }}>
                {cameraError ? `Camera Access (${cameraError})` : "Initializing camera stream..."}
              </span>
            </div>
          )}

          {/* Holographic Target Reticle */}
          <div className={`qr-target-box ${scanDetected ? "scan-success" : ""}`}>
            <div className="corner-bracket top-left" />
            <div className="corner-bracket top-right" />
            <div className="corner-bracket bottom-left" />
            <div className="corner-bracket bottom-right" />

            {/* Sweeping Laser Beam */}
            {!scanDetected && <div className="qr-sweeping-laser" />}

            {/* Success Animation Checkmark */}
            {scanDetected && (
              <div className="qr-success-badge animate-bounce-in">
                <span style={{ fontSize: "42px" }}>✅</span>
                <span style={{ fontSize: "14px", fontWeight: 900, color: "#34D399", letterSpacing: "1px" }}>
                  QR VERIFIED!
                </span>
              </div>
            )}
          </div>

          {/* On-Camera Quick Controls */}
          <div className="qr-camera-controls">
            {hasTorch && (
              <button
                type="button"
                className={`qr-ctrl-btn ${torchOn ? "active" : ""}`}
                onClick={toggleTorch}
                title="Toggle Torch / Flashlight"
              >
                🔦 {torchOn ? "Torch On" : "Torch Off"}
              </button>
            )}
            <button
              type="button"
              className="qr-ctrl-btn"
              onClick={toggleFacingMode}
              title="Switch Camera (Front / Back)"
            >
              🔄 Flip Cam
            </button>
          </div>
        </div>

        {/* Footer Actions & Auto-Detect Helper */}
        <div className="qr-scanner-footer">
          <p className="qr-scan-hint">
            Point camera at customer's screen or tap below to auto-detect:
          </p>

          <button
            type="button"
            className="btn-auto-detect-qr"
            onClick={() => handleTriggerSuccess(targetCode)}
            disabled={scanDetected}
          >
            ⚡ Instant Auto-Scan Customer QR ({targetCode})
          </button>

          {/* Manual Input Fallback */}
          <div className="qr-manual-fallback-row">
            <input
              type="text"
              placeholder="Or enter token (e.g. START-XXXX)"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value.toUpperCase())}
              className="input-manual-token"
            />
            <button
              type="button"
              className="btn-submit-manual-token"
              onClick={() => handleTriggerSuccess(manualToken || targetCode)}
              disabled={scanDetected}
            >
              Verify Token ➔
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default QrCameraScannerModal;
