import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { popularCategories } from "../data/popularCategoriesData";
import "../css/SmartSearchModal.css";

const trendingSuggestions = [
  { label: "Car Rental", icon: "🚘", path: "car-rental", type: "category" },
  { label: "Electrician", icon: "⚡", path: "electricians", type: "category" },
  { label: "AC Repair & Services", icon: "❄️", path: "ac-repair-services", type: "category" },
  { label: "Plumbers", icon: "🚰", path: "plumbers", type: "category" },
  { label: "Bike On Rent", icon: "🏍️", path: "bike-on-rent", type: "category" },
  { label: "Packers And Movers", icon: "📦", path: "packers-and-movers", type: "category" },
  { label: "Beauty Parlours", icon: "💇‍♀️", path: "beauty-parlours", type: "category" },
  { label: "Hospitals & Doctors", icon: "🏥", path: "hospitals", type: "category" },
  { label: "Gyms & Fitness", icon: "🏋️‍♂️", path: "gyms", type: "category" }
];

function SmartSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { services = [], categories = [], providers = [] } = useContext(DataContext);

  // Auto-focus on open and handle Escape key
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Combined categories registry for comprehensive matching
  const allCategories = useMemo(() => {
    const list = [...popularCategories];
    categories.forEach((c) => {
      const exists = list.some(
        (x) => x.name.toLowerCase() === (c.name || "").toLowerCase()
      );
      if (!exists && c.name) {
        list.push({
          id: c.id || `dyn-cat-${Math.random()}`,
          name: c.name,
          icon: c.icon || "📂",
          path: (c.slug || c.name).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          tag: c.tag || "Services",
          count: c.count || "Verified",
          group: c.group || "General"
        });
      }
    });
    return list;
  }, [categories]);

  // Real-time Query Analyzer Engine
  const analysis = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        intent: "idle",
        label: "Ready to analyze search query",
        color: "#6366F1",
        matchedCategories: [],
        matchedServices: [],
        matchedProviders: [],
        topMatch: null
      };
    }

    // 1. Match Categories
    const matchedCategories = allCategories.filter((cat) => {
      const n = (cat.name || "").toLowerCase();
      const p = (cat.path || "").toLowerCase();
      const t = (cat.tag || "").toLowerCase();
      const g = (cat.group || "").toLowerCase();
      return n.includes(q) || p.includes(q) || t.includes(q) || g.includes(q);
    });

    // 2. Match Services
    const matchedServices = services.filter((srv) => {
      const n = (srv.name || "").toLowerCase();
      const c = (srv.category || "").toLowerCase();
      const d = (srv.description || "").toLowerCase();
      return n.includes(q) || c.includes(q) || d.includes(q);
    });

    // 3. Match Providers
    const matchedProviders = providers.filter((prv) => {
      const n = (prv.name || "").toLowerCase();
      const s = (prv.shopName || "").toLowerCase();
      const c = (prv.category || "").toLowerCase();
      const loc = (prv.location || prv.address || "").toLowerCase();
      return n.includes(q) || s.includes(q) || c.includes(q) || loc.includes(q);
    });

    // Determine Intent Classification
    let intent = "general";
    let label = `Found ${matchedCategories.length} categories, ${matchedServices.length} services, ${matchedProviders.length} pros`;
    let color = "#6366F1";
    let topMatch = null;

    if (matchedCategories.length > 0 && (matchedCategories[0].name.toLowerCase().startsWith(q) || q.length >= 3)) {
      intent = "category";
      topMatch = { type: "category", data: matchedCategories[0] };
      label = `🎯 Category Intent: Direct match for "${matchedCategories[0].name}"`;
      color = "#0284C7";
    } else if (matchedServices.length > 0) {
      intent = "service";
      topMatch = { type: "service", data: matchedServices[0] };
      label = `⚡ Service Intent: Found "${matchedServices[0].name}" (${matchedServices[0].category})`;
      color = "#10B981";
    } else if (matchedProviders.length > 0) {
      intent = "provider";
      topMatch = { type: "provider", data: matchedProviders[0] };
      label = `🛡️ Provider Intent: Verified local partner match "${matchedProviders[0].shopName || matchedProviders[0].name}"`;
      color = "#FF4D2D";
    } else {
      intent = "broad";
      label = `🔍 Analyzing query for "${query}" across local network`;
      color = "#F59E0B";
    }

    return {
      intent,
      label,
      color,
      matchedCategories,
      matchedServices,
      matchedProviders,
      topMatch
    };
  }, [query, allCategories, services, providers]);

  // Navigate & Close
  const handleSelectCategory = (cat) => {
    onClose();
    const targetPath = cat.path || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    navigate(`/category/${targetPath}`);
  };

  const handleSelectService = (srv) => {
    onClose();
    if (srv.category) {
      const catSlug = srv.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      navigate(`/category/${catSlug}`);
    } else {
      navigate(`/services`);
    }
  };

  const handleSelectProvider = (prv) => {
    onClose();
    if (prv.category) {
      const catSlug = prv.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      navigate(`/category/${catSlug}`);
    } else {
      navigate(`/services`);
    }
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    if (analysis.topMatch) {
      if (analysis.topMatch.type === "category") {
        handleSelectCategory(analysis.topMatch.data);
      } else if (analysis.topMatch.type === "service") {
        handleSelectService(analysis.topMatch.data);
      } else if (analysis.topMatch.type === "provider") {
        handleSelectProvider(analysis.topMatch.data);
      }
    } else if (query.trim()) {
      onClose();
      const sanitized = query.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      navigate(`/category/${sanitized}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="smart-search-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="smart-search-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Search Header Bar with Input */}
        <div className="smart-search-input-bar">
          <span className="search-pulse-icon">🔍</span>
          
          <form onSubmit={handleFormSubmit} className="smart-search-form">
            <input
              ref={inputRef}
              type="text"
              className="smart-search-input"
              placeholder="Search by service, category, car hire, technician or city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search"
            />
          </form>

          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setQuery("")}
              title="Clear Search"
            >
              ✕
            </button>
          )}

          <button
            type="button"
            className="search-close-chip"
            onClick={onClose}
            title="Close Search (Esc)"
          >
            ESC
          </button>
        </div>

        {/* AI Analyzer Status Banner */}
        <div className="smart-search-analyzer-banner">
          <div className="analyzer-left">
            <span className="analyzer-dot" style={{ background: analysis.color }} />
            <span className="analyzer-label">{analysis.label}</span>
          </div>
          {query.trim() && (
            <span className="analyzer-badge" style={{ borderColor: analysis.color, color: analysis.color }}>
              Smart Analyzer Active
            </span>
          )}
        </div>

        {/* Search Body Content */}
        <div className="smart-search-body custom-scrollbar">
          
          {/* 1. When query is empty: Show Trending Topics & Categories */}
          {!query.trim() && (
            <div className="trending-search-section">
              <div className="section-title-row">
                <span>🔥 Popular Categories & Trending Searches</span>
                <span className="hint-tag">Tap to explore</span>
              </div>
              <div className="trending-chips-grid">
                {trendingSuggestions.map((item, idx) => (
                  <button
                    key={`trend-${idx}`}
                    type="button"
                    className="trending-chip-btn"
                    onClick={() => {
                      setQuery(item.label);
                    }}
                  >
                    <span className="chip-icon">{item.icon}</span>
                    <span className="chip-text">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Top Match Spotlight Card */}
          {query.trim() && analysis.topMatch && (
            <div className="spotlight-match-card" onClick={handleFormSubmit}>
              <div className="spotlight-badge">★ Best Recommended Match</div>
              <div className="spotlight-content">
                <div className="spotlight-left">
                  <span className="spotlight-icon">
                    {analysis.topMatch.type === "category" ? (analysis.topMatch.data.icon || "📂") : analysis.topMatch.type === "service" ? "⚡" : "👑"}
                  </span>
                  <div>
                    <h4 className="spotlight-title">
                      {analysis.topMatch.data.name || analysis.topMatch.data.shopName}
                    </h4>
                    <span className="spotlight-sub">
                      {analysis.topMatch.type === "category"
                        ? `${analysis.topMatch.data.count || "Verified"} in ${analysis.topMatch.data.group || "City"}`
                        : analysis.topMatch.type === "service"
                        ? `Price: ${analysis.topMatch.data.price || "₹299 onwards"} • ${analysis.topMatch.data.category}`
                        : `⭐ ${analysis.topMatch.data.rating || 4.9} • 📍 ${analysis.topMatch.data.location || "Central Indore"}`}
                    </span>
                  </div>
                </div>
                <button type="button" className="spotlight-action-btn">
                  <span>Explore Now</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Matched Categories List */}
          {query.trim() && analysis.matchedCategories.length > 0 && (
            <div className="search-results-group">
              <div className="group-title">
                <span>📂 Matching Categories ({analysis.matchedCategories.length})</span>
              </div>
              <div className="categories-results-grid">
                {analysis.matchedCategories.slice(0, 6).map((cat) => (
                  <div
                    key={`res-cat-${cat.id}`}
                    className="category-result-chip"
                    onClick={() => handleSelectCategory(cat)}
                  >
                    <span className="cat-res-icon">{cat.icon || "📂"}</span>
                    <div className="cat-res-text">
                      <strong className="cat-res-name">{cat.name}</strong>
                      <span className="cat-res-meta">{cat.count || "Available"}</span>
                    </div>
                    <span className="cat-res-arrow">›</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Matched Services List */}
          {query.trim() && analysis.matchedServices.length > 0 && (
            <div className="search-results-group">
              <div className="group-title">
                <span>⚡ Matching Services ({analysis.matchedServices.length})</span>
              </div>
              <div className="services-results-list">
                {analysis.matchedServices.slice(0, 6).map((srv) => (
                  <div
                    key={`res-srv-${srv.id}`}
                    className="service-result-row"
                    onClick={() => handleSelectService(srv)}
                  >
                    <div className="srv-res-left">
                      <div className="srv-res-icon-box">⚡</div>
                      <div>
                        <strong className="srv-res-title">{srv.name}</strong>
                        <span className="srv-res-cat-badge">{srv.category}</span>
                      </div>
                    </div>
                    <div className="srv-res-right">
                      <span className="srv-res-price">{srv.price || "₹299 onwards"}</span>
                      <span className="srv-res-arrow">›</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Matched Verified Providers */}
          {query.trim() && analysis.matchedProviders.length > 0 && (
            <div className="search-results-group">
              <div className="group-title">
                <span>🛡️ Verified Local Partners ({analysis.matchedProviders.length})</span>
              </div>
              <div className="providers-results-list">
                {analysis.matchedProviders.slice(0, 4).map((prv) => (
                  <div
                    key={`res-prv-${prv.id}`}
                    className="provider-result-row"
                    onClick={() => handleSelectProvider(prv)}
                  >
                    <div className="prv-res-left">
                      <div className="prv-res-avatar">
                        {prv.image ? (
                          <img src={prv.image} alt={prv.name} />
                        ) : (
                          <span>{(prv.name || "P").charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <strong className="prv-res-name">{prv.shopName || prv.name}</strong>
                        <div className="prv-res-details">
                          <span className="prv-res-cat">{prv.category}</span>
                          <span>•</span>
                          <span className="prv-res-rating">★ {prv.rating || 4.9}</span>
                          <span>•</span>
                          <span>📍 {prv.location || "Indore"}</span>
                        </div>
                      </div>
                    </div>
                    {prv.phone && (
                      <a
                        href={`tel:${prv.phone}`}
                        className="prv-call-btn"
                        onClick={(e) => e.stopPropagation()}
                        title="Call Partner"
                      >
                        📞 Call
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. No Results Fallback */}
          {query.trim() &&
            analysis.matchedCategories.length === 0 &&
            analysis.matchedServices.length === 0 &&
            analysis.matchedProviders.length === 0 && (
              <div className="search-empty-state">
                <span className="empty-icon">🔍</span>
                <h4>No direct matches found for "{query}"</h4>
                <p>
                  Try searching with another keyword like "Car", "AC", "Electrician", "Cleaner", or "Plumber".
                </p>
                <div style={{ marginTop: "14px", display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn-secondary-outline"
                    onClick={() => setQuery("Car Rental")}
                  >
                    Try "Car Rental"
                  </button>
                  <button
                    type="button"
                    className="btn-secondary-outline"
                    onClick={() => setQuery("Electricians")}
                  >
                    Try "Electricians"
                  </button>
                  <button
                    type="button"
                    className="btn-secondary-outline"
                    onClick={() => setQuery("")}
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* Search Modal Footer Navigation Hints */}
        <div className="smart-search-footer">
          <div className="footer-shortcuts">
            <span className="shortcut-item">
              <kbd>↵</kbd> Select Top Match
            </span>
            <span className="shortcut-item">
              <kbd>Esc</kbd> Close
            </span>
          </div>
          <div className="footer-credits">
            <span>HELPER GO AI Search Platform</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SmartSearchModal;
