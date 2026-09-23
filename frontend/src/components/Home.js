import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";
import LoginModal from "./LoginModal";
import { DataContext } from "../context/DataContext";
import { popularCategories } from "../data/popularCategoriesData";
import { initialOffers } from "../data/offersData";
import LiveTrackingModal from "./LiveTrackingModal";
import { API_BASE } from "../apiConfig";

function Home() {
  const dataContext = useContext(DataContext);
  const addBooking = dataContext?.addBooking;

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [activeLiveBooking, setActiveLiveBooking] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code) => {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
    } catch (e) {}
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const offersList = (dataContext?.offers && dataContext.offers.length > 0)
    ? dataContext.offers
    : (dataContext?.slides && dataContext.slides.length > 0 ? dataContext.slides : initialOffers);

  const activeOffers = (offersList || []).filter((o) => o.active !== false);

  // Dynamic Hero Banners - Auto-slide home 1, 2, 3, 4 every 2 seconds
  const defaultHeroSlides = [
    { id: "slide-1", image: "/images/homepage_1.jpg", title: "Quality House Painting" },
    { id: "slide-2", image: "/images/homepage_2.jpg", title: "Expert Plumbing Repairs" },
    { id: "slide-3", image: "/images/homepage_3.jpg", title: "Certified Electricians" },
    { id: "slide-4", image: "/images/homepage_4.jpg", title: "Professional Cleaning Services" }
  ];

  const heroBanners = dataContext?.heroBanners || [];
  const activeBanners = heroBanners.filter((b) => b.active !== false && !b.image?.includes("helper_full_banner"));
  const heroSlides = (activeBanners.length >= 4) ? activeBanners : defaultHeroSlides;

  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  // 2-Second Auto-Slide Interval
  useEffect(() => {
    if (heroSlides.length <= 1 || isHeroPaused) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [heroSlides.length, isHeroPaused]);

  // 3D Parallax Scroll Tracking
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY || window.pageYOffset || 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Popular Services & Categories Filter States
  const [homeCatFilter, setHomeCatFilter] = useState("All");
  const [homeCatSearch, setHomeCatSearch] = useState("");

  const categoriesList = (dataContext?.categories && dataContext.categories.length > 0)
    ? dataContext.categories
    : popularCategories;

  const filteredHomeCategories = (categoriesList || []).filter((cat) => {
    const matchFilter =
      homeCatFilter === "All" ||
      (cat.group && cat.group.toLowerCase().includes(homeCatFilter.toLowerCase())) ||
      (cat.tag && cat.tag.toLowerCase().includes(homeCatFilter.toLowerCase()));
    const matchSearch =
      !homeCatSearch ||
      cat.name.toLowerCase().includes(homeCatSearch.toLowerCase()) ||
      (cat.tag && cat.tag.toLowerCase().includes(homeCatSearch.toLowerCase())) ||
      (cat.group && cat.group.toLowerCase().includes(homeCatSearch.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const displayedHomeCategories = filteredHomeCategories.slice(0, 16);

  const handleEnquire = (service, provider = null) => {
    setSelectedService(service);
    setSelectedProvider(provider);
    setEnquirySuccess(false);
    setEnquiryPhone("");
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (enquiryPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSubmittingBooking(true);
    const numericPrice = typeof selectedService?.price === "number" 
      ? selectedService.price 
      : parseInt(String(selectedService?.price || "299").replace(/[^\d]/g, "") || "299", 10);

    try {
      // Call Production Express Booking & Dispatch API
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Valued Customer",
          customerPhone: enquiryPhone,
          serviceName: selectedService.name,
          category: selectedService.tag || selectedService.category || "Repairs",
          assignedProviderName: selectedProvider ? selectedProvider.name : undefined,
          customerLocation: {
            type: "Point",
            coordinates: [77.391029, 28.535516] // Sector 62 Noida default
          },
          address: {
            street: "Tower B, Sector 62",
            city: "Noida",
            state: "Uttar Pradesh",
            pincode: "201301"
          },
          servicePrice: numericPrice,
          paymentMethod: "cash_after_service",
          isEmergency: false
        })
      });

      const json = await res.json();

      if (json.success && (json.data || json.booking)) {
        const bData = json.data || json.booking;
        const fullBooking = {
          ...bData,
          startOtp: json.startOtp || "3459",
          serviceName: selectedService.name,
          assignedProvider: selectedProvider ? {
            name: selectedProvider.name,
            phone: selectedProvider.contact,
            rating: selectedProvider.rating,
            photo: selectedProvider.image
          } : (bData.assignedProvider || {
            name: "Ramesh Sharma",
            phone: "+91 98765 43210",
            rating: 4.9,
            photo: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200"
          })
        };

        if (addBooking) {
          addBooking({
            id: fullBooking.bookingId || fullBooking._id,
            name: "Customer",
            phone: enquiryPhone,
            service: selectedService.name,
            price: `₹${numericPrice}`,
            address: "Sector 62, Noida",
            status: "Pending",
            provider: selectedProvider ? selectedProvider.name : "Auto-Dispatched Pro"
          });
        }

        setSelectedService(null);
        setSelectedProvider(null);
        setActiveLiveBooking(fullBooking);
      } else {
        throw new Error(json.message || "Failed to create booking");
      }
    } catch (err) {
      // Fallback local booking
      const fallbackBooking = {
        _id: "BK-" + Date.now().toString().slice(-5),
        bookingId: "HLP-" + Math.floor(10000 + Math.random() * 90000),
        status: "searching_provider",
        serviceName: selectedService.name,
        totalAmount: numericPrice,
        startOtp: "3459",
        assignedProvider: selectedProvider ? {
          name: selectedProvider.name,
          phone: selectedProvider.contact,
          rating: selectedProvider.rating,
          photo: selectedProvider.image
        } : {
          name: "Ramesh Sharma",
          phone: "+91 98765 43210",
          rating: 4.9,
          photo: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200"
        }
      };
      if (addBooking) {
        addBooking({
          id: fallbackBooking.bookingId,
          name: "Customer",
          phone: enquiryPhone,
          service: selectedService.name,
          price: `₹${numericPrice}`,
          address: "Sector 62, Noida",
          status: "Pending",
          provider: selectedProvider ? selectedProvider.name : "Auto-Dispatched Pro"
        });
      }
      setSelectedService(null);
      setSelectedProvider(null);
      setActiveLiveBooking(fallbackBooking);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const servicesCarouselRef = React.useRef(null);

  const scrollServices = (direction) => {
    if (servicesCarouselRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      servicesCarouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const ourServicesList = [
    {
      id: "srv-clean",
      name: "House cleaning",
      subtitle: "Service at your...",
      badge: "New",
      badgeType: "new",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=320",
      path: "/category/cleaning"
    },
    {
      id: "srv-elec",
      name: "Electrician",
      subtitle: "Service at your...",
      badge: null,
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=320",
      path: "/category/electricians"
    },
    {
      id: "srv-plumb",
      name: "Plumbing Fix",
      subtitle: "Service at your...",
      badge: null,
      image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=320",
      path: "/category/plumbers"
    },
    {
      id: "srv-veg",
      name: "Vegetables",
      subtitle: "Service at your...",
      badge: null,
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=320",
      path: "/category/grocery-stores"
    },
    {
      id: "srv-salon",
      name: "Salon",
      subtitle: "Service at your...",
      badge: "New",
      badgeType: "new",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=320",
      path: "/category/beauty-parlours"
    },
    {
      id: "srv-teach",
      name: "Teaching",
      subtitle: "Service at your...",
      badge: "Sale",
      badgeType: "sale",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=320",
      path: "/category/schools"
    },
    {
      id: "srv-repair",
      name: "Repairing",
      subtitle: "Service at your...",
      badge: null,
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=320",
      path: "/category/repairs"
    },
    {
      id: "srv-fixed",
      name: "Fixed Price Cat...",
      subtitle: "Service at your...",
      badge: null,
      image: "https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&q=80&w=320",
      path: "/category/cleaning"
    }
  ];

  return (
    <div className="nexora-home-wrapper">
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* =========================================================================
          HERO SECTION: 2-Second Crystal Clear Image Carousel (Pinned under Header)
          ========================================================================= */}
      <section 
        className="helper-hero-slider-wrap"
        style={{
          transform: `scale(${Math.max(0.93, 1 - scrollY * 0.00025)})`,
          filter: `brightness(${Math.max(0.85, 1 - scrollY * 0.0005)})`
        }}
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
      >
        <div className="helper-hero-slider">
          {heroSlides.map((slide, idx) => (
            <div 
              key={slide.id || idx} 
              className={`hero-slide-item ${idx === heroIndex ? "active" : ""}`}
            >
              <img 
                src={slide.image || `/images/homepage_${(idx % 4) + 1}.jpg`} 
                alt={slide.title || `Home Banner ${idx + 1}`}
                className="hero-slide-img"
                loading={idx === 0 ? "eager" : "lazy"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `/images/homepage_${(idx % 4) + 1}.jpg`;
                }}
              />
            </div>
          ))}

          {/* 2-Second Slider Controls & Indicator Dots */}
          {heroSlides.length > 1 && (
            <div className="hero-slider-nav-controls">
              <button
                type="button"
                className="hero-slider-arrow prev"
                onClick={() => setHeroIndex((prev) => (prev > 0 ? prev - 1 : heroSlides.length - 1))}
                title="Previous Slide"
              >
                ‹
              </button>
              <div className="hero-slider-dots">
                {heroSlides.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`hero-slider-dot ${i === heroIndex ? "active" : ""}`}
                    onClick={() => setHeroIndex(i)}
                    title={`Slide ${i + 1}`}
                  >
                    <span>{i + 1}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="hero-slider-arrow next"
                onClick={() => setHeroIndex((prev) => (prev < heroSlides.length - 1 ? prev + 1 : 0))}
                title="Next Slide"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          3D STACKING SHEET: Slides Up and Layers OVER the Hero Section
          ========================================================================= */}
      <div className="home-3d-stack-sheet">
        {/* Subtle 3D Card Pill Handle */}
        <div className="sheet-3d-handle-bar">
          <div className="sheet-3d-pill" />
        </div>

        {/* Clean Search Bar Strip (Now Inside the 3D Stacking Layer) */}
        <div className="hero-bottom-search-strip">
          <div className="container-wrapper">
            <div className="hero-search-strip-inner">
              <form 
                className="hero-search-wrapper" 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (homeCatSearch.trim()) {
                    const element = document.getElementById("popular-service-categories");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <span className="hero-search-icon">🔍</span>
                <input
                  type="text"
                  className="hero-search-input"
                  placeholder="Search 'AC Repair', 'Electrician', 'Plumber', 'Cleaning'..."
                  value={homeCatSearch}
                  onChange={(e) => setHomeCatSearch(e.target.value)}
                />
                <button type="submit" className="hero-search-btn">
                  <span>Find Service ➔</span>
                </button>
              </form>

              {/* Quick Tags */}
              <div className="hero-quick-tags">
                <span className="quick-tags-label">Popular:</span>
                <div className="quick-tags-list">
                  <Link to="/category/ac-repair-services" className="quick-service-chip">
                    <span>❄️ AC Repair</span>
                  </Link>
                  <Link to="/category/electricians" className="quick-service-chip">
                    <span>⚡ Electrician</span>
                  </Link>
                  <Link to="/category/plumbers" className="quick-service-chip">
                    <span>🚰 Plumber</span>
                  </Link>
                  <Link to="/category/beauty-parlours" className="quick-service-chip">
                    <span>💇‍♀️ Salon & Spa</span>
                  </Link>
                  <Link to="/category/cleaning" className="quick-service-chip">
                    <span>🧹 Deep Cleaning</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* =========================================================================
          SECTION 1: OUR SERVICES
          ========================================================================= */}
      <section className="nexora-content-section">
        <div className="nexora-section-container">
          
          <div className="nexora-section-header">
            <h2 className="nexora-section-title">Our Services</h2>
            <div className="carousel-nav-arrows">
              <button 
                type="button" 
                className="carousel-arrow-btn" 
                onClick={() => scrollServices("left")}
                aria-label="Scroll left"
              >
                ‹
              </button>
              <button 
                type="button" 
                className="carousel-arrow-btn" 
                onClick={() => scrollServices("right")}
                aria-label="Scroll right"
              >
                ›
              </button>
            </div>
          </div>

          <div className="nexora-services-scroll-track" ref={servicesCarouselRef}>
            {ourServicesList.map((service) => (
              <div 
                className="nexora-service-card" 
                key={service.id}
                onClick={() => handleEnquire({ name: service.name, price: 249, tag: "Repairs" })}
                style={{ cursor: "pointer" }}
                title={`Instant Book ${service.name}`}
              >
                <div className="card-thumb-wrapper">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="card-thumb-img"
                    loading="lazy"
                  />
                  {service.badge && (
                    <span className={`service-pill-badge badge-${service.badgeType || "new"}`}>
                      {service.badge}
                    </span>
                  )}
                </div>
                <div className="card-info">
                  <h4 className="service-name">{service.name}</h4>
                  <p className="service-subtext">{service.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: OFFERS FOR YOU (Dynamic Offers & Promo Deals)
          ========================================================================= */}
      <section className="nexora-content-section" id="offers-for-you-section">
        <div className="nexora-section-container">
          
          <div className="nexora-section-header" style={{ alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div className="pill-tag-coral" style={{ background: "rgba(255, 77, 45, 0.12)", borderColor: "rgba(255, 77, 45, 0.35)", color: "#FF4D2D", display: "inline-flex", marginBottom: "8px" }}>
                <span>🔥 EXCLUSIVE SAVINGS & DEALS</span>
              </div>
              <h2 className="nexora-section-title" style={{ margin: 0 }}>Offers For You</h2>
              <p style={{ margin: "6px 0 0", color: "#64748B", fontSize: "14px" }}>
                Verified instant discounts, seasonal service combos & doorstep cashbacks.
              </p>
            </div>
            {copiedCode && (
              <div className="copied-toast-banner animate-fade-in">
                <span>✨ Coupon <strong>"{copiedCode}"</strong> copied to clipboard!</span>
              </div>
            )}
          </div>

          <div className="nexora-offers-grid">
            {activeOffers.map((offer) => {
              const isImageBanner = Boolean(offer.image);
              const chips = offer.chips || (offer.subtitle ? [offer.subtitle] : []);
              
              return (
                <div 
                  key={offer.id || offer._id} 
                  className={`offer-banner-card ${isImageBanner ? "has-bg-image" : "has-gradient-bg"}`}
                  style={{
                    background: offer.bgGradient || "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)",
                  }}
                >
                  {isImageBanner && (
                    <img 
                      src={offer.image} 
                      alt={offer.title} 
                      className="banner-bg-img"
                      loading="lazy"
                    />
                  )}

                  <div className="banner-overlay-scrim" />
                  
                  <div className="dynamic-offer-content">
                    {/* Top Row: Tag / Badge & Discount Pill */}
                    <div className="offer-header-row">
                      <span className="banner-badge-top">
                        {offer.badge || offer.tag || "🔥 SPECIAL OFFER"}
                      </span>
                      {offer.discount && (
                        <span className="offer-discount-pill">
                          {offer.discount}
                        </span>
                      )}
                    </div>

                    {/* Offer Title & Subtitle */}
                    <div className="offer-body-main">
                      <h3 className="offer-main-title">
                        {offer.icon ? `${offer.icon} ` : ""}{offer.title}
                      </h3>
                      <p className="offer-desc-text">
                        {offer.desc || offer.subtitle}
                      </p>

                      {/* Feature Chips */}
                      {chips && chips.length > 0 && (
                        <div className="banner-services-montage">
                          {chips.slice(0, 5).map((chip, idx) => (
                            <span key={idx} className="montage-chip">{chip}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Row: Coupon Code + Button */}
                    <div className="offer-footer-action">
                      {offer.code && (
                        <button 
                          type="button" 
                          className={`coupon-code-pill ${copiedCode === offer.code ? "copied" : ""}`}
                          onClick={() => handleCopyCode(offer.code)}
                          title="Click to copy coupon code"
                        >
                          <span className="coupon-label">CODE:</span>
                          <span className="coupon-val">{offer.code}</span>
                          <span className="coupon-copy-icon">
                            {copiedCode === offer.code ? "✓ Copied!" : "📋 Copy"}
                          </span>
                        </button>
                      )}

                      <Link 
                        to={offer.actionPath || offer.ctaLink || "/services"} 
                        className="banner-book-now-btn"
                      >
                        {offer.btnText || offer.ctaText || "Claim Offer ➔"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: POPULAR SERVICE CATEGORIES (Our Core On-Demand Services)
          ========================================================================= */}
      <section className="nexora-content-section" id="popular-service-categories">
        <div className="nexora-section-container">
          
          <div className="nexora-section-header" style={{ alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div className="pill-tag-coral" style={{ background: "rgba(255, 77, 45, 0.12)", borderColor: "rgba(255, 77, 45, 0.35)", color: "#FF4D2D", display: "inline-flex", marginBottom: "8px" }}>
                <span>🔥 ON-DEMAND SERVICE DIRECTORY</span>
              </div>
              <h2 className="nexora-section-title" style={{ margin: 0 }}>Popular Service Categories</h2>
              <p style={{ margin: "6px 0 0", color: "#64748B", fontSize: "14.5px" }}>
                Browse verified local technicians, home repairs, salons, clinics & daily service pros.
              </p>
            </div>

            <Link 
              to="/categories" 
              className="pop-cat-expand-btn" 
              style={{ textDecoration: "none", padding: "10px 22px", fontSize: "13.5px" }}
            >
              <span>View All 85+ Categories ➔</span>
            </Link>
          </div>

          {/* Search & Category Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", marginTop: "20px", marginBottom: "18px" }}>
            <div className="pop-cat-tabs-row" style={{ margin: 0, paddingBottom: 0 }}>
              {[
                { label: "🌟 All Services", val: "All" },
                { label: "⚡ Home & Repairs", val: "Home & Repairs" },
                { label: "💇‍♀️ Spa & Wellness", val: "Spa & Wellness" },
                { label: "🩺 Healthcare", val: "Healthcare" },
                { label: "🚖 Transport & Logistics", val: "Travel & Transport" }
              ].map((tab) => (
                <button
                  key={tab.val}
                  type="button"
                  className={`pop-tab-pill ${homeCatFilter === tab.val ? "active" : ""}`}
                  onClick={() => setHomeCatFilter(tab.val)}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Search Input */}
            <div className="pop-cat-search-box" style={{ maxWidth: "320px", padding: "8px 16px", margin: 0 }}>
              <span style={{ fontSize: "15px" }}>🔎</span>
              <input
                type="text"
                placeholder="Search services (AC, Plumber, Salon)..."
                value={homeCatSearch}
                onChange={(e) => setHomeCatSearch(e.target.value)}
                style={{ fontSize: "13px" }}
              />
              {homeCatSearch && (
                <button type="button" className="clear-btn" onClick={() => setHomeCatSearch("")}>✕</button>
              )}
            </div>
          </div>

          {/* 4-Column 3D Interactive Category Grid */}
          <div className="pop-categories-grid">
            {displayedHomeCategories.map((cat, idx) => (
              <Link
                key={cat.id || cat.path || idx}
                to={`/category/${cat.path || cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="pop-cat-card"
                title={`Book verified ${cat.name} service`}
              >
                <div className="pop-cat-card-left">
                  <div className="pop-cat-icon-badge">
                    {cat.icon || "⚡"}
                  </div>
                  <div className="pop-cat-text-info">
                    <h4 className="pop-cat-name">{cat.name}</h4>
                    <div className="pop-cat-meta">
                      <span>{cat.count || "Verified Pros"}</span>
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

          {/* Empty search state fallback */}
          {displayedHomeCategories.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <span style={{ fontSize: "36px" }}>🔍</span>
              <p style={{ color: "#64748B", marginTop: "10px" }}>No categories matching "{homeCatSearch}".</p>
              <button 
                type="button" 
                className="pop-tab-pill active" 
                onClick={() => { setHomeCatSearch(""); setHomeCatFilter("All"); }}
                style={{ margin: "10px auto 0" }}
              >
                Reset Search Filters
              </button>
            </div>
          )}

          {/* Bottom Callout & Direct Link to All Categories */}
          <div className="pop-cat-expand-wrap" style={{ marginTop: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <Link to="/categories" className="pop-cat-expand-btn" style={{ textDecoration: "none" }}>
              <span>Browse Complete Directory (85+ Categories) ➔</span>
            </Link>
            <span style={{ fontSize: "12.5px", color: "#94A3B8" }}>
              🛡️ All technicians background checked & covered with 30-day revisit warranty
            </span>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: DUAL METRICS & APP DOWNLOAD SECTION
          ========================================================================= */}
      <section className="nexora-content-section nexora-dual-section">
        <div className="nexora-section-container">
          
          <div className="nexora-dual-grid">
            
            {/* Left Card: Royal Blue Metrics Card */}
            <div className="nexora-metrics-card">
              <div className="metric-stat-item">
                <div className="stat-icon-circle">👥</div>
                <h3 className="stat-number">10K+</h3>
                <p className="stat-label">HAPPY CUSTOMERS</p>
              </div>

              <div className="metric-stat-item">
                <div className="stat-icon-circle">🛍️</div>
                <h3 className="stat-number">25K+</h3>
                <p className="stat-label">ORDERS DELIVERED</p>
              </div>

              <div className="metric-stat-item">
                <div className="stat-icon-circle">🛵</div>
                <h3 className="stat-number">500+</h3>
                <p className="stat-label">SERVICE PARTNERS</p>
              </div>

              <div className="metric-stat-item">
                <div className="stat-icon-circle">⏱️</div>
                <h3 className="stat-number">99%</h3>
                <p className="stat-label">ON-TIME DELIVERY</p>
              </div>
            </div>

            {/* Right Card: Clean White App Download Card */}
            <div className="nexora-app-card">
              <div className="app-card-left">
                <h3 className="app-card-title">Download the Helper GO App</h3>
                <p className="app-card-desc">
                  Better experience, exclusive offers & faster everything. Scan to download or use the stores.
                </p>
                <div className="app-store-badges-row">
                  <a href="#playstore" className="store-badge-btn" onClick={(e) => e.preventDefault()}>
                    <span className="store-icon">▶</span>
                    <div className="store-btn-text">
                      <span className="store-tiny">GET IT ON</span>
                      <span className="store-main">Google Play</span>
                    </div>
                  </a>
                  <a href="#appstore" className="store-badge-btn" onClick={(e) => e.preventDefault()}>
                    <span className="store-icon"></span>
                    <div className="store-btn-text">
                      <span className="store-tiny">DOWNLOAD ON THE</span>
                      <span className="store-main">App Store</span>
                    </div>
                  </a>
                </div>
              </div>

              <div className="app-card-right">
                <div className="phone-screen-mockup">
                  <div className="phone-notch"></div>
                  <div className="phone-content-inner">
                    <div className="phone-mini-header">
                      <span className="mini-brand">HELPER GO</span>
                      <span className="mini-cart">🛒</span>
                    </div>
                    <div className="phone-mini-banner">
                      <span>⚡ Superfast 15-min dispatch</span>
                    </div>
                    <div className="phone-mini-grid">
                      <div className="mini-box">🧹</div>
                      <div className="mini-box">⚡</div>
                      <div className="mini-box">🚰</div>
                      <div className="mini-box">🥦</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>



      {/* =========================================================================
          QUICK BOOKING MODAL
          ========================================================================= */}
      {selectedService && (
        <div className="booking-modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="booking-modal-box animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedService(null)}>✕</button>

            {enquirySuccess ? (
              <div className="modal-success-state">
                <div className="success-icon">✅</div>
                <h3>Booking Confirmed!</h3>
                <p>Your request for <strong>{selectedService.name}</strong> has been confirmed successfully.</p>
                {selectedProvider && (
                  <p style={{ marginTop: "6px", fontSize: "14px", color: "var(--beew-coral, #FF4D2D)" }}>
                    Assigned Pro: <strong>{selectedProvider.name}</strong> ({selectedProvider.category})
                  </p>
                )}
                <span className="success-pill">Provider Auto-Dispatched</span>
              </div>
            ) : (
              <div>
                <div className="modal-service-summary">
                  <span className="modal-service-icon">{selectedService.icon || "🛠️"}</span>
                  <div>
                    <h4>{selectedService.name}</h4>
                    <p>Estimated Cost: <strong>{typeof selectedService.price === "number" ? `₹${selectedService.price}` : selectedService.price}</strong></p>
                    {selectedProvider && (
                      <p style={{ fontSize: "13px", color: "var(--beew-coral, #FF4D2D)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>⚡ Direct Booking:</span>
                        <strong>{selectedProvider.name}</strong>
                        <span>(⭐ {selectedProvider.rating || "4.9"})</span>
                      </p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleEnquirySubmit} className="modal-quick-form">
                  <label>Enter Mobile Number for Instant Booking</label>
                  <div className="phone-input-wrap">
                    <span className="phone-prefix">+91</span>
                    <input 
                      type="tel"
                      placeholder="98765 43210"
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      required
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn-coral" 
                    style={{ width: "100%", marginTop: "16px" }}
                    disabled={isSubmittingBooking}
                  >
                    {isSubmittingBooking ? "Dispatching Pro... ⏳" : "Confirm & Dispatch Pro ⚡"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}



      {/* =========================================================================
          LIVE TRACKING MODAL & FLOATING RADAR STATUS
          ========================================================================= */}
      {activeLiveBooking && (
        <LiveTrackingModal 
          booking={activeLiveBooking} 
          onClose={() => setActiveLiveBooking(null)} 
        />
      )}

      {/* Floating Active Booking Tracker Banner if modal closed */}
      {activeLiveBooking && (
        <div 
          onClick={() => setActiveLiveBooking(activeLiveBooking)}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "rgba(15, 23, 42, 0.92)",
            border: "1px solid rgba(255, 77, 45, 0.4)",
            borderRadius: "100px",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
            zIndex: 998,
            backdropFilter: "blur(12px)"
          }}
        >
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981", animation: "pulse 1.5s infinite" }}></span>
          <span style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: 600, fontFamily: "Space Grotesk, sans-serif" }}>
            Live Dispatch: {activeLiveBooking.bookingId || "Active"} (OTP: {activeLiveBooking.startOtp || "3459"})
          </span>
          <span style={{ color: "#FF4D2D", fontSize: "13px", fontWeight: 700 }}>Track 📡</span>
        </div>
      )}

      {/* End of 3D Stacking Layer */}
      </div>
    </div>
  );
}

export default Home;