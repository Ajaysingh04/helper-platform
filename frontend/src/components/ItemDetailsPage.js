import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { realData, categoryItemsRegistry } from "./CategoryPage";
import "../css/ItemDetailsPage.css";

function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [reviewsList, setReviewsList] = useState([
    { author: "Vikram Sharma", rating: 5, date: "2 days ago", comment: "Outstanding service! Arrived exactly on time and fixed our issue within 30 minutes. Extremely professional." },
    { author: "Pooja Patel", rating: 5, date: "1 week ago", comment: "Very polite, fair pricing, and clean work. Highly recommended for any household help!" },
    { author: "Ankit Verma", rating: 4, date: "2 weeks ago", comment: "Great experience overall. Clear communication and hassle-free booking." }
  ]);
  const [newReview, setNewReview] = useState({ author: "", rating: 5, comment: "" });
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const registryItem = categoryItemsRegistry.get(String(id));
    const foundItem = registryItem || realData.find((data) => data.id === parseInt(id));
    if (foundItem) {
      setItem(foundItem);
    } else {
      setItem({
        id: id,
        name: "Supreme Certified Professional",
        distance: "1.2 km",
        price: "₹349 onwards",
        facilities: ["24/7 Rapid Support", "Background Verified", "Safety Insured", "Digital Billing"],
        contact: "+91 98765 00000",
        rating: 4.9,
        reviews: 240,
        address: "Block 12, Express Avenue, Metro District",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200",
      });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (!item) return <div className="details-loading-state">Loading provider details...</div>;

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (phoneInput.length >= 10) {
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setNameInput("");
        setPhoneInput("");
        setNotesInput("");
      }, 3500);
    } else {
      alert("Please enter a valid mobile number");
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (newReview.author && newReview.comment) {
      setReviewsList([
        {
          author: newReview.author,
          rating: Number(newReview.rating),
          date: "Just now",
          comment: newReview.comment
        },
        ...reviewsList
      ]);
      setReviewSuccess(true);
      setNewReview({ author: "", rating: 5, comment: "" });
      setTimeout(() => setReviewSuccess(false), 3000);
    }
  };

  return (
    <div className="details-page-wrapper">
      <div className="container-wrapper">
        
        {/* Navigation Bar */}
        <div className="details-top-nav">
          <button className="category-back-btn" onClick={() => navigate(-1)}>
            <span>←</span>
            <span>Back to Directory</span>
          </button>
          <div className="details-breadcrumbs">
            <span>Home</span> / <span>Services</span> / <strong style={{ color: "var(--primary)" }}>{item.name}</strong>
          </div>
        </div>

        {/* Hero Section */}
        <div className="details-hero-card">
          <div className="details-hero-image-box">
            <img src={item.image} alt={item.name} className="details-hero-img" />
            <div className="details-hero-gradient"></div>
            
            <div className="details-hero-floating-info">
              <div className="hero-badge-group">
                <span className="verified-badge-pill">🛡️ Verified Partner</span>
                <span className="open-status-pill">🟢 Open Today</span>
              </div>
              <h1 className="hero-provider-title">{item.name}</h1>
              <div className="hero-provider-meta">
                <span className="meta-star">⭐ {item.rating || 4.8} ({item.reviews || 150}+ Verified Reviews)</span>
                <span className="meta-dot">•</span>
                <span className="meta-loc">📍 {item.distance} away</span>
                <span className="meta-dot">•</span>
                <span className="meta-price">🏷️ {item.price || "₹299 onwards"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout: Main Details + Sticky Booking Card */}
        <div className="details-layout-grid">
          
          {/* Main Info Area */}
          <div className="details-main-column">
            
            {/* Navigation Tabs */}
            <div className="details-tab-nav">
              <button 
                className={`tab-item-btn ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview & Facilities
              </button>
              <button 
                className={`tab-item-btn ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                Customer Reviews ({reviewsList.length})
              </button>
              <button 
                className={`tab-item-btn ${activeTab === "gallery" ? "active" : ""}`}
                onClick={() => setActiveTab("gallery")}
              >
                Photo Gallery
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="tab-pane animate-fade-in">
                
                <section className="details-section-card">
                  <h3 className="section-subtitle">About {item.name}</h3>
                  <p className="details-body-text">
                    Welcome to <strong>{item.name}</strong>, where precision meets excellence. With years of recognized domain expertise, our certified professionals deliver timely, dependable, and high-standard services. Every team member goes through a stringent vetting and background check process to ensure your safety and utmost peace of mind.
                  </p>
                  <p className="details-body-text">
                    We maintain strict hygiene, transparent pricing without hidden surcharges, and a 100% satisfaction guarantee with dedicated re-service warranty protection.
                  </p>
                </section>

                <section className="details-section-card">
                  <h3 className="section-subtitle">Features & Amenities</h3>
                  <div className="facilities-chips-grid">
                    {item.facilities.map((fac, idx) => (
                      <div key={idx} className="facility-card-item">
                        <span className="facility-check-icon">✓</span>
                        <div className="facility-text">
                          <strong>{fac}</strong>
                          <span>Verified standard</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="details-section-card">
                  <h3 className="section-subtitle">Service Guarantees</h3>
                  <div className="guarantees-grid">
                    <div className="guarantee-box">
                      <span className="g-icon">⏱️</span>
                      <h4>On-Time Arrival</h4>
                      <p>Guaranteed 30-min window or get flat ₹50 cash credit</p>
                    </div>
                    <div className="guarantee-box">
                      <span className="g-icon">🛡️</span>
                      <h4>Insurance Cover</h4>
                      <p>Full protection up to ₹10,000 for any accidental damages</p>
                    </div>
                    <div className="guarantee-box">
                      <span className="g-icon">💳</span>
                      <h4>Secure Digital Pay</h4>
                      <p>Pay safely after service completion via UPI / Cards</p>
                    </div>
                  </div>
                </section>

              </div>
            )}

            {/* Tab 2: Reviews */}
            {activeTab === "reviews" && (
              <div className="tab-pane animate-fade-in">
                
                {/* Leave a Review Form */}
                <div className="details-section-card">
                  <h3 className="section-subtitle">Write a Review</h3>
                  {reviewSuccess ? (
                    <div className="review-success-msg">
                      🎉 Thank you! Your review has been added.
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="add-review-form">
                      <div className="form-row-dual">
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={newReview.author}
                          onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                          required
                        />
                        <select
                          value={newReview.rating}
                          onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                        >
                          <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                          <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                          <option value="3">⭐⭐⭐ (3 - Average)</option>
                        </select>
                      </div>
                      <textarea
                        placeholder="Share details of your experience..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        required
                      ></textarea>
                      <button type="submit" className="btn-primary-glow" style={{ alignSelf: "flex-start" }}>
                        Submit Review
                      </button>
                    </form>
                  )}
                </div>

                {/* Reviews List */}
                <div className="reviews-list-container">
                  {reviewsList.map((rev, index) => (
                    <div className="review-item-card" key={index}>
                      <div className="review-header">
                        <div className="review-author-avatar">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <h4 className="review-author-name">{rev.author}</h4>
                          <span className="review-date">{rev.date}</span>
                        </div>
                        <div className="review-stars">
                          {"⭐".repeat(rev.rating)}
                        </div>
                      </div>
                      <p className="review-comment">{rev.comment}</p>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Tab 3: Gallery */}
            {activeTab === "gallery" && (
              <div className="tab-pane animate-fade-in">
                <div className="details-section-card">
                  <h3 className="section-subtitle">Work & Facility Gallery</h3>
                  <div className="gallery-showcase-grid">
                    <img src={item.image} alt="Showcase 1" className="gallery-img" />
                    <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600" alt="Showcase 2" className="gallery-img" />
                    <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=600" alt="Showcase 3" className="gallery-img" />
                    <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600" alt="Showcase 4" className="gallery-img" />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Sticky Sidebar Action Card */}
          <div className="details-sidebar-column">
            <div className="sticky-booking-card">
              
              <div className="booking-card-top">
                <span className="price-title">Estimated Cost</span>
                <div className="booking-price-val">{item.price || "₹299 onwards"}</div>
                <span className="tax-notice">Includes service warranty & verified tools</span>
              </div>

              {bookingSuccess ? (
                <div className="booking-success-alert animate-fade-in">
                  <span className="success-icon-large">✅</span>
                  <h3>Booking Confirmed!</h3>
                  <p>Our expert from <strong>{item.name}</strong> will reach out on your phone shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="quick-booking-form">
                  <div className="form-group-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-field">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      maxLength={10}
                      required
                    />
                  </div>

                  <div className="form-group-field">
                    <label>Special Instructions / Problem (Optional)</label>
                    <textarea
                      placeholder="e.g. Please bring extra spare wires..."
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      rows={2}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-primary-glow booking-submit-btn">
                    <span>Book Appointment Now</span>
                    <span>⚡</span>
                  </button>
                </form>
              )}

              {/* Contact direct hotline */}
              <div className="sidebar-hotline-box">
                <div className="hotline-icon">📞</div>
                <div>
                  <span className="hotline-title">Direct Helpline</span>
                  <a href={`tel:${item.contact}`} className="hotline-number">{item.contact}</a>
                </div>
              </div>

              <div className="sidebar-hours-info">
                <p><strong>🕒 Operating Hours:</strong> 8:00 AM – 10:00 PM</p>
                <p><strong>📍 Service Zone:</strong> Up to 15km radius</p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ItemDetailsPage;
