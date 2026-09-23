import React, { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";
import { initialOffers } from "../../data/offersData";

const GRADIENT_PRESETS = [
  { name: "Royal Navy & Blue", value: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)" },
  { name: "Organic Farm Green", value: "linear-gradient(135deg, #052e16 0%, #166534 55%, #15803d 100%)" },
  { name: "Ice Cyan & Ocean", value: "linear-gradient(135deg, #082f49 0%, #0284c7 55%, #0ea5e9 100%)" },
  { name: "Velvet Magenta & Purple", value: "linear-gradient(135deg, #311042 0%, #701a75 55%, #a21caf 100%)" },
  { name: "Deep Indigo & Violet", value: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4338ca 100%)" },
  { name: "Sunset Amber & Orange", value: "linear-gradient(135deg, #451a03 0%, #b45309 60%, #d97706 100%)" },
  { name: "Midnight Obsidian", value: "linear-gradient(135deg, #18181b 0%, #27272a 60%, #3f3f46 100%)" }
];

const IMAGE_PRESETS = [
  { label: "Fresh Vegetables", url: "/images/fresh_vegetables_banner.jpg" },
  { label: "AC Cooling Repair", url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600" },
  { label: "Home Deep Cleaning", url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600" },
  { label: "Emergency Plumber", url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=600" },
  { label: "Electrician Pro", url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=600" },
  { label: "No Image (Gradient Only)", url: "" }
];

function AdminPromotions() {
  const dataContext = useContext(DataContext);
  const offers = (dataContext?.offers && dataContext.offers.length > 0)
    ? dataContext.offers
    : (dataContext?.slides && dataContext.slides.length > 0 ? dataContext.slides : initialOffers);

  const addOffer = dataContext?.addOffer || dataContext?.addSlide;
  const updateOffer = dataContext?.updateOffer || dataContext?.updateSlide;
  const deleteOffer = dataContext?.deleteOffer || dataContext?.deleteSlide;
  const toggleOfferActive = dataContext?.toggleOfferActive || dataContext?.toggleSlideActive;

  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("🔥 LIMITED OFFER");
  const [category, setCategory] = useState("Home Services");
  const [discount, setDiscount] = useState("FLAT ₹150 OFF");
  const [code, setCode] = useState("SAVE150");
  const [bgGradient, setBgGradient] = useState(GRADIENT_PRESETS[0].value);
  const [image, setImage] = useState("");
  const [btnText, setBtnText] = useState("Claim Offer ➔");
  const [actionPath, setActionPath] = useState("/services");
  const [icon, setIcon] = useState("🎁");
  const [active, setActive] = useState(true);
  const [chipsText, setChipsText] = useState("Instant Arrival, Verified Techs, Upfront Pricing");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const openAdd = () => {
    setEditingOffer(null);
    setTitle("Weekend Mega Flash Sale");
    setSubtitle("Get verified electrical, plumbing & deep cleaning fixes at up to 40% discount.");
    setBadge("⚡ FLASH SALE");
    setCategory("Home Services");
    setDiscount("UP TO 40% OFF");
    setCode("WEEKEND40");
    setBgGradient(GRADIENT_PRESETS[5].value);
    setImage("");
    setBtnText("Book Service Now ➔");
    setActionPath("/services");
    setIcon("⚡");
    setActive(true);
    setChipsText("⚡ 15-Min Arrival, 🛡️ 30-Day Warranty, 🔒 Start OTP");
    setShowModal(true);
  };

  const openEdit = (offer) => {
    setEditingOffer(offer);
    setTitle(offer.title || "");
    setSubtitle(offer.subtitle || offer.desc || "");
    setBadge(offer.badge || offer.tag || "🔥 SPECIAL DEAL");
    setCategory(offer.category || "Home Services");
    setDiscount(offer.discount || "");
    setCode(offer.code || "");
    setBgGradient(offer.bgGradient || GRADIENT_PRESETS[0].value);
    setImage(offer.image || "");
    setBtnText(offer.btnText || offer.ctaText || "Claim Offer ➔");
    setActionPath(offer.actionPath || offer.ctaLink || "/services");
    setIcon(offer.icon || "🎁");
    setActive(offer.active !== false);
    setChipsText(Array.isArray(offer.chips) ? offer.chips.join(", ") : (offer.subtitle || ""));
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a title for the offer.");
      return;
    }

    const chipsArray = chipsText
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);

    const payload = {
      title,
      subtitle,
      desc: subtitle,
      badge,
      tag: badge,
      category,
      discount,
      code: code ? code.toUpperCase().trim() : "",
      bgGradient,
      image,
      btnText,
      ctaText: btnText,
      actionPath,
      ctaLink: actionPath,
      icon,
      active,
      chips: chipsArray
    };

    if (editingOffer) {
      const targetId = editingOffer.id || editingOffer._id;
      if (updateOffer) updateOffer(targetId, payload);
      showToast(`✅ Offer "${title}" updated successfully!`);
    } else {
      if (addOffer) addOffer(payload);
      showToast(`🎉 New offer "${title}" published live!`);
    }

    setShowModal(false);
  };

  const handleToggle = (offer) => {
    const targetId = offer.id || offer._id;
    if (toggleOfferActive) {
      toggleOfferActive(targetId);
      const willBeActive = offer.active === false;
      showToast(willBeActive ? `🟢 Offer "${offer.title}" activated on homepage!` : `⚪ Offer "${offer.title}" deactivated.`);
    }
  };

  const handleDelete = (offer) => {
    const targetId = offer.id || offer._id;
    if (window.confirm(`Are you sure you want to permanently delete offer "${offer.title}"?`)) {
      if (deleteOffer) deleteOffer(targetId);
      showToast(`🗑️ Offer "${offer.title}" deleted.`);
    }
  };

  // Filter & Search
  const filteredOffers = (offers || []).filter((offer) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && offer.active !== false) ||
      (statusFilter === "inactive" && offer.active === false);

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (offer.title && offer.title.toLowerCase().includes(searchLower)) ||
      (offer.code && offer.code.toLowerCase().includes(searchLower)) ||
      (offer.category && offer.category.toLowerCase().includes(searchLower)) ||
      (offer.badge && offer.badge.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  const totalCount = (offers || []).length;
  const activeCount = (offers || []).filter(o => o.active !== false).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="admin-promotions-tab animate-fade-in">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          background: "#1E293B",
          color: "#FFFFFF",
          border: "1px solid #10B981",
          padding: "12px 20px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          fontWeight: 700,
          fontSize: "14px"
        }}>
          {toastMsg}
        </div>
      )}

      <div className="admin-card-section">
        {/* Header Bar */}
        <div className="admin-card-header" style={{ flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "22px" }}>Offers & Promo Deals Management</h3>
              <span className="badge-pill" style={{ background: "rgba(255, 77, 45, 0.15)", color: "#FF4D2D", border: "1px solid rgba(255, 77, 45, 0.3)" }}>
                ⚡ "Offers For You" Live Controller
              </span>
            </div>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>
              Add new promotional cards, edit discounts, copy codes, toggle active/inactive status, or delete offers appearing on the homepage.
            </p>
          </div>

          <button className="btn-primary-glow" onClick={openAdd}>
            + Create New Offer
          </button>
        </div>

        {/* Stats & Search Filter Bar */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          flexWrap: "wrap", 
          gap: "14px", 
          margin: "24px 0 16px",
          padding: "16px",
          background: "var(--bg-light)",
          borderRadius: "16px",
          border: "1px solid var(--border-color)"
        }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button 
              type="button"
              className={`table-action-btn ${statusFilter === "all" ? "active" : ""}`}
              style={{ fontWeight: statusFilter === "all" ? 800 : 500 }}
              onClick={() => setStatusFilter("all")}
            >
              All Offers ({totalCount})
            </button>
            <button 
              type="button"
              className={`table-action-btn ${statusFilter === "active" ? "active" : ""}`}
              style={{ fontWeight: statusFilter === "active" ? 800 : 500, color: "#10B981" }}
              onClick={() => setStatusFilter("active")}
            >
              🟢 Active on Home ({activeCount})
            </button>
            <button 
              type="button"
              className={`table-action-btn ${statusFilter === "inactive" ? "active" : ""}`}
              style={{ fontWeight: statusFilter === "inactive" ? 800 : 500, color: "#94A3B8" }}
              onClick={() => setStatusFilter("inactive")}
            >
              ⚪ Inactive / Hidden ({inactiveCount})
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", minWidth: "260px" }}>
            <input 
              type="text"
              placeholder="Search offer by title, coupon code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-card)",
                color: "var(--text-main)",
                fontSize: "13.5px"
              }}
            />
          </div>
        </div>

        {/* Offers Cards Grid in Admin */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
          {filteredOffers.map((offer, index) => {
            const isActive = offer.active !== false;
            const targetId = offer.id || offer._id;

            return (
              <div 
                key={targetId}
                className="admin-card-section"
                style={{ 
                  margin: 0, 
                  padding: "20px", 
                  borderRadius: "18px",
                  border: `1.5px solid ${isActive ? "rgba(16, 185, 129, 0.4)" : "var(--border-color)"}`,
                  opacity: isActive ? 1 : 0.65,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: "var(--bg-card)",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.04)"
                }}
              >
                <div>
                  {/* Top Header Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span className="badge-pill" style={{ fontSize: "11px", fontWeight: 700 }}>
                      {offer.icon || "🎁"} {offer.badge || offer.tag || "Offer"}
                    </span>
                    <span style={{ 
                      fontSize: "11.5px", 
                      fontWeight: 800, 
                      color: isActive ? "#10B981" : "#94A3B8",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      {isActive ? "🟢 Live on Home" : "⚪ Hidden"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h4 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-main)", margin: "0 0 6px 0", lineHeight: 1.3 }}>
                    {offer.title}
                  </h4>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 14px 0", lineHeight: 1.5 }}>
                    {offer.subtitle || offer.desc}
                  </p>

                  {/* Discount & Promo Code Chips */}
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                    {offer.discount && (
                      <span style={{ 
                        background: "rgba(16, 185, 129, 0.15)", 
                        color: "#10B981", 
                        padding: "3px 8px", 
                        borderRadius: "6px", 
                        fontSize: "11.5px", 
                        fontWeight: 800 
                      }}>
                        {offer.discount}
                      </span>
                    )}
                    {offer.code && (
                      <span style={{ 
                        background: "rgba(255, 77, 45, 0.12)", 
                        color: "#FF4D2D", 
                        border: "1px dashed rgba(255, 77, 45, 0.4)", 
                        padding: "2px 8px", 
                        borderRadius: "6px", 
                        fontSize: "11.5px", 
                        fontWeight: 800,
                        fontFamily: "monospace"
                      }}>
                        CODE: {offer.code}
                      </span>
                    )}
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Target: <strong>{offer.actionPath || offer.ctaLink || "/services"}</strong>
                    </span>
                  </div>

                  {/* Background / Image Indicator */}
                  <div style={{ 
                    height: "36px", 
                    borderRadius: "8px", 
                    background: offer.bgGradient || "linear-gradient(135deg, #0F172A, #2563EB)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 12px",
                    color: "#FFFFFF",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    overflow: "hidden"
                  }}>
                    {offer.image ? `🖼️ Image: ${offer.image.slice(0, 32)}...` : `🎨 Gradient Banner`}
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  paddingTop: "12px", 
                  borderTop: "1px solid var(--border-color)" 
                }}>
                  {/* Active Toggle Button */}
                  <button
                    type="button"
                    className="table-action-btn"
                    style={{ 
                      background: isActive ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                      color: isActive ? "#EF4444" : "#10B981",
                      border: "none",
                      fontWeight: 700
                    }}
                    onClick={() => handleToggle(offer)}
                    title={isActive ? "Hide this offer from homepage" : "Make this offer live on homepage"}
                  >
                    {isActive ? "🚫 Disable" : "👁️ Activate"}
                  </button>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      type="button" 
                      className="table-action-btn" 
                      onClick={() => openEdit(offer)}
                      title="Edit offer details"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      type="button" 
                      className="table-action-btn delete"
                      onClick={() => handleDelete(offer)}
                      title="Delete offer permanently"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {filteredOffers.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "36px" }}>🔍</span>
            <h4>No offers match your criteria</h4>
            <p>Try searching with another keyword or click "+ Create New Offer".</p>
          </div>
        )}
      </div>

      {/* Offer Add / Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="admin-modal-box" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "620px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>{editingOffer ? "Edit Promotional Offer" : "Create New Promotional Offer"}</h3>
              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "13px" }}>
                This card will be instantly published in the "Offers For You" section on the customer homepage.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              
              {/* Row 1: Title & Icon */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Offer Main Headline *</label>
                  <input
                    type="text"
                    placeholder="e.g. AC Foam Jet Wash & Cooling Tune-Up"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Emoji Icon</label>
                  <input
                    type="text"
                    placeholder="❄️"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Tag/Badge & Category */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Badge / Top Tag Text</label>
                  <input
                    type="text"
                    placeholder="e.g. 🔥 ALL-IN-ONE MEGA DEAL"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Appliances & AC"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Discount & Coupon Code */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Discount Tag Text</label>
                  <input
                    type="text"
                    placeholder="e.g. FLAT 30% OFF or STARTING @ ₹399"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Promo Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. COOLJET99"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="admin-form-group">
                <label>Offer Subtitle / Description *</label>
                <textarea
                  rows={2}
                  placeholder="Offer details, benefits and reassurance for customers..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Highlight Chips */}
              <div className="admin-form-group">
                <label>Highlight Chips (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 2X Power Jet Cooling, Eliminates Odor, Certified Techs"
                  value={chipsText}
                  onChange={(e) => setChipsText(e.target.value)}
                />
              </div>

              {/* Background Color Gradient */}
              <div className="admin-form-group">
                <label>Card Background Gradient Theme</label>
                <select 
                  value={bgGradient} 
                  onChange={(e) => setBgGradient(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-light)" }}
                >
                  {GRADIENT_PRESETS.map((gp, i) => (
                    <option key={i} value={gp.value}>{gp.name}</option>
                  ))}
                </select>
              </div>

              {/* Image URL & Presets */}
              <div className="admin-form-group">
                <label>Card Background Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://... or /images/fresh_vegetables_banner.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Quick presets:</span>
                  {IMAGE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImage(p.url)}
                      style={{
                        background: "var(--bg-light)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "4px",
                        fontSize: "11px",
                        padding: "2px 6px",
                        cursor: "pointer"
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Route & Button Text */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Button Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Claim Offer ➔"
                    value={btnText}
                    onChange={(e) => setBtnText(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Target URL / Route</label>
                  <input
                    type="text"
                    placeholder="e.g. /services or /category/cleaning"
                    value={actionPath}
                    onChange={(e) => setActionPath(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0" }}>
                <input
                  type="checkbox"
                  id="offerActiveCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="offerActiveCheck" style={{ fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}>
                  Active (Display this offer live on customer homepage)
                </label>
              </div>

              <button 
                type="submit" 
                className="btn-primary-glow" 
                style={{ width: "100%", marginTop: "12px", padding: "12px" }}
              >
                {editingOffer ? "Save Offer Changes ⚡" : "Publish Offer to Homepage 🚀"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminPromotions;
