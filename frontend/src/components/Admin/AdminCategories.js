import React, { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";

function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useContext(DataContext);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍽️");
  const [image, setImage] = useState("");
  const [tag, setTag] = useState("Food");
  const [count, setCount] = useState("50+ Places");

  const openAdd = () => {
    setEditingCat(null);
    setName("");
    setIcon("🏷️");
    setImage("");
    setTag("All");
    setCount("10+ Pros");
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setImage(cat.image || "");
    setTag(cat.tag || "All");
    setCount(cat.count || "10+ Places");
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCat) {
      updateCategory(editingCat.id, {
        name,
        icon,
        image,
        tag,
        count,
        path: name.toLowerCase().replace(/\s+/g, '-')
      });
    } else {
      addCategory({
        name,
        icon,
        image,
        tag,
        count
      });
    }
    setShowModal(false);
  };

  return (
    <div className="admin-categories-tab animate-fade-in">
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div>
            <h3>Categories Directory Management</h3>
            <p>Manage all directory categories and sub-sectors featured on the home explore grid</p>
          </div>
          <button className="btn-primary-glow" onClick={openAdd}>
            + Add New Category
          </button>
        </div>

        <div className="category-grid" style={{ marginTop: "20px" }}>
          {categories.map((cat) => (
            <div className="category-card-modern" key={cat.id || cat.path} style={{ position: "relative" }}>
              <div className="category-icon-wrapper" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", width: "42px", height: "42px", borderRadius: "10px" }}>
                {cat.image ? (
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = "inline";
                    }}
                  />
                ) : null}
                <span className="category-icon" style={{ display: cat.image ? "none" : "inline" }}>{cat.icon}</span>
              </div>
              <div className="category-card-text">
                <h3>{cat.name}</h3>
                <span className="category-count">{cat.count} • Tag: {cat.tag || "All"}</span>
              </div>

              <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                <button 
                  className="table-action-btn"
                  onClick={() => openEdit(cat)}
                  title="Edit Category"
                  style={{ padding: "4px 8px" }}
                >
                  ✏️
                </button>
                <button 
                  className="table-action-btn delete"
                  onClick={() => {
                    if (window.confirm(`Delete ${cat.name} category?`)) {
                      deleteCategory(cat.id || cat.name);
                    }
                  }}
                  title="Delete"
                  style={{ padding: "4px 8px" }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h3>{editingCat ? `Edit Category: ${editingCat.name}` : "Add New Category"}</h3>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Category Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Car Washing & Spa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Icon</label>
                  <input
                    type="text"
                    placeholder="🚗"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Sub-filter Tag</label>
                  <select value={tag} onChange={(e) => setTag(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Home">Home</option>
                    <option value="Events">Events</option>
                    <option value="Study">Study</option>
                    <option value="Rental">Rental</option>
                    <option value="Health">Health</option>
                    <option value="Repairs">Repairs</option>
                    <option value="Pets">Pets</option>
                    <option value="Living">Living</option>
                    <option value="Finance">Finance</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Estimate Pros Count</label>
                  <input
                    type="text"
                    placeholder="e.g. 85+ Places"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-group" style={{ marginTop: "8px" }}>
                <label>Category Image URL (Unsplash / Direct Link)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary-glow" style={{ width: "100%", marginTop: "14px" }}>
                {editingCat ? "Update Category" : "Add Category"} ⚡
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminCategories;
