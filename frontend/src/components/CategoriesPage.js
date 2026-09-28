import React, { useState, useContext, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { popularCategories } from "../data/popularCategoriesData";
import "../css/CategoriesPage.css";

function CategoriesPage() {
  const dataContext = useContext(DataContext);
  const categoriesList = dataContext?.categories?.length ? dataContext.categories : popularCategories;
  const gridTopRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);

  const filterGroups = [
    { id: "All", label: "All Sectors" },
    { id: "Healthcare", label: "Healthcare & Clinics" },
    { id: "Spa & Wellness", label: "Spa & Wellness" },
    { id: "Home & Repairs", label: "Home & Repairs" },
    { id: "Travel & Transport", label: "Travel & Rentals" },
    { id: "Dining & Stays", label: "Dining & Stays" },
    { id: "Shopping", label: "Shopping & Retail" },
    { id: "Education", label: "Education & Classes" },
    { id: "City & Finance", label: "City & Logistics" }
  ];

  // Filtering & Sorting
  const filteredCategories = useMemo(() => {
    let result = categoriesList.filter((cat) => {
      const matchGroup =
        activeFilter === "All" ||
        (cat.group && cat.group.toLowerCase().includes(activeFilter.toLowerCase())) ||
        (cat.tag && cat.tag.toLowerCase().includes(activeFilter.toLowerCase()));

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        cat.name.toLowerCase().includes(query) ||
        (cat.tag && cat.tag.toLowerCase().includes(query)) ||
        (cat.group && cat.group.toLowerCase().includes(query));

      return matchGroup && matchSearch;
    });

    // Sorting
    if (sortBy === "name-az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-za") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "count-high") {
      result.sort((a, b) => {
        const countA = parseInt((a.count || "0").replace(/[^0-9]/g, ""), 10) || 0;
        const countB = parseInt((b.count || "0").replace(/[^0-9]/g, ""), 10) || 0;
        return countB - countA;
      });
    } else {
      // Default: popular first
      result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    return result;
  }, [categoriesList, activeFilter, searchQuery, sortBy]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, sortBy, itemsPerPage]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCategories.length);
  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, startIndex, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (gridTopRef.current) {
        gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="categories-page-wrapper">
      {/* Background ambient radial glow */}
      <div className="categories-ambient-glow" aria-hidden="true">
        <div className="cat-glow cat-glow-1" />
        <div className="cat-glow cat-glow-2" />
      </div>

      <div className="categories-container">
        
        {/* ================= Studio Hero Section ================= */}
        <section className="categories-studio-hero">
          <div className="hero-pill-badge">
            <span className="live-status-dot" />
            <span>POPULAR LOCAL CATEGORIES • 85+ VERIFIED SECTORS</span>
          </div>

          <h1 className="categories-studio-title">
            Explore All Categories.<br />
            <span className="title-gradient-accent">Connect with Local Specialists.</span>
          </h1>

          <p className="categories-studio-subtitle">
            Browse and connect with verified local centres, licensed doctors, spas, electricians, plumbers, salons, and emergency daily city services across your neighborhood.
          </p>

          {/* Search Box */}
          <div className="categories-search-wrapper">
            <div className="search-bar-glass">
              <span className="search-svg-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search across all 85+ categories (e.g. Body Massage, AC Repair, Dentist, Gym, Hospital)..."
                className="search-input-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Sector Filter Tabs */}
          <div className="category-tabs-container">
            <div className="category-tabs-scroll">
              {filterGroups.map((group) => {
                const countInGroup = group.id === "All"
                  ? categoriesList.length
                  : categoriesList.filter(c => (c.group && c.group.toLowerCase().includes(group.id.toLowerCase())) || (c.tag && c.tag.toLowerCase().includes(group.id.toLowerCase()))).length;

                const isActive = activeFilter === group.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    className={`cat-tab-btn ${isActive ? "active" : ""}`}
                    onClick={() => setActiveFilter(group.id)}
                  >
                    <span>{group.label}</span>
                    <span className="cat-count-badge">{countInGroup}</span>
                    {isActive && <span className="cat-active-pill" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadata & Controls Bar */}
          <div className="categories-meta-bar" ref={gridTopRef}>
            <div className="meta-results-count">
              <span>Showing <strong>{filteredCategories.length ? startIndex + 1 : 0}–{endIndex}</strong> of <strong>{filteredCategories.length}</strong> categories</span>
              {activeFilter !== "All" && (
                <button 
                  type="button" 
                  className="reset-filter-tag"
                  onClick={() => setActiveFilter("All")}
                >
                  Sector: {activeFilter} ✕
                </button>
              )}
            </div>

            <div className="meta-controls-right">
              {/* Items Per Page Selector */}
              <div className="meta-per-page-box">
                <span className="control-label">Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="control-dropdown"
                >
                  <option value={16}>16</option>
                  <option value={24}>24</option>
                  <option value={32}>32</option>
                  <option value={48}>48</option>
                </select>
              </div>

              {/* Sort Selector */}
              <div className="meta-sort-box">
                <span className="control-label">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="control-dropdown"
                >
                  <option value="default">Most Popular</option>
                  <option value="name-az">Name (A–Z)</option>
                  <option value="name-za">Name (Z–A)</option>
                  <option value="count-high">Most Listings</option>
                </select>
              </div>
            </div>
          </div>

        </section>

        {/* ================= Categories Bento Grid ================= */}
        {paginatedCategories.length > 0 ? (
          <>
            <div className="categories-bento-grid">
              {paginatedCategories.map((cat, idx) => (
                <Link
                  key={cat.id || cat.path || idx}
                  to={`/category/${cat.path || cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="category-bento-card"
                  title={`Explore ${cat.name}`}
                >
                  <div className="cat-card-thumbnail">
                    {cat.image ? (
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="cat-thumb-img" 
                        loading="lazy" 
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.parentElement.querySelector(".cat-thumb-fallback");
                          if (fallback) fallback.style.display = "flex";
                        }} 
                      />
                    ) : null}
                    <div className="cat-thumb-fallback" style={{ display: cat.image ? "none" : "flex" }}>
                      <span>{cat.icon || "⚡"}</span>
                    </div>
                    {cat.popular && <span className="cat-popular-flame">★ POPULAR</span>}
                  </div>

                  <div className="cat-card-content">
                    <div className="cat-header-tags">
                      <span className="cat-pro-count">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        {cat.count || "50+ Pros"}
                      </span>
                      {cat.tag && <span className="cat-group-chip">{cat.tag}</span>}
                    </div>

                    <h3 className="cat-title">{cat.name}</h3>

                    <div className="cat-footer-row">
                      <span className="cat-explore-text">Browse Listings</span>
                      <span className="cat-arrow-icon">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                      </span>
                    </div>
                  </div>

                  <div className="card-hover-border-glow" />
                </Link>
              ))}
            </div>

            {/* ================= Professional Pagination Bar ================= */}
            {totalPages > 1 && (
              <div className="categories-pagination-bar">
                <div className="pagination-count-indicator">
                  <span>
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredCategories.length} total categories)
                  </span>
                </div>

                <div className="pagination-action-controls">
                  <button
                    type="button"
                    className="pagination-nav-btn prev-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Go to previous page"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                    <span>Previous</span>
                  </button>

                  <div className="pagination-pages-group">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        className={`pagination-num-btn ${currentPage === pageNum ? "active" : ""}`}
                        onClick={() => handlePageChange(pageNum)}
                        title={`Page ${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="pagination-nav-btn next-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Go to next page"
                  >
                    <span>Next</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty Search State */
          <div className="categories-empty-state">
            <div className="empty-icon-box">🔍</div>
            <h3>No categories match "{searchQuery}"</h3>
            <p>Try searching for "Spa", "Dentist", "Hospital", "Gym", "Cinema", "AC Repair", or reset your filters.</p>
            <button
              type="button"
              className="btn-reset-search"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All");
              }}
            >
              Reset Filters & Show All
            </button>
          </div>
        )}

        {/* ================= Partner / Business Listing CTA Banner ================= */}
        <section className="categories-partner-banner">
          <div className="partner-ambient-orb" />
          
          <div className="partner-banner-info">
            <div className="partner-pill">
              <span className="pulse-partner-dot" />
              <span>GROW YOUR LOCAL PRACTICE OR BUSINESS</span>
            </div>
            <h2>Are You a Local Business Owner or Service Specialist?</h2>
            <p>
              Get listed across Helper's verified directory. Reach thousands of daily active customers searching for your expertise in real-time.
            </p>

            <div className="partner-perks-row">
              <span className="partner-perk">✓ 100% Free Instant Business Listing</span>
              <span className="partner-perk">✓ Direct Phone & WhatsApp Leads</span>
              <span className="partner-perk">✓ Verified Trust Badge On Profile</span>
            </div>
          </div>

          <div className="partner-banner-actions">
            <Link to="/grow-business" className="btn-partner-primary">
              <span>List Your Business For Free</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
            <Link to="/contact" className="btn-partner-secondary">
              Talk to Partner Team
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

export default CategoriesPage;
