import React, { useState } from "react";
import "../css/GrowBusiness.css";

function GrowBusiness() {
  // Hero quick form input
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [toastMessage, setToastMessage] = useState("");

  // Business Onboarding Form State
  const [businessData, setBusinessData] = useState({
    businessName: "",
    category: "Home Services",
    city: "New Delhi",
    address: "",
    ownerName: "",
    phone: "",
    email: "",
    whatsapp: "",
  });

  // Callback form state
  const [callbackData, setCallbackData] = useState({
    name: "",
    phone: "",
  });

  // Active FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Active Testimonial Modal (Case Study)
  const [selectedStory, setSelectedStory] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      showToast("⚠️ Please enter a valid 10-digit mobile number");
      return;
    }
    setBusinessData((prev) => ({ ...prev, phone: phoneNumber }));
    setActiveStep(1);
    setShowOnboardingModal(true);
  };

  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    if (!callbackData.phone || callbackData.phone.length < 10) {
      showToast("⚠️ Please enter a valid phone number for callback");
      return;
    }
    showToast("🎉 Callback requested! Our growth expert will call you within 15 minutes.");
    setCallbackData({ name: "", phone: "" });
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    if (activeStep === 1) {
      if (!businessData.businessName.trim()) {
        showToast("⚠️ Please enter your business name");
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (!businessData.ownerName.trim() || !businessData.phone.trim()) {
        showToast("⚠️ Please provide your name and contact number");
        return;
      }
      setActiveStep(3);
      showToast("✨ Congratulations! Your business is now registered on Helper.");
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  // Testimonials Data
  const testimonials = [
    {
      id: 1,
      name: "Suresh Sharma",
      business: "Sharma Interior & Decor",
      city: "Mumbai, Maharashtra",
      category: "Interior Design & Renovation",
      growth: "+320% Revenue",
      rating: 5,
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80",
      quote:
        "Within 3 months of listing on Helper, our inquiries tripled. The verified badge gave our high-end residential clients instant trust. Helper is now our #1 source of business leads.",
      fullStory:
        "Before Helper, Suresh relied on word-of-mouth which led to seasonal fluctuations. By creating a rich catalogue with verified photos and receiving direct WhatsApp leads, his team closed 48 luxury home renovation projects in 2025 alone.",
    },
    {
      id: 2,
      name: "Priya Verma",
      business: "Elegance Fashion Boutique",
      city: "Delhi NCR",
      category: "Custom Tailoring & Boutique",
      growth: "450+ Monthly Leads",
      rating: 5,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
      quote:
        "Helper gave our boutique a massive digital storefront. The multi-category listing and direct call features made it so easy for shoppers across Delhi to reach us for custom bridal wear.",
      fullStory:
        "Priya used Helper's targeted pin-code visibility to reach affluent neighborhoods in South Delhi. Her customer repeat rate jumped by 65% thanks to genuine verified customer reviews.",
    },
    {
      id: 3,
      name: "Rajesh Kumar",
      business: "Kumar Auto Care Services",
      city: "Bangalore, Karnataka",
      category: "Car Repair & Detailing",
      growth: "4.9 ★ (1,800 Reviews)",
      rating: 5,
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
      quote:
        "Consistent high-intent service bookings every single day. The dedicated analytics dashboard helped us understand peak search hours and expand to 2 new service workshops.",
      fullStory:
        "With Helper Pro Ads, Rajesh tapped into emergency doorstep car breakdown requests. His average lead conversion time dropped to under 4 minutes with instant SMS alerts.",
    },
  ];

  // 12 Value Features
  const featuresList = [
    {
      icon: "🔍",
      bg: "#e0f2fe",
      color: "#0284c7",
      title: "Top Search Visibility",
      desc: "Rank above competitors and capture 80%+ of local category search traffic in your locality.",
    },
    {
      icon: "🛡️",
      bg: "#dcfce7",
      color: "#16a34a",
      title: "Verified Business Badge",
      desc: "Earn instant credibility with the official blue trust badge that increases inquiries by 3.5x.",
    },
    {
      icon: "📸",
      bg: "#fef3c7",
      color: "#d97706",
      title: "Rich Digital Catalogue",
      desc: "Upload high-res photos, video portfolios, rate cards, and service brochures for buyers.",
    },
    {
      icon: "💬",
      bg: "#d1fae5",
      color: "#059669",
      title: "Direct Call & WhatsApp Connect",
      desc: "One-tap direct contact with interested buyers without paying any middleman commission.",
    },
    {
      icon: "⚡",
      bg: "#ede9fe",
      color: "#7c3aed",
      title: "Instant Lead Alerts",
      desc: "Get real-time SMS, app notifications & WhatsApp alerts the moment a customer searches.",
    },
    {
      icon: "📊",
      bg: "#fee2e2",
      color: "#dc2626",
      title: "Deep Analytics & ROI",
      desc: "Track total profile views, phone clicks, map directions, and customer search keywords.",
    },
    {
      icon: "⭐",
      bg: "#fef9c3",
      color: "#ca8a04",
      title: "Review & Reputation Engine",
      desc: "Collect authentic 5-star customer ratings with automatic review request links.",
    },
    {
      icon: "🌐",
      bg: "#e0e7ff",
      color: "#4f46e5",
      title: "Free Custom Mobile Website",
      desc: "Get an SEO-ready webpage url (helper.com/biz/your-name) that ranks on Google automatically.",
    },
    {
      icon: "🏷️",
      bg: "#fce7f3",
      color: "#db2777",
      title: "Multi-Category Tagging",
      desc: "List under multiple relevant services so you never miss a prospective customer lead.",
    },
    {
      icon: "👨‍💼",
      bg: "#ccfbf1",
      color: "#0d9488",
      title: "Dedicated Account Manager",
      desc: "Get a dedicated growth manager to help you optimize catalogue photos, keywords, and ads.",
    },
    {
      icon: "📍",
      bg: "#ffedd5",
      color: "#ea580c",
      title: "Hyper-Local Geo Targeting",
      desc: "Reach customers precisely in your selected pin codes, neighborhoods, and radius.",
    },
    {
      icon: "🔒",
      bg: "#f1f5f9",
      color: "#475569",
      title: "100% Safe & Spam-Free",
      desc: "Strict verification protocols filter spam inquiries so you only get high-intent genuine buyers.",
    },
  ];

  // Learning Guides
  const learningGuides = [
    {
      id: 1,
      title: "How to choose multiple business categories for 3x reach",
      desc: "Learn how to select primary and secondary sub-categories to capture all relevant local search queries.",
      readTime: "3 min read",
    },
    {
      id: 2,
      title: "How to respond to customer inquiries within 5 minutes",
      desc: "Proven conversation starters and WhatsApp response templates that double your sales conversions.",
      readTime: "4 min read",
    },
    {
      id: 3,
      title: "How to optimize photos and price catalogue for maximum trust",
      desc: "Best practices for showcasing your workplace, staff, certifications, and portfolio photos.",
      readTime: "5 min read",
    },
  ];

  // FAQ Items
  const faqList = [
    {
      q: "What are the key benefits of listing my business on Helper?",
      a: "Listing on Helper gives your business massive local visibility to millions of active buyers searching for services in your city. You receive verified leads directly on your phone, a dedicated digital storefront, authentic review tools, and direct WhatsApp connectivity with zero commission fees.",
    },
    {
      q: "Is it completely free to create a business listing on Helper?",
      a: "Yes! Creating your primary business listing is 100% free with no hidden charges or credit card requirements. We also offer optional premium Growth & Helper Pro Ads packages if you want guaranteed top-rank placement in your city.",
    },
    {
      q: "How long does it take for my listing to go live?",
      a: "Your basic listing goes live immediately upon completion of the 2-minute registration. Our verification team verifies your business details and credentials within 2 to 4 hours to award the verified trust badge.",
    },
    {
      q: "How will I receive customer inquiries and leads?",
      a: "You receive leads in real-time through direct phone calls, WhatsApp messages, and instant SMS/Email notifications. All leads are directly delivered to you so you can talk to customers immediately.",
    },
    {
      q: "Can I update my business address, photos, and timings later?",
      a: "Yes, absolutely! You will have access to the Helper Business Dashboard where you can update your working hours, photos, services, price lists, and contact numbers anytime with a single click.",
    },
    {
      q: "What is the difference between Free Listing and Helper Pro Ads?",
      a: "A Free Listing gives you a full business profile, review system, and standard directory placement. Helper Pro Ads gives you premium top-3 search ranking, priority lead delivery, featured banner placement, and a dedicated growth manager.",
    },
    {
      q: "How does the business verification process work?",
      a: "Verification requires a simple OTP check on your registered mobile number and uploading an optional business proof (GST, Trade License, Shop Board photo, or Visiting Card). Once reviewed, your profile displays the prestigious blue Verified badge.",
    },
  ];

  return (
    <div className="grow-page-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="grow-toast">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= Hero Section ================= */}
      <section className="grow-hero">
        <div className="grow-container">
          <div className="hero-grid">
            {/* Left Content */}
            <div className="hero-content">
              <div className="hero-badge-tag">
                <span>🚀</span> #1 Local Business Growth Platform
              </div>

              <h1 className="hero-title">
                <span className="hero-title-highlight">GROW</span> Your Business
              </h1>

              <p className="hero-subtitle">
                Turn online searches into footfalls and paying customers. Connect with over 17+ Crore verified shoppers searching for your services right now.
              </p>

              {/* Quick Mobile Input Form */}
              <form className="hero-form-card" onSubmit={handleHeroSubmit}>
                <div className="phone-input-group">
                  <div className="country-flag-box">
                    <span className="flag">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    className="hero-phone-input"
                    placeholder="Enter your 10-digit mobile number"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <button type="submit" className="hero-submit-btn">
                  <span>Start Free Listing</span>
                  <span>➜</span>
                </button>
              </form>

              <div className="hero-micro-text">
                <span>🛡️ 100% Free Forever</span>
                <span>•</span>
                <span>⚡ Instant 2-Minute Activation</span>
                <span>•</span>
                <span>💳 No Credit Card Required</span>
              </div>

              {/* Bullet Points */}
              <div className="hero-bullets">
                <div className="hero-bullet-item">
                  <div className="bullet-icon">✓</div>
                  <span>Get Direct Customer Inquiries & Calls from Your City</span>
                </div>
                <div className="hero-bullet-item">
                  <div className="bullet-icon">✓</div>
                  <span>Build Trust with an Official Verified Business Profile</span>
                </div>
                <div className="hero-bullet-item">
                  <div className="bullet-icon">✓</div>
                  <span>Reach Over 17+ Crore Active Local Shoppers Every Month</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup Visual */}
            <div className="hero-visual-wrapper">
              {/* Floating Stat Badge 1 */}
              <div className="floating-stat-card top-left">
                <div className="float-stat-icon blue">📈</div>
                <div>
                  <div className="float-stat-val">50 Crore+</div>
                  <div className="float-stat-lbl">Searches Every Year</div>
                </div>
              </div>

              {/* Phone Frame */}
              <div className="phone-mockup-frame">
                <div className="phone-screen">
                  <div className="phone-top-bar">
                    <span>9:41 AM</span>
                    <div className="phone-notch"></div>
                    <span>5G 📶</span>
                  </div>

                  <div className="phone-header-search">
                    <div className="phone-search-pill">
                      <span>🔍</span> Best Electrician in New Delhi
                    </div>
                  </div>

                  {/* Business Preview Card */}
                  <div className="phone-biz-preview-card">
                    <div className="phone-biz-img">
                      <span>⚡</span>
                    </div>
                    <div className="phone-biz-body">
                      <div className="phone-biz-header">
                        <div className="phone-biz-title">Apex Home & Electric Co.</div>
                        <span className="verified-mini-badge">✓ Verified</span>
                      </div>
                      <div className="phone-biz-rating">
                        <span>★ 4.9</span>
                        <span className="count">(420+ Reviews)</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "8px" }}>
                        📍 Connaught Place • Open Now
                      </div>

                      <div className="phone-biz-actions">
                        <button className="phone-action-btn call" onClick={() => showToast("📞 Direct calling simulation activated!")}>
                          <span>📞</span> Call Now
                        </button>
                        <button className="phone-action-btn whatsapp" onClick={() => showToast("💬 WhatsApp inquiry simulation connected!")}>
                          <span>💬</span> WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="phone-stats-ticker">
                    <span>🔥</span>
                    <span>14 customers inquired in the last 2 hours</span>
                  </div>
                </div>
              </div>

              {/* Floating Stat Badge 2 */}
              <div className="floating-stat-card bottom-right">
                <div className="float-stat-icon green">⚡</div>
                <div>
                  <div className="float-stat-val">98.4%</div>
                  <div className="float-stat-lbl">Fast Lead Response</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Success Stories / Testimonials ================= */}
      <section className="grow-testimonials-section">
        <div className="grow-container">
          <div className="testi-header-row">
            <div className="testi-title-area">
              <div className="testi-quote-icon">““</div>
              <div>
                <h2 className="testi-main-title">Success Stories</h2>
                <div className="testi-rating-badge">
                  <span className="stars">★★★★★ 4.8 / 5.0</span>
                  <span>Rated by over 50,000+ local businesses</span>
                </div>
              </div>
            </div>

            <button
              className="testi-action-btn"
              onClick={() => {
                setSelectedStory(testimonials[0]);
              }}
            >
              Read All Stories ➜
            </button>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((item) => (
              <div key={item.id} className="testi-card">
                <div className="testi-img-holder">
                  <img src={item.image} alt={item.name} className="testi-cover-photo" />
                  <span className="testi-growth-pill">{item.growth}</span>
                </div>

                <div className="testi-card-body">
                  <div className="testi-stars">{"★".repeat(item.rating)}</div>
                  <p className="testi-quote-text">"{item.quote}"</p>

                  <div className="testi-author-info">
                    <div>
                      <div className="testi-author-name">{item.name}</div>
                      <div className="testi-author-biz">{item.business} • {item.city}</div>
                    </div>
                    <button
                      className="testi-case-link"
                      onClick={() => setSelectedStory(item)}
                    >
                      Case Study →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 3 Core Pillars Section ================= */}
      <section className="grow-pillars-section">
        <div className="grow-container">
          <div className="section-headline-block">
            <h2 className="section-main-title">How Helper Ads Help You Achieve Your Goals</h2>
            <p className="section-subtitle-text">
              A proven 3-step growth framework built specifically to scale local services and retail businesses.
            </p>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon-badge blue">🎯</div>
              <h3 className="pillar-title">1. High-Intent Discovery</h3>
              <p className="pillar-desc">
                Reach verified local customers the exact moment they search for your specific service or product in your neighborhood.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-badge orange">🚀</div>
              <h3 className="pillar-title">2. Direct Zero-Fee Conversion</h3>
              <p className="pillar-desc">
                Receive direct phone calls and WhatsApp chats straight from buyers without paying commissions or third-party cut.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-badge cyan">💎</div>
              <h3 className="pillar-title">3. Unmatched Brand Trust</h3>
              <p className="pillar-desc">
                Win over customers with the blue verified seal, authentic 5-star reviews, high-res photo gallery, and Google search SEO.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 12 Features Grid ================= */}
      <section className="grow-features-section">
        <div className="grow-container">
          <div className="section-headline-block">
            <h2 className="section-main-title">Powerful Business Growth Features</h2>
            <p className="section-subtitle-text">
              Everything you need to manage your business presence, collect leads, and scale your brand.
            </p>
          </div>

          <div className="features-grid-12">
            {featuresList.map((feat, idx) => (
              <div key={idx} className="feature-item-card">
                <div
                  className="feature-icon-box"
                  style={{ backgroundColor: feat.bg, color: feat.color }}
                >
                  {feat.icon}
                </div>
                <div className="feature-info">
                  <h4>{feat.title}</h4>
                  <p>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Learning Guides / Knowledge Section ================= */}
      <section className="grow-learning-section">
        <div className="grow-container">
          <div className="section-headline-block">
            <h2 className="section-main-title">Learn How to Maximize Helper Ads for Your Business</h2>
            <p className="section-subtitle-text">
              Master step-by-step best practices recommended by our top-performing business partners.
            </p>
          </div>

          <div className="learning-cards-grid">
            {learningGuides.map((guide) => (
              <div key={guide.id} className="learn-card">
                <div className="learn-preview-box">
                  <div className="mini-phone-graphic">
                    <div className="mini-phone-top"></div>
                    <div className="mini-phone-content-lines">
                      <div className="mini-line accent"></div>
                      <div className="mini-line"></div>
                      <div className="mini-line short"></div>
                    </div>
                    <div className="mini-badge-pill">⚡ Pro Tip</div>
                  </div>
                </div>

                <div className="learn-card-body">
                  <h3 className="learn-card-title">{guide.title}</h3>
                  <p className="learn-card-desc">{guide.desc}</p>
                  <button
                    className="learn-more-link"
                    onClick={() => showToast(`📖 Guide "${guide.title}" will be available in the Knowledge Hub soon!`)}
                  >
                    <span>Read Guide ({guide.readTime})</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Frequently Asked Questions ================= */}
      <section className="grow-faq-section">
        <div className="grow-container">
          <div className="section-headline-block">
            <h2 className="section-main-title">Frequently Asked Questions</h2>
            <p className="section-subtitle-text">
              Have questions about listing your business? Here are answers to common questions.
            </p>
          </div>

          <div className="faq-accordion-list">
            {faqList.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={`faq-item ${isOpen ? "open" : ""}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <div className="faq-icon-circle">{isOpen ? "✕" : "+"}</div>
                  </button>

                  {isOpen && <div className="faq-answer-panel">{faq.a}</div>}
                </div>
              );
            })}
          </div>

          {/* Callback Request Card */}
          <div className="grow-callback-card">
            <div className="callback-icon-holder">
              <span>🎧</span>
            </div>
            <div className="callback-info">
              <h3>Still have questions?</h3>
              <p>Request a free callback from our certified business growth advisor in your city.</p>

              <form className="callback-form-row" onSubmit={handleCallbackSubmit}>
                <input
                  type="text"
                  className="callback-input"
                  placeholder="Your Name"
                  value={callbackData.name}
                  onChange={(e) => setCallbackData({ ...callbackData, name: e.target.value })}
                />
                <input
                  type="tel"
                  className="callback-input"
                  placeholder="Your 10-digit mobile number"
                  maxLength={10}
                  value={callbackData.phone}
                  onChange={(e) =>
                    setCallbackData({
                      ...callbackData,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
                <button type="submit" className="callback-submit-btn">
                  Request Call ⚡
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Bottom High-Impact CTA Banner ================= */}
      <section className="grow-cta-section">
        <div className="grow-container">
          <div className="cta-gradient-banner">
            <div className="cta-banner-content">
              <h2>Ready to 10x Your Local Business Growth?</h2>
              <p>
                Join over 5,00,000+ businesses who connect with local customers every day on Helper. Setup takes less than 2 minutes.
              </p>

              <div className="cta-trust-tags">
                <span>🛡️ Verified Business Partner</span>
                <span>⚡ Instant Customer Connect</span>
                <span>⭐ Zero Hidden Charges</span>
              </div>
            </div>

            <div className="cta-form-box">
              <h4>Get Started for Free</h4>
              <div className="cta-input-stack">
                <input
                  type="tel"
                  className="cta-input-field"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                />
                <button
                  className="cta-primary-btn"
                  onClick={() => {
                    if (!phoneNumber || phoneNumber.length < 10) {
                      showToast("⚠️ Please enter a valid 10-digit mobile number");
                      return;
                    }
                    setBusinessData((prev) => ({ ...prev, phone: phoneNumber }));
                    setActiveStep(1);
                    setShowOnboardingModal(true);
                  }}
                >
                  Create Free Listing 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3-Step Business Onboarding Modal ================= */}
      {showOnboardingModal && (
        <div className="onboarding-modal-overlay" onClick={() => setShowOnboardingModal(false)}>
          <div className="onboarding-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowOnboardingModal(false)}>
              ✕
            </button>

            {/* Step Indicators */}
            <div className="modal-step-indicator">
              <div className={`step-circle ${activeStep >= 1 ? "active" : ""} ${activeStep > 1 ? "completed" : ""}`}>
                {activeStep > 1 ? "✓" : "1"}
              </div>
              <div className={`step-line ${activeStep >= 2 ? "active" : ""}`}></div>
              <div className={`step-circle ${activeStep >= 2 ? "active" : ""} ${activeStep > 2 ? "completed" : ""}`}>
                {activeStep > 2 ? "✓" : "2"}
              </div>
              <div className={`step-line ${activeStep >= 3 ? "active" : ""}`}></div>
              <div className={`step-circle ${activeStep === 3 ? "active completed" : ""}`}>
                3
              </div>
            </div>

            {/* Step 1: Business Details */}
            {activeStep === 1 && (
              <form onSubmit={handleOnboardingSubmit}>
                <div className="modal-header-text">
                  <h3>Step 1: Tell Us About Your Business</h3>
                  <p>Provide basic business information to setup your digital storefront</p>
                </div>

                <div className="modal-form-grid">
                  <div className="input-field-block">
                    <label>Business / Shop Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma Electricals & Home Services"
                      required
                      value={businessData.businessName}
                      onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                    />
                  </div>

                  <div className="input-field-block">
                    <label>Primary Business Category *</label>
                    <select
                      value={businessData.category}
                      onChange={(e) => setBusinessData({ ...businessData, category: e.target.value })}
                    >
                      <option value="Home Services">Home Services & Repairs</option>
                      <option value="Electrician & Plumber">Electrician & Plumber</option>
                      <option value="Interior Design & Decor">Interior Design & Renovation</option>
                      <option value="Automobile & Garage">Automobile & Garage Services</option>
                      <option value="Beauty & Salon">Beauty, Salon & Spa</option>
                      <option value="Cleaning & Pest Control">Cleaning & Pest Control</option>
                      <option value="Retail & Boutique">Retail & Boutique</option>
                      <option value="Health & Medical">Doctor & Healthcare</option>
                    </select>
                  </div>

                  <div className="input-field-block">
                    <label>City / Location *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, New Delhi, Bangalore"
                      required
                      value={businessData.city}
                      onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                    />
                  </div>

                  <div className="input-field-block">
                    <label>Shop / Office Address</label>
                    <textarea
                      rows={2}
                      placeholder="Full shop address or landmark (Optional)"
                      value={businessData.address}
                      onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-actions-row">
                  <button type="button" className="modal-btn-secondary" onClick={() => setShowOnboardingModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="modal-btn-primary">
                    Next: Contact Details ➜
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Contact Person & Verification */}
            {activeStep === 2 && (
              <form onSubmit={handleOnboardingSubmit}>
                <div className="modal-header-text">
                  <h3>Step 2: Contact & Lead Delivery</h3>
                  <p>Where should we send customer calls and inquiries?</p>
                </div>

                <div className="modal-form-grid">
                  <div className="input-field-block">
                    <label>Owner / Manager Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ajay Singh"
                      required
                      value={businessData.ownerName}
                      onChange={(e) => setBusinessData({ ...businessData, ownerName: e.target.value })}
                    />
                  </div>

                  <div className="input-field-block">
                    <label>Mobile Number for Calls *</label>
                    <input
                      type="tel"
                      placeholder="10-digit primary mobile"
                      required
                      maxLength={10}
                      value={businessData.phone}
                      onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value.replace(/\D/g, "") })}
                    />
                  </div>

                  <div className="input-field-block">
                    <label>WhatsApp Number for Inquiries</label>
                    <input
                      type="tel"
                      placeholder="WhatsApp number (if different)"
                      maxLength={10}
                      value={businessData.whatsapp}
                      onChange={(e) => setBusinessData({ ...businessData, whatsapp: e.target.value.replace(/\D/g, "") })}
                    />
                  </div>

                  <div className="input-field-block">
                    <label>Business Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="contact@mybusiness.com"
                      value={businessData.email}
                      onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-actions-row">
                  <button type="button" className="modal-btn-secondary" onClick={() => setActiveStep(1)}>
                    ← Back
                  </button>
                  <button type="submit" className="modal-btn-primary">
                    Submit & Activate Listing 🚀
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success Celebration */}
            {activeStep === 3 && (
              <div className="success-wizard-box">
                <div className="success-icon-badge">🎉</div>
                <h3>Your Business is Registered!</h3>
                <p>
                  Congratulations <strong>{businessData.ownerName}</strong>! Your business has been submitted for live activation.
                </p>

                <div className="live-badge-preview">
                  <div className="live-preview-title">
                    <span>🏢 {businessData.businessName}</span>
                    <span className="verified-mini-badge">✓ Verified</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    📂 Category: {businessData.category} • 📍 {businessData.city}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    📞 Inquiries will be sent to: +91 {businessData.phone}
                  </div>
                </div>

                <div className="modal-actions-row" style={{ justifyContent: "center" }}>
                  <button
                    className="modal-btn-primary"
                    onClick={() => {
                      setShowOnboardingModal(false);
                      setActiveStep(1);
                    }}
                  >
                    Go to Business Dashboard ⚡
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= Case Study Modal ================= */}
      {selectedStory && (
        <div className="onboarding-modal-overlay" onClick={() => setSelectedStory(null)}>
          <div className="onboarding-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedStory(null)}>
              ✕
            </button>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <img
                src={selectedStory.image}
                alt={selectedStory.name}
                style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px" }}
              />
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>{selectedStory.name}</h3>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                {selectedStory.business} • {selectedStory.city}
              </div>
              <div style={{ marginTop: "8px" }}>
                <span className="verified-mini-badge">Growth Metric: {selectedStory.growth}</span>
              </div>
            </div>

            <div style={{ background: "var(--surface-input)", padding: "18px", borderRadius: "16px", marginBottom: "20px" }}>
              <div style={{ fontSize: "0.95rem", fontStyle: "italic", lineHeight: "1.6", color: "var(--text-main)" }}>
                "{selectedStory.quote}"
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "8px", color: "var(--text-main)" }}>
                The Growth Journey:
              </h4>
              <p style={{ fontSize: "0.92rem", lineHeight: "1.6", color: "var(--text-muted)" }}>
                {selectedStory.fullStory}
              </p>
            </div>

            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <button className="modal-btn-primary" onClick={() => setSelectedStory(null)}>
                Close Case Study
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GrowBusiness;
