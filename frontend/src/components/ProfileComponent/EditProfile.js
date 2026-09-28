import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/Profile/EditProfile.css";
import { LocationContext } from "../../context/LocationContext";
import { API_BASE } from "../../apiConfig";

const PRESET_AVATARS = [
  { id: "p1", name: "Executive Male", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250" },
  { id: "p2", name: "Tech Specialist", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250" },
  { id: "p3", name: "Creative Professional", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250" },
  { id: "p4", name: "Corporate Lead", url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=250" },
  { id: "p5", name: "Friendly Customer", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250" },
  { id: "p6", name: "Modern Resident", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250" }
];

function EditProfile({ isOpen, onClose, isPage }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { location, fetchLocation } = useContext(LocationContext);

  const isStandalonePage = isPage || isOpen === undefined;

  const getInitialProfile = () => {
    try {
      const stored = localStorage.getItem("helper_user_profile");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      name: "Ajay Singh Banafer",
      email: "ajay@example.com",
      mobile: "+91 98765 43210",
      altPhone: "+91 98111 22233",
      gender: "Male",
      bio: "Helper verified member • Booking routine home services & care",
      address: "14 Palm Avenue, Metro Zone, City Central",
      city: "Indore, MP",
      pincode: "452001",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
    };
  };

  const [formData, setFormData] = useState(getInitialProfile);
  const [avatarPreview, setAvatarPreview] = useState(formData.avatar || PRESET_AVATARS[0].url);
  const [detectingGps, setDetectingGps] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    const initial = getInitialProfile();
    setFormData(initial);
    setAvatarPreview(initial.avatar || PRESET_AVATARS[0].url);
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg({ text: "Please choose an image file (JPG, PNG, or WEBP)", type: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMsg({ text: "Image size must be less than 5 MB", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setFormData(prev => ({ ...prev, avatar: reader.result }));
      setMsg({ text: "Photo uploaded! Don't forget to save changes.", type: "success" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Select Preset Avatar
  const handleSelectPreset = (url) => {
    setAvatarPreview(url);
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  // Remove Photo
  const handleRemovePhoto = () => {
    const fallback = PRESET_AVATARS[0].url;
    setAvatarPreview(fallback);
    setFormData(prev => ({ ...prev, avatar: fallback }));
  };

  // Detect Live GPS Location
  const handleDetectLocation = async () => {
    setDetectingGps(true);
    setMsg({ text: "Detecting your current location via GPS...", type: "info" });

    try {
      if (fetchLocation) {
        await fetchLocation();
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
              const data = await res.json();
              if (data && data.display_name) {
                const cityStr = data.address?.city || data.address?.state_district || data.address?.state || "Indore, MP";
                const pin = data.address?.postcode || "452001";
                setFormData(prev => ({
                  ...prev,
                  address: data.display_name,
                  city: cityStr,
                  pincode: pin
                }));
                setMsg({ text: "📍 Live location detected and filled successfully!", type: "success" });
              } else {
                setFormData(prev => ({
                  ...prev,
                  address: `Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}, Delhi NCR`,
                  city: "Delhi NCR"
                }));
                setMsg({ text: "📍 GPS coordinates captured!", type: "success" });
              }
            } catch (err) {
              setFormData(prev => ({
                ...prev,
                address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
                city: "Local Area"
              }));
              setMsg({ text: "GPS detected coordinates", type: "success" });
            } finally {
              setDetectingGps(false);
              setTimeout(() => setMsg({ text: "", type: "" }), 3500);
            }
          },
          (err) => {
            setDetectingGps(false);
            if (location && location.address) {
              setFormData(prev => ({ ...prev, address: location.address }));
              setMsg({ text: "Location loaded from app state!", type: "success" });
            } else {
              setMsg({ text: "Could not fetch GPS: " + err.message, type: "error" });
            }
            setTimeout(() => setMsg({ text: "", type: "" }), 3500);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setDetectingGps(false);
        setMsg({ text: "Geolocation is not supported by your browser", type: "error" });
      }
    } catch (e) {
      setDetectingGps(false);
      setMsg({ text: "Error fetching location", type: "error" });
    }
  };

  // Submit Profile Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      setMsg({ text: "Full Name is required", type: "error" });
      return;
    }
    if (!formData.mobile?.trim()) {
      setMsg({ text: "Mobile phone number is required", type: "error" });
      return;
    }

    setSaving(true);
    setMsg({ text: "Saving your profile changes...", type: "info" });

    const updatedProfile = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email?.trim() || "ajay@example.com",
      mobile: formData.mobile.trim(),
      avatar: avatarPreview,
      updatedAt: new Date().toISOString()
    };

    try {
      // 1. Save to local storage
      localStorage.setItem("helper_user_profile", JSON.stringify(updatedProfile));

      // 2. Dispatch cross-component update event
      window.dispatchEvent(new Event("user_profile_updated"));
      window.dispatchEvent(new Event("auth_state_changed"));

      // 3. Sync with backend API
      try {
        await fetch(`${API_BASE}/users/current`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfile)
        });
      } catch (err) {
        // Backend optional sync
      }

      setSaving(false);
      setMsg({ text: "🎉 Profile & Avatar updated successfully!", type: "success" });

      setTimeout(() => {
        setMsg({ text: "", type: "" });
        if (onClose) {
          onClose();
        } else if (isStandalonePage) {
          navigate("/profile");
        }
      }, 1200);

    } catch (err) {
      setSaving(false);
      setMsg({ text: "Error saving profile. Please try again.", type: "error" });
    }
  };

  // Main Form JSX Content
  const formContent = (
    <form className="edit-profile-form" onSubmit={handleSubmit}>
      
      {/* Avatar Customization Section */}
      <div className="avatar-edit-section">
        <div className="avatar-preview-box">
          <img
            src={avatarPreview}
            alt="User Avatar"
            className="avatar-preview-img"
          />
          <button
            type="button"
            className="btn-avatar-camera"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Photo"
          >
            📷
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

        <div className="avatar-actions-meta">
          <h4 style={{ margin: "0 0 4px 0", color: "var(--text-main)", fontSize: "16px", fontWeight: 800 }}>
            Profile Photo & Avatar
          </h4>
          <p style={{ margin: "0 0 10px 0", color: "var(--text-muted)", fontSize: "12.5px" }}>
            Upload custom picture from device or tap any avatar preset below:
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-upload-photo"
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Choose Photo
            </button>
            <button
              type="button"
              className="btn-remove-photo"
              onClick={handleRemovePhoto}
            >
              Reset Default
            </button>
          </div>
        </div>
      </div>

      {/* Preset Avatars Carousel */}
      <div className="preset-avatars-row">
        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: "6px" }}>
          Choose Instant Avatar Style:
        </span>
        <div className="preset-chips-list">
          {PRESET_AVATARS.map(preset => (
            <button
              key={preset.id}
              type="button"
              className={`preset-avatar-chip ${avatarPreview === preset.url ? "active" : ""}`}
              onClick={() => handleSelectPreset(preset.url)}
              title={preset.name}
            >
              <img src={preset.url} alt={preset.name} />
            </button>
          ))}
        </div>
      </div>

      <div className="form-fields-grid">
        {/* Full Name */}
        <div className="input-group-box">
          <label className="field-label">👤 Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            placeholder="e.g. Ajay Singh Banafer"
            onChange={handleChange}
            required
            className="styled-form-input"
          />
        </div>

        {/* Email Address */}
        <div className="input-group-box">
          <label className="field-label">✉️ Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            placeholder="e.g. ajay@example.com"
            onChange={handleChange}
            required
            className="styled-form-input"
          />
        </div>

        {/* Mobile Number */}
        <div className="input-group-box">
          <label className="field-label">📞 Mobile Phone *</label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile || ""}
            placeholder="e.g. +91 98765 43210"
            onChange={handleChange}
            required
            className="styled-form-input"
          />
        </div>

        {/* Alternate Phone */}
        <div className="input-group-box">
          <label className="field-label">📱 Alternate Phone / WhatsApp</label>
          <input
            type="tel"
            name="altPhone"
            value={formData.altPhone || ""}
            placeholder="e.g. +91 98111 22233"
            onChange={handleChange}
            className="styled-form-input"
          />
        </div>

        {/* Gender Selection */}
        <div className="input-group-box">
          <label className="field-label">⚧ Gender</label>
          <select
            name="gender"
            value={formData.gender || "Male"}
            onChange={handleChange}
            className="styled-form-input"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        {/* City / State */}
        <div className="input-group-box">
          <label className="field-label">🏙️ City / State</label>
          <input
            type="text"
            name="city"
            value={formData.city || ""}
            placeholder="e.g. Indore, Madhya Pradesh"
            onChange={handleChange}
            className="styled-form-input"
          />
        </div>
      </div>

      {/* Address & GPS Detection Box */}
      <div className="address-group-card">
        <div className="address-header-row">
          <label className="field-label" style={{ margin: 0 }}>📍 Service & Delivery Address *</label>
          <button
            type="button"
            className="btn-detect-gps"
            onClick={handleDetectLocation}
            disabled={detectingGps}
          >
            {detectingGps ? "⚡ Detecting GPS..." : "📍 Auto-Detect GPS Location"}
          </button>
        </div>
        <textarea
          name="address"
          value={formData.address || ""}
          placeholder="House / Flat No., Building, Street Name, Landmark, City"
          onChange={handleChange}
          required
          rows={3}
          className="styled-form-textarea"
        />
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <input
            type="text"
            name="pincode"
            value={formData.pincode || ""}
            placeholder="Pincode (e.g. 452001)"
            onChange={handleChange}
            style={{ width: "160px" }}
            className="styled-form-input"
          />
          <span style={{ fontSize: "12px", color: "var(--text-muted)", alignSelf: "center" }}>
            Used for finding nearest verified servicemen within 5 km
          </span>
        </div>
      </div>

      {/* Short Bio */}
      <div className="input-group-box">
        <label className="field-label">📝 Short Bio / About You</label>
        <input
          type="text"
          name="bio"
          value={formData.bio || ""}
          placeholder="e.g. Homeowner in Sector 62, frequent AC & plumbing services"
          onChange={handleChange}
          className="styled-form-input"
        />
      </div>

      {/* Toast Alert Message */}
      {msg.text && (
        <div className={`edit-feedback-banner ${msg.type} animate-fade-in`}>
          <span>{msg.type === "success" ? "✅" : msg.type === "error" ? "⚠️" : "ℹ️"}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="edit-form-actions">
        {onClose && (
          <button
            type="button"
            className="btn-cancel-edit"
            onClick={onClose}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="btn-save-profile"
        >
          {saving ? "Saving Changes..." : "Save Profile & Update Account 💾"}
        </button>
      </div>

    </form>
  );

  // Standalone Page View
  if (isStandalonePage) {
    return (
      <div className="edit-profile-page-wrapper">
        <div className="edit-profile-page-container animate-fade-in">
          
          <div className="edit-page-breadcrumb">
            <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Home</span>
            <span>›</span>
            <span onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>Account Profile</span>
            <span>›</span>
            <span style={{ color: "var(--primary)", fontWeight: 700 }}>Edit Profile</span>
          </div>

          <div className="edit-page-header-card">
            <div>
              <h2>Edit Account Profile</h2>
              <p>Change your name, profile photo, mobile phone, and delivery service address anytime.</p>
            </div>
            <button
              type="button"
              className="btn-back-profile"
              onClick={() => navigate("/profile")}
            >
              ← Back to Profile
            </button>
          </div>

          <div className="edit-page-content-card">
            {formContent}
          </div>

        </div>
      </div>
    );
  }

  // Slide-in Drawer / Modal View
  return (
    <>
      <div
        className={`edit-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      <div className={`edit-drawer ${isOpen ? "open" : ""}`}>
        <div className="edit-header">
          <div>
            <span className="profile-header-badge">HELPER ACCOUNT</span>
            <h2>Edit Profile</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="edit-drawer-scrollable">
          {formContent}
        </div>
      </div>
    </>
  );
}

export default EditProfile;
