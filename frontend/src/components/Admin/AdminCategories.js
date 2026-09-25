import React, { useContext, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../../context/DataContext";

function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useContext(DataContext);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍽️");
  const [image, setImage] = useState("");
  const [tag, setTag] = useState("All");
  const [count, setCount] = useState("10+ Pros");

  // Filter Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.tag && cat.tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cat.count && cat.count.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [categories, searchTerm]);

  // Statistics
  const totalCount = categories.length;
  const verifiedCentresCount = categories.reduce((sum, c) => {
    const num = parseInt(String(c.count).replace(/[^0-9]/g, ""), 10);
    return sum + (isNaN(num) ? 15 : num);
  }, 0);
  const tagsCount = new Set(categories.map((c) => c.tag || "General")).size;

  const openAdd = () => {
    setEditingCat(null);
    setName("");
    setIcon("🏷️");
    setImage("");
    setTag("Home Care");
    setCount("10+ Pros");
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    setIcon(cat.icon || "🏷️");
    setImage(cat.image || "");
    setTag(cat.tag || "Home Care");
    setCount(cat.count || "10+ Pros");
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const path = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    if (editingCat) {
      updateCategory(editingCat.id || editingCat.name, {
        name: name.trim(),
        icon: icon.trim() || "🏷️",
        image: image.trim(),
        tag: tag.trim(),
        count: count.trim(),
        path: editingCat.path || path
      });
    } else {
      addCategory({
        name: name.trim(),
        icon: icon.trim() || "🏷️",
        image: image.trim(),
        tag: tag.trim(),
        count: count.trim(),
        path
      });
    }
    setShowModal(false);
  };

  return (
    <div className="admin-categories-tab animate-fade-in">
      
      {/* Top Stat Summary Banner */}
      <div className="admin-stats-summary-grid">
        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(255, 77, 45, 0.12)", color: "#FF4D2D" }}>
            📂
          </div>
          <div>
            <div className="summary-card-num">{totalCount}</div>
            <div className="summary-card-label">Total Categories Directory</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
            🏢
          </div>
          <div>
            <div className="summary-card-num">{verifiedCentresCount}+</div>
            <div className="summary-card-label">Verified Service Centres</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(147, 51, 234, 0.12)", color: "#9333EA" }}>
            📑
          </div>
          <div>
            <div className="summary-card-num">{tagsCount}</div>
            <div className="summary-card-label">Directory Sector Tags</div>
          </div>
        </div>
      </div>

      <div className="admin-card-section">
        {/* Header Row */}
        <div className="admin-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>Categories Directory Management</h3>
              <span className="admin-count-pill">{filteredCategories.length} Categories</span>
            </div>
            <p style={{ margin: "4px 0 0 0" }}>
              Manage all directory categories and sub-sectors featured on the home explore grid
            </p>
          </div>

          <button className="btn-primary-glow" onClick={openAdd}>
            <span>+</span> <span>Add New Category</span>
          </button>
        </div>

        {/* Search Toolbar */}
        <div className="admin-catalog-toolbar">
          <div className="admin-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search categories by title, sector tag, or pros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
            {searchTerm && (
              <button type="button" className="btn-clear-search" onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="admin-empty-state">
            <span style={{ fontSize: "40px" }}>🔍</span>
            <h4>No matching categories found</h4>
            <p>Try searching with another keyword.</p>
            <button className="btn-secondary-outline" onClick={() => setSearchTerm("")}>
              Reset Search
            </button>
          </div>
        ) : (
          <div className="category-grid">
            {filteredCategories.map((cat) => {
              const catSlug = cat.path || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

              return (
                <div className="category-card-modern" key={cat.id || cat.name}>
                  {/* Thumbnail / Icon */}
                  <div className="category-thumb-box">
                    {cat.image ? (
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="category-thumb-img"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div className="category-thumb-fallback" style={{ display: cat.image ? "none" : "flex" }}>
                      <span>{cat.icon || "🏷️"}</span>
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="category-card-text">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <h4 className="category-title">{cat.name}</h4>
                      <span className="category-tag-badge">{cat.tag || "General"}</span>
                    </div>
                    <span className="category-count">{cat.count || "10+ Centres"}</span>
                    
                    <div style={{ marginTop: "4px" }}>
                      <Link 
                        to={`/category/${catSlug}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="category-live-link"
                      >
                        <span>👁️ Live View</span> <span>➔</span>
                      </Link>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="category-actions-group">
                    <button 
                      type="button"
                      className="btn-card-action edit icon-only"
                      onClick={() => openEdit(cat)}
                      title={`Edit ${cat.name}`}
                    >
                      ✏️
                    </button>
                    <button 
                      type="button"
                      className="btn-card-action delete icon-only"
                      onClick={() => {
                        if (window.confirm(`Delete "${cat.name}" category from platform?`)) {
                          deleteCategory(cat.id || cat.name);
                        }
                      }}
                      title={`Delete ${cat.name}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>

            <div className="modal-title-row">
              <span style={{ fontSize: "28px" }}>{editingCat ? "✏️" : "📂"}</span>
              <div>
                <h3 style={{ margin: 0 }}>{editingCat ? `Edit: ${editingCat.name}` : "Add New Directory Category"}</h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Changes will be instantly available in Home Explore and Category Directory.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Category Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Car Spa & Deep Wash"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group icon-field">
                  <label>Emoji Icon</label>
                  <input
                    type="text"
                    placeholder="🚗"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Sector / Tag *</label>
                  <input
                    type="text"
                    placeholder="e.g. Auto Care or Repairs"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Badge Count *</label>
                  <input
                    type="text"
                    placeholder="e.g. 50+ Places or 15+ Pros"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Banner Image URL (Unsplash or CDN)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              {/* Live Image Preview */}
              {image && (
                <div className="modal-image-preview-box">
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Image Preview</span>
                  <img
                    src={image}
                    alt="Preview"
                    style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "10px", marginTop: "6px" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              )}

              <div className="modal-actions-group">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-glow" style={{ flex: 1 }}>
                  {editingCat ? "Save Category Changes 💾" : "Create New Category 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminCategories;
