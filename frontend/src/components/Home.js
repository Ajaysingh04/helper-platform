import React, { useState, useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";
import LoginModal from "./LoginModal";
import { DataContext } from "../context/DataContext";
import { popularCategories } from "../data/popularCategoriesData";
import { initialOffers } from "../data/offersData";
import { getServicemanImage } from "../data/categoryImages";
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

  // Next Page Overlapping Sheet Ref & Smooth Scroll Handler
  const nextSectionRef = useRef(null);

  const handleScrollToNextPage = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (nextSectionRef.current) {
      nextSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const secondPage = document.getElementById("home-second-page") || document.getElementById("our-services-section");
      if (secondPage) {
        secondPage.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({
          top: window.innerHeight - 76,
          behavior: "smooth"
        });
      }
    }
  };

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

  // Dynamic Hero Banners - Auto-slide home banners with animated cinematic feel
  const defaultHeroSlides = [
    {
      id: "slide-experts",
      image: "/images/homepage_5_wide.jpg",
      mobileImage: "/images/homepage_5.jpg",
      title: "All Verified Experts.",
      highlight: "One Trusted Platform.",
      subtitle: "Over 100+ on-demand home, technical, medical & emergency services delivered in 15 mins by police-verified professionals.",
      badge: "🛡️ 50,000+ POLICE-VERIFIED SPECIALISTS",
      ctaText: "Find Your Expert",
      ctaLink: "/services",
      perk1: "* 100% Police-verified & certified specialists",
      perk2: "* Upfront pricing with 30-day rework warranty",
      perk3: "* 15-min arrival with live GPS tracking"
    },
    {
      id: "slide-cleaning",
      image: "/images/pinterest_clean_widescreen.jpg",
      title: "Clean Space",
      highlight: "Starts Here.",
      subtitle: "Professional cleaning services for offices, homes, and commercial spaces — done right, every time.",
      badge: "⭐ TRUSTED BY 10,000+ HOMES & BUSINESSES",
      ctaText: "Book Cleaning Pro",
      ctaLink: "/category/cleaning",
      perk1: "* 100% Police-verified & certified master cleaners",
      perk2: "* Upfront pricing with 30-day quality warranty",
      perk3: "* 15-min arrival with live GPS tracking"
    },
    {
      id: "slide-1",
      image: "/images/homepage_1.jpg",
      title: "Everything Your Home Needs.",
      highlight: "Delivered In 15 Mins.",
      subtitle: "Book verified electricians, plumbers, cleaning experts & painters with guaranteed upfront rates and 30-day warranty.",
      badge: "⚡ #1 ON-DEMAND HOME SERVICE PLATFORM",
      ctaText: "Book Service Now",
      ctaLink: "/services",
      perk1: "* 15-min arrival with live GPS tracking",
      perk2: "* 100% verified police-checked experts",
      perk3: "* Upfront rates with 30-day warranty"
    },
    {
      id: "slide-2",
      image: "/images/homepage_2.jpg",
      title: "Certified Electricians & Diagnostics.",
      highlight: "Instant 15-Min Response.",
      subtitle: "Short circuit repair, wiring, switchboards, inverter & fan repairs by background-screened pros.",
      badge: "🛡️ 100% VERIFIED BACKGROUND CHECK",
      ctaText: "Book Electrician",
      ctaLink: "/category/electricians",
      perk1: "* Upfront rates with zero fraud start OTP",
      perk2: "* 30-day free revisit guarantee",
      perk3: "* Certified high-voltage specialists"
    },
    {
      id: "slide-3",
      image: "/images/homepage_plumbing_wide.jpg",
      title: "Expert Plumbing & Sparkle Deep Clean.",
      highlight: "Spotless Clean Guaranteed.",
      subtitle: "Leak repairs, tap fittings, pipe drainage & hospital-grade deep sanitization. Trusted by 25,000+ homes.",
      badge: "✨ 5-STAR HYGIENE & QUALITY GUARANTEE",
      ctaText: "Explore Plumbers",
      ctaLink: "/category/plumbers",
      perk1: "* 100% transparent rate card",
      perk2: "* Certified master plumbers",
      perk3: "* Free inspection on booking"
    },
    {
      id: "slide-4",
      image: "/images/homepage_4.jpg",
      title: "Luxury Home Painting & Renovation.",
      highlight: "Flawless Finish On Time.",
      subtitle: "Premium dust-free painting, waterproof coatings & carpentry by top-rated certified specialists.",
      badge: "🏡 ARCHITECTURAL GRADE WORKMANSHIP",
      ctaText: "Explore Services",
      ctaLink: "/services",
      perk1: "* Free color consultation & 3D preview",
      perk2: "* 5-year anti-peel warranty",
      perk3: "* Laser accurate cost estimation"
    }
  ];

  const heroSettings = dataContext?.heroSettings || {
    slideSpeed: 2500,
    continuousSlide: true,
    showIndicators: false,
    imagePosition: "center top"
  };

  const heroBanners = dataContext?.heroBanners || [];
  const activeBanners = heroBanners.filter((b) => b.active !== false && !b.image?.includes("helper_full_banner"));
  const heroSlides = (activeBanners && activeBanners.length >= 2) 
    ? activeBanners 
    : (heroBanners && heroBanners.length >= 2 ? heroBanners.map(b => ({ ...b, active: true })) : defaultHeroSlides);
  const safeHeroSlides = (heroSlides && heroSlides.length >= 2) ? heroSlides : defaultHeroSlides;

  const [heroIndex, setHeroIndex] = useState(0);

  // Continuous Auto-Slide Interval (slides smoothly and continuously without stopping on hover)
  useEffect(() => {
    if (!safeHeroSlides || safeHeroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % safeHeroSlides.length);
    }, heroSettings.slideSpeed || 2500);
    return () => clearInterval(interval);
  }, [safeHeroSlides, heroSettings.slideSpeed]);

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
          photo: selectedProvider.image || getServicemanImage(selectedService.name)
        } : {
          name: `${selectedService.name} Specialist`,
          phone: "+91 98765 43210",
          rating: 4.9,
          photo: getServicemanImage(selectedService.name)
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
      name: "House Cleaning",
      subtitle: "Full deep sanitization",
      price: "₹399",
      rating: "4.9",
      tag: "Cleaning",
      badge: "Popular",
      badgeType: "new",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=500",
      path: "/category/cleaning"
    },
    {
      id: "srv-elec",
      name: "Electrician",
      subtitle: "15-min instant dispatch",
      price: "₹199",
      rating: "4.9",
      tag: "Repairs",
      badge: "Trending",
      badgeType: "sale",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=500",
      path: "/category/electricians"
    },
    {
      id: "srv-plumb",
      name: "Plumbing Fix",
      subtitle: "Leak repairs & fitting",
      price: "₹249",
      rating: "4.8",
      tag: "Repairs",
      badge: null,
      image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=500",
      path: "/category/plumbers"
    },
    {
      id: "srv-ac",
      name: "AC Repair & Jet",
      subtitle: "Cooling & gas refill",
      price: "₹499",
      rating: "5.0",
      tag: "Appliances",
      badge: "Hot",
      badgeType: "sale",
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=500",
      path: "/category/ac-repair-services"
    },
    {
      id: "srv-paint",
      name: "Wall Painting",
      subtitle: "Dust-free & waterproof",
      price: "₹599",
      rating: "4.9",
      tag: "Home Decor",
      badge: null,
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=500",
      path: "/category/painters"
    },
    {
      id: "srv-salon",
      name: "Salon & Spa",
      subtitle: "Beauty, hair & facial",
      price: "₹299",
      rating: "4.9",
      tag: "Daily Help",
      badge: "New",
      badgeType: "new",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=500",
      path: "/category/beauty-parlours"
    },
    {
      id: "srv-spa-amritam",
      name: "Body Massage & Spa",
      subtitle: "Ayurvedic & Swedish",
      price: "₹302",
      rating: "5.0",
      tag: "Daily Help",
      badge: "₹302/hr",
      badgeType: "new",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=500",
      path: "/category/body-massage-centres"
    },
    {
      id: "srv-carp",
      name: "Carpentry & Locks",
      subtitle: "Furniture & woodwork",
      price: "₹249",
      rating: "4.8",
      tag: "Repairs",
      badge: null,
      image: "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&q=80&w=500",
      path: "/category/carpenters"
    },
    {
      id: "srv-teach",
      name: "Teaching & Tutors",
      subtitle: "Home & online tuition",
      price: "₹350",
      rating: "4.9",
      tag: "Daily Help",
      badge: "Top Rated",
      badgeType: "sale",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=500",
      path: "/category/schools"
    },
    {
      id: "srv-repair",
      name: "Mobile & Gadget Fix",
      subtitle: "Electronics diagnostic",
      price: "₹199",
      rating: "4.7",
      tag: "Appliances",
      badge: null,
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=500",
      path: "/category/mobile-phone-dealers"
    },
    {
      id: "srv-veg",
      name: "Fresh Groceries",
      subtitle: "Daily organic produce",
      price: "₹149",
      rating: "4.8",
      tag: "Daily Help",
      badge: "Express",
      badgeType: "new",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=500",
      path: "/category/grocery-stores"
    }
  ];

  return (
    <div className="nexora-home-wrapper">
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* =========================================================================
          HERO SECTION: 2-Second Crystal Clear Image Carousel (Pinned under Header)
          ========================================================================= */}
      <section className="helper-hero-slider-wrap">
        <div className="helper-hero-slider">
          {/* Full-Width Auto-Slider with Responsive Picture Elements */}
          {safeHeroSlides.map((slide, idx) => (
            <div 
              key={slide.id || idx} 
              className={`hero-slide-item ${idx === heroIndex ? "active" : ""}`}
            >
              <picture className="hero-slide-picture">
                {slide.mobileImage && (
                  <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
                )}
                <img 
                  src={slide.image || `/images/homepage_${(idx % 5) + 1}.jpg`} 
                  alt={slide.title || `Home Banner ${idx + 1}`}
                  className={`hero-slide-img ${idx === heroIndex ? "kenburns-active" : ""}`}
                  style={{
                    objectPosition: (slide.image?.includes("homepage_5") || slide.id?.includes("experts"))
                      ? "right top"
                      : ((heroSettings.imagePosition && heroSettings.imagePosition !== "center 18%" && heroSettings.imagePosition !== "center 20%") 
                        ? heroSettings.imagePosition 
                        : "center top")
                  }}
                  loading={idx === 0 ? "eager" : "lazy"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `/images/homepage_5_wide.jpg`;
                  }}
                />
              </picture>
            </div>
          ))}

          {/* Animated Ambient Sparkles / Light Dust Motes (Floating Clean Air Glow) */}
          <div className="hero-ambient-particles">
            <span className="ambient-sparkle sp-1" />
            <span className="ambient-sparkle sp-2" />
            <span className="ambient-sparkle sp-3" />
            <span className="ambient-sparkle sp-4" />
            <span className="ambient-sparkle sp-5" />
            <span className="ambient-sparkle sp-6" />
          </div>

          {/* Ambient Lighting & Scrim Overlays (Ensures Text is 100% Crisp) */}
          <div className="hero-panoramic-overlay" />
          <div className="hero-ambient-glow-warm" />
          <div className="hero-ambient-glow-cyan" />

          {/* Manual Studio Hero Content Overlay */}
          <div className="container-wrapper hero-panoramic-grid">
            {/* Left Column: Pinterest-Inspired Razor-Sharp Typography & Search */}
            <div className="hero-panoramic-left">
              {/* Top Row: Social Proof Avatars & Live Status Pill (Matching Pinterest Reference) */}
              <div className="hero-top-social-row">
                <div className="hero-social-proof-pill">
                  <span className="social-proof-label">Trusted by 10,000+ happy clients</span>
                  <span className="social-proof-arrow">➔</span>
                  <div className="social-avatars-cluster">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80" alt="Client 1" className="cluster-avatar" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80" alt="Client 2" className="cluster-avatar" />
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80" alt="Client 3" className="cluster-avatar" />
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=80" alt="Client 4" className="cluster-avatar" />
                  </div>
                </div>
                <div className="hero-live-pill">
                  <span className="live-pulse-dot" />
                  <span className="live-pill-city">📍 INDORE & REGION</span>
                </div>
              </div>

              {/* Razor-sharp Typography Headline */}
              <h1 className="hero-studio-headline">
                {heroSlides[heroIndex]?.title || "Clean Space"}<br />
                <span className="hero-gradient-highlight">
                  {heroSlides[heroIndex]?.highlight || "Starts Here."}
                </span>
              </h1>

              <p className="hero-studio-subtitle">
                {heroSlides[heroIndex]?.subtitle || "Professional cleaning services for offices, homes, and commercial spaces — done right, every time."}
              </p>

              {/* Live Interactive Search Bar */}
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
                  placeholder="Search 'Deep Cleaning', 'AC Repair', 'Plumber'..."
                  value={homeCatSearch}
                  onChange={(e) => setHomeCatSearch(e.target.value)}
                />
                <button type="submit" className="hero-search-btn">
                  <span>Find Service ➔</span>
                </button>
              </form>

              {/* Quick Tags */}
              <div className="hero-quick-tags">
                <span className="quick-tags-label">Popular Now:</span>
                <div className="quick-tags-list">
                  <Link to="/category/cleaning" className="quick-service-chip">
                    <span>🧹 Deep Cleaning</span>
                  </Link>
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
                </div>
              </div>

              {/* Primary Hero Action: Find Your Expert / Dynamic Slide CTA */}
              <div className="hero-primary-cta-row">
                <Link to={heroSlides[heroIndex]?.ctaLink || "/services"} className="hero-find-expert-btn">
                  <span className="btn-lightning-glow">⚡</span>
                  <span>{heroSlides[heroIndex]?.ctaText || "Find Your Expert"}</span>
                  <span className="btn-arrow-glow">➔</span>
                </Link>

                <div className="hero-active-perk-badge">
                  <span className="perk-badge-check">✓</span>
                  <span>{heroSlides[heroIndex]?.perk1?.replace(/^\*\s*/, '') || "100% Police-verified specialists"}</span>
                </div>
              </div>

              {/* Trust Badges Bar */}
              <div className="hero-trust-bar">
                <div className="trust-item">
                  <span className="trust-icon">⭐</span>
                  <div className="trust-text">
                    <strong>4.9 / 5</strong>
                    <span>Customer Trust</span>
                  </div>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">⚡</span>
                  <div className="trust-text">
                    <strong>15 Mins</strong>
                    <span>Fast Dispatch</span>
                  </div>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">🛡️</span>
                  <div className="trust-text">
                    <strong>100% Verified</strong>
                    <span>Police-Checked Pros</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Kept completely open & unobscured so all 14+ professionals & airplane are 100% visible */}
            <div className="hero-panoramic-right hero-right-unobstructed" />
          </div>

          {/* =========================================================================
              NEXT PAGE INTERACTIVE ANIMATED BUTTON (Bottom Center)
              Full animation with bouncing arrow, pulsing ripple, and smooth scroll
              ========================================================================= */}
          <div className="hero-next-page-anchor">
            <button
              type="button"
              className="hero-next-page-btn"
              onClick={handleScrollToNextPage}
              aria-label="Next Page"
              title="Next Page — Click to scroll down"
            >
              <span className="next-page-ripple-ring ring-1" />
              <span className="next-page-ripple-ring ring-2" />
              <span className="next-page-glow-aura" />

              <div className="next-page-btn-inner">
                {/* Animated Mouse Scroll Wheel */}
                <div className="next-page-mouse-icon">
                  <div className="mouse-wheel-dot" />
                </div>

                <div className="next-page-text-content">
                  <span className="next-page-bold-title">NEXT PAGE</span>
                  <span className="next-page-hint-text">Click to scroll</span>
                </div>

                {/* Big Bouncing Down Arrow */}
                <div className="next-page-arrow-pill">
                  <span className="bouncing-down-arrow">↓</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3D STACKING SHEET: Slides Up and Layers OVER the Hero Section
          ========================================================================= */}
      <div className="home-3d-stack-sheet" ref={nextSectionRef} id="home-second-page">
        {/* Physical 3D Card Handle Bar & Drag Pill */}
        <div className="sheet-3d-handle-bar" onClick={handleScrollToNextPage} style={{ cursor: "pointer" }} title="Click to reveal full page">
          <div className="sheet-3d-drag-indicator">
            <div className="sheet-3d-pill" />
            <span className="sheet-edge-label">Explore 100+ Doorstep Services & Categories</span>
          </div>
        </div>

      {/* =========================================================================
          SECTION 1: OUR SERVICES
          ========================================================================= */}
      <section className="nexora-content-section" id="our-services-section">
        <div className="nexora-section-container">
          
          <div className="nexora-section-header" style={{ alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div className="pill-tag-coral" style={{ background: "rgba(255, 77, 45, 0.12)", borderColor: "rgba(255, 77, 45, 0.35)", color: "#FF4D2D", display: "inline-flex", marginBottom: "8px" }}>
                <span>⚡ TOP RATED EXPERTS AT YOUR DOORSTEP</span>
              </div>
              <h2 className="nexora-section-title" style={{ margin: 0 }}>Our Services</h2>
              <p style={{ margin: "6px 0 0", color: "#64748B", fontSize: "14px" }}>
                Verified local specialists ready for 15-minute express doorstep arrival.
              </p>
            </div>

            <div className="carousel-nav-arrows">
              <button 
                type="button" 
                className="carousel-arrow-btn" 
                onClick={() => scrollServices("left")}
                aria-label="Scroll left"
                title="Scroll Left"
              >
                ‹
              </button>
              <button 
                type="button" 
                className="carousel-arrow-btn" 
                onClick={() => scrollServices("right")}
                aria-label="Scroll right"
                title="Scroll Right"
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
              >
                <Link 
                  to={service.path}
                  className="card-thumb-wrapper" 
                  title={`Explore ${service.name}`}
                >
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
                  <span className="card-rating-chip">★ {service.rating || "4.9"}</span>
                </Link>

                <div className="card-info">
                  <Link to={service.path} className="service-title-link" title={service.name}>
                    <h4 className="service-name">{service.name}</h4>
                  </Link>
                  <p className="service-subtext">{service.subtitle}</p>

                  <div className="card-footer-row">
                    <div className="service-price-block">
                      <span className="price-label">Starts at</span>
                      <strong className="service-price-val">{service.price || "₹249"}</strong>
                    </div>

                    <button
                      type="button"
                      className="card-book-action-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEnquire({ 
                          name: service.name, 
                          price: parseInt(String(service.price || "249").replace(/[^\d]/g, "") || "249", 10), 
                          tag: service.tag || "Repairs" 
                        });
                      }}
                      title={`Instant book ${service.name}`}
                    >
                      <span>Book</span>
                      <span className="book-btn-arrow">⚡</span>
                    </button>
                  </div>
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
          SECTION 3.5: MEET OUR VERIFIED EXPERTS (Showcasing home page5.jpg)
          ========================================================================= */}
      <section className="nexora-content-section nexora-verified-experts-section" id="verified-experts-section">
        <div className="nexora-section-container">
          <div className="experts-showcase-card">
            {/* Ambient Background Glows */}
            <div className="experts-glow-blob-1" />
            <div className="experts-glow-blob-2" />

            <div className="experts-grid-layout">
              {/* Left Column: Trust Pitch & Key Pillars */}
              <div className="experts-content-col">
                <div className="experts-badge-pill">
                  <span className="badge-shield-icon">🛡️</span>
                  <span>100% POLICE-VERIFIED & CERTIFIED SPECIALISTS</span>
                </div>

                <h2 className="experts-main-title">
                  Skilled Hands You Can <span className="experts-highlight">Trust in Your Home.</span>
                </h2>

                <p className="experts-subtitle">
                  We don't just dispatch anyone. Every Helper professional undergoes a rigorous 5-step background vetting, national police verification, and hands-on trade skills testing before ever ringing your doorbell.
                </p>

                {/* 4 Feature Checklist Pillars */}
                <div className="experts-pillars-list">
                  <div className="pillar-item">
                    <div className="pillar-icon-box">🛡️</div>
                    <div className="pillar-text">
                      <h4>Police Background Verified</h4>
                      <p>Criminal records checked and verified with official government databases.</p>
                    </div>
                  </div>

                  <div className="pillar-item">
                    <div className="pillar-icon-box">⚡</div>
                    <div className="pillar-text">
                      <h4>15-Minute Rapid Doorstep Dispatch</h4>
                      <p>Real-time live GPS tracking of your assigned pro from route to doorstep.</p>
                    </div>
                  </div>

                  <div className="pillar-item">
                    <div className="pillar-icon-box">🏷️</div>
                    <div className="pillar-text">
                      <h4>Fixed Upfront Standard Rate Card</h4>
                      <p>Transparent digital estimates with zero hidden fees or post-service surprises.</p>
                    </div>
                  </div>

                  <div className="pillar-item">
                    <div className="pillar-icon-box">✨</div>
                    <div className="pillar-text">
                      <h4>30-Day Free Revisit Guarantee</h4>
                      <p>Full satisfaction warranty on every repair, electrical and cleaning job.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons & Live Active Counter */}
                <div className="experts-action-row">
                  <Link to="/services" className="experts-primary-btn">
                    <span>Explore 100+ Verified Services</span>
                    <span className="btn-arrow">➔</span>
                  </Link>

                  <div className="experts-live-status">
                    <span className="live-status-pulse" />
                    <div className="live-status-info">
                      <strong>1,420+ Verified Pros</strong>
                      <span>Active & Ready in Indore</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Visual Showcase Card of home page5.jpg */}
              <div className="experts-visual-col">
                <div className="experts-3d-card-frame">
                  <div className="experts-image-wrapper">
                    <img 
                      src="/images/homepage_5.jpg" 
                      alt="Helper Verified Service Professionals" 
                      className="experts-hero-photo"
                      loading="lazy"
                    />

                    {/* Floating Trust Badges */}
                    <div className="floating-badge badge-top-left">
                      <span className="badge-star">⭐</span>
                      <div>
                        <strong>4.9 / 5 Rating</strong>
                        <span>50,000+ Happy Clients</span>
                      </div>
                    </div>

                    <div className="floating-badge badge-top-right">
                      <span className="badge-plane">✈️</span>
                      <div>
                        <strong>15-Min Express</strong>
                        <span>Fast GPS Dispatch</span>
                      </div>
                    </div>

                    <div className="floating-badge badge-bottom-left">
                      <span className="badge-shield">🛡️</span>
                      <div>
                        <strong>Govt ID & Police</strong>
                        <span>100% Background Screened</span>
                      </div>
                    </div>

                    <div className="floating-badge badge-bottom-right">
                      <span className="badge-dot-green" />
                      <div>
                        <strong>Multi-Trade Pros</strong>
                        <span>Electric, Clean, Plumb, Tech</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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