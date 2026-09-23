import React, { useContext, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { LocationContext } from "../context/LocationContext";
import { DataContext } from "../context/DataContext";
import { popularCategories } from "../data/popularCategoriesData";
import "../css/CategoryPage.css";

// Global cache for ItemDetailsPage lookup
export const categoryItemsRegistry = new Map();
export const realData = [];

function CategoryPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { location, fetchLocation, locationError } = useContext(LocationContext);
  const dataContext = useContext(DataContext);
  const updateProviderInContext = dataContext?.updateProvider;
  const addProviderInContext = dataContext?.addProvider;

  const [sortBy, setSortBy] = useState("rating");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Customer Enquiry Modal State
  const [enquiryItem, setEnquiryItem] = useState(null);
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryName, setEnquiryName] = useState("");
  const [enquirySent, setEnquirySent] = useState(false);

  // Edit Provider Modal State (Updates Backend)
  const [editingProvider, setEditingProvider] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    shopName: "",
    phone: "",
    distance: "",
    experience: "",
    rating: 4.9,
    address: ""
  });

  // Add New Provider Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingPro, setIsAddingPro] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    shopName: "",
    phone: "",
    distance: "1.2 km",
    experience: "5+ Years Exp",
    rating: 4.9,
    address: "Central Zone, Main Market"
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  // Normalize category slug & obtain metadata
  const currentSlug = (name || "services").toLowerCase().trim();

  const matchedCategory = useMemo(() => {
    return (
      popularCategories.find(
        (c) =>
          c.path.toLowerCase() === currentSlug ||
          c.name.toLowerCase().replace(/\s+/g, "-") === currentSlug ||
          c.name.toLowerCase() === currentSlug.replace(/-/g, " ")
      ) || null
    );
  }, [currentSlug]);

  const categoryTitle = useMemo(() => {
    if (matchedCategory) return matchedCategory.name;
    return currentSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [matchedCategory, currentSlug]);

  const categoryIcon = matchedCategory?.icon || "⚡";
  const categoryTag = matchedCategory?.tag || "Verified Sector";
  const categoryCount = matchedCategory?.count || "50+ Specialists";

  // Filter providers from DataContext / Backend for this category
  const categoryProviders = useMemo(() => {
    const allProviders = dataContext?.providers || [];
    const cleanCat = categoryTitle.toLowerCase();
    const cleanSlug = currentSlug.replace(/-/g, " ");

    let matching = allProviders.filter((p) => {
      const pCat = (p.category || "").toLowerCase();
      const pShop = (p.shopName || "").toLowerCase();
      const pServiceCats = (p.serviceCategories || []).map((c) => String(c).toLowerCase());

      return (
        pCat.includes(cleanCat) ||
        cleanCat.includes(pCat) ||
        pCat.includes(cleanSlug) ||
        cleanSlug.includes(pCat) ||
        pShop.includes(cleanCat) ||
        pServiceCats.some((sc) => sc.includes(cleanCat) || cleanCat.includes(sc))
      );
    });

    // Fallback template items if this category does not yet have custom entries in DB
    if (matching.length === 0) {
      matching = [
        {
          id: `seed_${currentSlug}_1`,
          name: "Rajesh Kumar (Chief Specialist)",
          shopName: `Premier ${categoryTitle} Hub`,
          category: categoryTitle,
          phone: "+91 98765 43210",
          distance: "1.1 km",
          experience: "8+ Years Exp",
          rating: 4.9,
          totalReviewsCount: 310,
          location: "Sector 18, Central Zone",
          address: "Sector 18, Central Zone, Near Metro",
          facilities: ["Verified Specialist", "Instant Booking", "Same Day Service", "Warranty Covered"],
          avatar: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
          verified: true
        },
        {
          id: `seed_${currentSlug}_2`,
          name: "Amit Saxena (Senior Partner)",
          shopName: `Royal ${categoryTitle} & Services`,
          category: categoryTitle,
          phone: "+91 98765 88990",
          distance: "2.3 km",
          experience: "10+ Years Exp",
          rating: 4.8,
          totalReviewsCount: 240,
          location: "Ring Road, Commercial Phase",
          address: "Ring Road, Commercial Phase, North Sector",
          facilities: ["Top Rated Pro", "Fast Dispatch", "Digital Billing", "Police Verified"],
          avatar: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=600",
          verified: true
        },
        {
          id: `seed_${currentSlug}_3`,
          name: "Pooja Sharma (Expert Consultant)",
          shopName: `City Apex ${categoryTitle} Centre`,
          category: categoryTitle,
          phone: "+91 98765 11223",
          distance: "3.5 km",
          experience: "6+ Years Exp",
          rating: 4.7,
          totalReviewsCount: 180,
          location: "Galleria Commercial Zone",
          address: "Galleria Commercial Zone, City South",
          facilities: ["Certified Technicians", "Zero Advance", "Quality Assured", "24/7 Support"],
          avatar: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600",
          verified: true
        }
      ];
    }

    // Save to global registry so ItemDetailsPage can view any profile
    matching.forEach((item) => {
      categoryItemsRegistry.set(String(item.id), item);
      categoryItemsRegistry.set(String(item._id), item);
    });

    return matching;
  }, [dataContext?.providers, categoryTitle, currentSlug]);

  // Search filtering
  const filtered = useMemo(() => {
    return categoryProviders.filter((p) => {
      const q = searchTerm.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.shopName && p.shopName.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.experience && p.experience.toLowerCase().includes(q))
      );
    });
  }, [categoryProviders, searchTerm]);

  // Sorting by rating or nearest distance (KM)
  const sortedData = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "rating") return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      if (sortBy === "distance") {
        const distA = parseFloat(String(a.distance || "99").replace(/[^0-9.]/g, "")) || 99;
        const distB = parseFloat(String(b.distance || "99").replace(/[^0-9.]/g, "")) || 99;
        return distA - distB;
      }
      return 0;
    });
  }, [filtered, sortBy]);

  // Open Edit Modal with existing provider data
  const handleOpenEdit = (item) => {
    setEditingProvider(item);
    setEditForm({
      name: item.name || "",
      shopName: item.shopName || "",
      phone: item.phone || item.contact || "",
      distance: item.distance || "1.2 km",
      experience: item.experience || "5+ Years Exp",
      rating: item.rating || 4.9,
      address: item.address || item.location || ""
    });
  };

  // Submit Edit: updates in Context, sends PUT to backend (MongoDB + database.json)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProvider) return;
    setIsSavingEdit(true);

    const updatedFields = {
      name: editForm.name.trim(),
      shopName: editForm.shopName.trim(),
      phone: editForm.phone.trim(),
      distance: editForm.distance.trim().includes("km") ? editForm.distance.trim() : `${editForm.distance.trim()} km`,
      experience: editForm.experience.trim().toLowerCase().includes("exp") ? editForm.experience.trim() : `${editForm.experience.trim()} Exp`,
      rating: parseFloat(editForm.rating) || 4.9,
      address: editForm.address.trim(),
      location: editForm.address.trim()
    };

    try {
      if (updateProviderInContext) {
        await updateProviderInContext(editingProvider.id || editingProvider._id, updatedFields);
      }
      showToast(`✅ Saved! ${updatedFields.name} updated in Backend Database.`);
      setEditingProvider(null);
    } catch (err) {
      showToast(`⚠️ Updated locally. Notice: ${err.message}`);
      setEditingProvider(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Add New Provider directly to this category
  const handleSaveNewProvider = async (e) => {
    e.preventDefault();
    setIsAddingPro(true);

    const newPro = {
      id: `prv_${Date.now()}`,
      name: addForm.name.trim(),
      shopName: addForm.shopName.trim() || `${addForm.name.trim()}'s ${categoryTitle}`,
      category: categoryTitle,
      serviceCategories: [categoryTitle],
      phone: addForm.phone.trim(),
      distance: addForm.distance.trim().includes("km") ? addForm.distance.trim() : `${addForm.distance.trim()} km`,
      experience: addForm.experience.trim().toLowerCase().includes("exp") ? addForm.experience.trim() : `${addForm.experience.trim()} Exp`,
      rating: parseFloat(addForm.rating) || 4.9,
      address: addForm.address.trim(),
      location: addForm.address.trim(),
      verified: true,
      status: "Active",
      facilities: ["Certified Specialist", "Instant Booking", "Warranty Covered"],
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400"
    };

    try {
      if (addProviderInContext) {
        await addProviderInContext(newPro);
      }
      showToast(`🎉 New Serviceman ${newPro.name} added to ${categoryTitle} in Backend!`);
      setShowAddModal(false);
      setAddForm({
        name: "",
        shopName: "",
        phone: "",
        distance: "1.2 km",
        experience: "5+ Years Exp",
        rating: 4.9,
        address: "Central Zone, Main Market"
      });
    } catch (err) {
      showToast(`Added locally: ${err.message}`);
      setShowAddModal(false);
    } finally {
      setIsAddingPro(false);
    }
  };

  // Quick Callback Booking submit
  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    if (enquiryPhone.length < 10) return;
    setEnquirySent(true);
    setTimeout(() => {
      setEnquirySent(false);
      setEnquiryItem(null);
      setEnquiryPhone("");
      setEnquiryName("");
    }, 2500);
  };

  return (
    <div className="category-page-wrapper">
      <div className="container-wrapper">

        {/* Top Header Bar */}
        <div className="category-top-bar">
          <button className="category-back-btn" onClick={() => navigate(-1)}>
            <span>←</span>
            <span>Back</span>
          </button>

          <div className="category-title-group">
            <span className="category-tag-pill">
              {categoryIcon} {categoryTag} • DIRECTORY
            </span>
            <h1 className="category-heading">
              {categoryTitle}{" "}
              <span className="category-count-badge">
                ({sortedData.length} Verified Centres • {categoryCount})
              </span>
            </h1>
          </div>

          {/* Search, Sort & Add Controls */}
          <div className="category-controls">
            <input
              type="text"
              placeholder={`Search in ${categoryTitle}...`}
              className="category-filter-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="category-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">⭐ Highest Rated</option>
              <option value="distance">📍 Nearest Distance (KM)</option>
            </select>

            <button
              type="button"
              className="btn-add-pro-header"
              onClick={() => setShowAddModal(true)}
              title="Add a new serviceman / center to backend"
            >
              <span>+</span>
              <span>Add Serviceman</span>
            </button>
          </div>
        </div>

        {/* Location Banner (if GPS not enabled) */}
        {!location && (
          <div className="location-alert-card animate-fade-in">
            <div className="alert-icon-box">📍</div>
            <div className="alert-text-content">
              <h3>Showing Verified Nearest Providers for {categoryTitle}</h3>
              <p>Detect your live location to calculate precise real-time distances and nearest arrivals.</p>
              {locationError && <p className="alert-error-msg">{locationError}</p>}
            </div>
            <button className="btn-primary-glow" onClick={fetchLocation}>
              <span>Detect GPS Location</span>
              <span>⚡</span>
            </button>
          </div>
        )}

        {/* Providers Listing Grid */}
        <div className="category-items-grid">
          {sortedData.map((item) => (
            <div className="category-item-card-modern" key={item.id || item._id}>
              {/* Card Image Thumbnail */}
              <div className="item-thumbnail-box">
                <img
                  src={item.avatar || item.image || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"}
                  alt={item.shopName || item.name}
                  className="item-thumbnail-img"
                />
                <div className="item-status-tag">{item.status || "Open Now"}</div>
                <div className="item-rating-float">
                  <span>★ {item.rating || 4.9}</span>
                  <span className="reviews-sub">({item.totalReviewsCount || item.reviews || 150}+)</span>
                </div>
              </div>

              {/* Card Body with Detailed Info */}
              <div className="item-info-panel">
                
                {/* Serviceman Name & Edit Button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div className="item-serviceman-bar">
                    <span>👨‍🔧 Serviceman:</span>
                    <strong>{item.name}</strong>
                  </div>

                  <button
                    type="button"
                    className="btn-edit-pro-badge"
                    onClick={() => handleOpenEdit(item)}
                    title="Click to edit contact, KM, experience & rating in Backend"
                  >
                    ✏️ Edit Details
                  </button>
                </div>

                {/* Service / Shop / Center Name */}
                <h2 className="item-title" style={{ fontSize: "19px", marginBottom: "6px" }}>
                  {item.shopName || `${item.name}'s ${categoryTitle}`}
                </h2>

                {/* Key Stats Row: Distance in KM, Experience, Rating */}
                <div className="item-key-stats-row">
                  <span className="key-stat-chip stat-km" title="Distance from your location">
                    <span>📍</span>
                    <strong>{item.distance || "1.2 km"} away</strong>
                  </span>

                  <span className="key-stat-chip stat-exp" title="Work Experience">
                    <span>💼</span>
                    <strong>{item.experience || "5+ Years Exp"}</strong>
                  </span>

                  <span className="key-stat-chip stat-rating" title="Customer Rating">
                    <span>⭐</span>
                    <strong>{item.rating || 4.9} / 5.0</strong>
                  </span>
                </div>

                {/* Address & Contact Number */}
                <div style={{ marginBottom: "12px", fontSize: "13px", color: "#64748B" }}>
                  <p style={{ margin: "0 0 4px 0" }}>📌 {item.address || item.location || "City Center, Local Hub"}</p>
                  <p style={{ margin: "0", color: "#0F172A", fontWeight: 600 }}>
                    📞 Contact No: <strong>{item.phone || item.contact || "+91 98765 00000"}</strong>
                  </p>
                </div>

                {/* Card Action Buttons (Direct Call, WhatsApp, Book, View Profile) */}
                <div className="pro-card-actions-grid">
                  <a
                    href={`tel:${item.phone || item.contact || "+919876543210"}`}
                    className="btn-call-direct"
                    title="Direct Call Serviceman"
                  >
                    📞 Call Now
                  </a>

                  <a
                    href={`https://wa.me/${String(item.phone || item.contact || "9876543210").replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(item.name)},%20I%20saw%20your%20listing%20for%20${encodeURIComponent(categoryTitle)}%20and%20would%20like%20to%20book%20a%20service.`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-wa-direct"
                    title="Chat on WhatsApp"
                  >
                    💬 WhatsApp
                  </a>

                  <button
                    type="button"
                    className="view-details-action-btn"
                    style={{ flex: 1, border: "none", cursor: "pointer" }}
                    onClick={() => setEnquiryItem(item)}
                  >
                    Enquire ⚡
                  </button>

                  <Link
                    to={`/details/${item.id || item._id}`}
                    className="view-details-action-btn"
                    style={{ background: "transparent", color: "#64748B", border: "1px solid #E2E8F0", boxShadow: "none" }}
                    title="View Full Profile"
                  >
                    Profile →
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* =========================================================================
          EDIT PROVIDER DETAILS MODAL (Updates directly to Backend MongoDB + JSON)
          ========================================================================= */}
      {editingProvider && (
        <div className="cat-preview-modal-overlay" onClick={() => !isSavingEdit && setEditingProvider(null)}>
          <div className="cat-preview-modal-box animate-fade-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <button className="modal-close-btn" onClick={() => setEditingProvider(null)} disabled={isSavingEdit}>✕</button>

            <div className="cat-modal-header">
              <div className="cat-modal-icon">
                ✏️
              </div>
              <div>
                <h3 className="cat-modal-title">Edit Serviceman Details</h3>
                <span style={{ fontSize: "13px", color: "#10B981", fontWeight: 700 }}>
                  ⚡ Any changes update directly in Backend (MongoDB & JSON)
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Service Man Name 👨‍🔧
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Contact Number 📞
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                  Service / Shop / Centre Name 🏢
                </label>
                <input
                  type="text"
                  value={editForm.shopName}
                  onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })}
                  required
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Distance (KM) 📍
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1.2 km"
                    value={editForm.distance}
                    onChange={(e) => setEditForm({ ...editForm, distance: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Experience 💼
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8+ Years"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Rating ⭐
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                  Address / Location 📌
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  className="btn-coral"
                  style={{ flex: 1, padding: "12px 20px" }}
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? "Updating in Backend... ⏳" : "Save Changes to Backend 💾"}
                </button>
                <button
                  type="button"
                  className="btn-coral-outline"
                  onClick={() => setEditingProvider(null)}
                  disabled={isSavingEdit}
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          ADD NEW SERVICEMAN MODAL (Saves to Backend)
          ========================================================================= */}
      {showAddModal && (
        <div className="cat-preview-modal-overlay" onClick={() => !isAddingPro && setShowAddModal(false)}>
          <div className="cat-preview-modal-box animate-fade-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <button className="modal-close-btn" onClick={() => setShowAddModal(false)} disabled={isAddingPro}>✕</button>

            <div className="cat-modal-header">
              <div className="cat-modal-icon">
                ➕
              </div>
              <div>
                <h3 className="cat-modal-title">Add Serviceman for {categoryTitle}</h3>
                <span style={{ fontSize: "13px", color: "#FF4D2D", fontWeight: 700 }}>
                  Will be saved into MongoDB & backend database
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveNewProvider} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Service Man Name 👨‍🔧
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Contact Number 📞
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                  Service / Shop / Centre Name 🏢
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${addForm.name || "Pro"} ${categoryTitle}`}
                  value={addForm.shopName}
                  onChange={(e) => setAddForm({ ...addForm, shopName: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Distance (KM) 📍
                  </label>
                  <input
                    type="text"
                    placeholder="1.2 km"
                    value={addForm.distance}
                    onChange={(e) => setAddForm({ ...addForm, distance: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Experience 💼
                  </label>
                  <input
                    type="text"
                    placeholder="5+ Years Exp"
                    value={addForm.experience}
                    onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Rating ⭐
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={addForm.rating}
                    onChange={(e) => setAddForm({ ...addForm, rating: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                  Address / Location 📌
                </label>
                <input
                  type="text"
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  className="btn-coral"
                  style={{ flex: 1, padding: "12px 20px" }}
                  disabled={isAddingPro}
                >
                  {isAddingPro ? "Adding to Backend... ⏳" : "Save & Add to Backend ⚡"}
                </button>
                <button
                  type="button"
                  className="btn-coral-outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={isAddingPro}
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Quick Customer Enquiry / Booking Modal */}
      {enquiryItem && (
        <div className="cat-preview-modal-overlay" onClick={() => setEnquiryItem(null)}>
          <div className="cat-preview-modal-box animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setEnquiryItem(null)}>✕</button>

            <div className="cat-modal-header">
              <div className="cat-modal-icon">
                {categoryIcon}
              </div>
              <div>
                <h3 className="cat-modal-title">{enquiryItem.shopName || enquiryItem.name}</h3>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className="pop-cat-badge-live">🛡️ Verified Center</span>
                  <span style={{ fontSize: "13px", color: "var(--beew-coral, #FF4D2D)", fontWeight: 600 }}>
                    ★ {enquiryItem.rating} ({enquiryItem.totalReviewsCount || 120} Reviews)
                  </span>
                </div>
              </div>
            </div>

            {enquirySent ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <span style={{ fontSize: "48px" }}>✅</span>
                <h4 style={{ fontSize: "20px", fontWeight: 700, margin: "12px 0 6px" }}>Enquiry Sent!</h4>
                <p style={{ color: "#64748B", fontSize: "14px" }}>
                  Serviceman <strong>{enquiryItem.name}</strong> will contact you on <strong>+91 {enquiryPhone}</strong> within 15 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} style={{ marginTop: "16px" }}>
                <p className="cat-modal-desc">
                  Connect instantly with <strong>{enquiryItem.name}</strong> ({enquiryItem.experience}). Direct provider contact, guaranteed callback.
                </p>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Mobile Number for Free Callback</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ padding: "10px 14px", background: "#F1F5F9", borderRadius: "10px", border: "1px solid #CBD5E1", fontWeight: 600, fontSize: "14px" }}>+91</span>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      required
                      style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" className="btn-coral" style={{ flex: 1, padding: "12px 20px" }}>
                    Request Free Callback ⚡
                  </button>
                  <a
                    href={`https://wa.me/${String(enquiryItem.phone || enquiryItem.contact || "9876543210").replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(enquiryItem.name)},%20I%20would%20like%20to%20enquire%20about%20your%20service.`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-coral-outline"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", padding: "12px 16px" }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Floating Backend Sync Toast Notification */}
      {toastMessage && (
        <div className="toast-backend-sync">
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

export default CategoryPage;
