import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../../context/DataContext";

const COLOR_PRESETS = [
  { name: "Helper Sunset", hex: "#FF4D2D", badge: "Default", text: "#FFFFFF" },
  { name: "Emerald Partner", hex: "#10B981", badge: "Partner", text: "#FFFFFF" },
  { name: "Royal Indigo", hex: "#2563EB", badge: "Enterprise", text: "#FFFFFF" },
  { name: "Imperial Gold", hex: "#F59E0B", badge: "Luxury", text: "#000000" },
  { name: "Electric Violet", hex: "#7C3AED", badge: "Modern", text: "#FFFFFF" },
  { name: "Midnight Obsidian", hex: "#0F172A", badge: "Dark", text: "#FFFFFF" },
];

const LOGO_PRESETS = [
  { name: "Customer Red H", url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=150&q=80" },
  { name: "Partner Crown Green", url: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80" },
  { name: "Luxury Shield Pro", url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=150&q=80" }
];

export default function AdminAppTheme() {
  const { settings, updateSettings, heroBanners } = useContext(DataContext);

  const [primaryColor, setPrimaryColor] = useState(settings?.primaryColor || "#FF4D2D");
  const [appName, setAppName] = useState(settings?.appName || "Helper India");
  const [appTagline, setAppTagline] = useState(settings?.tagline || "Verified Doorstep Services in 15 Mins");
  const [appLogo, setAppLogo] = useState(settings?.appLogo || LOGO_PRESETS[0].url);
  const [emergencySurgeActive, setEmergencySurgeActive] = useState(settings?.emergencySurgeActive !== false);
  const [surgeMessage, setSurgeMessage] = useState(settings?.surgeMessage || "⚡ High Demand: Verified technicians dispatched within 15 mins");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      if (settings.primaryColor) setPrimaryColor(settings.primaryColor);
      if (settings.appName) setAppName(settings.appName);
      if (settings.appLogo) setAppLogo(settings.appLogo);
      if (settings.emergencySurgeActive !== undefined) setEmergencySurgeActive(settings.emergencySurgeActive);
      if (settings.surgeMessage) setSurgeMessage(settings.surgeMessage);
    }
  }, [settings]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo file should be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) setAppLogo(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTheme = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        primaryColor,
        appName: appName.trim(),
        appLogo: appLogo.trim(),
        emergencySurgeActive,
        surgeMessage: surgeMessage.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save theme: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-app-theme-tab animate-fade-in" style={{ padding: "10px 0" }}>
      {/* Header Bar */}
      <div style={{
        background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
        borderRadius: "20px",
        padding: "24px 28px",
        color: "#FFFFFF",
        marginBottom: "24px",
        boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "28px" }}>🎨</span>
            <h2 style={{ fontSize: "22px", fontWeight: "900", margin: 0 }}>Mobile Application UI & Branding Studio</h2>
            <span style={{
              background: "rgba(16, 185, 129, 0.2)",
              color: "#34D399",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "0.5px"
            }}>
              ● LIVE MOBILE SYNC
            </span>
          </div>
          <p style={{ color: "#94A3B8", fontSize: "14px", margin: 0 }}>
            Customize the primary accent color, branding, application logo, and live surge notice for both Android apps.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveTheme}
          disabled={isSaving}
          style={{
            background: primaryColor,
            color: "#FFFFFF",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "900",
            cursor: "pointer",
            boxShadow: `0 8px 20px -4px ${primaryColor}88`,
            transition: "all 0.2s ease"
          }}
        >
          {isSaving ? "Syncing..." : "💾 Save & Apply to Mobile App"}
        </button>
      </div>

      {savedSuccess && (
        <div style={{
          background: "#ECFDF5",
          border: "1.5px solid #10B981",
          color: "#065F46",
          padding: "14px 20px",
          borderRadius: "14px",
          marginBottom: "20px",
          fontWeight: "700",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)"
        }}>
          <span>🎉</span>
          <span>Theme and branding saved successfully! The Mobile App will reflect the new color and styling in real time.</span>
        </div>
      )}

      {/* Main Grid: Controls Left + Live Phone Mockup Right */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Column: Customization Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Card 1: Primary Accent Color */}
          <div style={{
            background: "var(--bg-card, #FFFFFF)",
            borderRadius: "18px",
            padding: "22px",
            border: "1px solid var(--border-color, #E2E8F0)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main, #0F172A)", margin: "0 0 4px 0" }}>
              1. Primary Brand Accent Color
            </h3>
            <p style={{ color: "var(--text-muted, #64748B)", fontSize: "12.5px", margin: "0 0 16px 0" }}>
              Controls header glows, checkout buttons, rating stars, category highlights, and active tabs in the Customer App.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px", marginBottom: "16px" }}>
              {COLOR_PRESETS.map((p) => {
                const isSelected = primaryColor.toLowerCase() === p.hex.toLowerCase();
                return (
                  <button
                    key={p.hex}
                    type="button"
                    onClick={() => setPrimaryColor(p.hex)}
                    style={{
                      background: p.hex,
                      color: p.text,
                      border: isSelected ? "3px solid #0F172A" : "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "12px",
                      padding: "12px 10px",
                      cursor: "pointer",
                      textAlign: "left",
                      boxShadow: isSelected ? `0 6px 16px ${p.hex}66` : "none",
                      transform: isSelected ? "scale(1.02)" : "scale(1)",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: "900", opacity: 0.9 }}>{p.badge}</div>
                    <div style={{ fontSize: "13px", fontWeight: "900", marginTop: "2px" }}>{p.name}</div>
                    <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px" }}>{p.hex}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-main, #F8FAFC)", padding: "10px 14px", borderRadius: "12px" }}>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ width: "40px", height: "40px", borderRadius: "8px", border: "none", cursor: "pointer", padding: 0 }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted, #64748B)", fontWeight: "700" }}>CUSTOM HEX CODE</span>
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{
                    display: "block",
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "var(--text-main, #0F172A)",
                    outline: "none"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: App Name & Tagline */}
          <div style={{
            background: "var(--bg-card, #FFFFFF)",
            borderRadius: "18px",
            padding: "22px",
            border: "1px solid var(--border-color, #E2E8F0)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main, #0F172A)", margin: "0 0 4px 0" }}>
              2. App Name & Title Branding
            </h3>
            <p style={{ color: "var(--text-muted, #64748B)", fontSize: "12.5px", margin: "0 0 16px 0" }}>
              App name shown in the mobile top navigation bar and splash welcome screen.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted, #64748B)", display: "block", marginBottom: "4px" }}>
                  APPLICATION TITLE
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Helper India"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--border-color, #CBD5E1)",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "var(--text-main, #0F172A)",
                    background: "var(--bg-main, #FFFFFF)"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted, #64748B)", display: "block", marginBottom: "4px" }}>
                  TAGLINE / SUBHEADING
                </label>
                <input
                  type="text"
                  value={appTagline}
                  onChange={(e) => setAppTagline(e.target.value)}
                  placeholder="Doorstep Repairs & Maintenance in 15 Minutes"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--border-color, #CBD5E1)",
                    fontSize: "13.5px",
                    fontWeight: "600",
                    color: "var(--text-main, #0F172A)",
                    background: "var(--bg-main, #FFFFFF)"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: App Logo Image */}
          <div style={{
            background: "var(--bg-card, #FFFFFF)",
            borderRadius: "18px",
            padding: "22px",
            border: "1px solid var(--border-color, #E2E8F0)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main, #0F172A)", margin: "0 0 4px 0" }}>
              3. Application Logo Image
            </h3>
            <p style={{ color: "var(--text-muted, #64748B)", fontSize: "12.5px", margin: "0 0 16px 0" }}>
              Logo displayed on the splash screen, mobile header, and invoices.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "14px",
                border: "2px solid var(--border-color, #CBD5E1)",
                overflow: "hidden",
                background: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <img src={appLogo} alt="App Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={appLogo}
                  onChange={(e) => setAppLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--border-color, #CBD5E1)",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "8px"
                  }}
                />
                <label style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  background: "var(--bg-main, #F1F5F9)",
                  border: "1px solid var(--border-color, #CBD5E1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  color: "var(--text-main, #0F172A)"
                }}>
                  📁 Upload Logo File
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                </label>
              </div>
            </div>
          </div>

          {/* Card 4: Surge Emergency Banner */}
          <div style={{
            background: "var(--bg-card, #FFFFFF)",
            borderRadius: "18px",
            padding: "22px",
            border: "1px solid var(--border-color, #E2E8F0)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main, #0F172A)", margin: 0 }}>
                4. Live Home Screen Surge Notice
              </h3>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={emergencySurgeActive}
                  onChange={(e) => setEmergencySurgeActive(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", fontWeight: "800", color: emergencySurgeActive ? "#10B981" : "#64748B" }}>
                  {emergencySurgeActive ? "ACTIVE 🟢" : "HIDDEN ⚪"}
                </span>
              </label>
            </div>
            <p style={{ color: "var(--text-muted, #64748B)", fontSize: "12.5px", margin: "0 0 12px 0" }}>
              A high-priority animated notice banner displayed below the search bar in the customer mobile app.
            </p>
            <input
              type="text"
              value={surgeMessage}
              onChange={(e) => setSurgeMessage(e.target.value)}
              placeholder="Notice message text..."
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1.5px solid var(--border-color, #CBD5E1)",
                fontSize: "13px",
                fontWeight: "600"
              }}
            />
          </div>

        </div>

        {/* Right Column: Live Phone Mockup Preview */}
        <div style={{ position: "sticky", top: "20px" }}>
          <div style={{
            background: "var(--bg-card, #FFFFFF)",
            borderRadius: "24px",
            padding: "20px",
            border: "1px solid var(--border-color, #E2E8F0)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            textAlign: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: "900", color: "var(--text-main, #0F172A)" }}>📱 LIVE MOBILE PREVIEW</span>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#10B981" }}>Instant React View</span>
            </div>

            {/* Smartphone Frame */}
            <div style={{
              width: "280px",
              height: "560px",
              margin: "0 auto",
              borderRadius: "36px",
              border: "8px solid #0F172A",
              background: "#F8FAFC",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.25)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              position: "relative"
            }}>
              {/* Dynamic Island / Speaker Notch */}
              <div style={{ width: "90px", height: "16px", background: "#0F172A", borderRadius: "10px", margin: "6px auto 4px auto" }} />

              {/* Mobile Header */}
              <div style={{
                background: "#FFFFFF",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #E2E8F0"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img src={appLogo} alt="Logo" style={{ width: "24px", height: "24px", borderRadius: "6px", objectFit: "cover" }} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "12px", fontWeight: "900", color: "#0F172A" }}>{appName}</div>
                    <div style={{ fontSize: "9px", color: "#64748B" }}>Indore, MP • 15 Mins</div>
                  </div>
                </div>
                <div style={{ width: "24px", height: "24px", borderRadius: "12px", background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>
                  🔔
                </div>
              </div>

              {/* Mobile Scrollable Area */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                {/* Search Bar */}
                <div style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  color: "#94A3B8",
                  marginBottom: "8px"
                }}>
                  <span>🔍</span>
                  <span>Search "AC repair, electrician..."</span>
                </div>

                {/* Surge Banner if Active */}
                {emergencySurgeActive && (
                  <div style={{
                    background: `${primaryColor}15`,
                    border: `1px solid ${primaryColor}44`,
                    borderRadius: "8px",
                    padding: "6px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "8px"
                  }}>
                    <span style={{ fontSize: "11px" }}>⚡</span>
                    <span style={{ fontSize: "9.5px", fontWeight: "700", color: primaryColor, textAlign: "left" }} numberOfLines={1}>
                      {surgeMessage}
                    </span>
                  </div>
                )}

                {/* Hero Carousel Preview */}
                <div style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, #0F172A 100%)`,
                  borderRadius: "12px",
                  padding: "12px",
                  color: "#FFFFFF",
                  textAlign: "left",
                  marginBottom: "10px"
                }}>
                  <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 6px", borderRadius: "4px", fontSize: "8.5px", fontWeight: "800" }}>
                    PROMO 50% OFF
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: "900", marginTop: "4px" }}>
                    {heroBanners?.[0]?.title || "Expert Home Repairs"}
                  </div>
                  <div style={{ fontSize: "9.5px", opacity: 0.85, marginTop: "2px" }}>
                    Verified Specialists at Doorstep
                  </div>
                  <div style={{
                    marginTop: "8px",
                    background: "#FFFFFF",
                    color: primaryColor,
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "9px",
                    fontWeight: "900",
                    display: "inline-block"
                  }}>
                    Book Now ➔
                  </div>
                </div>

                {/* Categories Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "10px" }}>
                  {[
                    { n: "AC Service", icon: "❄️" },
                    { n: "Electrician", icon: "⚡" },
                    { n: "Plumber", icon: "🔧" },
                    { n: "Cleaning", icon: "🧹" }
                  ].map((c) => (
                    <div key={c.n} style={{ background: "#FFFFFF", borderRadius: "8px", padding: "8px 4px", border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: "16px" }}>{c.icon}</div>
                      <div style={{ fontSize: "8px", fontWeight: "700", color: "#334155", marginTop: "2px" }}>{c.n}</div>
                    </div>
                  ))}
                </div>

                {/* Service Card Mockup */}
                <div style={{
                  background: "#FFFFFF",
                  borderRadius: "10px",
                  padding: "8px",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: `${primaryColor}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                    🛠️
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: "10.5px", fontWeight: "800", color: "#0F172A" }}>Foam Jet AC Service</div>
                    <div style={{ fontSize: "9px", color: primaryColor, fontWeight: "900" }}>₹499 <span style={{ textDecoration: "line-through", color: "#94A3B8" }}>₹699</span></div>
                  </div>
                  <button type="button" style={{
                    background: primaryColor,
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "9px",
                    fontWeight: "900",
                    cursor: "pointer"
                  }}>
                    ADD +
                  </button>
                </div>
              </div>

              {/* Mobile Bottom Navigation Bar */}
              <div style={{
                background: "#FFFFFF",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                borderTop: "1px solid #E2E8F0"
              }}>
                <div style={{ color: primaryColor, fontSize: "14px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span>🏠</span>
                  <span style={{ fontSize: "7px", fontWeight: "800" }}>Home</span>
                </div>
                <div style={{ color: "#94A3B8", fontSize: "14px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span>🔍</span>
                  <span style={{ fontSize: "7px" }}>Explore</span>
                </div>
                <div style={{ color: "#94A3B8", fontSize: "14px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span>📅</span>
                  <span style={{ fontSize: "7px" }}>Orders</span>
                </div>
                <div style={{ color: "#94A3B8", fontSize: "14px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span>👤</span>
                  <span style={{ fontSize: "7px" }}>Profile</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: "11px", color: "var(--text-muted, #64748B)", marginTop: "12px", marginBottom: 0 }}>
              Live rendering matching the Customer Mobile App. Click "Save & Apply" above to push changes to all live mobile users.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
