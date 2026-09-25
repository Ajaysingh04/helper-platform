import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import "../css/Services.css";

const categoryIcons = {
  "All": "⚡",
  "Spa & Wellness": "💆‍♂️",
  "Repairs": "🛠️",
  "Cleaning": "🧹",
  "Daily Help": "👨‍🍳",
  "Appliances": "❄️",
  "Home Decor": "🎨"
};

const defaultServices = [
  { id: 1, name: "Electrician", icon: "💡", desc: "Short circuits, wiring, switchboards, inverter & fan repairs.", price: "₹249", tag: "Repairs", popular: true, speed: "20 min dispatch", category: "electricians" },
  { id: 2, name: "Plumber", icon: "🚰", desc: "Leak repair, tap replacement, drainage clogs & water heaters.", price: "₹199", tag: "Repairs", popular: true, speed: "25 min dispatch", category: "plumbers" },
  { id: "srv-spa-amritam", name: "Body Massage & Spa", icon: "💆‍♂️", desc: "Authentic Ayurvedic body massage, Swedish relaxation & aroma spa therapy by certified specialists.", price: "₹302", tag: "Spa & Wellness", popular: true, speed: "Verified Center • Amritam", category: "body-massage-centres" },
  { id: 3, name: "AC Jet Service", icon: "❄️", desc: "Deep jet clean, gas refill, cooling check & circuit repair.", price: "₹599", tag: "Appliances", popular: true, speed: "30 min dispatch", category: "ac-repair-services" },
  { id: 4, name: "Deep Home Cleaning", icon: "🧹", desc: "Complete kitchen, washroom, balcony & floor sanitization.", price: "₹899", tag: "Cleaning", popular: false, speed: "Same day", category: "cleaning" },
  { id: 5, name: "Daily Home Chef", icon: "👨‍🍳", desc: "Hygienic home-style meals, breakfast, lunch & dinner prep.", price: "₹399", tag: "Daily Help", popular: true, speed: "Immediate match", category: "daily-help" },
  { id: 6, name: "Appliance Technician", icon: "🔧", desc: "Washing machine, microwave, chimney & refrigerator fix.", price: "₹349", tag: "Appliances", popular: false, speed: "40 min dispatch", category: "appliances" },
  { id: 7, name: "Home Painter", icon: "🎨", desc: "Interior waterproof touch-ups, wall putty & full coat paint.", price: "₹1,299", tag: "Home Decor", popular: false, speed: "Next day", category: "painters" },
  { id: 8, name: "Carpentry & Locks", icon: "🚪", desc: "Door lock installation, furniture assembly & modular fittings.", price: "₹299", tag: "Repairs", popular: false, speed: "30 min dispatch", category: "carpenters" }
];

function Services() {
  const dataContext = useContext(DataContext);
  const servicesList = dataContext?.services?.length ? dataContext.services : defaultServices;
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaused, setIsPaused] = useState(false);

  const categories = ["All", "Spa & Wellness", "Repairs", "Cleaning", "Daily Help", "Appliances", "Home Decor"];

  const filtered = servicesList.filter(s => {
    const matchesCat = activeFilter === "All" || s.tag === activeFilter || (s.category && s.category.toLowerCase().includes(activeFilter.toLowerCase()));
    const matchesSearch = !searchQuery || 
                          s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.desc && s.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="services-page-wrapper">
      <div className="container-wrapper">
        
        {/* Studio Hero Header (5U AI Style) */}
        <div className="services-studio-header">
          <div className="pill-tag-coral animate-fade-in">
            <span>ON-DEMAND CAPABILITIES</span>
          </div>

          <h1 className="services-studio-title animate-fade-up">
            Services & Capabilities.<br />
            Built for Every Need.
          </h1>

          <p className="services-studio-subtitle animate-fade-up">
            Smart dispatch connects your request with background-verified, certified professionals in &lt; 30 seconds.
          </p>

          {/* Search & Filter Bar */}
          <div className="services-search-filter-box animate-fade-up">
            <div className="services-search-input-wrapper">
              <span className="search-icon-symbol">🔍</span>
              <input 
                type="text" 
                placeholder="Search across electrician, plumbing, deep cleaning..." 
                className="services-studio-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="search-clear-btn" 
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Continuous Sliding Categories Marquee Ribbon */}
            <div className="services-category-marquee-container">
              <div className="services-marquee-inner">
                <div className={`services-marquee-track ${isPaused ? "paused" : ""}`}>
                  {[1, 2, 3].map((groupNum) => (
                    <div className="services-marquee-group" key={`group-${groupNum}`}>
                      {categories.map((cat) => (
                        <button
                          key={`cat-${groupNum}-${cat}`}
                          type="button"
                          className={`studio-chip-btn ${activeFilter === cat ? "active" : ""}`}
                          onClick={() => setActiveFilter(cat)}
                          title={`Filter by ${cat} (Click to select)`}
                        >
                          <span className="chip-icon">{categoryIcons[cat] || "⚡"}</span>
                          <span className="chip-label">{cat}</span>
                          {activeFilter === cat && <span className="active-dot"></span>}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Marquee Controls & Current Status */}
              <div className="services-marquee-controls">
                <button
                  type="button"
                  className="marquee-ctrl-btn"
                  onClick={() => setIsPaused(!isPaused)}
                  title={isPaused ? "Resume continuous slide" : "Pause continuous slide"}
                >
                  {isPaused ? "▶ Resume Slide" : "⏸ Pause Slide"}
                </button>

                <div className="marquee-status-text">
                  <span>Selected: <strong>{activeFilter}</strong> ({filtered.length} Services Available)</span>
                </div>

                <div className="marquee-hint-badge">
                  <span>✨ Continuous Live Stream</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Services Grid */}
        <div className="services-bento-grid">
          {filtered.map((item) => (
            <div className="service-bento-card" key={item.id}>
              
              <div className="bento-card-top">
                <div className="service-icon-box">
                  <span>{item.icon || "⚡"}</span>
                </div>
                <div className="bento-card-badges">
                  {item.popular && <span className="chip-badge-coral">POPULAR</span>}
                  <span className="chip-badge-subtle">{item.speed || "VERIFIED"}</span>
                </div>
              </div>

              <div className="bento-card-body">
                <h3 className="bento-service-name">{item.name}</h3>
                <p className="bento-service-desc">{item.desc || "Certified professionals for reliable and fast doorstep completion."}</p>
              </div>

              <div className="bento-card-footer">
                <div className="bento-price-stack">
                  <span className="bento-price-label">Starts from</span>
                  <span className="bento-price-val">{item.price || "₹199"}</span>
                </div>

                <Link 
                  to={`/category/${(item.category || item.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`} 
                  className="btn-coral-sm"
                >
                  <span>Book Now</span>
                  <span>→</span>
                </Link>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Studio Dispatch Banner */}
        <div className="services-bottom-banner">
          <div className="banner-left-info">
            <span className="banner-pill">24/7 INTELLIGENT DISPATCH</span>
            <h3>Need a custom commercial or enterprise setup?</h3>
            <p>Our dispatch operations team handles recurring maintenance, office cleaning, and apartment complexes.</p>
          </div>
          <div className="banner-right-actions">
            <Link to="/contact" className="btn-coral">
              <span>TALK TO DISPATCH</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Services;
