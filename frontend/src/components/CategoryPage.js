import React, { useContext, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { LocationContext } from "../context/LocationContext";
import "../css/CategoryPage.css";

const dummyData = [
  { 
    id: 1, 
    name: "Premier City Grand", 
    distance: "1.2 km", 
    price: "₹399 onwards",
    status: "Open Now",
    rating: 4.7,
    reviews: 184,
    facilities: ["Air Conditioned", "High-Speed WiFi", "Card Payment"], 
    contact: "+91 98765 43210", 
    address: "12 Connaught Place, Central Zone",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800" 
  },
  { 
    id: 2, 
    name: "Royal Apex Services", 
    distance: "2.4 km", 
    price: "₹299 onwards",
    status: "Open Now",
    rating: 4.9,
    reviews: 320,
    facilities: ["Free Valet Parking", "24/7 Available", "Verified Pros"], 
    contact: "+91 98765 88990", 
    address: "45 MG Road, Tech Sector",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800" 
  },
  { 
    id: 3, 
    name: "Golden Crest Experts", 
    distance: "3.8 km", 
    price: "₹499 onwards",
    status: "Closes at 10 PM",
    rating: 4.6,
    reviews: 98,
    facilities: ["Live Tracking", "Same Day Service", "Warranty Covered"], 
    contact: "+91 98765 11223", 
    address: "88 Ring Road, North Extension",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800" 
  },
  { 
    id: 4, 
    name: "Urban Elite Hub", 
    distance: "4.5 km", 
    price: "₹199 onwards",
    status: "Open Now",
    rating: 4.8,
    reviews: 412,
    facilities: ["Express Booking", "Certified Staff", "Digital Invoice"], 
    contact: "+91 98765 77665", 
    address: "102 Boulevard Avenue, South District",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800" 
  }
];

export const realData = [
  { 
    id: 101, 
    name: "The Grand Cuisine & Banquets", 
    distance: "0.5 km", 
    price: "₹500 for two",
    status: "Open Now",
    facilities: ["AC Dining", "Free WiFi", "Valet Parking", "Live Music"], 
    contact: "+91 98765 11111", 
    rating: 4.9, 
    reviews: 580,
    address: "Plot 18, Commercial Hub, Downtown",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800" 
  },
  { 
    id: 102, 
    name: "Spice Route Gourmet Lounge", 
    distance: "1.2 km", 
    price: "₹700 for two",
    status: "Open Now",
    facilities: ["Rooftop Seating", "Cocktail Bar", "Air Conditioned"], 
    contact: "+91 98765 22222", 
    rating: 4.8, 
    reviews: 340,
    address: "Floor 4, Galleria Tower, Main Blvd",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800" 
  },
  { 
    id: 103, 
    name: "Ocean Breeze Fresh Kitchen", 
    distance: "2.0 km", 
    price: "₹450 for two",
    status: "Closes at 11 PM",
    facilities: ["Sea View", "Live Counter", "Free Home Delivery"], 
    contact: "+91 98765 33333", 
    rating: 4.7, 
    reviews: 215,
    address: "Harbor Promenade, Bay View Area",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800" 
  },
  { 
    id: 104, 
    name: "Artisan Bake & Cafe Lounge", 
    distance: "2.5 km", 
    price: "₹300 for two",
    status: "Open Now",
    facilities: ["WiFi Working Space", "Vegan Options", "Outdoor Lawn"], 
    contact: "+91 98765 44444", 
    rating: 4.8, 
    reviews: 490,
    address: "Shop 14, Heritage Square, City Park",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800" 
  },
];

function CategoryPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { location, fetchLocation, locationError } = useContext(LocationContext);
  const [sortBy, setSortBy] = useState("rating");
  const [searchTerm, setSearchTerm] = useState("");

  const title = name ? name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ') : "Category";
  const rawData = location ? realData : dummyData;

  const filtered = rawData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.facilities.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedData = [...filtered].sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "distance") return parseFloat(a.distance) - parseFloat(b.distance);
    return 0;
  });

  return (
    <div className="category-page-wrapper">
      <div className="container-wrapper">
        
        {/* Category Header with Back Button and Quick Search */}
        <div className="category-top-bar">
          <button className="category-back-btn" onClick={() => navigate(-1)}>
            <span>←</span>
            <span>Back</span>
          </button>

          <div className="category-title-group">
            <span className="category-tag-pill">Directory</span>
            <h1 className="category-heading">{title} <span className="category-count-badge">({sortedData.length} Available)</span></h1>
          </div>

          {/* Quick Filter Sort */}
          <div className="category-controls">
            <input
              type="text"
              placeholder={`Search in ${title}...`}
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
              <option value="distance">📍 Nearest Distance</option>
            </select>
          </div>
        </div>

        {/* Location Banner (if location not provided) */}
        {!location && (
          <div className="location-alert-card animate-fade-in">
            <div className="alert-icon-box">📍</div>
            <div className="alert-text-content">
              <h3>Showing Representative Providers</h3>
              <p>Detect your live location to unlock real-time distance, instant availability, and local providers right at your doorstep.</p>
              {locationError && <p className="alert-error-msg">{locationError}</p>}
            </div>
            <button className="btn-primary-glow" onClick={fetchLocation}>
              <span>Enable GPS Location</span>
              <span>⚡</span>
            </button>
          </div>
        )}

        {/* Providers Listing Grid */}
        <div className="category-items-grid">
          {sortedData.map((item) => (
            <div className="category-item-card-modern" key={item.id}>
              
              {/* Card Thumbnail Area */}
              <div className="item-thumbnail-box">
                <img src={item.image} alt={item.name} className="item-thumbnail-img" />
                <div className="item-status-tag">{item.status || "Open"}</div>
                {item.rating && (
                  <div className="item-rating-float">
                    <span>★ {item.rating}</span>
                    <span className="reviews-sub">({item.reviews || 50}+)</span>
                  </div>
                )}
              </div>

              {/* Card Details Area */}
              <div className="item-info-panel">
                <div className="item-main-header">
                  <h2 className="item-title">{item.name}</h2>
                  <span className="item-distance-pill">📍 {item.distance}</span>
                </div>

                {item.address && (
                  <p className="item-address-text">📌 {item.address}</p>
                )}

                <div className="item-facilities-pills">
                  {item.facilities.map((fac, i) => (
                    <span key={i} className="facility-tag-pill">
                      ✓ {fac}
                    </span>
                  ))}
                </div>

                <div className="item-card-bottom">
                  <div className="item-contact-preview">
                    <span className="phone-icon">📞</span>
                    <span>{item.contact}</span>
                  </div>

                  <Link to={`/details/${item.id}`} className="view-details-action-btn">
                    <span>View Profile</span>
                    <span>→</span>
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default CategoryPage;
