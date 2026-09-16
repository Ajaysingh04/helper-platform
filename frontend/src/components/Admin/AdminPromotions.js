import React, { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";

function AdminPromotions() {
  const { slides, updateSlide, addSlide, deleteSlide } = useContext(DataContext);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);

  const [tag, setTag] = useState("🔥 SPECIAL DEAL");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [btnText, setBtnText] = useState("Book Now");
  const [icon, setIcon] = useState("🎁");
  const [actionPath, setActionPath] = useState("/services");

  const openAdd = () => {
    setEditingSlide(null);
    setTag("⚡ FLASH SALE");
    setTitle("Flat 30% OFF On AC & Appliance Servicing");
    setDesc("Beat the summer heat with rapid 30-min doorstep cooling repair.");
    setBtnText("Book Service Now");
    setIcon("🧊");
    setActionPath("/category/ac-repair");
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditingSlide(s);
    setTag(s.tag);
    setTitle(s.title);
    setDesc(s.desc);
    setBtnText(s.btnText);
    setIcon(s.icon);
    setActionPath(s.actionPath);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSlide) {
      updateSlide(editingSlide.id, {
        tag,
        title,
        desc,
        btnText,
        icon,
        actionPath
      });
    } else {
      addSlide({
        tag,
        title,
        desc,
        btnText,
        icon,
        actionPath
      });
    }
    setShowModal(false);
  };

  return (
    <div className="admin-promotions-tab animate-fade-in">
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div>
            <h3>Homepage Promotions & Hero Slider</h3>
            <p>Customize banner headlines, discount offers, and call-to-action buttons displayed on the homepage slider</p>
          </div>
          <button className="btn-primary-glow" onClick={openAdd}>
            + Create New Promo Slide
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
          {slides.map((slide, index) => (
            <div 
              key={slide.id}
              className="admin-card-section"
              style={{ 
                margin: 0, 
                padding: "24px", 
                border: "1px solid var(--border-color)",
                opacity: slide.active === false ? 0.6 : 1 
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span className="badge-pill">{slide.icon} {slide.tag}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Slide #{index + 1}</span>
                  </div>
                  <h4 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-main)", marginBottom: "6px" }}>{slide.title}</h4>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "600px", marginBottom: "12px" }}>{slide.desc}</p>
                  
                  <div style={{ display: "flex", gap: "14px", fontSize: "13px", color: "var(--primary)", fontWeight: 600 }}>
                    <span>Button: "{slide.btnText}"</span>
                    <span>•</span>
                    <span>Target Route: "{slide.actionPath}"</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    className="table-action-btn"
                    onClick={() => updateSlide(slide.id, { active: slide.active === false ? true : false })}
                  >
                    {slide.active === false ? "👁️ Enable" : "🚫 Disable"}
                  </button>
                  <button className="table-action-btn" onClick={() => openEdit(slide)}>
                    ✏️ Edit Slide
                  </button>
                  <button 
                    className="table-action-btn delete"
                    onClick={() => {
                      if (window.confirm(`Delete slide "${slide.title}"?`)) {
                        deleteSlide(slide.id);
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h3>{editingSlide ? "Edit Promotion Slide" : "Create Promotion Slide"}</h3>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Tag / Badge Text</label>
                  <input
                    type="text"
                    placeholder="e.g. 🔥 20% DISCOUNT"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Emoji</label>
                  <input
                    type="text"
                    placeholder="🎁"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Main Headline</label>
                <input
                  type="text"
                  placeholder="Catchy promotion title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Description Subtext</label>
                <textarea
                  rows={2}
                  placeholder="Offer details and reassurance..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Button Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Claim Offer"
                    value={btnText}
                    onChange={(e) => setBtnText(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Target URL / Route</label>
                  <input
                    type="text"
                    placeholder="e.g. /category/plumber"
                    value={actionPath}
                    onChange={(e) => setActionPath(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary-glow" style={{ width: "100%", marginTop: "10px" }}>
                {editingSlide ? "Save Slide Changes" : "Publish Slide"} ⚡
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminPromotions;
