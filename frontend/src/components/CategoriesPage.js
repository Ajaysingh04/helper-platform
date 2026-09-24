import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import "../css/Home.css";

function CategoriesPage() {
  const dataContext = useContext(DataContext);
  const categories = dataContext?.categories || [];

  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filterGroups = [
    "All",
    "Healthcare",
    "Spa & Wellness",
    "Home & Repairs",
    "Travel & Transport",
    "Dining & Stays",
    "Shopping",
    "Education",
    "City & Finance"
  ];

  const filtered = categories.filter((cat) => {
    const matchGroup =
      activeFilter === "All" ||
      (cat.group && cat.group.toLowerCase().includes(activeFilter.toLowerCase())) ||
      (cat.tag && cat.tag.toLowerCase().includes(activeFilter.toLowerCase()));
    const matchSearch =
      !searchQuery ||
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.tag && cat.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cat.group && cat.group.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchGroup && matchSearch;
  });

  const displayed = showAll || searchQuery || activeFilter !== "All"
    ? filtered
    : filtered.slice(0, 16);

  return (
    <div className="home-beew-wrapper" style={{ paddingTop: "100px", minHeight: "100vh" }}>
      <div className="container-wrapper" style={{ padding: "40px 24px 80px 24px" }}>
        
        {/* Page Hero Header */}
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 48px auto" }}>
          <div className="pill-tag-coral" style={{ background: "rgba(255, 77, 45, 0.12)", borderColor: "rgba(255, 77, 45, 0.35)", color: "#FF4D2D", margin: "0 auto 16px auto" }}>
            <span>🔥 POPULAR LOCAL CATEGORIES • 85+ SECTORS</span>
          </div>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "46px", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px 0" }}>
            Popular Categories
          </h1>
          <p style={{ fontSize: "17px", color: "var(--beew-slate-text, #64748B)", lineHeight: 1.6, margin: "0 0 28px 0" }}>
            Browse and connect with verified local centres, specialists, and professionals across healthcare, beauty, spas, stays, repairs, and daily city services.
          </p>

          {/* Search Box */}
          <div className="pop-cat-search-box" style={{ maxWidth: "540px", margin: "0 auto", padding: "12px 24px" }}>
            <span style={{ fontSize: "18px" }}>🔎</span>
            <input
              type="text"
              placeholder="Search across all 85 categories (e.g. Massage, Cinema, School, Dentist, Gym)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button type="button" className="clear-btn" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>
        </div>

        {/* Group Filter Tabs */}
        <div className="pop-cat-tabs-row" style={{ justifyContent: "center" }}>
          {filterGroups.map((group) => {
            const countInGroup = group === "All"
              ? categories.length
              : categories.filter(c => (c.group && c.group.toLowerCase().includes(group.toLowerCase())) || (c.tag && c.tag.toLowerCase().includes(group.toLowerCase()))).length;

            return (
              <button
                key={group}
                type="button"
                className={`pop-tab-pill ${activeFilter === group ? "active" : ""}`}
                onClick={() => setActiveFilter(group)}
              >
                <span>{group}</span>
                <span style={{ fontSize: "11px", opacity: 0.85 }}>({countInGroup})</span>
              </button>
            );
          })}
        </div>

        {/* Live Status Bar */}
        <div className="pop-cat-status-bar" style={{ marginBottom: "28px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600 }}>
            Showing <strong>{filtered.length}</strong> of <strong>{categories.length}</strong> Verified Categories
          </span>
          <span className="pop-cat-badge-live">
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
            100% Verified Local Sectors
          </span>
        </div>

        {/* 85 Category Grid */}
        <div className="pop-categories-grid">
          {displayed.map((cat, idx) => (
            <Link
              key={cat.id || cat.path || idx}
              to={`/category/${cat.path || cat.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="pop-cat-card"
              title={`Click to open ${cat.name} listings`}
            >
              <div className="pop-cat-card-left">
                <div className="pop-cat-icon-badge">
                  {cat.image ? (
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="pop-cat-img" 
                      loading="lazy" 
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.parentElement.querySelector(".pop-cat-fallback-icon");
                        if (fallback) fallback.style.display = "inline";
                      }} 
                    />
                  ) : null}
                  <span className="pop-cat-fallback-icon" style={{ display: cat.image ? "none" : "inline" }}>
                    {cat.icon || "⚡"}
                  </span>
                </div>
                <div className="pop-cat-text-info">
                  <h4 className="pop-cat-name">{cat.name}</h4>
                  <div className="pop-cat-meta">
                    <span>{cat.count || "50+ Pros"}</span>
                    {cat.tag && <span className="pop-cat-tag-chip">{cat.tag}</span>}
                  </div>
                </div>
              </div>

              <div className="pop-cat-arrow-btn">
                →
              </div>
            </Link>
          ))}
        </div>

        {/* View More Button */}
        {!searchQuery && activeFilter === "All" && (
          <div className="pop-cat-expand-wrap">
            <button
              type="button"
              className="pop-cat-expand-btn"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>Show Less (4x4 Grid) ▴</>
              ) : (
                <>View More Categories ({categories.length - displayed.length} More) ▾</>
              )}
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <span style={{ fontSize: "42px" }}>🔍</span>
            <h3 style={{ marginTop: "12px", fontFamily: "Space Grotesk, sans-serif" }}>No categories matching "{searchQuery}"</h3>
            <p style={{ color: "#64748B" }}>Try searching for "Spa", "Dentist", "Hospital", "Gym", "Cinema", or "Restaurant".</p>
            <button type="button" className="btn-coral" onClick={() => { setSearchQuery(""); setActiveFilter("All"); }} style={{ marginTop: "16px" }}>
              Clear Search & Show All 85
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default CategoriesPage;
