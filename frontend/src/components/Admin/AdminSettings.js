import React, { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";

function AdminSettings() {
  const { settings, updateSettings, resetAllData } = useContext(DataContext);
  const [commission, setCommission] = useState(settings.platformCommission || "12%");
  const [radius, setRadius] = useState(settings.serviceRadius || "20 km");
  const [hotline, setHotline] = useState(settings.supportHotline || "+91 98765 43210");
  const [email, setEmail] = useState(settings.supportEmail || "support@helper.com");
  const [tax, setTax] = useState(settings.taxPercent || "5%");
  const [instantBooking, setInstantBooking] = useState(settings.instantBookingEnabled !== false);
  const [maintenance, setMaintenance] = useState(settings.maintenanceMode || false);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({
      platformCommission: commission,
      serviceRadius: radius,
      supportHotline: hotline,
      supportEmail: email,
      taxPercent: tax,
      instantBookingEnabled: instantBooking,
      maintenanceMode: maintenance
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all mock data to factory defaults? All manual edits will be re-seeded.")) {
      resetAllData();
      alert("All platform data reset to defaults.");
    }
  };

  return (
    <div className="admin-settings-tab animate-fade-in">
      <div className="admin-card-section" style={{ maxWidth: "800px" }}>
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
