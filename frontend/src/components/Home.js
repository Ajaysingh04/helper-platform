import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Home.css";
import Slider from "../components/Slider";
import LoginModal from "./LoginModal";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";

const highlights = [
  { icon: "🛡️", title: "100% Verified Pros", desc: "Rigorous background checks & skill verified" },
  { icon: "⚡", title: "30-Min Rapid Booking", desc: "Instant response from local professionals" },
  { icon: "🏷️", title: "Transparent Pricing", desc: "No hidden charges, upfront clear estimates" },
  { icon: "⭐", title: "Satisfaction Guarantee", desc: "Re-service warranty if you're not 100% satisfied" }
];

function Home() {
  const { isLoggedIn } = useContext(AuthContext);
  const dataContext = useContext(DataContext);
  const categories = dataContext?.categories || [];
  const services = dataContext?.services || [];
  const addBooking = dataContext?.addBooking;

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedService, setSelectedService] = useState(null);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      const timer = setTimeout(() => setShowLoginModal(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setShowLoginModal(false);
    }
  }, [isLoggedIn]);

  const filterTabs = ["All", "Home", "Repairs", "Health", "Wellness", "Living", "Logistics"];

  const filteredCategories = activeFilter === "All" 
    ? categories 
    : categories.filter(c => c.tag === activeFilter || c.tag === "All");

  const handleEnquire = (service) => {
    setSelectedService(service);
    setEnquirySuccess(false);
    setEnquiryPhone("");
  };

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    if (enquiryPhone.length >= 10) {
      if (addBooking && selectedService) {
        addBooking({
          name: "Website User",
          phone: enquiryPhone,
          service: selectedService.name,
          price: selectedService.price,
          address: "Direct Web Request"
        });
      }
      setEnquirySuccess(true);
      setTimeout(() => {
        setSelectedService(null);
        setEnquirySuccess(false);
      }, 2500);
    } else {
      alert("Please enter a valid 10-digit mobile number");
    }
  };

  return (
    <div className="home-main-layout">
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      {/* Background Decorative Grid & Glows */}
      <div className="ambient-background">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      <div className="content-overlay">
        
        {/* Hero Section */}
        <section className="hero-modern-section">
          <div className="container-wrapper">
            <div className="hero-top-badge animate-fade-in">
              <span className="badge-sparkle">⚡</span>
              <span>Your Trusted Local Service Companion</span>
              <span className="badge-highlight">Over 50K+ Happy Customers</span>
            </div>

            <h1 className="hero-main-title animate-fade-up">
              Find & Book <span className="gradient-text">Top-Rated Local Services</span> In Minutes
            </h1>

            <p className="hero-subtext animate-fade-up">
              Connect with certified electricians, plumbers, home cleaners, chefs, and over 500+ local professionals near you with instant booking and guaranteed quality.
            </p>

            {/* Quick Metrics Counter */}
            <div className="hero-metrics-bar animate-fade-up">
              <div className="metric-item">
                <span className="metric-number">50,000+</span>
                <span className="metric-label">Bookings Done</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-number">4.9 ★</span>
                <span className="metric-label">Customer Rating</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-number">1,200+</span>
                <span className="metric-label">Verified Experts</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-number">15 Mins</span>
                <span className="metric-label">Avg. Response Time</span>
              </div>
            </div>

            {/* Hero Slider Component */}
            <Slider />
          </div>
        </section>

        {/* Categories Section */}
        <section className="category-section">
          <div className="container-wrapper">
            <div className="section-header-modern">
              <div>
                <span className="section-sub-badge">Explore Categories</span>
                <h2 className="section-title">What are you looking for today?</h2>
              </div>
              
              {/* Category Filter Pills */}
              <div className="category-filter-pills">
                {filterTabs.map((tab, i) => (
                  <button
                    key={i}
                    className={`filter-pill-btn ${activeFilter === tab ? "active" : ""}`}
                    onClick={() => setActiveFilter(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="category-grid">
              {filteredCategories.map((cat, index) => (
                <Link 
                  to={`/category/${cat.path}`} 
                  className="category-card-modern" 
                  key={index}
                >
                  <div className="category-icon-wrapper">
                    <span className="category-icon">{cat.icon}</span>
                  </div>
                  <div className="category-card-text">
                    <h3>{cat.name}</h3>
                    <span className="category-count">{cat.count}</span>
                  </div>
                  <div className="category-hover-arrow">→</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Services Section */}
        <section className="popular-services-section">
          <div className="container-wrapper">
            <div className="section-header-modern">
              <div>
                <span className="section-sub-badge">Most Requested</span>
                <h2 className="section-title">Popular On-Demand Services</h2>
              </div>
              <button 
                className="btn-secondary-glass"
                onClick={() => navigate("/services")}
              >
                View All Services →
              </button>
            </div>

            <div className="services-grid">
              {services.map((service, index) => (
                <div className="service-card-modern" key={index}>
                  
                  {/* Top Badge */}
                  <div className="service-card-header">
                    <div className="service-icon-box">
                      <span className="service-main-icon">{service.icon}</span>
                    </div>
                    <div className="service-badge-tag">
                      <span>★ {service.rating}</span>
                      <span className="service-bookings-text">({service.bookings})</span>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="service-info-area">
                    <div className="service-text-group">
                      <h4 className="service-name">{service.name}</h4>
                      <p className="service-desc">{service.desc}</p>
                    </div>

                    <div className="service-footer-area">
                      <div className="service-price-box">
                        <span className="price-label">Starts at</span>
                        <span className="price-value">{service.price}</span>
                      </div>
                      
                      <button 
                        className="enquire-now-btn"
                        onClick={() => handleEnquire(service)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Helper / Trust Badges */}
        <section className="trust-badges-section">
          <div className="container-wrapper">
            <div className="trust-grid">
              {highlights.map((item, idx) => (
                <div className="trust-card" key={idx}>
                  <div className="trust-icon-box">{item.icon}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Quick Service Inquiry Modal */}
      {selectedService && (
        <div className="inquiry-modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="inquiry-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="inquiry-modal-close" onClick={() => setSelectedService(null)}>✕</button>

            {enquirySuccess ? (
              <div className="inquiry-success-box animate-fade-in">
                <span className="success-icon">🎉</span>
                <h3>Booking Request Received!</h3>
                <p>Our expert for <strong>{selectedService.name}</strong> will contact you within 15 minutes.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit}>
                <div className="inquiry-header">
                  <span className="inquiry-service-icon">{selectedService.icon}</span>
                  <div>
                    <h3>Book {selectedService.name}</h3>
                    <p>Estimated starts at {selectedService.price} • Verified Pro</p>
                  </div>
                </div>

                <div className="inquiry-input-group">
                  <label>Mobile Number for Instant Confirmation</label>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    maxLength={10}
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" className="btn-primary-glow" style={{ width: "100%", marginTop: "16px" }}>
                  Confirm Booking Request ⚡
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;