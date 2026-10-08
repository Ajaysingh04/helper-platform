import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Home.css";
import LoginModal from "./LoginModal";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import { popularCategories } from "../data/popularCategoriesData";
import { initialOffers } from "../data/offersData";
import { getServicemanImage } from "../data/categoryImages";
import LiveTrackingModal from "./LiveTrackingModal";
import { API_BASE } from "../apiConfig";

// Service-Specific Dynamic Problem Options
export const getServiceProblemChips = (service) => {
  if (!service) return ["Standard Repair", "Inspection & Estimate", "Installation", "Other / Custom Issue"];
  const name = (service.name || "").toLowerCase();
  const tag = (service.tag || service.category || "").toLowerCase();

  if (name.includes("ac") || tag.includes("ac") || tag.includes("appliance")) {
    return ["Cooling Issue", "Gas Refill", "Water Leakage", "Filter Cleaning", "Jet Service", "AC Installation", "Other / Custom Issue"];
  }
  if ((name.includes("electric") || tag.includes("electric") || tag.includes("repair")) && !name.includes("plumb")) {
    return ["Fan Repair", "Switchboard / Socket", "Wiring Issue", "MCB Tripping", "Inverter Setup", "Complete Safety Audit", "Other / Custom Issue"];
  }
  if (name.includes("plumb") || tag.includes("plumb") || name.includes("leak")) {
    return ["Pipe Leakage", "Drainage Clog", "Tap Replacement", "Geyser Setup", "Flush Tank Fix", "Other / Custom Issue"];
  }
  if (name.includes("clean") || tag.includes("clean") || tag.includes("sanitiz")) {
    return ["Deep Home Cleaning", "Bathroom Descaling", "Kitchen Chimney", "Sofa Shampoo Wash", "Balcony Clean", "Post-Paint Clean", "Other / Custom Issue"];
  }
  if (name.includes("paint") || tag.includes("paint") || tag.includes("decor")) {
    return ["Full Wall Painting", "Waterproofing Seepage", "Putty & Crack Fill", "Texture Accent Wall", "Door Polish", "Exterior Coating", "Other / Custom Issue"];
  }
  if (name.includes("salon") || name.includes("beauty") || tag.includes("beauty") || tag.includes("salon")) {
    return ["Haircut & Styling", "Facial & Glow Cleanup", "Head & Body Massage", "Waxing & Threading", "Manicure & Pedicure", "Party Makeup", "Other / Custom Issue"];
  }
  if (name.includes("massage") || name.includes("spa") || tag.includes("spa")) {
    return ["Swedish Full Body", "Deep Tissue Therapy", "Aromatherapy Oil", "Foot Reflexology", "Head & Shoulder", "Other / Custom Issue"];
  }
  if (name.includes("carpent") || name.includes("lock") || name.includes("wood")) {
    return ["Furniture Repair", "Door & Lock Fitting", "Custom Wardrobe", "Hinges & Handles", "Bed Frame Assembly", "Other / Custom Issue"];
  }
  if (name.includes("teach") || name.includes("tutor") || name.includes("school")) {
    return ["Admission Enquiry", "Home Tuition Demo", "Maths & Science Tutor", "Exam Prep & Coaching", "Parent Consultation", "Other / Custom Issue"];
  }
  return ["Quick Diagnostic", "Parts Replacement", "Standard Maintenance", "General Inspection", "Other / Custom Issue"];
};

// Dynamic Problem Symptoms based on Selected Service
const getServiceProblems = (service) => {
  if (!service) return [];
  const name = (service.name || "").toLowerCase();
  const tag = (service.tag || service.category || "").toLowerCase();

  if (name.includes("ac") || tag.includes("ac") || tag.includes("appliance")) {
    return [
      { id: "ac-1", title: "AC Not Cooling / Low Cooling", icon: "❄️" },
      { id: "ac-2", title: "Water Leakage from Indoor Unit", icon: "💧" },
      { id: "ac-3", title: "Gas Leakage & Gas Refilling", icon: "💨" },
      { id: "ac-4", title: "Strange Noise / Heavy Vibration", icon: "🔊" },
      { id: "ac-5", title: "AC Trips MCB / Power Not Turning On", icon: "⚡" },
      { id: "ac-6", title: "Jet Foam Deep Service & Jet Clean", icon: "🧼" },
      { id: "ac-other", title: "Other / Custom Issue", icon: "📝" }
    ];
  }
  if ((name.includes("electric") || tag.includes("electric") || tag.includes("repair")) && !name.includes("plumb")) {
    return [
      { id: "el-1", title: "Short Circuit / MCB Tripping", icon: "⚡" },
      { id: "el-2", title: "Switchboard / Socket Sparking or Dead", icon: "🔌" },
      { id: "el-3", title: "Ceiling Fan / Light / Chandelier Issue", icon: "💡" },
      { id: "el-4", title: "Inverter / Battery Backup Wiring", icon: "🔄" },
      { id: "el-5", title: "New Appliance Wiring & Point Install", icon: "🏗️" },
      { id: "el-6", title: "Complete Home Electrical Safety Audit", icon: "🔍" },
      { id: "el-other", title: "Other / Custom Issue", icon: "📝" }
    ];
  }
  if (name.includes("plumb") || tag.includes("plumb") || name.includes("leak")) {
    return [
      { id: "pl-1", title: "Tap / Faucet Continuously Dripping", icon: "🚰" },
      { id: "pl-2", title: "Low Water Pressure / Shower Issue", icon: "🚿" },
      { id: "pl-3", title: "Blocked Drain / Kitchen Sink Clogging", icon: "🚽" },
      { id: "pl-4", title: "Pipe Joint Leakage / Wall Seepage", icon: "💧" },
      { id: "pl-5", title: "Water Tank Overflow / Valve Fault", icon: "🛢️" },
      { id: "pl-6", title: "Washbasin / Western Commode Fitting", icon: "🛠️" },
      { id: "pl-other", title: "Other / Custom Issue", icon: "📝" }
    ];
  }
  if (name.includes("clean") || tag.includes("clean") || name.includes("sanitiz")) {
    return [
      { id: "cl-1", title: "Full Home Deep Sanitization (BHK)", icon: "🧹" },
      { id: "cl-2", title: "Bathroom Hard Stain & Tiles Descaling", icon: "🚽" },
      { id: "cl-3", title: "Kitchen Chimney & Grease Scrubbing", icon: "🍳" },
      { id: "cl-4", title: "Sofa, Carpet & Mattress Shampoo Wash", icon: "🛋️" },
      { id: "cl-5", title: "Balcony & Window Mesh Deep Clean", icon: "🪟" },
      { id: "cl-6", title: "Move-In / Post Renovation Deep Cleaning", icon: "📦" },
      { id: "cl-other", title: "Other / Custom Issue", icon: "📝" }
    ];
  }
  if (name.includes("paint") || tag.includes("paint") || tag.includes("decor")) {
    return [
      { id: "pt-1", title: "Full Interior Home Repaint", icon: "🎨" },
      { id: "pt-2", title: "Wall Dampness & Waterproofing Coat", icon: "🌧️" },
      { id: "pt-3", title: "Putty Work & Wall Crack Repair", icon: "🧱" },
      { id: "pt-4", title: "Wood & Metal Door Polish / Primer", icon: "🚪" },
      { id: "pt-5", title: "Designer Accent Wall / Texture Finish", icon: "🖌️" },
      { id: "pt-6", title: "Exterior Weatherproof Protective Coat", icon: "🏠" },
      { id: "pt-other", title: "Other / Custom Issue", icon: "📝" }
    ];
  }
  if (name.includes("salon") || name.includes("beauty") || tag.includes("beauty") || tag.includes("salon")) {
    return [
      { id: "sa-1", title: "Haircut, Blowdry & Hair Spa", icon: "💇" },
      { id: "sa-2", title: "Facial, Cleanup & Gold Glow Care", icon: "✨" },
      { id: "sa-3", title: "Manicure & Pedicure Nail Care", icon: "💅" },
      { id: "sa-4", title: "Head, Neck & Shoulder Relaxing Massage", icon: "💆" },
      { id: "sa-5", title: "Full Body Waxing & Threading", icon: "🌿" },
      { id: "sa-6", title: "Party Makeup & Draping Package", icon: "💄" },
      { id: "sa-other", title: "Other / Custom Issue", icon: "📝" }
    ];
  }
  if (name.includes("massage") || name.includes("spa") || tag.includes("spa")) {
    return [
      { id: "ms-1", title: "Swedish Relaxing Full Body Massage (60m)", icon: "💆" },
      { id: "ms-2", title: "Deep Tissue Therapy (Back & Muscle Relief)", icon: "🌿" },
      { id: "ms-3", title: "Aromatherapy Organic Oil Treatment", icon: "🧴" },
      { id: "ms-4", title: "Foot Reflexology & Acupressure Points", icon: "🦶" },
      { id: "ms-5", title: "Head, Neck & Upper Body Stress Relief", icon: "🧘" },
      { id: "ms-other", title: "Other / Custom Issue", icon: "📝" }
    ];
  }
  if (name.includes("carpent") || name.includes("lock") || name.includes("wood")) {
    return [
      { id: "cp-1", title: "Door Lock / Handle Jammed or Broken", icon: "🚪" },
      { id: "cp-2", title: "Furniture Repair & Hinge Alignment", icon: "🪑" },
      { id: "cp-3", title: "Custom Wardrobe / Shelf Making & Fitting", icon: "🔨" },
      { id: "cp-4", title: "Bed Frame Assembly / Drawer Slider Fix", icon: "🛏️" },
      { id: "cp-5", title: "Curtain Rod & Wall Drilling Installation", icon: "🔩" },
      { id: "cp-other", title: "Other / Custom Issue", icon: "📝" }
    ];
  }
  if (name.includes("teach") || name.includes("tutor")) {
    return [
      { id: "tc-1", title: "Home Tutor for Primary / Middle School", icon: "📚" },
      { id: "tc-2", title: "Maths & Science Specialist Classes", icon: "🔤" },
      { id: "tc-3", title: "Spoken English & Communication", icon: "🗣️" },
      { id: "tc-4", title: "Exam Preparation & Homework Help", icon: "📝" },
      { id: "tc-other", title: "Other / Custom Issue", icon: "📝" }
    ];
  }

  return [
    { id: "gn-1", title: "On-Site Inspection & Problem Diagnostics", icon: "🔍" },
    { id: "gn-2", title: "Urgent Repair & Part Replacement", icon: "🛠️" },
    { id: "gn-3", title: "Installation & Setup Service", icon: "⚙️" },
    { id: "gn-4", title: "Routine Servicing & Maintenance", icon: "🧹" },
    { id: "gn-other", title: "Other / Custom Issue", icon: "📝" }
  ];
};

// Available Booking Time Slots Starting Strictly from 7:00 AM
const bookingTimeSlots = [
  { id: "s-07", label: "07:00 AM - 08:00 AM", period: "Morning", badge: "Early" },
  { id: "s-08", label: "08:00 AM - 09:00 AM", period: "Morning", badge: "Popular" },
  { id: "s-09", label: "09:00 AM - 10:00 AM", period: "Morning", badge: "Express" },
  { id: "s-10", label: "10:00 AM - 11:00 AM", period: "Morning" },
  { id: "s-11", label: "11:00 AM - 12:00 PM", period: "Morning" },
  { id: "s-12", label: "12:00 PM - 01:00 PM", period: "Afternoon" },
  { id: "s-13", label: "01:00 PM - 02:00 PM", period: "Afternoon" },
  { id: "s-14", label: "02:00 PM - 03:00 PM", period: "Afternoon" },
  { id: "s-15", label: "03:00 PM - 04:00 PM", period: "Afternoon" },
  { id: "s-16", label: "04:00 PM - 05:00 PM", period: "Evening", badge: "Popular" },
  { id: "s-17", label: "05:00 PM - 06:00 PM", period: "Evening" },
  { id: "s-18", label: "06:00 PM - 07:00 PM", period: "Evening" },
  { id: "s-19", label: "07:00 PM - 08:00 PM", period: "Evening" },
  { id: "s-20", label: "08:00 PM - 09:00 PM", period: "Night" }
];

// 4 Booking Dates: Today, Tomorrow, +2 Days
const getBookingDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 4; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const formattedDate = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    dates.push({
      key: d.toISOString().split("T")[0],
      dayName,
      formattedDate,
      fullLabel: `${dayName}, ${formattedDate}`
    });
  }
  return dates;
};

function Home() {
  const dataContext = useContext(DataContext);
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.currentUser;
  const addBooking = dataContext?.addBooking;
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryName, setEnquiryName] = useState(currentUser?.name || "");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [selectedProblem, setSelectedProblem] = useState("");
  const [customProblemNote, setCustomProblemNote] = useState("");
  const [selectedBookingDate, setSelectedBookingDate] = useState(todayStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("07:00 AM - 08:00 AM");
  const [slotFilter, setSlotFilter] = useState("All");
  const [bookingAddress, setBookingAddress] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [activeLiveBooking, setActiveLiveBooking] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Input Refs for smooth animations & auto-focus
  const customNoteInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const addressInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const handleSelectProblem = (probTitle) => {
    setSelectedProblem(probTitle);
    if (probTitle.toLowerCase().includes("other") || probTitle.toLowerCase().includes("custom")) {
      setTimeout(() => {
        if (customNoteInputRef.current) {
          customNoteInputRef.current.focus();
        }
      }, 100);
    }
  };

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
      image: "/images/banner_all_experts_clean.png",
      mobileImage: "/images/banner_all_experts_clean.png",
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
      id: "slide-electrician",
      image: "/images/banner_electrician.png",
      mobileImage: "/images/banner_electrician.png",
      title: "Certified Electricians & Diagnostics.",
      highlight: "Instant 15-Min Response.",
      subtitle: "Short circuit repair, wiring, switchboards, inverter & fan repairs by background-screened pros.",
      badge: "⚡ 100% VERIFIED BACKGROUND CHECK",
      ctaText: "Book Electrician",
      ctaLink: "/category/electricians",
      perk1: "* Upfront rates with zero fraud start OTP",
      perk2: "* 30-day free revisit guarantee",
      perk3: "* Certified high-voltage specialists"
    },
    {
      id: "slide-plumber",
      image: "/images/banner_plumber.png",
      mobileImage: "/images/banner_plumber.png",
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
      id: "slide-painter",
      image: "/images/banner_painter.png",
      mobileImage: "/images/banner_painter.png",
      title: "Luxury Home Painting & Renovation.",
      highlight: "Flawless Finish On Time.",
      subtitle: "Premium dust-free painting, waterproof coatings & carpentry by top-rated certified specialists.",
      badge: "🏡 ARCHITECTURAL GRADE WORKMANSHIP",
      ctaText: "Explore Services",
      ctaLink: "/services",
      perk1: "* Free color consultation & 3D preview",
      perk2: "* 5-year anti-peel warranty",
      perk3: "* Laser accurate cost estimation"
    },
    {
      id: "slide-team",
      image: "/images/banner_team.png",
      mobileImage: "/images/banner_team.png",
      title: "Everything Your Home Needs.",
      highlight: "Delivered In 15 Mins.",
      subtitle: "Book verified electricians, plumbers, cleaning experts & painters with guaranteed upfront rates.",
      badge: "⭐ #1 ON-DEMAND HOME SERVICE PLATFORM",
      ctaText: "Book Service Now",
      ctaLink: "/services",
      perk1: "* 15-min arrival with live GPS tracking",
      perk2: "* 100% verified police-checked experts",
      perk3: "* Upfront rates with 30-day warranty"
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
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    return typeof window !== "undefined" ? window.innerWidth <= 1024 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const goToNextSlide = () => {
    setHeroIndex((prev) => (prev + 1) % safeHeroSlides.length);
  };

  const goToPrevSlide = () => {
    setHeroIndex((prev) => (prev - 1 + safeHeroSlides.length) % safeHeroSlides.length);
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }
  };

  // Auto-Slide Interval (respects slideSpeed and pause-on-hover setting)
  useEffect(() => {
    if (!safeHeroSlides || safeHeroSlides.length <= 1) return;
    if (isHeroPaused && !heroSettings.continuousSlide) return;

    const speed = Math.max(1000, Number(heroSettings.slideSpeed) || 2500);
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % safeHeroSlides.length);
    }, speed);
    return () => clearInterval(interval);
  }, [safeHeroSlides, heroSettings.slideSpeed, isHeroPaused, heroSettings.continuousSlide]);

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
    // 1. Bina login ke booking nahi hogi
    if (!authContext?.isLoggedIn) {
      alert("⚠️ Bina login ke booking nahi ho sakti! Kripya pehle apne Customer account me login karein.");
      navigate("/login?role=user");
      return;
    }

    // 2. Booking sirf user/customer karta hai - Admin, Vendor, Worker restricted
    const isSpecialAccount = 
      authContext?.isAdmin || 
      authContext?.isVendor || 
      authContext?.isWorker || 
      localStorage.getItem("helper_admin_auth") === "true" ||
      Boolean(localStorage.getItem("helper_vendor")) ||
      Boolean(localStorage.getItem("helper_worker")) ||
      ["administrator", "admin", "partner", "vendor", "worker", "technician"].includes(currentUser?.role?.toLowerCase());

    if (isSpecialAccount) {
      alert("⚠️ Booking sirf Customer accounts kar sakte hain! Admin, Vendor ya Worker accounts se customer booking allowed nahi hai.");
      return;
    }

    setSelectedService(service);
    setSelectedProvider(provider);
    setEnquirySuccess(false);
    setEnquiryName(currentUser?.name || localStorage.getItem("helper_user_name") || "");
    setEnquiryPhone(currentUser?.phone || localStorage.getItem("helper_user_phone") || "");
    const problems = getServiceProblems(service);
    setSelectedProblem(problems[0]?.title || "Inspection & Estimate");
    setCustomProblemNote("");
    const bookingDates = getBookingDates();
    setSelectedBookingDate(bookingDates[0]?.fullLabel || "Today");
    setSelectedTimeSlot("07:00 AM - 08:00 AM");
    setSlotFilter("All");
    const storedAddress = localStorage.getItem("helper_user_full_address") 
      || `${localStorage.getItem("helper_user_area") || "Palasia"} Square, ${localStorage.getItem("helper_user_city") || "Indore"}, Madhya Pradesh`;
    setBookingAddress(storedAddress);
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!enquiryPhone || enquiryPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!selectedTimeSlot) {
      alert("Please select a service time slot");
      return;
    }

    setIsSubmittingBooking(true);
    const numericPrice = typeof selectedService?.price === "number" 
      ? selectedService.price 
      : parseInt(String(selectedService?.price || "299").replace(/[^\d]/g, "") || "299", 10);

    const selectedCity = localStorage.getItem("helper_user_city") || "Indore";
    const selectedArea = localStorage.getItem("helper_user_area") || "Palasia";
    const selectedFullAddress = bookingAddress || localStorage.getItem("helper_user_full_address") || `${selectedArea} Square, ${selectedCity}, Madhya Pradesh`;

    try {
      // Call Production Express Booking & Dispatch API
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: enquiryName.trim() || currentUser?.name || "Customer",
          customerPhone: enquiryPhone,
          serviceName: selectedService.name,
          category: selectedService.tag || selectedService.category || "General",
          assignedProviderName: selectedProvider ? selectedProvider.name : undefined,
          customerAddress: selectedFullAddress,
          fullAddress: selectedFullAddress,
          customerLocation: {
            type: "Point",
            coordinates: [75.8858, 22.7196] // Central Indore / Palasia coordinates
          },
          address: {
            street: selectedFullAddress,
            city: selectedCity,
            state: "Madhya Pradesh",
            pincode: "452001"
          },
          servicePrice: numericPrice,
          paymentMethod: "cash_after_service",
          isEmergency: false,
          bookingDate: selectedBookingDate,
          timeSlot: selectedTimeSlot,
          problem: selectedProblem,
          problemNotes: customProblemNote || selectedProblem
        })
      });

      const json = await res.json();

      if (json.success && (json.data || json.booking)) {
        const bData = json.data || json.booking;
        const fullBooking = {
          ...bData,
          startOtp: json.startOtp || "3459",
          serviceName: selectedService.name,
          bookingDate: selectedBookingDate,
          timeSlot: selectedTimeSlot,
          problem: selectedProblem,
          assignedProvider: selectedProvider ? {
            name: selectedProvider.name,
            phone: selectedProvider.contact,
            rating: selectedProvider.rating,
            photo: selectedProvider.image
          } : (bData.assignedProvider || {
            name: `${selectedService.name} Specialist`,
            phone: "+91 98765 43210",
            rating: 4.8,
            photo: getServicemanImage(selectedService.name)
          })
        };

        if (addBooking) {
          addBooking({
            id: fullBooking.bookingId || fullBooking._id,
            name: enquiryName.trim() || currentUser?.name || "Customer",
            phone: enquiryPhone,
            service: selectedService.name,
            price: `₹${numericPrice}`,
            address: selectedFullAddress,
            status: "Pending",
            provider: selectedProvider ? selectedProvider.name : `${selectedService.name} Specialist`,
            timeSlot: selectedTimeSlot,
            bookingDate: selectedBookingDate
          });
        }

        try {
          const existing = JSON.parse(localStorage.getItem("helper_user_bookings") || "[]");
          localStorage.setItem("helper_user_bookings", JSON.stringify([fullBooking, ...existing]));
        } catch (e) {}

        setEnquirySuccess(true);
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
        slotOtp: "3459",
        doorOtp: "3459",
        bookingDate: selectedBookingDate,
        timeSlot: selectedTimeSlot,
        problem: selectedProblem,
        assignedProvider: selectedProvider ? {
          name: selectedProvider.name,
          phone: selectedProvider.contact,
          rating: selectedProvider.rating,
          photo: selectedProvider.image || getServicemanImage(selectedService.name)
        } : {
          name: `${selectedService.name} Specialist`,
          phone: "+91 98765 43210",
          rating: 4.8,
          photo: getServicemanImage(selectedService.name)
        }
      };
      if (addBooking) {
        addBooking({
          id: fallbackBooking.bookingId,
          name: enquiryName.trim() || currentUser?.name || "Customer",
          phone: enquiryPhone,
          service: selectedService.name,
          price: `₹${numericPrice}`,
          address: selectedFullAddress,
          status: "Pending",
          provider: selectedProvider ? selectedProvider.name : `${selectedService.name} Specialist`,
          timeSlot: selectedTimeSlot,
          bookingDate: selectedBookingDate
        });
      }
      try {
        const existing = JSON.parse(localStorage.getItem("helper_user_bookings") || "[]");
        localStorage.setItem("helper_user_bookings", JSON.stringify([fallbackBooking, ...existing]));
      } catch (e) {}
      setEnquirySuccess(true);
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
      <section 
        className="helper-hero-slider-wrap"
        onMouseEnter={() => {
          if (!heroSettings.continuousSlide) setIsHeroPaused(true);
        }}
        onMouseLeave={() => {
          if (!heroSettings.continuousSlide) setIsHeroPaused(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
                  src={slide.image || "/images/banner_all_experts_clean.png"} 
                  alt={slide.title || `Home Banner ${idx + 1}`}
                  className={`hero-slide-img ${idx === heroIndex ? "kenburns-active" : ""}`}
                  style={{
                    objectPosition: heroSettings.imagePosition || "center top"
                  }}
                  loading={idx === 0 ? "eager" : "lazy"}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/banner_all_experts_clean.png";
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

          {/* Subtle Top & Bottom Gradient Scrim to ensure crisp contrast on any device */}
          <div className="hero-bottom-clean-scrim" />

          {/* Desktop Previous / Next Hover Arrows */}
          {safeHeroSlides.length > 1 && (
            <>
              <button
                type="button"
                className="hero-nav-arrow hero-nav-prev"
                onClick={goToPrevSlide}
                aria-label="Previous Banner Slide"
              >
                ‹
              </button>
              <button
                type="button"
                className="hero-nav-arrow hero-nav-next"
                onClick={goToNextSlide}
                aria-label="Next Banner Slide"
              >
                ›
              </button>
            </>
          )}

          {/* Slide Indicator Dots Pill */}
          {safeHeroSlides.length > 1 && (
            <div className="hero-slide-dots-container" role="tablist">
              {safeHeroSlides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  className={`hero-slide-dot-pill ${dotIdx === heroIndex ? "active" : ""}`}
                  onClick={() => setHeroIndex(dotIdx)}
                  aria-label={`Switch to slide ${dotIdx + 1}`}
                  role="tab"
                  aria-selected={dotIdx === heroIndex}
                />
              ))}
            </div>
          )}

          {/* Hero Search Bar & Popular Chips Container - Floating Overlay (Desktop Only) */}
          {!isMobileScreen && (
            <div className="hero-centered-search-container hero-search-desktop-only">
              {/* Live Trust / Verification Micro-Badge */}
              <div className="hero-trust-tag-pill">
                <span className="hero-trust-pulse" />
                <span className="hero-trust-text">
                  {safeHeroSlides[heroIndex]?.badge || "🛡️ 50,000+ POLICE-VERIFIED SPECIALISTS"}
                </span>
              </div>

              <form 
                className="hero-search-wrapper hero-search-centered" 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (homeCatSearch.trim()) {
                    const element = document.getElementById("popular-service-categories");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <div className="hero-search-location-chip">
                  <span className="location-pin">📍</span>
                  <span className="location-name">Indore</span>
                </div>
                <span className="hero-search-divider" />
                <span className="hero-search-icon">🔍</span>
                <input
                  type="text"
                  className="hero-search-input"
                  placeholder="Search 'AC Repair', 'Plumber', 'Cleaning'..."
                  value={homeCatSearch}
                  onChange={(e) => setHomeCatSearch(e.target.value)}
                  aria-label="Search Services"
                />
                <button type="submit" className="hero-search-btn" aria-label="Search">
                  <span className="hero-search-btn-text-full">Find Service ➔</span>
                  <span className="hero-search-btn-text-short">Find ➔</span>
                </button>
              </form>

              {/* Quick Popular Service Chips */}
              <div className="hero-tags-centered">
                <span className="quick-tags-label">Popular:</span>
                <div className="quick-tags-scroll-wrap">
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
              </div>
            </div>
          )}
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
                        handleEnquire(service);
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
          
          <div className="nexora-section-header pop-cat-header-wrap">
            <div className="nexora-section-header-content">
              <div className="pill-tag-coral" style={{ background: "rgba(255, 77, 45, 0.12)", borderColor: "rgba(255, 77, 45, 0.35)", color: "#FF4D2D", display: "inline-flex", marginBottom: "8px" }}>
                <span>🔥 ON-DEMAND SERVICE DIRECTORY</span>
              </div>
              <h2 className="nexora-section-title">Popular Service Categories</h2>
              <p className="nexora-section-subtitle">
                Browse verified local technicians, home repairs, salons, clinics & daily service pros.
              </p>
            </div>

            <Link 
              to="/categories" 
              className="pop-cat-expand-btn pop-cat-header-btn"
            >
              <span>View All 85+ Categories ➔</span>
            </Link>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="pop-cat-filters-bar">
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
            <div className="pop-cat-search-box">
              <span className="pop-cat-search-icon">🔎</span>
              <input
                type="text"
                placeholder="Search services (AC, Plumber, Salon)..."
                value={homeCatSearch}
                onChange={(e) => setHomeCatSearch(e.target.value)}
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
          <div className="pop-cat-expand-wrap">
            <Link to="/categories" className="pop-cat-expand-btn pop-cat-footer-btn">
              <span>Browse Complete Directory (85+ Categories) ➔</span>
            </Link>
            <span className="pop-cat-guarantee-note">
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
                      src="/images/verified_expert_pro.jpg" 
                      alt="Helper Verified Service Professionals" 
                      className="experts-hero-photo"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/homepage_5.jpg";
                      }}
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
          ADVANCED MULTI-OPTION BOOKING MODAL (Problem Selection, Slot & Address)
          ========================================================================= */}
      {selectedService && (
        <div className="booking-modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="booking-modal-box advanced-booking-modal animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedService(null)} aria-label="Close modal">✕</button>

            {enquirySuccess ? (
              <div className="modal-success-state animate-fade-in" style={{ textAlign: "center", padding: "28px 16px" }}>
                <div style={{ fontSize: "52px", marginBottom: "12px", animation: "checkmarkPop 0.4s ease" }}>🎉</div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#10B981", margin: "0 0 6px 0" }}>
                  Booking Confirmed Successfully!
                </h3>
                <p style={{ fontSize: "14px", color: "#64748B", margin: "0 0 16px 0" }}>
                  Direct doorstep service scheduled for <strong>{selectedService.name}</strong>.
                </p>
                <div className="confirmed-slot-pill">
                  <span>📅 {selectedBookingDate}</span>
                  <span className="dot-divider">•</span>
                  <span>⏰ {selectedTimeSlot}</span>
                </div>
                {selectedProblem && (
                  <p style={{ fontSize: "13.5px", color: "#334155", margin: "12px 0 6px" }}>
                    Selected Requirement: <strong>{selectedProblem}</strong>
                  </p>
                )}
                {customProblemNote && (
                  <p style={{ fontSize: "12.5px", color: "#64748B", margin: "0 0 12px" }}>
                    Customer Note: <em>"{customProblemNote}"</em>
                  </p>
                )}
                <div style={{ background: "linear-gradient(135deg, rgba(255, 77, 45, 0.08) 0%, rgba(255, 120, 94, 0.08) 100%)", border: "2px solid #FF4D2D", borderRadius: "16px", padding: "18px 12px", margin: "14px 0" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#FF4D2D", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    🔑 Your Service Start OTP
                  </div>
                  <div style={{ fontSize: "38px", fontWeight: 900, letterSpacing: "6px", color: "#0F172A", margin: "6px 0" }}>
                    {activeLiveBooking?.startOtp || activeLiveBooking?.slotOtp || "3459"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B", maxWidth: "340px", margin: "0 auto" }}>
                    Share this 4-digit code with the technician upon doorstep arrival to begin service.
                  </div>
                </div>

                <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px dashed #3B82F6", borderRadius: "12px", padding: "10px 14px", margin: "10px 0 16px", fontSize: "12.5px", color: "#1E3A8A", display: "flex", alignItems: "center", gap: "8px", textAlign: "left" }}>
                  <span style={{ fontSize: "18px" }}>💡</span>
                  <span><strong>Don't worry!</strong> Agar aap ye screen abhi hata ya band bhi kar dete hain, toh ye OTP aapke <strong>Profile &gt; My Bookings</strong> section me hamesha save rahega.</span>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button 
                    type="button" 
                    className="btn-coral" 
                    style={{ flex: 1, padding: "14px", fontWeight: 800, fontSize: "14.5px", borderRadius: "12px" }}
                    onClick={() => {
                      setSelectedService(null);
                      setEnquirySuccess(false);
                      navigate("/my-bookings");
                    }}
                  >
                    📋 Go to My Bookings &amp; OTP
                  </button>
                  <button 
                    type="button" 
                    className="btn-coral-outline" 
                    style={{ flex: 1, padding: "14px", fontWeight: 800, fontSize: "14.5px", borderRadius: "12px" }}
                    onClick={() => {
                      setSelectedService(null);
                      setEnquirySuccess(false);
                    }}
                  >
                    Done &amp; Close ✕
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="advanced-booking-form">
                {/* 1. Header with Service Info */}
                <div className="modal-service-summary-pro">
                  {selectedService.image ? (
                    <img src={selectedService.image} alt={selectedService.name} className="modal-service-thumb-img" />
                  ) : (
                    <span className="modal-service-icon" style={{ fontSize: "36px" }}>{selectedService.icon || "🛠️"}</span>
                  )}
                  <div className="modal-service-info-text">
                    <div className="modal-service-badges-row">
                      <span className="modal-dispatch-badge">⚡ 15-Min Express Arrival</span>
                      <span className="modal-rating-badge">★ {selectedService.rating || "5.0"}</span>
                    </div>
                    <h3 className="modal-service-title">{selectedService.name}</h3>
                    <p className="modal-service-price-note">
                      Starts at <strong className="modal-price-accent">₹{typeof selectedService.price === "number" ? selectedService.price : (String(selectedService.price).replace(/[^\d]/g, "") || "499")}</strong>
                      <span className="modal-rate-guarantee"> • Free Diagnostics with Service</span>
                    </p>
                  </div>
                </div>

                <div className="modal-scrollable-body">
                  {/* Step 1: Select Problem / Requirement */}
                  <div className="booking-modal-section">
                    <div className="section-label-row">
                      <span className="section-step-num">1</span>
                      <div>
                        <h4 className="section-step-title">Select Problem / Requirement</h4>
                        <p className="section-step-sub">Select the issue you're facing with your {selectedService.name}:</p>
                      </div>
                    </div>

                    <div className="problem-options-grid">
                      {getServiceProblems(selectedService).map((prob) => {
                        const isSelected = selectedProblem === prob.title;
                        const isOther = prob.id.includes("other") || prob.title.toLowerCase().includes("other");
                        return (
                          <button
                            key={prob.id}
                            type="button"
                            className={`problem-option-card ${isSelected ? "selected" : ""} ${isOther ? "is-other-option" : ""}`}
                            onClick={() => handleSelectProblem(prob.title)}
                          >
                            <span className="problem-icon">{prob.icon}</span>
                            <span className="problem-title">{prob.title}</span>
                            <span className="problem-radio-dot">{isSelected ? "✓" : ""}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Optional Custom Problem Notes - Highlighted with glow animation if 'Other' is picked */}
                    <div className={`problem-custom-note-wrap ${selectedProblem.toLowerCase().includes("other") ? "highlight-active" : ""}`}>
                      {selectedProblem.toLowerCase().includes("other") && (
                        <div className="other-helper-badge animate-fade-in">
                          <span>📝 Please describe your custom requirement or issue below:</span>
                        </div>
                      )}
                      <input
                        ref={customNoteInputRef}
                        type="text"
                        placeholder={
                          selectedProblem.toLowerCase().includes("other")
                            ? "Describe your specific problem or requirement here..."
                            : "Any additional notes or specific details? (Optional)"
                        }
                        value={customProblemNote}
                        onChange={(e) => setCustomProblemNote(e.target.value)}
                        className="problem-note-input"
                      />
                    </div>
                  </div>

                  {/* Step 2: Date & Time Slot Selection (Starts at 7:00 AM) */}
                  <div className="booking-modal-section">
                    <div className="section-label-row">
                      <span className="section-step-num">2</span>
                      <div>
                        <h4 className="section-step-title">Select Appointment Slot (From 7:00 AM)</h4>
                        <p className="section-step-sub">Choose your preferred date and arrival time slot:</p>
                      </div>
                    </div>

                    {/* Date Selector Pills */}
                    <div className="booking-date-pills-row">
                      {getBookingDates().map((dt) => (
                        <button
                          key={dt.key}
                          type="button"
                          className={`booking-date-pill ${selectedBookingDate === dt.fullLabel ? "active" : ""}`}
                          onClick={() => setSelectedBookingDate(dt.fullLabel)}
                        >
                          <span className="date-day-name">{dt.dayName}</span>
                          <span className="date-formatted">{dt.formattedDate}</span>
                        </button>
                      ))}
                    </div>

                    {/* Slot Period Filters (Morning / Afternoon / Evening) */}
                    <div className="slot-period-filters">
                      {["All", "Morning (7-12)", "Afternoon (12-5)", "Evening (5-9)"].map((filter) => {
                        const filterKey = filter.split(" ")[0];
                        return (
                          <button
                            key={filter}
                            type="button"
                            className={`slot-filter-btn ${slotFilter === filterKey ? "active" : ""}`}
                            onClick={() => setSlotFilter(filterKey)}
                          >
                            {filter}
                          </button>
                        );
                      })}
                    </div>

                    {/* Time Slots Grid (Starting strictly at 7:00 AM) */}
                    <div className="booking-slots-grid">
                      {bookingTimeSlots
                        .filter((slot) => {
                          if (slotFilter === "All") return true;
                          if (slotFilter === "Morning") return slot.period === "Morning";
                          if (slotFilter === "Afternoon") return slot.period === "Afternoon";
                          if (slotFilter === "Evening") return slot.period === "Evening" || slot.period === "Night";
                          return true;
                        })
                        .map((slot) => {
                          const isSlotSelected = selectedTimeSlot === slot.label;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              className={`booking-slot-chip ${isSlotSelected ? "selected" : ""}`}
                              onClick={() => setSelectedTimeSlot(slot.label)}
                            >
                              <span className="slot-clock-icon">⏰</span>
                              <span className="slot-time-text">{slot.label}</span>
                              {slot.badge && (
                                <span className="slot-meta-badge">{slot.badge}</span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Step 3: Address & Contact Phone */}
                  <div className="booking-modal-section">
                    <div className="section-label-row">
                      <span className="section-step-num">3</span>
                      <div>
                        <h4 className="section-step-title">Address & Contact Phone</h4>
                        <p className="section-step-sub">Technician will arrive at this address for doorstep service:</p>
                      </div>
                    </div>

                    {/* Full Name Input */}
                    <div className="booking-field-group">
                      <label className="booking-field-label">
                        <span>👤 Your Full Name</span>
                        <span className="field-required">*</span>
                      </label>
                      <div className="booking-input-wrap-pro">
                        <input
                          ref={nameInputRef}
                          type="text"
                          placeholder="e.g. Ajay Singh"
                          value={enquiryName}
                          onChange={(e) => setEnquiryName(e.target.value)}
                          required
                          className="booking-text-input-pro"
                        />
                      </div>
                    </div>

                    {/* Doorstep Address Input with Auto-Fill Button */}
                    <div className="booking-field-group">
                      <div className="booking-field-label-row">
                        <label className="booking-field-label">
                          <span>📍 Doorstep Address & Area</span>
                          <span className="field-required">*</span>
                        </label>
                        <button
                          type="button"
                          className="autofill-location-btn"
                          onClick={() => {
                            const saved = localStorage.getItem("helper_user_full_address") || "Palasia Square, Indore, Madhya Pradesh";
                            setBookingAddress(saved);
                          }}
                          title="Auto-fill saved address"
                        >
                          ⚡ Use Saved Location
                        </button>
                      </div>
                      <div className="booking-address-box-pro">
                        <span className="booking-addr-icon-pro">📍</span>
                        <input 
                          ref={addressInputRef}
                          type="text" 
                          value={bookingAddress} 
                          onChange={(e) => setBookingAddress(e.target.value)} 
                          placeholder="House / Flat No., Landmark, Area, Indore"
                          className="booking-addr-input-pro"
                          required
                        />
                      </div>
                    </div>

                    {/* Redesigned Modern 10-Digit Mobile Phone Input */}
                    <div className="booking-field-group">
                      <div className="booking-field-label-row">
                        <label className="booking-field-label">
                          <span>📱 10-Digit Mobile Number (for dispatch & OTP)</span>
                          <span className="field-required">*</span>
                        </label>
                        {enquiryPhone.length === 10 ? (
                          <span className="phone-valid-badge animate-scale-in">✓ Valid Mobile</span>
                        ) : enquiryPhone.length > 0 ? (
                          <span className="phone-digits-badge">{10 - enquiryPhone.length} digits left</span>
                        ) : null}
                      </div>
                      <div className={`booking-phone-input-wrap-pro ${enquiryPhone.length === 10 ? "is-valid" : ""}`}>
                        <div className="phone-flag-prefix-pro">
                          <span className="phone-flag-emoji">🇮🇳</span>
                          <span className="phone-prefix-code">+91</span>
                        </div>
                        <input 
                          ref={phoneInputRef}
                          type="tel"
                          placeholder="98765 43210"
                          value={enquiryPhone}
                          onChange={(e) => setEnquiryPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                          required
                          maxLength="10"
                          className="booking-phone-input-pro"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Bottom Action Row */}
                <div className="modal-booking-footer-bar">
                  <div className="modal-footer-price-info">
                    <span className="footer-price-label">ESTIMATED BILL</span>
                    <strong className="footer-price-value">
                      ₹{typeof selectedService.price === "number" ? selectedService.price : (String(selectedService.price).replace(/[^\d]/g, "") || "499")}
                    </strong>
                    <span className="footer-payment-mode">💵 Pay cash / UPI after service</span>
                  </div>

                  <button 
                    type="submit" 
                    className="modal-confirm-booking-btn" 
                    disabled={isSubmittingBooking || enquiryPhone.length < 10 || !bookingAddress.trim() || !enquiryName.trim() || !selectedTimeSlot}
                  >
                    {isSubmittingBooking ? (
                      <span>Dispatching Technician... ⏳</span>
                    ) : (
                      <span>BOOK SLOT ({selectedTimeSlot ? selectedTimeSlot.split(" - ")[0] : "07:00 AM"}) ⚡</span>
                    )}
                  </button>
                </div>
              </form>
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
          className="home-floating-live-tracker"
        >
          <span className="live-tracker-pulse-dot" />
          <span className="live-tracker-info-text">
            Live Dispatch: {activeLiveBooking.bookingId || "Active"} (OTP: {activeLiveBooking.startOtp || "3459"})
          </span>
          <span className="live-tracker-btn-text">Track 📡</span>
        </div>
      )}

      {/* End of 3D Stacking Layer */}
      </div>
    </div>
  );
}

export default Home;