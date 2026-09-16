import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import "../css/Services.css";

const defaultServices = [
  { id: 1, name: "Electrician", icon: "💡", desc: "Short circuits, wiring, switchboards, inverter & fan repairs.", price: "₹249", tag: "Repairs", popular: true },
  { id: 2, name: "Plumber", icon: "🚰", desc: "Leak repair, tap replacement, drainage clogs & water heaters.", price: "₹199", tag: "Repairs", popular: true }
];

function Services() {
  const dataContext = useContext(DataContext);
  const servicesList = dataContext?.services || defaultServices;
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Repairs", "Cleaning", "Daily Help", "Appliances", "Home Decor", "Kitchen"];

  const filtered = servicesList.filter(s => {
    const matchesCat = activeFilter === "All" || s.tag === activeFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="services-page-wrapper">
      <div className="container-wrapper">
        
        {/* Header Section */}
        <div className="services-page-header">
          <span className="services-sub-badge">On-Demand Help</span>
          <h1 className="services-main-title">Comprehensive Home & Professional Services</h1>
          <p className="services-lead-text">
            Choose from our extensive catalog of verified home care, maintenance, and repair solutions.
          </p>

          {/* Search & Category Filter Bar */}
          <div className="services-filter-bar">
            <input 
              type="text" 
              placeholder="Search by service name or keyword..." 
              className="service-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="services-tag-pills">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  className={`service-cat-pill ${activeFilter === cat ? "active" : ""}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="services-cards-grid">
          {filtered.map((item) => (
            <div className="service-feature-card" key={item.id}>
              
              <div className="card-top-row">
                <div className="service-icon-bubble">{item.icon}</div>
                {item.popular && <span className="popular-badge">🔥 Popular</span>}
              </div>

              <h3 className="service-title">{item.name}</h3>
              <p className="service-detail">{item.desc}</p>

              <div className="card-bottom-row">
                <div className="price-tag-group">
                  <span className="from-text">Starts from</span>
                  <span className="price-number">{item.price}</span>
                </div>

                <Link to={`/category/${item.name.toLowerCase().replace(/\s+/g, '-')}`} className="service-book-action-btn">
                  <span>Explore</span>
                  <span>→</span>
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Services;
