import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../../context/DataContext";

const SHOWCASE_PRESETS = [
  {
    name: "Doctor & Health Specialist",
    icon: "👩‍⚕️",
    url: "/images/verified_doctor_pro.jpg",
    desc: "Certified medical & wellness expert"
  },
  {
    name: "Electrician Pro",
    icon: "👨‍🔧",
    url: "/images/electrician.png",
    desc: "Licensed electrical & appliance pro"
  },
  {
    name: "Multi-Service Team",
    icon: "👥",
    url: "/images/banner_all_experts.png",
    desc: "Full crew of verified home specialists"
  },
  {
    name: "Deep Cleaning Expert",
    icon: "🧹",
    url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=700",
    desc: "Sanitization & cleaning professional"
  },
  {
    name: "Precision Plumber",
    icon: "🛠️",
    url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=700",
    desc: "Pipeline, leakage & fitting specialist"
  }
];

function AdminSettings() {
  const { settings, updateSettings, resetAllData } = useContext(DataContext);
  const [commission, setCommission] = useState(settings?.platformCommission || "12%");
  const [radius, setRadius] = useState(settings?.serviceRadius || "20 km");
  const [hotline, setHotline] = useState(settings?.supportHotline || "+91 98765 43210");
  const [email, setEmail] = useState(settings?.supportEmail || "support@helper.com");
  const [tax, setTax] = useState(settings?.taxPercent || "5%");
  const [instantBooking, setInstantBooking] = useState(settings?.instantBookingEnabled !== false);
  const [maintenance, setMaintenance] = useState(settings?.maintenanceMode || false);
  const [savedToast, setSavedToast] = useState(false);

  // Showcase Image State
  const defaultShowcase = settings?.expertShowcaseImage || "/images/verified_expert_pro.jpg";
  const [showcaseImage, setShowcaseImage] = useState(defaultShowcase);
  const [imageSourceTab, setImageSourceTab] = useState("file"); // "file" | "url" | "presets"
  const [showcaseToast, setShowcaseToast] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({
      platformCommission: commission,
      serviceRadius: radius,
      supportHotline: hotline,
      supportEmail: email,
      taxPercent: tax,
      instantBookingEnabled: instantBooking,
      maintenanceMode: maintenance,
      expertShowcaseImage: showcaseImage
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleSaveShowcasePhoto = (imgToSave) => {
    const finalImg = imgToSave || showcaseImage;
    updateSettings({
      expertShowcaseImage: finalImg
    });
    localStorage.setItem("helper_expert_showcase_image", finalImg);
    setShowcaseToast(true);
    setTimeout(() => setShowcaseToast(false), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size should be less than 5MB.");
      return;
    }

    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setShowcaseImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all mock data to factory defaults? All manual edits will be re-seeded.")) {
      resetAllData();
      alert("All platform data reset to defaults.");
    }
  };

  return (
    <div className="admin-settings-tab animate-fade-in" style={{ paddingBottom: "60px" }}>
      
      {/* 1. HOME TRUST SHOWCASE PHOTO MANAGEMENT CARD */}
      <div className="admin-card-section" style={{ maxWidth: "860px", marginBottom: "32px", border: "1px solid rgba(255, 77, 45, 0.25)" }}>
        <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "20px" }}>🖼️</span>
              <h3 style={{ margin: 0 }}>Homepage Showcase Photo & Expert Visual</h3>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
              Customize the prominent visual displayed in the <strong>"Skilled Hands You Can Trust in Your Home"</strong> section on the public homepage.
            </p>
          </div>
          <Link 
            to="/" 
            target="_blank" 
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              background: "rgba(255, 77, 45, 0.1)",
              color: "#ff4d2d",
              textDecoration: "none",
              border: "1px solid rgba(255, 77, 45, 0.2)"
            }}
          >
            <span>🌐 View Live On Website</span>
          </Link>
        </div>

        {showcaseToast && (
          <div className="settings-save-toast animate-fade-in" style={{ marginTop: "16px", marginBottom: "16px", background: "#10b981", color: "#fff", padding: "12px 18px", borderRadius: "10px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <span>✅</span>
            <span>Showcase image saved successfully! Live homepage is now showing this photo.</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: "28px", marginTop: "20px", alignItems: "start" }}>
          
          {/* Live Realistic Preview Card */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "10px" }}>
              Live Homepage Preview
            </div>

            <div style={{
              background: "#0c1322",
              borderRadius: "20px",
              padding: "12px",
              border: "2px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Image Frame */}
              <div style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 5",
                borderRadius: "14px",
                overflow: "hidden",
                background: "#1e293b"
              }}>
                <img 
                  src={showcaseImage} 
                  alt="Showcase Expert Preview" 
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top",
                    display: "block"
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/verified_doctor_pro.jpg";
                  }}
                />

                {/* Simulated Floating Badges */}
                <div style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  background: "rgba(15, 23, 42, 0.88)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "10px",
                  padding: "6px 10px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "10px",
                  color: "#fff"
                }}>
                  <span>⭐</span>
                  <div>
                    <div style={{ fontWeight: 800 }}>4.9 / 5 Rating</div>
                    <div style={{ fontSize: "8.5px", color: "#94a3b8" }}>50,000+ Clients</div>
                  </div>
                </div>

                <div style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(15, 23, 42, 0.88)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "10px",
                  padding: "6px 10px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "10px",
                  color: "#fff"
                }}>
                  <span>✈️</span>
                  <div>
                    <div style={{ fontWeight: 800 }}>15-Min Express</div>
                    <div style={{ fontSize: "8.5px", color: "#94a3b8" }}>Fast Dispatch</div>
                  </div>
                </div>

                <div style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "10px",
                  background: "rgba(15, 23, 42, 0.88)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "10px",
                  padding: "6px 10px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "10px",
                  color: "#fff"
                }}>
                  <span>🛡️</span>
                  <div>
                    <div style={{ fontWeight: 800 }}>Govt ID & Police</div>
                    <div style={{ fontSize: "8.5px", color: "#94a3b8" }}>100% Screened</div>
                  </div>
                </div>

                <div style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  background: "rgba(15, 23, 42, 0.88)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "10px",
                  padding: "6px 10px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "10px",
                  color: "#fff"
                }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                  <div>
                    <div style={{ fontWeight: 800 }}>Multi-Trade Pros</div>
                    <div style={{ fontSize: "8.5px", color: "#94a3b8" }}>Electric, Clean, etc.</div>
                  </div>
                </div>

              </div>

              <div style={{ textAlign: "center", marginTop: "10px", fontSize: "11px", color: "#94a3b8" }}>
                Active photo displayed on homepage right now
              </div>
            </div>
          </div>

          {/* Controls: Upload, URL, and Presets */}
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", background: "var(--surface-input, rgba(0,0,0,0.05))", padding: "4px", borderRadius: "10px" }}>
              <button
                type="button"
                onClick={() => setImageSourceTab("file")}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  background: imageSourceTab === "file" ? "#ff4d2d" : "transparent",
                  color: imageSourceTab === "file" ? "#fff" : "var(--text-main)",
                  transition: "all 0.2s"
                }}
              >
                📁 Upload Photo
              </button>

              <button
                type="button"
                onClick={() => setImageSourceTab("url")}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  background: imageSourceTab === "url" ? "#ff4d2d" : "transparent",
                  color: imageSourceTab === "url" ? "#fff" : "var(--text-main)",
                  transition: "all 0.2s"
                }}
              >
                🔗 Web URL
              </button>

              <button
                type="button"
                onClick={() => setImageSourceTab("presets")}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  background: imageSourceTab === "presets" ? "#ff4d2d" : "transparent",
                  color: imageSourceTab === "presets" ? "#fff" : "var(--text-main)",
                  transition: "all 0.2s"
                }}
              >
                ⭐ Presets
              </button>
            </div>

            {/* TAB 1: FILE UPLOAD */}
            {imageSourceTab === "file" && (
              <div style={{ background: "var(--surface-input, #f8fafc)", padding: "18px", borderRadius: "12px", border: "1px dashed var(--border-color)", textAlign: "center" }}>
                <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>📸</span>
                <label style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #ff4d2d 0%, #ff7a00 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(255, 77, 45, 0.3)",
                  marginBottom: "8px"
                }}>
                  Choose Image File from Computer
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    style={{ display: "none" }} 
                  />
                </label>
                {uploadFileName ? (
                  <div style={{ fontSize: "12px", color: "#10b981", fontWeight: 600, marginTop: "6px" }}>
                    ✓ Selected: {uploadFileName}
                  </div>
                ) : (
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Supports PNG, JPG, JPEG, WEBP (Max 5MB)
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: URL INPUT */}
            {imageSourceTab === "url" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
                  Paste Direct Image URL
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input 
                    type="text" 
                    value={showcaseImage} 
                    onChange={(e) => setShowcaseImage(e.target.value)} 
                    placeholder="https://example.com/photo.jpg"
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      background: "var(--surface-input)",
                      color: "var(--text-main)",
                      fontSize: "13px"
                    }}
                  />
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Direct URL of high-resolution image hosted online.
                </span>
              </div>
            )}

            {/* TAB 3: ONE-CLICK PRESETS */}
            {imageSourceTab === "presets" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>
                  Select a Curated Photo Preset:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
                  {SHOWCASE_PRESETS.map((preset, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setShowcaseImage(preset.url);
                        handleSaveShowcasePhoto(preset.url);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background: showcaseImage === preset.url ? "rgba(255, 77, 45, 0.12)" : "var(--surface-input)",
                        border: showcaseImage === preset.url ? "2px solid #ff4d2d" : "1px solid var(--border-color)",
                        transition: "all 0.2s"
                      }}
                    >
                      <span style={{ fontSize: "22px" }}>{preset.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-main)" }}>
                          {preset.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {preset.desc}
                        </div>
                      </div>
                      {showcaseImage === preset.url && (
                        <span style={{ color: "#ff4d2d", fontWeight: 800, fontSize: "13px" }}>✓ Selected</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save & Reset Action Buttons */}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button 
                type="button" 
                className="btn-primary-glow"
                onClick={() => handleSaveShowcasePhoto()}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  background: "linear-gradient(135deg, #ff4d2d 0%, #ff7a00 100%)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(255, 77, 45, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <span>⚡ Save Showcase Photo</span>
              </button>

              <button 
                type="button" 
                onClick={() => {
                  const defaultImg = "/images/verified_doctor_pro.jpg";
                  setShowcaseImage(defaultImg);
                  handleSaveShowcasePhoto(defaultImg);
                }}
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "12.5px",
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-color)",
                  cursor: "pointer"
                }}
                title="Restore default doctor photo"
              >
                ↺ Reset
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 2. PLATFORM & FINANCIAL SETTINGS CARD */}
      <div className="admin-card-section" style={{ maxWidth: "860px" }}>
        <div className="admin-card-header">
          <div>
            <h3>Platform & Financial Settings</h3>
            <p>Configure revenue commissions, operating boundaries, and customer support channels</p>
          </div>
        </div>

        {savedToast && (
          <div className="settings-save-toast animate-fade-in" style={{ marginBottom: "20px" }}>
            ✨ Platform settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="admin-modal-form" style={{ marginTop: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group">
              <label>Platform Commission per Booking</label>
              <input
                type="text"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>GST / Service Tax Rate</label>
              <input
                type="text"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group">
              <label>Maximum Service Radius</label>
              <input
                type="text"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Emergency Support Hotline</label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Official Support Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px 0", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <strong>Enable 15-Minute Instant Booking</strong>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Automatically notifies nearest active providers</div>
              </div>
              <input
                type="checkbox"
                className="modern-toggle-switch"
                checked={instantBooking}
                onChange={(e) => setInstantBooking(e.target.checked)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <strong style={{ color: "var(--danger)" }}>Maintenance Mode</strong>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Temporarily pauses public service checkouts</div>
              </div>
              <input
                type="checkbox"
                className="modern-toggle-switch"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary-glow" style={{ marginTop: "14px" }}>
            Save Platform Configurations ⚡
          </button>
        </form>

        {/* Factory Reset Area */}
        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px dashed var(--danger)" }}>
          <h4 style={{ color: "var(--danger)", marginBottom: "6px" }}>⚠️ Danger Zone: Factory Reset Data</h4>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
            Restores all mock bookings, services, providers, and settings to original state.
          </p>
          <button 
            type="button" 
            className="table-action-btn delete" 
            style={{ padding: "10px 18px", color: "#fff", background: "var(--danger)" }}
            onClick={handleReset}
          >
            Reset All Application Data ↺
          </button>
        </div>

      </div>
    </div>
  );
}

export default AdminSettings;
