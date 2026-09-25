import React, { useContext, useState, useMemo } from "react";
import { DataContext } from "../../context/DataContext";

const AVAILABLE_TAGS = ["All", "Repairs", "Cleaning", "Daily Help", "Appliances", "Home Decor", "Kitchen"];

// Robust matching for categories and sub-sectors
export const isServiceInTag = (service, targetTag) => {
  if (!service) return false;
  if (targetTag === "All") return true;

  const sTag = (service.tag || "").toLowerCase().trim();
  const tTag = targetTag.toLowerCase().trim();
  if (sTag === tTag) return true;

  const corpus = `${service.name || ""} ${service.tag || ""} ${service.category || ""} ${service.desc || ""}`.toLowerCase();

  if (tTag === "repairs") {
    return sTag.includes("repair") || sTag.includes("plumb") || sTag.includes("electr") || sTag.includes("carpent") || sTag.includes("lock") ||
           corpus.includes("electric") || corpus.includes("plumb") || corpus.includes("carpent") || corpus.includes("switchboard") || corpus.includes("leak") || corpus.includes("lock");
  }
  if (tTag === "cleaning") {
    return sTag.includes("clean") || sTag.includes("pest") || sTag.includes("sanit") ||
           corpus.includes("clean") || corpus.includes("pest") || corpus.includes("termite") || corpus.includes("sanit") || corpus.includes("descal") || corpus.includes("shampoo");
  }
  if (tTag === "daily help") {
    return sTag.includes("daily") || sTag.includes("help") || sTag.includes("maid") || sTag.includes("nanny") || sTag.includes("keeper") || sTag.includes("driver") ||
           corpus.includes("keeper") || corpus.includes("nanny") || corpus.includes("babysitter") || corpus.includes("elderly") || corpus.includes("driver") || corpus.includes("chauffeur") || corpus.includes("maid");
  }
  if (tTag === "appliances") {
    return sTag.includes("appliance") || sTag.includes("ac") || sTag.includes("fridge") || sTag.includes("ro") || sTag.includes("geyser") ||
           corpus.includes("appliance") || corpus.includes("ac jet") || corpus.includes("cooling") || corpus.includes("refrigerator") || corpus.includes("washing machine") || corpus.includes("purifier") || corpus.includes("geyser") || corpus.includes("heater");
  }
  if (tTag === "home decor") {
    return sTag.includes("decor") || sTag.includes("paint") || sTag.includes("wall") || sTag.includes("ceiling") ||
           corpus.includes("paint") || corpus.includes("decor") || corpus.includes("ceiling") || corpus.includes("pop") || corpus.includes("wallpaper") || corpus.includes("curtain");
  }
  if (tTag === "kitchen") {
    return sTag.includes("kitchen") || sTag.includes("cook") || sTag.includes("chef") || sTag.includes("chimney") ||
           corpus.includes("chef") || corpus.includes("cook") || corpus.includes("kitchen") || corpus.includes("chimney") || corpus.includes("hob") || corpus.includes("catering") || corpus.includes("bartender");
  }

  return false;
};

function AdminServices() {
  const { services, addService, updateService, deleteService } = useContext(DataContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  // Form states
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💡");
  const [price, setPrice] = useState("₹299");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("Repairs");
  const [popular, setPopular] = useState(false);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.desc && s.desc.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.tag && s.tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchTag = isServiceInTag(s, activeTag);
      return matchSearch && matchTag;
    });
  }, [services, searchTerm, activeTag]);

  // Statistics
  const totalCount = services.length;
  const popularCount = services.filter((s) => s.popular).length;
  const categoriesCount = new Set(services.map((s) => s.tag || "General")).size;

  const openAddModal = () => {
    setEditingService(null);
    setName("");
    setIcon("🛠️");
    setPrice("₹299");
    setDesc("");
    setTag("Repairs");
    setPopular(false);
    setShowAddModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setName(service.name);
    setIcon(service.icon || "🛠️");
    setPrice(service.price);
    setDesc(service.desc || "");
    setTag(service.tag || "Repairs");
    setPopular(Boolean(service.popular));
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingService) {
      updateService(editingService.id, {
        name: name.trim(),
        icon: icon.trim() || "🛠️",
        price: price.trim(),
        desc: desc.trim(),
        tag: tag.trim(),
        popular
      });
    } else {
      addService({
        name: name.trim(),
        icon: icon.trim() || "🛠️",
        price: price.trim(),
        desc: desc.trim(),
        tag: tag.trim(),
        popular
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="admin-services-tab animate-fade-in">
      
      {/* Top Stat Summary Banner */}
      <div className="admin-stats-summary-grid">
        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366F1" }}>
            🛠️
          </div>
          <div>
            <div className="summary-card-num">{totalCount}</div>
            <div className="summary-card-label">Total Catalog Services</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" }}>
            🔥
          </div>
          <div>
            <div className="summary-card-num">{popularCount}</div>
            <div className="summary-card-label">Featured / Popular Services</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
            🏷️
          </div>
          <div>
            <div className="summary-card-num">{categoriesCount}</div>
            <div className="summary-card-label">Active Service Sectors</div>
          </div>
        </div>
      </div>

      <div className="admin-card-section">
        {/* Header Row */}
        <div className="admin-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>Services Catalog Management</h3>
              <span className="admin-count-pill">{filteredServices.length} Services</span>
            </div>
            <p style={{ margin: "4px 0 0 0" }}>
              Add, edit prices, descriptions, and feature services on the live website
            </p>
          </div>

          <button className="btn-primary-glow" onClick={openAddModal}>
            <span>+</span> <span>Add New Service</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="admin-catalog-toolbar">
          <div className="admin-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search services by title, tag, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
            {searchTerm && (
              <button type="button" className="btn-clear-search" onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>

          {/* Filter Tag Chips */}
          <div className="admin-tag-chips-wrapper">
            {AVAILABLE_TAGS.map((t) => {
              const count = services.filter((s) => isServiceInTag(s, t)).length;
              return (
                <button
                  key={t}
                  type="button"
                  className={`admin-tag-chip ${activeTag === t ? "active" : ""}`}
                  onClick={() => setActiveTag(t)}
                >
                  <span>{t}</span>
                  <span className="tag-chip-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="admin-empty-state">
            <span style={{ fontSize: "40px" }}>🔍</span>
            <h4>No matching services found</h4>
            <p>Try searching with another keyword or clear the tag filter.</p>
            <button className="btn-secondary-outline" onClick={() => { setSearchTerm(""); setActiveTag("All"); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map((service) => (
              <div className="service-card-modern" key={service.id}>
                
                {/* Card Top Meta */}
                <div className="service-card-top-row">
                  <div className="service-icon-box">
                    <span className="service-main-icon">{service.icon || "🛠️"}</span>
                  </div>
                  <div className="service-badges-group">
                    {service.popular && <span className="popular-badge">🔥 Popular</span>}
                    <span className="service-badge-tag">★ {service.rating || "4.8"}</span>
                    <span className="service-sector-pill">{service.tag || "General"}</span>
                  </div>
                </div>

                {/* Info Area */}
                <div className="service-info-area">
                  <h4 className="service-name">{service.name}</h4>
                  <p className="service-desc">{service.desc || "Standard home care consultation and certified service."}</p>
                </div>

                {/* Price Bar */}
                <div className="service-price-bar">
                  <span className="service-price-label">Price Estimate</span>
                  <strong className="service-price-val">{service.price}</strong>
                </div>

                {/* Action Buttons */}
                <div className="service-card-actions">
                  <button
                    type="button"
                    className="btn-card-action edit"
                    onClick={() => openEditModal(service)}
                  >
                    ✏️ Edit Service
                  </button>
                  <button
                    type="button"
                    className="btn-card-action delete"
                    title={`Delete ${service.name}`}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${service.name}" from catalog?`)) {
                        deleteService(service.id);
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Service Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="admin-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            
            <div className="modal-title-row">
              <span style={{ fontSize: "28px" }}>{editingService ? "✏️" : "✨"}</span>
              <div>
                <h3 style={{ margin: 0 }}>{editingService ? `Edit: ${editingService.name}` : "Add New Catalog Service"}</h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Changes will be immediately reflected across the website.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Solar Panel Cleaning & Maintenance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group icon-field">
                  <label>Icon Emoji</label>
                  <input
                    type="text"
                    placeholder="💡"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Price Estimate *</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Category Tag *</label>
                  <select value={tag} onChange={(e) => setTag(e.target.value)}>
                    <option value="Repairs">Repairs</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Daily Help">Daily Help</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Kitchen">Kitchen</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Description *</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of service features..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="admin-checkbox-group">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "var(--primary)" }}
                />
                <label htmlFor="popularCheck" style={{ fontSize: "14px", fontWeight: 700, cursor: "pointer", color: "var(--text-main)" }}>
                  Mark as 🔥 Popular / Featured on Homepage
                </label>
              </div>

              <div className="modal-actions-group">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-glow" style={{ flex: 1 }}>
                  {editingService ? "Save Service Changes 💾" : "Publish New Service 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminServices;
