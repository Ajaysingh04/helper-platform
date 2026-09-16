import React, { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";

function AdminServices() {
  const { services, addService, updateService, deleteService } = useContext(DataContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💡");
  const [price, setPrice] = useState("₹299");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("Repairs");
  const [popular, setPopular] = useState(false);

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
    setIcon(service.icon);
    setPrice(service.price);
    setDesc(service.desc);
    setTag(service.tag || "Repairs");
    setPopular(service.popular || false);
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingService) {
      updateService(editingService.id, {
        name,
        icon,
        price,
        desc,
        tag,
        popular
      });
    } else {
      addService({
        name,
        icon,
        price,
        desc,
        tag,
        popular
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="admin-services-tab animate-fade-in">
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div>
            <h3>Services Catalog Management</h3>
            <p>Add, edit prices, descriptions, and feature services on the live website</p>
          </div>

          <button className="btn-primary-glow" onClick={openAddModal}>
            + Add New Service
          </button>
        </div>

        {/* Services Grid in Admin */}
        <div className="services-grid" style={{ marginTop: "20px" }}>
          {services.map((service) => (
            <div className="service-card-modern" key={service.id} style={{ height: "auto" }}>
              
              <div className="service-card-header">
                <div className="service-icon-box">
                  <span className="service-main-icon" style={{ fontSize: "28px" }}>{service.icon}</span>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {service.popular && <span className="popular-badge">🔥 Popular</span>}
                  <span className="service-badge-tag">★ {service.rating || 4.8}</span>
                </div>
              </div>

              <div className="service-info-area" style={{ padding: "0 0 16px 0" }}>
                <h4 className="service-name">{service.name}</h4>
                <p className="service-desc" style={{ marginBottom: "12px", minHeight: "40px" }}>{service.desc}</p>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Tag: <strong>{service.tag || "General"}</strong></span>
                  <strong style={{ fontSize: "18px", color: "var(--primary)" }}>{service.price}</strong>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    className="table-action-btn" 
                    style={{ flex: 1, padding: "8px" }}
                    onClick={() => openEditModal(service)}
                  >
                    ✏️ Edit Service
                  </button>
                  <button 
                    className="table-action-btn delete"
                    style={{ padding: "8px 12px" }}
                    onClick={() => {
                      if (window.confirm(`Delete ${service.name}?`)) {
                        deleteService(service.id);
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

      {/* Add / Edit Service Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            <h3>{editingService ? `Edit ${editingService.name}` : "Add New Service"}</h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>Changes will be immediately reflected across the website.</p>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Service Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Solar Panel Cleaning"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Price Estimate</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Category Tag</label>
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
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of service features..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "var(--primary)" }}
                />
                <label htmlFor="popularCheck" style={{ fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                  Mark as 🔥 Popular / Featured Service
                </label>
              </div>

              <button type="submit" className="btn-primary-glow" style={{ width: "100%", marginTop: "10px" }}>
                {editingService ? "Save Service Changes" : "Publish New Service"} ⚡
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminServices;
