import React, { useState, useRef } from "react";
import { API_BASE } from "../../apiConfig";

/**
 * AdminImageUpload
 * Provides a dual-mode image selector:
 * 1. Choose / Upload from local device (Phone gallery or PC folder)
 * 2. Paste direct Web Image URL (Unsplash, CDN, etc.)
 */
export default function AdminImageUpload({
  label = "Banner / Photo",
  value = "",
  onChange,
  placeholder = "https://images.unsplash.com/photo-...",
  helperText = "PNG, JPG, WEBP supported from your device folder or external link."
}) {
  const [mode, setMode] = useState("file"); // 'file' or 'url'
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Helper to downscale large phone images to web-optimized resolution
  const processAndUploadFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please select a valid image file (.jpg, .png, .webp)");
      return;
    }

    setUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const rawDataUrl = e.target.result;

      // Create an image to check dimensions and compress if > 1200px
      const img = new Image();
      img.onload = async () => {
        const maxWidth = 1200;
        const maxHeight = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedDataUrl = canvas.toDataURL(file.type || "image/jpeg", 0.88);

        // Try uploading to backend /api/upload
        try {
          const response = await fetch(`${API_BASE}/api/upload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: optimizedDataUrl,
              name: file.name.replace(/\.[^/.]+$/, "")
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && (result.fullUrl || result.url)) {
              onChange(result.fullUrl || result.url);
              setUploading(false);
              return;
            }
          }
        } catch (err) {
          console.warn("[AdminImageUpload] Server upload fallback to optimized Base64:", err);
        }

        // Fallback: Use optimized Base64 data URL directly
        onChange(optimizedDataUrl);
        setUploading(false);
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processAndUploadFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processAndUploadFile(file);
  };

  return (
    <div className="admin-image-upload-wrapper">
      <div className="admin-image-upload-header">
        <label className="admin-image-upload-label">{label}</label>

        {/* Mode Toggle Switch */}
        <div className="admin-image-upload-tabs">
          <button
            type="button"
            className={`admin-image-tab-btn ${mode === "file" ? "active" : ""}`}
            onClick={() => setMode("file")}
          >
            📁 Folder / File
          </button>
          <button
            type="button"
            className={`admin-image-tab-btn ${mode === "url" ? "active" : ""}`}
            onClick={() => setMode("url")}
          >
            🔗 Web URL
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div
          className={`admin-image-dropzone ${dragActive ? "drag-active" : ""} ${value ? "has-file" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {uploading ? (
            <div className="admin-dropzone-loading">
              <span className="spinner-icon">⏳</span>
              <p>Compressing &amp; Uploading photo...</p>
            </div>
          ) : value ? (
            <div className="admin-dropzone-preview-row">
              <img
                src={value}
                alt="Selected"
                className="admin-dropzone-img"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <div className="admin-dropzone-info">
                <span className="admin-dropzone-tag">✅ Image Loaded</span>
                <p className="admin-dropzone-hint">Click anywhere to choose another photo</p>
                <button
                  type="button"
                  className="btn-remove-photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-dropzone-placeholder">
              <span className="dropzone-icon">🖼️</span>
              <div className="dropzone-text">
                <strong>Click to browse from folder</strong> or drag photo here
              </div>
              <span className="dropzone-sub">{helperText}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="admin-image-url-box">
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="url"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="admin-image-url-input"
            />
            {value && (
              <button
                type="button"
                className="btn-clear-url"
                onClick={() => onChange("")}
                title="Clear URL"
              >
                ✕
              </button>
            )}
          </div>
          {value && (
            <div className="admin-image-url-preview">
              <img
                src={value}
                alt="Preview"
                style={{ width: "100%", maxHeight: "140px", objectFit: "cover", borderRadius: "10px", marginTop: "8px", border: "1px solid var(--border-color)" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
