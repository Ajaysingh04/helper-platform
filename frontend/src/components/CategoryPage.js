import React, { useContext, useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { LocationContext } from "../context/LocationContext";
import { DataContext } from "../context/DataContext";
import { popularCategories } from "../data/popularCategoriesData";
import { getServicemanImagesForCategory, getServicemanImage } from "../data/categoryImages";
import "../css/CategoryPage.css";
import { API_BASE } from "../apiConfig";

// Global cache for ItemDetailsPage lookup
export const categoryItemsRegistry = new Map();
export const realData = [];

const stemWord = (w) => (w || "").toLowerCase().trim()
  .replace(/ies$/, "")
  .replace(/try$/, "t")
  .replace(/y$/, "")
  .replace(/ers$/, "")
  .replace(/er$/, "")
  .replace(/ing$/, "")
  .replace(/s$/, "");

function matchesCategory(provider, reqCategory, categoryTitle) {
  if (!provider) return false;
  const cleanReq = (reqCategory || "").toLowerCase().replace(/[-_]/g, " ").trim();
  const cleanTitle = (categoryTitle || "").toLowerCase().replace(/[-_]/g, " ").trim();
  const reqStem = stemWord(cleanReq);
  
  const pCat = (provider.category || "").toLowerCase().replace(/[-_]/g, " ").trim();
  const pServiceCats = (provider.serviceCategories || []).map(c => String(c).toLowerCase().replace(/[-_]/g, " ").trim());
  const pShop = (provider.shopName || "").toLowerCase().replace(/[-_]/g, " ").trim();

  // 1. Direct equality / stem match on category or serviceCategories
  const allCats = [pCat, ...pServiceCats];
  for (const c of allCats) {
    if (!c) continue;
    if (c === cleanReq || c === cleanTitle) return true;
    const cStem = stemWord(c);
    if ((cStem === reqStem || cStem === stemWord(cleanTitle)) && cStem.length >= 4) return true;
    
    const escaped = cleanReq.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp("\\b" + escaped + "s?\\b", "i").test(c)) return true;
  }

  // 2. Token overlap: require whole words
  const reqTokens = cleanReq
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !["and", "for", "the", "services", "centres", "center", "hub", "care"].includes(w));

  if (reqTokens.length === 0) return false;

  // If query has multiple tokens (e.g. 'car rental'), require matching all tokens as whole words or full phrase
  if (reqTokens.length >= 2) {
    const matchAll = reqTokens.every(tok => {
      const escaped = tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const wordRegex = new RegExp("\\b" + escaped + "s?\\b", "i");
      return wordRegex.test(pCat) || wordRegex.test(pShop) || pServiceCats.some(sc => wordRegex.test(sc));
    });
    if (matchAll) return true;

    const escapedPhrase = cleanReq.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp("\\b" + escapedPhrase + "s?\\b", "i").test(pShop)) return true;
    return false;
  }

  // Single token query: must match as a standalone whole word
  const singleTok = reqTokens[0];
  const escaped = singleTok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordRegex = new RegExp("\\b" + escaped + "s?\\b", "i");
  return wordRegex.test(pCat) || wordRegex.test(pShop) || pServiceCats.some(sc => wordRegex.test(sc));
}

function CategoryPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { location, fetchLocation, locationError } = useContext(LocationContext);
  const dataContext = useContext(DataContext);
  const updateProviderInContext = dataContext?.updateProvider;
  const addProviderInContext = dataContext?.addProvider;
  const deleteProviderInContext = dataContext?.deleteProvider;

  const [sortBy, setSortBy] = useState("rating");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [backendCategoryProviders, setBackendCategoryProviders] = useState([]);

  // Customer Enquiry / Booking Modal State
  const [enquiryItem, setEnquiryItem] = useState(null);
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryAddress, setEnquiryAddress] = useState("");
  const [enquirySent, setEnquirySent] = useState(false);
  const [confirmedBookingInfo, setConfirmedBookingInfo] = useState(null);
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  // Appointment Scheduling & Telemetry State
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [bookingTime, setBookingTime] = useState("11:00 AM");
  const [bookingProblem, setBookingProblem] = useState("Water pipe leakage / repair");

  // Real-time Live Countdown, Stopwatch & Running Meter
  const [liveCountdown, setLiveCountdown] = useState("");
  const [liveStopwatch, setLiveStopwatch] = useState("00:00:00");
  const [liveRunningCost, setLiveRunningCost] = useState(149);

  // Robust Target Timestamp & Countdown Calculator
  const parseTargetCountdown = (b) => {
    if (!b) return { days: "00", hours: "00", mins: "00", secs: "00", isArrived: false, text: "00:00:00" };
    const now = Date.now();
    let target = b.scheduledTimestamp;

    if (!target || isNaN(target)) {
      const sDate = String(b.scheduledDate || "").trim();
      const sTime = String(b.scheduledTime || "11:00 AM").trim();
      const curr = new Date();
      let y = curr.getFullYear();
      let m = curr.getMonth();
      let d = curr.getDate();

      if (sDate.toLowerCase().includes("tomorrow")) {
        d += 1;
      } else if (sDate.includes("-")) {
        const parts = sDate.split("-");
        if (parts.length === 3) {
          y = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10) - 1;
          d = parseInt(parts[2], 10);
        }
      }

      let hours = 11;
      let minutes = 0;
      const match = sTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const meridiem = (match[3] || "").toUpperCase();
        if (meridiem === "PM" && hours < 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;
      }

      const parsedDate = new Date(y, m, d, hours, minutes, 0, 0);
      target = parsedDate.getTime();

      if (isNaN(target) || target <= now) {
        target = now + 45 * 60 * 1000;
      }
    }

    const diff = target - now;

    if (diff <= 0) {
      return {
        days: "00",
        hours: "00",
        mins: "00",
        secs: "00",
        isArrived: true,
        text: "00:00:00"
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    return {
      days: String(days).padStart(2, "0"),
      hours: String(hours).padStart(2, "0"),
      mins: String(mins).padStart(2, "0"),
      secs: String(secs).padStart(2, "0"),
      isArrived: false,
      text: `${days > 0 ? `${days}d ` : ""}${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`
    };
  };

  const [cdData, setCdData] = useState({ days: "00", hours: "00", mins: "45", secs: "00", isArrived: false });

  // Live Timer Hook (Countdown to slot & Work stopwatch)
  useEffect(() => {
    if (!confirmedBookingInfo) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const updatedCd = parseTargetCountdown(confirmedBookingInfo);
      setCdData(updatedCd);
      setLiveCountdown(updatedCd.text);

      // If job is in progress, tick live stopwatch & calculate running dynamic cost
      if (confirmedBookingInfo.status === "in_progress" && confirmedBookingInfo.workStartedAt) {
        const start = new Date(confirmedBookingInfo.workStartedAt).getTime();
        const elapsedSec = Math.max(0, Math.floor((now - start) / 1000));
        const swHours = Math.floor(elapsedSec / 3600);
        const swMins = Math.floor((elapsedSec % 3600) / 60);
        const swSecs = elapsedSec % 60;
        setLiveStopwatch(`${swHours.toString().padStart(2, "0")}:${swMins.toString().padStart(2, "0")}:${swSecs.toString().padStart(2, "0")}`);

        const base = confirmedBookingInfo.homeServiceCharge || 149;
        const rate = confirmedBookingInfo.hourlyRate || 299;
        const hoursFraction = Math.max(1, Math.round((elapsedSec / 3600) * 10) / 10);
        const running = base + Math.round(hoursFraction * rate);
        setLiveRunningCost(running);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [confirmedBookingInfo]);

  // Real-time synchronization polling for active booking status (Slot OTP confirm, QR scan start, stop work)
  useEffect(() => {
    if (!confirmedBookingInfo?.bookingCode) return;

    const pollInterval = setInterval(async () => {
      try {
        const code = confirmedBookingInfo.bookingCode || confirmedBookingInfo.id;
        const res = await fetch(`${API_BASE}/bookings/${code}`);
        const data = await res.json();
        if (data.success && data.data) {
          setConfirmedBookingInfo(prev => ({
            ...prev,
            ...data.data,
            slotConfirmed: data.data.slotConfirmed || (data.data.status !== "assigned" && data.data.status !== "requested"),
            status: data.data.status || prev.status
          }));
        }
      } catch (e) {}
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [confirmedBookingInfo?.bookingCode]);

  // Edit Provider Modal State (Updates Backend)
  const [editingProvider, setEditingProvider] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    shopName: "",
    phone: "",
    distance: "",
    experience: "",
    rating: 4.9,
    address: ""
  });

  // Add New Provider Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingPro, setIsAddingPro] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    shopName: "",
    phone: "",
    distance: "1.2 km",
    experience: "5+ Years Exp",
    rating: 4.9,
    address: "Central Zone, Main Market"
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  // Normalize category slug & obtain metadata
  const currentSlug = (name || "services").toLowerCase().trim();

  // Fetch real-time providers directly from Backend database for this specific category
  const fetchCategoryProviders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/providers?category=${encodeURIComponent(currentSlug)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBackendCategoryProviders(data.data);
      }
    } catch (e) {
      console.warn("Category providers backend fetch notice:", e);
    }
  }, [currentSlug]);

  useEffect(() => {
    fetchCategoryProviders();
  }, [fetchCategoryProviders]);

  // Re-fetch when vendor profile updates in local session
  useEffect(() => {
    const handleUpdate = () => fetchCategoryProviders();
    window.addEventListener("vendor_updated", handleUpdate);
    return () => window.removeEventListener("vendor_updated", handleUpdate);
  }, [fetchCategoryProviders]);

  const matchedCategory = useMemo(() => {
    return (
      popularCategories.find(
        (c) =>
          c.path.toLowerCase() === currentSlug ||
          c.name.toLowerCase().replace(/\s+/g, "-") === currentSlug ||
          c.name.toLowerCase() === currentSlug.replace(/-/g, " ")
      ) || null
    );
  }, [currentSlug]);

  const categoryTitle = useMemo(() => {
    if (matchedCategory) return matchedCategory.name;
    return currentSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [matchedCategory, currentSlug]);

  const categoryIcon = matchedCategory?.icon || "⚡";
  const categoryImage = matchedCategory?.image || "";
  const categoryTag = matchedCategory?.tag || "Verified Sector";
  const categoryCount = matchedCategory?.count || "50+ Specialists";

  const isAdmin = localStorage.getItem("helper_admin_auth") === "true";

  // Filter providers from DataContext / Backend for this category
  const categoryProviders = useMemo(() => {
    const allProviders = dataContext?.providers || [];
    const cleanCat = categoryTitle.toLowerCase();
    const cleanSlug = currentSlug.replace(/[-_]/g, " ").toLowerCase();
    const stemSlug = cleanSlug.replace(/s$/, "");
    const stemCat = cleanCat.replace(/s$/, "");

    // Also check active vendor from localStorage
    let activeVendor = null;
    try {
      const rawV = localStorage.getItem("helper_vendor");
      if (rawV) activeVendor = JSON.parse(rawV);
    } catch (e) {}

    // Combine all potential sources: backendCategoryProviders, allProviders, activeVendor
    const combinedList = [...backendCategoryProviders];
    allProviders.forEach(p => {
      if (!combinedList.some(c => (c.id && c.id === p.id) || (c._id && c._id === p._id))) {
        combinedList.push(p);
      }
    });

    if (activeVendor && (activeVendor.name || activeVendor.shopName)) {
      const vCat = (activeVendor.category || "").toLowerCase();
      if (vCat.includes(stemSlug) || stemSlug.includes(vCat) || vCat.includes(stemCat) || stemCat.includes(vCat)) {
        const existingIdx = combinedList.findIndex(p => p.id === activeVendor.id || (p.name && p.name.toLowerCase() === activeVendor.name?.toLowerCase()));
        const formattedActive = {
          id: activeVendor.id || `vdr_${Date.now()}`,
          name: activeVendor.name,
          shopName: activeVendor.shopName || `${activeVendor.name}'s ${activeVendor.category} Services`,
          category: activeVendor.category || categoryTitle,
          serviceCategories: activeVendor.serviceCategories || [activeVendor.category || categoryTitle],
          phone: activeVendor.phone || "+91 98765 00001",
          contact: activeVendor.phone || "+91 98765 00001",
          rating: activeVendor.rating || 5.0,
          verified: true,
          status: "Active",
          franchiseActive: true,
          distance: activeVendor.distance || "1.2 km",
          experience: activeVendor.experience || "3+ Years Exp",
          address: activeVendor.address || activeVendor.location || "Central Zone, Main Market",
          location: activeVendor.location || "Indore / Delhi NCR",
          image: activeVendor.image || activeVendor.avatar || "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400",
          avatar: activeVendor.avatar || activeVendor.image || "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400"
        };
        if (existingIdx !== -1) {
          combinedList[existingIdx] = { ...combinedList[existingIdx], ...formattedActive };
        } else {
          combinedList.unshift(formattedActive);
        }
      }
    }

    let matching = combinedList.filter((p) => {
      return matchesCategory(p, currentSlug, categoryTitle);
    });

    // Ensure featured partner Rahul Gandhi / Amritam is always prominently at top for Massage & Spa
    const isSpaCategory = cleanCat.includes("massage") || cleanCat.includes("spa") || cleanSlug.includes("massage") || cleanSlug.includes("spa");
    if (isSpaCategory) {
      const rahul = combinedList.find(p => p.id === "vdr_rahul_amritam" || (p.name && p.name.toLowerCase().includes("rahul")));
      if (rahul && !matching.some(m => m.id === rahul.id || m.name === rahul.name)) {
        matching = [rahul, ...matching];
      } else if (rahul) {
        matching = [rahul, ...matching.filter(m => m.id !== rahul.id && m.name !== rahul.name)];
      }
    }

    // Sort to prioritize active franchise vendors (e.g. Rakesh, Rahul) right at top
    matching.sort((a, b) => {
      const aIsActive = a.franchiseActive || a.name?.toLowerCase().includes("rakesh") || a.id?.startsWith("vdr_");
      const bIsActive = b.franchiseActive || b.name?.toLowerCase().includes("rakesh") || b.id?.startsWith("vdr_");
      if (aIsActive && !bIsActive) return -1;
      if (!aIsActive && bIsActive) return 1;
      return 0;
    });

    // Fallback template items if this category does not yet have custom entries in DB
    const catImages = getServicemanImagesForCategory(categoryTitle || currentSlug);
    const seedItems = [
      {
        id: `seed_${currentSlug}_1`,
        name: "Rajesh Kumar (Chief Specialist)",
        shopName: `Premier ${categoryTitle} Hub`,
        category: categoryTitle,
        phone: "+91 98765 43210",
        distance: "1.1 km",
        experience: "8+ Years Exp",
        rating: 4.9,
        totalReviewsCount: 310,
        location: "Sector 18, Central Zone",
        address: "Sector 18, Central Zone, Near Metro",
        facilities: ["Verified Specialist", "Instant Booking", "Same Day Service", "Warranty Covered"],
        avatar: catImages[0],
        image: catImages[0],
        verified: true
      },
      {
        id: `seed_${currentSlug}_2`,
        name: "Amit Saxena (Senior Partner)",
        shopName: `Royal ${categoryTitle} & Services`,
        category: categoryTitle,
        phone: "+91 98765 88990",
        distance: "2.3 km",
        experience: "10+ Years Exp",
        rating: 4.8,
        totalReviewsCount: 240,
        location: "Ring Road, Commercial Phase",
        address: "Ring Road, Commercial Phase, North Sector",
        facilities: ["Top Rated Pro", "Fast Dispatch", "Digital Billing", "Police Verified"],
        avatar: catImages[1],
        image: catImages[1],
        verified: true
      },
      {
        id: `seed_${currentSlug}_3`,
        name: "Pooja Sharma (Expert Consultant)",
        shopName: `City Apex ${categoryTitle} Centre`,
        category: categoryTitle,
        phone: "+91 98765 11223",
        distance: "3.5 km",
        experience: "6+ Years Exp",
        rating: 4.7,
        totalReviewsCount: 180,
        location: "Galleria Commercial Zone",
        address: "Galleria Commercial Zone, City South",
        facilities: ["Certified Technicians", "Zero Advance", "Quality Assured", "24/7 Support"],
        avatar: catImages[2],
        image: catImages[2],
        verified: true
      }
    ];

    if (matching.length === 0) {
      matching = seedItems;
    } else if (matching.length < 3) {
      // Append seed items so user always sees full options while real providers are on top
      seedItems.forEach(s => {
        if (!matching.some(m => m.id === s.id || m.name === s.name)) {
          matching.push(s);
        }
      });
    }

    // Save to global registry so ItemDetailsPage can view any profile
    matching.forEach((item) => {
      categoryItemsRegistry.set(String(item.id), item);
      categoryItemsRegistry.set(String(item._id), item);
    });

    return matching;
  }, [backendCategoryProviders, dataContext?.providers, categoryTitle, currentSlug]);

  // Admin delete provider handler
  const handleDeleteProvider = async (id) => {
    try {
      if (deleteProviderInContext) {
        await deleteProviderInContext(id);
      }
      setBackendCategoryProviders(prev => prev.filter(p => String(p.id) !== String(id) && String(p._id) !== String(id)));
      showToast("🗑️ Provider deleted successfully by Admin from Backend Database");
    } catch (err) {
      showToast(`Delete error: ${err.message}`);
    }
  };

  // Search filtering
  const filtered = useMemo(() => {
    return categoryProviders.filter((p) => {
      const q = searchTerm.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.shopName && p.shopName.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.experience && p.experience.toLowerCase().includes(q))
      );
    });
  }, [categoryProviders, searchTerm]);

  // Sorting by rating or nearest distance (KM)
  const sortedData = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "rating") return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      if (sortBy === "distance") {
        const distA = parseFloat(String(a.distance || "99").replace(/[^0-9.]/g, "")) || 99;
        const distB = parseFloat(String(b.distance || "99").replace(/[^0-9.]/g, "")) || 99;
        return distA - distB;
      }
      return 0;
    });
  }, [filtered, sortBy]);

  // Open Edit Modal with existing provider data
  const handleOpenEdit = (item) => {
    setEditingProvider(item);
    setEditForm({
      name: item.name || "",
      shopName: item.shopName || "",
      phone: item.phone || item.contact || "",
      distance: item.distance || "1.2 km",
      experience: item.experience || "5+ Years Exp",
      rating: item.rating || 4.9,
      address: item.address || item.location || ""
    });
  };

  // Submit Edit: updates in Context, sends PUT to backend (MongoDB + database.json)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProvider) return;
    setIsSavingEdit(true);

    const updatedFields = {
      name: editForm.name.trim(),
      shopName: editForm.shopName.trim(),
      phone: editForm.phone.trim(),
      distance: editForm.distance.trim().includes("km") ? editForm.distance.trim() : `${editForm.distance.trim()} km`,
      experience: editForm.experience.trim().toLowerCase().includes("exp") ? editForm.experience.trim() : `${editForm.experience.trim()} Exp`,
      rating: parseFloat(editForm.rating) || 4.9,
      address: editForm.address.trim(),
      location: editForm.address.trim()
    };

    try {
      if (updateProviderInContext) {
        await updateProviderInContext(editingProvider.id || editingProvider._id, updatedFields);
      }
      showToast(`✅ Saved! ${updatedFields.name} updated in Backend Database.`);
      setEditingProvider(null);
    } catch (err) {
      showToast(`⚠️ Updated locally. Notice: ${err.message}`);
      setEditingProvider(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Add New Provider directly to this category
  const handleSaveNewProvider = async (e) => {
    e.preventDefault();
    setIsAddingPro(true);

    const newPro = {
      id: `prv_${Date.now()}`,
      name: addForm.name.trim(),
      shopName: addForm.shopName.trim() || `${addForm.name.trim()}'s ${categoryTitle}`,
      category: categoryTitle,
      serviceCategories: [categoryTitle],
      phone: addForm.phone.trim(),
      distance: addForm.distance.trim().includes("km") ? addForm.distance.trim() : `${addForm.distance.trim()} km`,
      experience: addForm.experience.trim().toLowerCase().includes("exp") ? addForm.experience.trim() : `${addForm.experience.trim()} Exp`,
      rating: parseFloat(addForm.rating) || 4.9,
      address: addForm.address.trim(),
      location: addForm.address.trim(),
      verified: true,
      status: "Active",
      facilities: ["Certified Specialist", "Instant Booking", "Warranty Covered"],
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400"
    };

    try {
      if (addProviderInContext) {
        await addProviderInContext(newPro);
      }
      showToast(`🎉 New Serviceman ${newPro.name} added to ${categoryTitle} in Backend!`);
      setShowAddModal(false);
      setAddForm({
        name: "",
        shopName: "",
        phone: "",
        distance: "1.2 km",
        experience: "5+ Years Exp",
        rating: 4.9,
        address: "Central Zone, Main Market"
      });
    } catch (err) {
      showToast(`Added locally: ${err.message}`);
      setShowAddModal(false);
    } finally {
      setIsAddingPro(false);
    }
  };

  // Real Customer Booking submit (dispatches to Backend, Admin & Service Man Panel)
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (enquiryPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSubmittingEnquiry(true);
    const bookingCode = `HLP-${Math.floor(10000 + Math.random() * 90000)}`;
    const slotOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const startQrCode = `QR-HLP-${bookingCode}-${Math.floor(1000 + Math.random() * 9000)}`;
    const homeServiceCharge = 149;
    const hourlyRateNum = parseInt(String(enquiryItem.hourlyRate || "299").replace(/[^0-9]/g, "")) || 299;

    let scheduledTimestamp = Date.now() + 7200000;
    try {
      if (bookingDate) {
        let cleanTime = bookingTime || "11:00 AM";
        if (cleanTime.includes("-")) cleanTime = cleanTime.split("-")[0].trim();
        const d = new Date(`${bookingDate} ${cleanTime}`).getTime();
        if (!isNaN(d)) scheduledTimestamp = d;
      }
    } catch (e) {}

    const newBookingData = {
      id: bookingCode,
      bookingCode,
      bookingId: bookingCode,
      customerName: enquiryName.trim() || "Customer",
      name: enquiryName.trim() || "Customer",
      customerPhone: enquiryPhone.startsWith("+91") ? enquiryPhone : `+91 ${enquiryPhone}`,
      phone: enquiryPhone.startsWith("+91") ? enquiryPhone : `+91 ${enquiryPhone}`,
      service: enquiryItem.shopName ? `${enquiryItem.shopName} • ${categoryTitle}` : categoryTitle,
      serviceName: `${enquiryItem.shopName || enquiryItem.name} • ${categoryTitle}`,
      serviceCategory: enquiryItem.category || categoryTitle,
      price: `₹${homeServiceCharge}`,
      totalAmount: homeServiceCharge,
      homeServiceCharge,
      hourlyRate: hourlyRateNum,
      scheduledDate: bookingDate,
      scheduledTime: bookingTime,
      scheduledTimestamp,
      problemDescription: bookingProblem,
      address: enquiryAddress.trim() || enquiryItem.address || enquiryItem.location || "Indore Ahinsha Tower / Local Address",
      provider: enquiryItem.shopName ? `${enquiryItem.shopName} • ${enquiryItem.name}` : enquiryItem.name,
      assignedProvider: enquiryItem.name,
      assignedProviderName: enquiryItem.name,
      providerId: enquiryItem.id || enquiryItem._id || "vdr_rahul_amritam",
      status: "assigned",
      slotConfirmed: false,
      slotOtp,
      startQrCode,
      doorOtp: slotOtp,
      date: "Just now"
    };

    try {
      if (dataContext?.addBooking) {
        await dataContext.addBooking(newBookingData);
      }
      setConfirmedBookingInfo(newBookingData);
      setEnquirySent(true);
      showToast(`🎉 Scheduled for ${bookingDate} at ${bookingTime}! Plumber will call to confirm. 📞`);
    } catch (err) {
      showToast(`Booking registered: ${err.message}`);
      setConfirmedBookingInfo(newBookingData);
      setEnquirySent(true);
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  return (
    <div className="category-page-wrapper">
      <div className="container-wrapper">

        {/* Top Header Bar */}
        <div className="category-top-bar">
          <button className="category-back-btn" onClick={() => navigate(-1)}>
            <span>←</span>
            <span>Back</span>
          </button>

          <div className="category-title-group" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {categoryImage ? (
              <img
                src={categoryImage}
                alt={categoryTitle}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  objectFit: "cover",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                  border: "2px solid rgba(255,255,255,0.8)"
                }}
              />
            ) : null}
            <div>
              <span className="category-tag-pill">
                {categoryIcon} {categoryTag} • DIRECTORY
              </span>
              <h1 className="category-heading">
                <span className="category-heading-title">{categoryTitle}</span>
                <span className="category-count-badge">
                  ({sortedData.length} Verified Centres • {categoryCount})
                </span>
              </h1>
            </div>
          </div>

          {/* Search, Sort & Add Controls */}
          <div className="category-controls">
            <input
              type="text"
              placeholder={`Search in ${categoryTitle}...`}
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
              <option value="distance">📍 Nearest Distance (KM)</option>
            </select>

            {localStorage.getItem("helper_admin_auth") === "true" && (
              <button
                type="button"
                className="btn-add-pro-header"
                onClick={() => setShowAddModal(true)}
                title="Admin only: Add a new serviceman / center to backend"
              >
                <span>🛡️</span>
                <span>Admin: Add Serviceman</span>
              </button>
            )}
          </div>
        </div>

        {/* Location Banner (if GPS not enabled) */}
        {!location && (
          <div className="location-alert-card animate-fade-in">
            <div className="alert-icon-box">📍</div>
            <div className="alert-text-content">
              <h3>Showing Verified Nearest Providers for {categoryTitle}</h3>
              <p>Detect your live location to calculate precise real-time distances and nearest arrivals.</p>
              {locationError && <p className="alert-error-msg">{locationError}</p>}
            </div>
            <button className="btn-primary-glow" onClick={fetchLocation}>
              <span>Detect GPS Location</span>
              <span>⚡</span>
            </button>
          </div>
        )}

        {/* Providers Listing Grid */}
        {/* Providers Listing Grid (Compact & Modern UX) */}
        <div className="category-items-grid compact-grid">
          {sortedData.map((item, idx) => {
            const fallbackImg = getServicemanImage(item.category || categoryTitle, idx);
            const displayImg = (item.avatar && !item.avatar.includes("photo-1540555700478")) 
              ? item.avatar 
              : ((item.image && !item.image.includes("photo-1540555700478")) ? item.image : fallbackImg);

            return (
              <div className="category-item-card-modern compact-pro-card" key={item.id || item._id}>
                {/* Compact Card Thumbnail with Overlays */}
                <div className="item-thumbnail-box compact-thumbnail">
                  <img
                    src={displayImg}
                    alt={item.shopName || item.name}
                    className="item-thumbnail-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImg;
                    }}
                  />
                  <div className="item-status-tag-compact">
                    <span className="live-dot" />
                    <span>Verified</span>
                  </div>

                  {isAdmin && (
                    <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px", zIndex: 10 }}>
                      <button
                        type="button"
                        className="btn-edit-pro-floating"
                        style={{ position: "static" }}
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                        title="Edit provider details (Admin Only)"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="btn-edit-pro-floating"
                        style={{ position: "static", background: "rgba(239, 68, 68, 0.95)", color: "#fff" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Admin: Remove provider "${item.shopName || item.name}" from database?`)) {
                            handleDeleteProvider(item.id || item._id);
                          }
                        }}
                        title="Delete provider (Admin Only)"
                      >
                        🗑️
                      </button>
                    </div>
                  )}

                  <div className="item-thumbnail-bottom-bar">
                    <span className="thumb-stat-pill stat-km">
                      📍 {item.distance || "1.2 km"}
                    </span>
                    <span className="thumb-stat-pill stat-rating">
                      ★ {item.rating || 4.9}
                    </span>
                  </div>
                </div>

                {/* Compact Card Info Panel */}
                <div className="item-info-panel compact-info-panel">
                  {/* Shop / Center Name */}
                  <Link 
                    to={`/details/${item.id || item._id}`} 
                    className="compact-item-title-link"
                    title={item.shopName || `${item.name}'s ${categoryTitle}`}
                  >
                    <h3 className="compact-item-title">
                      {item.shopName || `${item.name}'s ${categoryTitle}`}
                    </h3>
                  </Link>

                  {/* Serviceman Name & Experience */}
                  <div className="compact-serviceman-meta">
                    <span className="pro-name-tag">👨‍🔧 {item.name}</span>
                    <span className="meta-sep">•</span>
                    <span className="pro-exp-tag">{item.experience || "5+ Yrs Exp"}</span>
                  </div>

                  {/* Address */}
                  <div className="compact-address-row" title={item.address || item.location}>
                    <span className="addr-icon">📌</span>
                    <span className="addr-text">{item.address || item.location || "City Central Zone"}</span>
                  </div>

                  {/* 3 Compact Action Buttons */}
                  <div className="compact-card-actions">
                    <a
                      href={`tel:${item.phone || item.contact || "+919876543210"}`}
                      className="compact-action-btn btn-call"
                      title="Direct Phone Call"
                    >
                      <span>📞 Call</span>
                    </a>

                    <a
                      href={`https://wa.me/${String(item.phone || item.contact || "9876543210").replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(item.name)},%20I%20saw%20your%20listing%20for%20${encodeURIComponent(categoryTitle)}%20and%20would%20like%20to%20book%20a%20service.`}
                      target="_blank"
                      rel="noreferrer"
                      className="compact-action-btn btn-wa"
                      title="Chat on WhatsApp"
                    >
                      <span>💬 Chat</span>
                    </a>

                    <button
                      type="button"
                      className="compact-action-btn btn-book"
                      onClick={() => setEnquiryItem(item)}
                      title="Quick Booking Enquiry"
                    >
                      <span>⚡ Book</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* =========================================================================
          EDIT PROVIDER DETAILS MODAL (Updates directly to Backend MongoDB + JSON)
          ========================================================================= */}
      {editingProvider && (
        <div className="cat-preview-modal-overlay" onClick={() => !isSavingEdit && setEditingProvider(null)}>
          <div className="cat-preview-modal-box animate-fade-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <button className="modal-close-btn" onClick={() => setEditingProvider(null)} disabled={isSavingEdit}>✕</button>

            <div className="cat-modal-header">
              <div className="cat-modal-icon">
                ✏️
              </div>
              <div>
                <h3 className="cat-modal-title">Edit Serviceman Details</h3>
                <span style={{ fontSize: "13px", color: "#10B981", fontWeight: 700 }}>
                  ⚡ Any changes update directly in Backend (MongoDB & JSON)
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Service Man Name 👨‍🔧
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Contact Number 📞
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                  Service / Shop / Centre Name 🏢
                </label>
                <input
                  type="text"
                  value={editForm.shopName}
                  onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })}
                  required
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Distance (KM) 📍
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1.2 km"
                    value={editForm.distance}
                    onChange={(e) => setEditForm({ ...editForm, distance: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Experience 💼
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8+ Years"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Rating ⭐
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                  Address / Location 📌
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  className="btn-coral"
                  style={{ flex: 1, padding: "12px 20px" }}
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? "Updating in Backend... ⏳" : "Save Changes to Backend 💾"}
                </button>
                <button
                  type="button"
                  className="btn-coral-outline"
                  onClick={() => setEditingProvider(null)}
                  disabled={isSavingEdit}
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          ADD NEW SERVICEMAN MODAL (Saves to Backend)
          ========================================================================= */}
      {localStorage.getItem("helper_admin_auth") === "true" && showAddModal && (
        <div className="cat-preview-modal-overlay" onClick={() => !isAddingPro && setShowAddModal(false)}>
          <div className="cat-preview-modal-box animate-fade-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <button className="modal-close-btn" onClick={() => setShowAddModal(false)} disabled={isAddingPro}>✕</button>

            <div className="cat-modal-header">
              <div className="cat-modal-icon">
                ➕
              </div>
              <div>
                <h3 className="cat-modal-title">Add Serviceman for {categoryTitle}</h3>
                <span style={{ fontSize: "13px", color: "#FF4D2D", fontWeight: 700 }}>
                  Will be saved into MongoDB & backend database
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveNewProvider} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Service Man Name 👨‍🔧
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Contact Number 📞
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                  Service / Shop / Centre Name 🏢
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${addForm.name || "Pro"} ${categoryTitle}`}
                  value={addForm.shopName}
                  onChange={(e) => setAddForm({ ...addForm, shopName: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Distance (KM) 📍
                  </label>
                  <input
                    type="text"
                    placeholder="1.2 km"
                    value={addForm.distance}
                    onChange={(e) => setAddForm({ ...addForm, distance: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Experience 💼
                  </label>
                  <input
                    type="text"
                    placeholder="5+ Years Exp"
                    value={addForm.experience}
                    onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    Rating ⭐
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={addForm.rating}
                    onChange={(e) => setAddForm({ ...addForm, rating: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                  Address / Location 📌
                </label>
                <input
                  type="text"
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  className="btn-coral"
                  style={{ flex: 1, padding: "12px 20px" }}
                  disabled={isAddingPro}
                >
                  {isAddingPro ? "Adding to Backend... ⏳" : "Save & Add to Backend ⚡"}
                </button>
                <button
                  type="button"
                  className="btn-coral-outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={isAddingPro}
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Quick Customer Enquiry / Booking Modal */}
      {enquiryItem && (
        <div className="cat-preview-modal-overlay" onClick={() => setEnquiryItem(null)}>
          <div className="cat-preview-modal-box animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setEnquiryItem(null)}>✕</button>

            <div className="cat-modal-header">
              <div className="cat-modal-icon">
                {categoryIcon}
              </div>
              <div>
                <h3 className="cat-modal-title">{enquiryItem.shopName || enquiryItem.name}</h3>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className="pop-cat-badge-live">🛡️ Verified Center</span>
                  <span style={{ fontSize: "13px", color: "var(--beew-coral, #FF4D2D)", fontWeight: 600 }}>
                    ★ {enquiryItem.rating} ({enquiryItem.totalReviewsCount || 120} Reviews)
                  </span>
                </div>
              </div>
            </div>

            {enquirySent ? (
              <div style={{ textAlign: "center", padding: "10px 4px" }}>
                {/* 4-Stage Operational Stepper */}
                <div className="booking-stepper">
                  <div className={`step-item ${confirmedBookingInfo?.slotConfirmed ? "completed" : "active"}`}>
                    <div className="step-icon-bubble">{confirmedBookingInfo?.slotConfirmed ? "✓" : "📞"}</div>
                    <span>1. Call & OTP</span>
                  </div>
                  <div className={`step-item ${confirmedBookingInfo?.status === "in_progress" || confirmedBookingInfo?.status === "work_completed" || confirmedBookingInfo?.status === "completed" ? "completed" : confirmedBookingInfo?.slotConfirmed ? "active" : ""}`}>
                    <div className="step-icon-bubble">{confirmedBookingInfo?.status === "in_progress" || confirmedBookingInfo?.status === "work_completed" ? "✓" : "⏳"}</div>
                    <span>2. Slot Locked</span>
                  </div>
                  <div className={`step-item ${confirmedBookingInfo?.status === "in_progress" ? "active" : confirmedBookingInfo?.status === "work_completed" || confirmedBookingInfo?.status === "completed" ? "completed" : ""}`}>
                    <div className="step-icon-bubble">📱</div>
                    <span>3. Doorstep QR</span>
                  </div>
                  <div className={`step-item ${confirmedBookingInfo?.status === "work_completed" || confirmedBookingInfo?.status === "completed" ? "completed" : confirmedBookingInfo?.status === "in_progress" ? "active" : ""}`}>
                    <div className="step-icon-bubble">⏱️</div>
                    <span>4. Stopwatch & Bill</span>
                  </div>
                </div>

                {/* STAGE 1: Call & Slot OTP Verification */}
                {!confirmedBookingInfo?.slotConfirmed && confirmedBookingInfo?.status === "assigned" && (
                  <div className="animate-fade-in">
                    <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "14px", padding: "14px", marginBottom: "14px", textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "24px" }}>📞</span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "14.5px", color: "#1E3A8A", fontWeight: 800 }}>Plumber will call you shortly</h4>
                          <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#3B82F6" }}>
                            <strong>{enquiryItem.name}</strong> will call on <strong>{confirmedBookingInfo?.customerPhone}</strong> to verify location & requirements.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: "linear-gradient(135deg, rgba(255, 77, 45, 0.08) 0%, rgba(255, 120, 94, 0.08) 100%)", border: "2px solid #FF4D2D", borderRadius: "16px", padding: "18px 12px", margin: "14px 0" }}>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: "#FF4D2D", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        🔑 Your 4-Digit Slot Confirmation OTP
                      </div>
                      <div style={{ fontSize: "38px", fontWeight: 900, letterSpacing: "6px", color: "#0F172A", margin: "6px 0" }}>
                        {confirmedBookingInfo?.slotOtp || "8544"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", maxWidth: "340px", margin: "0 auto" }}>
                        Tell this OTP to <strong>{enquiryItem.name}</strong> over the phone call so your appointment date and time are officially locked!
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 2 & 3: Slot Locked, Live Countdown & Doorstep QR Code */}
                {confirmedBookingInfo?.slotConfirmed && confirmedBookingInfo?.status !== "in_progress" && confirmedBookingInfo?.status !== "work_completed" && confirmedBookingInfo?.status !== "completed" && (
                  <div className="animate-fade-in">
                    <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "10px 14px", marginBottom: "14px", color: "#166534", fontSize: "13.5px", fontWeight: 700 }}>
                      ✅ Appointment Locked for <strong>{confirmedBookingInfo?.scheduledDate}</strong> at <strong>{confirmedBookingInfo?.scheduledTime}</strong>!
                    </div>

                    {/* Live Glowing Countdown */}
                    <div className="telemetry-countdown-box">
                      <div className="telemetry-countdown-label">
                        <span>⏳</span>
                        <span>Plumber Arrival Live Countdown</span>
                      </div>

                      {/* 4 Digital Countdown Blocks */}
                      <div className="countdown-digits-grid">
                        <div className="countdown-digit-card">
                          <div className="digit-val">{cdData.days || "00"}</div>
                          <div className="digit-sub">DAYS</div>
                        </div>
                        <span className="digit-colon">:</span>
                        <div className="countdown-digit-card">
                          <div className="digit-val">{cdData.hours || "00"}</div>
                          <div className="digit-sub">HOURS</div>
                        </div>
                        <span className="digit-colon">:</span>
                        <div className="countdown-digit-card">
                          <div className="digit-val">{cdData.mins || "00"}</div>
                          <div className="digit-sub">MINS</div>
                        </div>
                        <span className="digit-colon">:</span>
                        <div className="countdown-digit-card active-tick">
                          <div className="digit-val" style={{ color: "#38BDF8" }}>{cdData.secs || "00"}</div>
                          <div className="digit-sub">SECS</div>
                        </div>
                      </div>

                      <div style={{ fontSize: "11.5px", color: "#94A3B8", marginTop: "4px" }}>
                        {cdData.isArrived
                          ? "🚨 Scheduled appointment time has arrived! Plumber is at your doorstep."
                          : `Time remaining until appointment on ${confirmedBookingInfo?.scheduledDate || "Today"} at ${confirmedBookingInfo?.scheduledTime || "slot"}`}
                      </div>
                    </div>

                    {/* Authentic Doorstep QR Code */}
                    <div className="telemetry-qr-card">
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", marginBottom: "8px" }}>
                        📱 Show This QR Code to Plumber on Arrival
                      </div>
                      <div className="qr-visual-box">
                        <svg viewBox="0 0 200 200" width="144" height="144">
                          <rect width="200" height="200" fill="#FFFFFF" rx="10" />
                          <rect x="15" y="15" width="50" height="50" fill="#0F172A" rx="8" />
                          <rect x="25" y="25" width="30" height="30" fill="#FFFFFF" rx="4" />
                          <rect x="33" y="33" width="14" height="14" fill="#FF4D2D" rx="2" />
                          
                          <rect x="135" y="15" width="50" height="50" fill="#0F172A" rx="8" />
                          <rect x="145" y="25" width="30" height="30" fill="#FFFFFF" rx="4" />
                          <rect x="153" y="33" width="14" height="14" fill="#FF4D2D" rx="2" />
                          
                          <rect x="15" y="135" width="50" height="50" fill="#0F172A" rx="8" />
                          <rect x="25" y="145" width="30" height="30" fill="#FFFFFF" rx="4" />
                          <rect x="33" y="153" width="14" height="14" fill="#FF4D2D" rx="2" />
                          
                          <circle cx="85" cy="30" r="5" fill="#0F172A" />
                          <circle cx="105" cy="30" r="5" fill="#0F172A" />
                          <circle cx="95" cy="50" r="6" fill="#FF4D2D" />
                          <circle cx="80" cy="70" r="5" fill="#0F172A" />
                          <circle cx="100" cy="75" r="5" fill="#0F172A" />
                          <circle cx="120" cy="70" r="5" fill="#0F172A" />
                          
                          <rect x="75" y="90" width="50" height="20" fill="#0F172A" rx="4" />
                          <circle cx="100" cy="100" r="4" fill="#FFFFFF" />
                          
                          <circle cx="80" cy="130" r="5" fill="#0F172A" />
                          <circle cx="100" cy="135" r="6" fill="#FF4D2D" />
                          <circle cx="120" cy="130" r="5" fill="#0F172A" />
                          <circle cx="145" cy="90" r="5" fill="#0F172A" />
                          <circle cx="165" cy="105" r="5" fill="#0F172A" />
                          <circle cx="150" cy="140" r="5" fill="#0F172A" />
                          <circle cx="170" cy="155" r="6" fill="#FF4D2D" />
                        </svg>
                        <div className="qr-laser-scanner" />
                      </div>
                      <span className="qr-label" style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>START TOKEN / PIN</span>
                      <span className="qr-code-val">{confirmedBookingInfo?.startQrCode || `START-${confirmedBookingInfo?.slotOtp || "8544"}`}</span>
                      <p style={{ fontSize: "11.5px", color: "#64748B", margin: "6px 0 0" }}>
                        Plumber will scan this QR at your door to start the official work stopwatch.
                      </p>
                    </div>
                  </div>
                )}

                {/* STAGE 4: Work in Progress - Live Work Stopwatch & Running Meter */}
                {confirmedBookingInfo?.status === "in_progress" && (
                  <div className="animate-fade-in">
                    <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "12px", padding: "10px 14px", marginBottom: "14px", color: "#065F46", fontSize: "13.5px", fontWeight: 800 }}>
                      ⚡ {enquiryItem.name} is working at your doorstep right now!
                    </div>

                    <div className="telemetry-stopwatch-box">
                      <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#A7F3D0" }}>
                        ⏱️ Live Work Stopwatch
                      </div>
                      <div className="stopwatch-time-val">
                        {liveStopwatch}
                      </div>
                      <div className="stopwatch-meter-row">
                        <div>
                          <span style={{ display: "block", color: "#A7F3D0", fontSize: "11px" }}>Visiting Charge</span>
                          <strong>₹{confirmedBookingInfo?.homeServiceCharge || 149}</strong>
                        </div>
                        <div>
                          <span style={{ display: "block", color: "#A7F3D0", fontSize: "11px" }}>Hourly Rate</span>
                          <strong>₹{confirmedBookingInfo?.hourlyRate || 299}/hr</strong>
                        </div>
                        <div>
                          <span style={{ display: "block", color: "#34D399", fontSize: "11px" }}>Current Running Total</span>
                          <strong style={{ color: "#34D399", fontSize: "15px" }}>₹{liveRunningCost}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 5: Work Completed & Itemized Digital Invoice */}
                {(confirmedBookingInfo?.status === "work_completed" || confirmedBookingInfo?.status === "completed") && (
                  <div className="animate-fade-in">
                    <div style={{ fontSize: "44px", marginBottom: "6px" }}>🎉</div>
                    <h4 style={{ fontSize: "20px", fontWeight: 800, color: "#10B981", margin: "0 0 6px" }}>
                      Work Completed Successfully!
                    </h4>
                    <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 14px" }}>
                      {enquiryItem.name} has finished the service and stopped the timer.
                    </p>

                    <div className="telemetry-invoice-card">
                      <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#0F172A", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                        <span>Itemized Bill Receipt</span>
                        <span style={{ color: "#059669" }}>⏱️ {confirmedBookingInfo?.workDurationFormatted || "1h 15m"}</span>
                      </div>
                      <div className="invoice-item-row">
                        <span>Doorstep Home Service Fee (Fixed)</span>
                        <strong>₹{confirmedBookingInfo?.homeServiceCharge || confirmedBookingInfo?.billBreakdown?.homeServiceCharge || 149}</strong>
                      </div>
                      <div className="invoice-item-row">
                        <span>Hourly Labor ({confirmedBookingInfo?.workDurationFormatted || "1h 15m"} @ ₹{confirmedBookingInfo?.hourlyRate || 299}/hr)</span>
                        <strong>₹{confirmedBookingInfo?.billBreakdown?.laborCharge || Math.round((confirmedBookingInfo?.hourlyRate || 299) * 1.3)}</strong>
                      </div>
                      {confirmedBookingInfo?.billBreakdown?.materialCost > 0 && (
                        <div className="invoice-item-row">
                          <span>Replacement Parts / Materials</span>
                          <strong>₹{confirmedBookingInfo?.billBreakdown?.materialCost}</strong>
                        </div>
                      )}
                      <div className="invoice-total-row">
                        <span>Total Payable</span>
                        <span style={{ color: "#10B981" }}>₹{confirmedBookingInfo?.totalAmount || confirmedBookingInfo?.finalCalculatedAmount || 688}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Order Meta Bar */}
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "12px 14px", margin: "14px 0", textAlign: "left", fontSize: "12.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#64748B" }}>Booking ID:</span>
                    <strong>{confirmedBookingInfo?.bookingCode || "HLP-72819"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#64748B" }}>Scheduled Slot:</span>
                    <strong style={{ color: "#FF4D2D" }}>{confirmedBookingInfo?.scheduledDate} at {confirmedBookingInfo?.scheduledTime}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Plumber:</span>
                    <strong>{enquiryItem.name} ({enquiryItem.shopName || "Plumbing Care"})</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-coral"
                  style={{ width: "100%", padding: "12px", fontWeight: 700 }}
                  onClick={() => {
                    setEnquirySent(false);
                    setEnquiryItem(null);
                    setConfirmedBookingInfo(null);
                  }}
                >
                  Done & Back to Directory ⚡
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} style={{ marginTop: "14px" }}>
                <p className="cat-modal-desc">
                  Schedule direct doorstep service with <strong>{enquiryItem.name}</strong> ({enquiryItem.shopName || "Specialist"}).
                </p>

                {/* Transparent Upfront Pricing Card */}
                <div className="pricing-transparency-card">
                  <div className="pricing-transparency-row">
                    <span>🏠 Doorstep Home Service Charge</span>
                    <strong style={{ color: "#0F172A" }}>₹149 (Fixed)</strong>
                  </div>
                  <div className="pricing-transparency-row">
                    <span>⏱️ Hourly Labor Rate</span>
                    <strong style={{ color: "#FF4D2D" }}>{enquiryItem.hourlyRate || "₹299/hr"} (Starts via Doorstep QR)</strong>
                  </div>
                  <div className="pricing-transparency-row" style={{ fontSize: "11.5px", color: "#10B981" }}>
                    <span>🛡️ Protection</span>
                    <strong>30-Day Work Warranty Included</strong>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>Your Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ajay Singh"
                      value={enquiryName}
                      onChange={(e) => setEnquiryName(e.target.value)}
                      required
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>Mobile Number *</label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span style={{ padding: "9px 10px", background: "#F1F5F9", borderRadius: "10px", border: "1px solid #CBD5E1", fontWeight: 700, fontSize: "13px" }}>+91</span>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={enquiryPhone}
                        onChange={(e) => setEnquiryPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                        required
                        style={{ flex: 1, padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Date Picker & Quick Day Chips */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    📅 Select Service Date (Konse din service chahiye?) *
                  </label>
                  <div className="booking-chips-grid">
                    <button
                      type="button"
                      className={`booking-chip-btn ${bookingDate === todayStr ? "active" : ""}`}
                      onClick={() => setBookingDate(todayStr)}
                    >
                      Today ({todayStr})
                    </button>
                    <button
                      type="button"
                      className={`booking-chip-btn ${bookingDate === tomorrowStr ? "active" : ""}`}
                      onClick={() => setBookingDate(tomorrowStr)}
                    >
                      Tomorrow ({tomorrowStr})
                    </button>
                  </div>
                  <input
                    type="date"
                    min={todayStr}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px", marginTop: "6px" }}
                  />
                </div>

                {/* Time Slot Picker */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    ⏰ Select Time Slot (Kitne baje chahiye?) *
                  </label>
                  <div className="booking-chips-grid">
                    {["09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM"].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`booking-chip-btn ${bookingTime === slot ? "active" : ""}`}
                        onClick={() => setBookingTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issue Description */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>
                    🔧 Problem / Work Needed (Kya problem hai?)
                  </label>
                  <div className="booking-chips-grid" style={{ marginBottom: "6px" }}>
                    {["Pipe Leakage", "Drainage Clog", "Tap Replacement", "Geyser Setup", "Inspection"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="booking-chip-btn"
                        onClick={() => setBookingProblem(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Bathroom sink water leakage"
                    value={bookingProblem}
                    onChange={(e) => setBookingProblem(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                {/* Service Address */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, marginBottom: "4px" }}>Full Address & Area *</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 304, Ahinsa Tower, MG Road, Indore"
                    value={enquiryAddress}
                    onChange={(e) => setEnquiryAddress(e.target.value)}
                    required
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "13.5px" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    type="submit" 
                    className="btn-coral" 
                    style={{ flex: 1, padding: "13px 20px", fontWeight: 800, fontSize: "15px" }}
                    disabled={isSubmittingEnquiry}
                  >
                    {isSubmittingEnquiry ? "Locking Appointment..." : `Confirm & Book Slot (${bookingDate}) ⚡`}
                  </button>
                  <a
                    href={`tel:${enquiryItem.phone || enquiryItem.contact || "+919876543210"}`}
                    className="btn-coral-outline"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", padding: "12px 16px" }}
                  >
                    📞 Call Pro
                  </a>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Floating Backend Sync Toast Notification */}
      {toastMessage && (
        <div className="toast-backend-sync">
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

export default CategoryPage;
