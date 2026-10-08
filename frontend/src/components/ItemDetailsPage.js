import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { realData, categoryItemsRegistry } from "./CategoryPage";
import { getServicemanImage } from "../data/categoryImages";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import "../css/ItemDetailsPage.css";

function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const dataContext = useContext(DataContext);
  const currentUser = authContext?.currentUser;

  const [item, setItem] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [nameInput, setNameInput] = useState(currentUser?.name || "");
  const [phoneInput, setPhoneInput] = useState(currentUser?.phone || "");
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
        image: getServicemanImage(id),
      });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (!item) return <div className="details-loading-state">Loading provider details...</div>;

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    // 1. Login required for bookings
    if (!authContext?.isLoggedIn) {
      alert("⚠️ You must be logged in to book a service. Please sign in to your Customer account to continue.");
      navigate(`/login?role=user&redirect=/details/${id}`);
      return;
    }

    // 2. Only customer (user) accounts can book services
    const isSpecialAccount = 
      authContext?.isAdmin || 
      authContext?.isVendor || 
      authContext?.isWorker || 
      localStorage.getItem("helper_admin_auth") === "true" ||
      Boolean(localStorage.getItem("helper_vendor")) ||
      Boolean(localStorage.getItem("helper_worker")) ||
      ["administrator", "admin", "partner", "vendor", "worker", "technician"].includes(currentUser?.role?.toLowerCase());

    if (isSpecialAccount) {
      alert("⚠️ Only Customer accounts can place bookings. Administrator, Vendor, and Worker accounts are not permitted to book customer services.");
      return;
    }

    if (phoneInput.length >= 10) {
      const bookingCode = `HLP-${Math.floor(10000 + Math.random() * 90000)}`;
      const slotOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const newB = {
        id: bookingCode,
        bookingCode,
        bookingId: bookingCode,
        customerName: nameInput.trim() || currentUser?.name || "Customer",
        name: nameInput.trim() || currentUser?.name || "Customer",
        phone: phoneInput.startsWith("+91") ? phoneInput : `+91 ${phoneInput}`,
        customerPhone: phoneInput.startsWith("+91") ? phoneInput : `+91 ${phoneInput}`,
        service: item.shopName || item.name,
        serviceName: item.shopName || item.name,
        price: item.price || "₹349",
        totalAmount: 349,
        status: "assigned",
        assignedProvider: item.name,
        provider: item.name,
        slotOtp,
        startOtp: slotOtp,
        doorOtp: slotOtp,
        notes: notesInput,
        date: "Just now"
      };

      if (dataContext?.addBooking) {
        dataContext.addBooking(newB);
      }
      try {
        const existing = JSON.parse(localStorage.getItem("helper_user_bookings") || "[]");
        localStorage.setItem("helper_user_bookings", JSON.stringify([newB, ...existing]));
      } catch (err) {}

      setCreatedBooking(newB);
      setBookingSuccess(true);
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
            <img 
              src={item.image || item.avatar || getServicemanImage(item.category || item.name || "")} 
              alt={item.name} 
              className="details-hero-img" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getServicemanImage(item.category || item.name || "");
              }}
            />
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
                <div className="booking-success-alert animate-fade-in" style={{ textAlign: "center", padding: "20px 14px" }}>
                  <span className="success-icon-large">✅</span>
                  <h3 style={{ margin: "6px 0 4px", fontSize: "18px", color: "#10B981" }}>Booking Confirmed!</h3>
                  <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 12px" }}>
                    Our expert from <strong>{item.name}</strong> will reach out shortly.
                  </p>

                  <div style={{ background: "rgba(255, 77, 45, 0.08)", border: "2px solid #FF4D2D", borderRadius: "14px", padding: "14px 10px", margin: "10px 0" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#FF4D2D", textTransform: "uppercase" }}>
                      🔑 Service Start OTP
                    </div>
                    <div style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "5px", color: "#0F172A", margin: "4px 0" }}>
                      {createdBooking?.slotOtp || "3459"}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748B" }}>
                      Share this OTP with technician at your doorstep
                    </div>
                  </div>

                  <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px dashed #3B82F6", borderRadius: "10px", padding: "8px 10px", margin: "8px 0 14px", fontSize: "11.5px", color: "#1E3A8A" }}>
                    💡 <strong>Saved in Profile:</strong> This OTP is permanently saved in your <strong>Profile &gt; My Bookings</strong> section.
                  </div>

                  <button
                    type="button"
                    className="btn-primary-glow"
                    style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: 700 }}
                    onClick={() => navigate("/my-bookings")}
                  >
                    📋 Go to My Bookings &amp; OTP
                  </button>
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
