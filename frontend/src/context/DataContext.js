import React, { createContext, useState, useEffect, useCallback } from "react";
import { popularCategories } from "../data/popularCategoriesData";
import { initialOffers } from "../data/offersData";
import { initialHeroBanners } from "../data/heroBannersData";
import { API_BASE } from "../apiConfig";

export const DataContext = createContext();

// Initial Default Data with 85 Popular Categories
const initialCategories = popularCategories;

const initialServices = [
  { id: 1, name: "Electrician", icon: "💡", desc: "Short circuits, wiring, switchboards, inverter & fan repairs.", price: "₹249", tag: "Repairs", popular: true, bookings: "1.2k", rating: 4.9 },
  { id: 2, name: "Plumber", icon: "🚰", desc: "Leak repair, tap replacement, drainage clogs & water heaters.", price: "₹199", tag: "Repairs", popular: true, bookings: "980+", rating: 4.8 },
  { id: 3, name: "Home Cleaner", icon: "🧹", desc: "Full house deep cleaning, sofa scrubbing & sanitization.", price: "₹499", tag: "Cleaning", popular: true, bookings: "2.5k", rating: 4.9 },
  { id: 4, name: "Home Chef", icon: "👨‍🍳", desc: "Daily nutritious meals, custom diet menus & party cuisine cooking.", price: "₹399", tag: "Kitchen", popular: false, bookings: "750+", rating: 4.8 },
  { id: 5, name: "Home Keeper", icon: "🏠", desc: "Daily dusting, utensil assistance, organizing & housekeeping.", price: "₹349", tag: "Daily Help", popular: false, bookings: "620+", rating: 4.7 },
  { id: 6, name: "Nanny / Babysitter", icon: "👶", desc: "Trained, attentive and background-screened infant & toddler care.", price: "₹450", tag: "Daily Help", popular: false, bookings: "430+", rating: 4.9 },
  { id: 7, name: "Wall Painter", icon: "🎨", desc: "Interior, exterior, texture designs & waterproof painting.", price: "₹599", tag: "Home Decor", popular: false, bookings: "890+", rating: 4.8 },
  { id: 8, name: "Carpenter", icon: "🪚", desc: "Furniture crafting, repair, lock assembly & custom woodwork.", price: "₹299", tag: "Repairs", popular: true, bookings: "1.1k", rating: 4.8 },
  { id: 9, name: "AC Repair & Gas", icon: "🧊", desc: "AC foam wash, gas leak fix, cooling troubleshooting & PCB repair.", price: "₹399", tag: "Appliances", popular: true, bookings: "3.4k", rating: 4.9 },
  { id: 10, name: "Appliance Repair", icon: "🛠️", desc: "Washing machine, fridge, microwave & TV fixing.", price: "₹299", tag: "Appliances", popular: false, bookings: "1.5k", rating: 4.8 }
];

const initialProviders = [
  { 
    id: 101, 
    name: "Ramesh Sharma", 
    shopName: "Sharma Express Electricals", 
    category: "Electrician", 
    contact: "+91 98765 11001", 
    rating: 4.9, 
    status: "Active", 
    verified: true, 
    jobsDone: 420, 
    distance: "1.1 km", 
    hourlyRate: "₹249/hr",
    address: "Sector 62, Noida", 
    experience: "8+ Years Exp",
    badges: ["Govt Certified", "Top Rated"],
    image: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400" 
  },
  { 
    id: 102, 
    name: "Manoj Kumar", 
    shopName: "Rapid Flow Plumbing Works", 
    category: "Plumber", 
    contact: "+91 98765 22002", 
    rating: 4.8, 
    status: "Active", 
    verified: true, 
    jobsDone: 310, 
    distance: "1.8 km", 
    hourlyRate: "₹199/hr",
    address: "Sector 18, Noida", 
    experience: "6+ Years Exp",
    badges: ["Leak Specialist", "Instant Dispatch"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" 
  },
  { 
    id: 103, 
    name: "Arvind Verma", 
    shopName: "CoolTech AC & Jet Services", 
    category: "Appliances", 
    contact: "+91 98765 33003", 
    rating: 4.9, 
    status: "Active", 
    verified: true, 
    jobsDone: 530, 
    distance: "2.3 km", 
    hourlyRate: "₹399/hr",
    address: "Sector 50, Noida", 
    experience: "10+ Years Exp",
    badges: ["Jet Foam Clean", "PCB Expert"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" 
  },
  { 
    id: 104, 
    name: "Sunita & Team", 
    shopName: "ProClean Deep Sanitization", 
    category: "Cleaning", 
    contact: "+91 98765 44004", 
    rating: 4.9, 
    status: "Active", 
    verified: true, 
    jobsDone: 680, 
    distance: "1.5 km", 
    hourlyRate: "₹499/hr",
    address: "Indirapuram, Ghaziabad", 
    experience: "5+ Years Exp",
    badges: ["Eco Clean Tech", "Police Verified"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" 
  },
  { 
    id: 105, 
    name: "Chef Vikram Singh", 
    shopName: "Gourmet Home Dining Co.", 
    category: "Daily Help", 
    contact: "+91 98765 55005", 
    rating: 4.8, 
    status: "Active", 
    verified: true, 
    jobsDone: 290, 
    distance: "2.8 km", 
    hourlyRate: "₹399/hr",
    address: "Sector 137, Noida", 
    experience: "7+ Years Exp",
    badges: ["North & Continental", "Hygienic Safe"],
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=400" 
  },
  { 
    id: 106, 
    name: "Suresh Suthar", 
    shopName: "Precision Woodcraft & Locks", 
    category: "Repairs", 
    contact: "+91 98765 66006", 
    rating: 4.8, 
    status: "Active", 
    verified: true, 
    jobsDone: 340, 
    distance: "3.2 km", 
    hourlyRate: "₹299/hr",
    address: "Mayur Vihar, Delhi", 
    experience: "9+ Years Exp",
    badges: ["Modular Furniture", "Instant Fix"],
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400" 
  },
  { 
    id: 107, 
    name: "Rajesh Painter", 
    shopName: "ColorCraft Waterproofing & Walls", 
    category: "Home Decor", 
    contact: "+91 98765 77007", 
    rating: 4.7, 
    status: "Active", 
    verified: true, 
    jobsDone: 210, 
    distance: "3.5 km", 
    hourlyRate: "₹599/hr",
    address: "Sector 76, Noida", 
    experience: "12+ Years Exp",
    badges: ["Asian Paints Certified", "Dust-Free"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" 
  },
  { 
    id: 108, 
    name: "Deepak Yadav", 
    shopName: "SafeDrive Verified Chauffeurs", 
    category: "Daily Help", 
    contact: "+91 98765 88008", 
    rating: 4.9, 
    status: "Active", 
    verified: true, 
    jobsDone: 510, 
    distance: "1.4 km", 
    hourlyRate: "₹349/hr",
    address: "Sector 62, Noida", 
    experience: "8+ Years Exp",
    badges: ["Zero Incident Record", "Commercial Lic"],
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400" 
  }
];

const initialBookings = [
  { id: "BK-9081", customerName: "Rahul Verma", phone: "+91 98765 12345", service: "AC Repair & Gas", price: "₹399", status: "Pending", date: "Today, 02:30 PM", address: "Flat 402, Green Valley Apartments", provider: "Apex Electrical Solutions" },
  { id: "BK-9080", customerName: "Priya Mehra", phone: "+91 98765 67890", service: "Home Cleaner", price: "₹499", status: "In Progress", date: "Today, 11:15 AM", address: "House 18, Block C, Metro Park", provider: "ProClean Sanitization Hub" },
  { id: "BK-9079", customerName: "Siddharth Jain", phone: "+91 98765 99887", service: "Electrician", price: "₹249", status: "Completed", date: "Yesterday, 04:00 PM", address: "Plot 89, Tech Residency", provider: "Apex Electrical Solutions" },
  { id: "BK-9078", customerName: "Ananya Roy", phone: "+91 98765 44332", service: "Plumber", price: "₹199", status: "Cancelled", date: "Yesterday, 10:00 AM", address: "Tower 2, Urban Heights", provider: "Rapid Flow Plumbing Works" }
];

const initialSlides = initialOffers;

const initialUsers = [
  { id: 1, name: "Ajay Singh Banafer", email: "ajay@example.com", phone: "+91 98765 43210", bookingsCount: 14, status: "Active", joined: "Jan 2026", role: "Super Admin" },
  { id: 2, name: "Vikram Sharma", email: "vikram@gmail.com", phone: "+91 98765 88990", bookingsCount: 6, status: "Active", joined: "Feb 2026", role: "Customer" },
  { id: 3, name: "Pooja Patel", email: "pooja.p@yahoo.com", phone: "+91 98765 33221", bookingsCount: 3, status: "Active", joined: "Mar 2026", role: "Customer" },
  { id: 4, name: "Ankit Verma", email: "ankit.v@hotmail.com", phone: "+91 98765 77665", bookingsCount: 0, status: "Suspended", joined: "Apr 2026", role: "Customer" }
];

const initialTickets = [
  { id: "TKT-101", name: "Rohan Gupta", email: "rohan@gmail.com", phone: "+91 98765 22114", subject: "Payment Deduction Issue", message: "Money deducted but booking was showing pending.", status: "Open", date: "Today" },
  { id: "TKT-102", name: "Simran Kaur", email: "simran@gmail.com", phone: "+91 98765 99001", subject: "Electrician Arrived Late", message: "Provider arrived 45 mins late than scheduled slot.", status: "Resolved", date: "Yesterday" }
];

const initialSettings = {
  platformCommission: "12%",
  serviceRadius: "20 km",
  supportHotline: "+91 98765 43210",
  supportEmail: "ajayworkon04@gmail.com",
  maintenanceMode: false,
  instantBookingEnabled: true,
  taxPercent: "5%"
};

export const DataProvider = ({ children }) => {
  // Load state with localStorage fallback (clearing stale category caches)
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("helper_categories");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 80 && parsed[0]?.name === "Body Massage Centres") {
          return parsed;
        }
      }
    } catch (e) {}
    return initialCategories;
  });

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem("helper_services");
    return saved ? JSON.parse(saved) : initialServices;
  });

  const [providers, setProviders] = useState(() => {
    const saved = localStorage.getItem("helper_providers");
    return saved ? JSON.parse(saved) : initialProviders;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem("helper_bookings");
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [slides, setSlides] = useState(() => {
    try {
      const saved = localStorage.getItem("helper_slides") || localStorage.getItem("helper_offers");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed;
        }
      }
    } catch (e) {}
    return initialOffers;
  });

  const [heroBanners, setHeroBanners] = useState(() => {
    try {
      const saved = localStorage.getItem("helper_hero_banners_v4");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4 && !parsed.some(b => b.image?.includes("helper_full_banner"))) {
          return parsed;
        }
      }
    } catch (e) {}
    return initialHeroBanners;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("helper_users");
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem("helper_tickets");
    return saved ? JSON.parse(saved) : initialTickets;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("helper_settings");
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [isApiOnline, setIsApiOnline] = useState(false);
  const [dbStatusText, setDbStatusText] = useState("Checking...");

  // Sync to backend on mount & fetch latest data
  const fetchAllFromBackend = useCallback(async () => {
    try {
      const healthRes = await fetch(`${API_BASE}/health`).then(r => r.json()).catch(() => null);
      if (healthRes && healthRes.status === "ok") {
        setIsApiOnline(true);
        setDbStatusText(healthRes.database || "Online");

        // Concurrently fetch all collections
        const [catRes, srvRes, prvRes, bkgRes, sldRes, usrRes, tktRes, stgRes] = await Promise.allSettled([
          fetch(`${API_BASE}/categories`).then(r => r.json()),
          fetch(`${API_BASE}/services`).then(r => r.json()),
          fetch(`${API_BASE}/providers`).then(r => r.json()),
          fetch(`${API_BASE}/bookings`).then(r => r.json()),
          fetch(`${API_BASE}/promotions`).then(r => r.json()),
          fetch(`${API_BASE}/users`).then(r => r.json()),
          fetch(`${API_BASE}/tickets`).then(r => r.json()),
          fetch(`${API_BASE}/settings`).then(r => r.json())
        ]);

        if (catRes.status === "fulfilled" && catRes.value?.data?.length) setCategories(catRes.value.data);
        if (srvRes.status === "fulfilled" && srvRes.value?.data?.length) setServices(srvRes.value.data);
        if (prvRes.status === "fulfilled" && prvRes.value?.data?.length) setProviders(prvRes.value.data);
        if (bkgRes.status === "fulfilled" && bkgRes.value?.data?.length) setBookings(bkgRes.value.data);
        if (sldRes.status === "fulfilled" && sldRes.value?.data?.length) setSlides(sldRes.value.data);
        if (usrRes.status === "fulfilled" && usrRes.value?.data?.length) setUsers(usrRes.value.data);
        if (tktRes.status === "fulfilled" && tktRes.value?.data?.length) setTickets(tktRes.value.data);
        if (stgRes.status === "fulfilled" && stgRes.value?.data) setSettings(stgRes.value.data);
      } else {
        setIsApiOnline(false);
        setDbStatusText("Offline / Local Cache");
      }
    } catch (e) {
      console.warn("Backend sync notice:", e);
      setIsApiOnline(false);
      setDbStatusText("Offline");
    }
  }, []);

  useEffect(() => {
    fetchAllFromBackend();
  }, [fetchAllFromBackend]);

  // Sync state changes to localStorage for offline cache
  useEffect(() => { localStorage.setItem("helper_categories", JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem("helper_services", JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem("helper_providers", JSON.stringify(providers)); }, [providers]);
  useEffect(() => { localStorage.setItem("helper_bookings", JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem("helper_slides", JSON.stringify(slides)); }, [slides]);
  useEffect(() => { localStorage.setItem("helper_hero_banners_v4", JSON.stringify(heroBanners)); }, [heroBanners]);
  useEffect(() => { localStorage.setItem("helper_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("helper_tickets", JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem("helper_settings", JSON.stringify(settings)); }, [settings]);

  // ================= CRUD ACTION DISPATCHERS =================
  // Services
  const addService = async (newServ) => {
    const item = { ...newServ, id: `s${Date.now()}`, rating: 4.8, bookings: "New" };
    setServices(prev => [item, ...prev]);

    try {
      await fetch(`${API_BASE}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
    } catch (err) {
      console.warn("Backend addService error:", err);
    }
  };

  const updateService = async (id, updatedFields) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));

    try {
      await fetch(`${API_BASE}/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.warn("Backend updateService error:", err);
    }
  };

  const deleteService = async (id) => {
    setServices(prev => prev.filter(s => s.id !== id));

    try {
      await fetch(`${API_BASE}/services/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Backend deleteService error:", err);
    }
  };

  // Categories
  const addCategory = async (newCat) => {
    const item = { 
      ...newCat, 
      id: `${Date.now()}`, 
      count: newCat.count || "10+ Pros", 
      path: newCat.path || newCat.name.toLowerCase().replace(/\s+/g, '-') 
    };
    setCategories(prev => [item, ...prev]);

    try {
      await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
    } catch (err) {
      console.warn("Backend addCategory error:", err);
    }
  };

  const updateCategory = async (id, updatedFields) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));

    try {
      await fetch(`${API_BASE}/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.warn("Backend updateCategory error:", err);
    }
  };

  const deleteCategory = async (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));

    try {
      await fetch(`${API_BASE}/categories/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Backend deleteCategory error:", err);
    }
  };

  // Providers
  const addProvider = async (newProv) => {
    const item = { ...newProv, id: newProv.id || `prv_${Date.now()}`, rating: parseFloat(newProv.rating) || 4.9, verified: true, status: "Active" };
    setProviders(prev => [item, ...prev]);

    try {
      const res = await fetch(`${API_BASE}/providers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn("Backend addProvider error:", err);
      return { success: false, message: err.message };
    }
  };

  const updateProvider = async (id, updatedFields) => {
    setProviders(prev => prev.map(p => (String(p.id) === String(id) || String(p._id) === String(id)) ? { ...p, ...updatedFields } : p));

    try {
      const res = await fetch(`${API_BASE}/providers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn("Backend updateProvider error:", err);
      return { success: false, message: err.message };
    }
  };

  const deleteProvider = async (id) => {
    setProviders(prev => prev.filter(p => String(p.id) !== String(id) && String(p._id) !== String(id)));

    try {
      await fetch(`${API_BASE}/providers/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Backend deleteProvider error:", err);
    }
  };

  // Bookings
  const addBooking = async (bookingData) => {
    const tempId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const item = {
      id: tempId,
      customerName: bookingData.name || bookingData.customerName || "Customer",
      phone: bookingData.phone || "+91 98765 00000",
      service: bookingData.service || "General Service",
      price: bookingData.price || "₹299",
      status: "Pending",
      date: bookingData.date || "Just now",
      address: bookingData.address || "Local Delivery Area",
      provider: bookingData.provider || "Auto Assigned"
    };
    setBookings(prev => [item, ...prev]);

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBookings(prev => prev.map(b => b.id === tempId ? { ...item, ...data.data } : b));
      }
    } catch (err) {
      console.warn("Backend addBooking error:", err);
    }
    return item;
  };

  const updateBookingStatus = async (id, newStatus, assignedProvider = null) => {
    const updates = { 
      status: newStatus, 
      ...(assignedProvider ? { assignedProvider, provider: assignedProvider } : {}) 
    };

    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, ...updates };
      }
      return b;
    }));

    try {
      await fetch(`${API_BASE}/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.warn("Backend updateBookingStatus error:", err);
    }
  };

  const deleteBooking = async (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));

    try {
      await fetch(`${API_BASE}/bookings/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Backend deleteBooking error:", err);
    }
  };

  // Offers & Promo Slides Management
  const addSlide = async (newSlide) => {
    const item = { 
      ...newSlide, 
      id: newSlide.id || `off-${Date.now()}`, 
      active: newSlide.active !== undefined ? newSlide.active : true 
    };
    setSlides(prev => [item, ...prev]);

    try {
      await fetch(`${API_BASE}/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
    } catch (err) {
      console.warn("Backend addSlide error:", err);
    }
  };

  const updateSlide = async (id, updatedFields) => {
    setSlides(prev => prev.map(sl => (sl.id === id || sl._id === id) ? { ...sl, ...updatedFields } : sl));

    try {
      await fetch(`${API_BASE}/promotions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.warn("Backend updateSlide error:", err);
    }
  };

  const toggleSlideActive = async (id) => {
    let targetActive = true;
    setSlides(prev => prev.map(sl => {
      if (sl.id === id || sl._id === id) {
        targetActive = sl.active === false ? true : false;
        return { ...sl, active: targetActive };
      }
      return sl;
    }));

    try {
      await fetch(`${API_BASE}/promotions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: targetActive })
      });
    } catch (err) {
      console.warn("Backend toggleSlideActive error:", err);
    }
  };

  const deleteSlide = async (id) => {
    setSlides(prev => prev.filter(sl => sl.id !== id && sl._id !== id));

    try {
      await fetch(`${API_BASE}/promotions/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Backend deleteSlide error:", err);
    }
  };

  // Offers Aliases (Offers For You section & Admin)
  const offers = slides;
  const addOffer = addSlide;
  const updateOffer = updateSlide;
  const toggleOfferActive = toggleSlideActive;
  const deleteOffer = deleteSlide;

  // Hero Banners Management (Admin Panel & Dynamic Home Hero)
  const addHeroBanner = (bannerData) => {
    const newBanner = {
      id: `hero-${Date.now()}`,
      title: bannerData.title || "Everything Your Home Needs.",
      highlight: bannerData.highlight || "Delivered In 15 Mins.",
      subtitle: bannerData.subtitle || "Book certified electricians, plumbers & cleaning experts.",
      badge: bannerData.badge || "#1 ON-DEMAND HOME SERVICE PLATFORM",
      city: bannerData.city || "📍 INDORE & REGION",
      image: bannerData.image || "/images/homepage_1.jpg",
      active: bannerData.active !== undefined ? bannerData.active : true,
      ctaText: bannerData.ctaText || "Book Service Now ➔",
      ctaLink: bannerData.ctaLink || "/services",
      tags: Array.isArray(bannerData.tags) ? bannerData.tags : ["Electrician", "AC Repair", "Cleaning", "Plumber"],
      createdAt: new Date().toISOString()
    };
    setHeroBanners(prev => [newBanner, ...prev]);
  };

  const updateHeroBanner = (id, updatedFields) => {
    setHeroBanners(prev => prev.map(b => (b.id === id || b._id === id) ? { ...b, ...updatedFields } : b));
  };

  const toggleHeroBannerActive = (id) => {
    setHeroBanners(prev => prev.map(b => {
      if (b.id === id || b._id === id) {
        return { ...b, active: !b.active };
      }
      return b;
    }));
  };

  const setActiveHeroBanner = (id) => {
    setHeroBanners(prev => prev.map(b => ({
      ...b,
      active: (b.id === id || b._id === id)
    })));
  };

  const deleteHeroBanner = (id) => {
    setHeroBanners(prev => {
      if (prev.length <= 1) {
        alert("At least one hero banner must remain.");
        return prev;
      }
      const filtered = prev.filter(b => b.id !== id && b._id !== id);
      // Ensure at least one is active if the deleted one was active
      if (!filtered.some(b => b.active) && filtered.length > 0) {
        filtered[0].active = true;
      }
      return filtered;
    });
  };

  // Users
  const updateUserStatus = async (id, status) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));

    try {
      await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.warn("Backend updateUserStatus error:", err);
    }
  };

  const deleteUser = async (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));

    try {
      await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Backend deleteUser error:", err);
    }
  };

  // Tickets
  const resolveTicket = async (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "Resolved" } : t));

    try {
      await fetch(`${API_BASE}/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Resolved" })
      });
    } catch (err) {
      console.warn("Backend resolveTicket error:", err);
    }
  };

  const addTicket = async (ticketData) => {
    const item = {
      id: `TK-${Math.floor(100 + Math.random() * 900)}`,
      ...ticketData,
      status: "Open",
      date: "Just now"
    };
    setTickets(prev => [item, ...prev]);

    try {
      await fetch(`${API_BASE}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
    } catch (err) {
      console.warn("Backend addTicket error:", err);
    }
  };

  // Settings
  const updateSettings = async (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));

    try {
      await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
    } catch (err) {
      console.warn("Backend updateSettings error:", err);
    }
  };

  // Reset to Defaults
  const resetAllData = async () => {
    try {
      await fetch(`${API_BASE}/settings/reset`, { method: "POST" });
    } catch (err) {
      console.warn("Backend reset error:", err);
    }
    setCategories(initialCategories);
    setServices(initialServices);
    setProviders(initialProviders);
    setBookings(initialBookings);
    setSlides(initialSlides);
    setHeroBanners(initialHeroBanners);
    setUsers(initialUsers);
    setTickets(initialTickets);
    setSettings(initialSettings);
    localStorage.clear();
  };

  return (
    <DataContext.Provider value={{
      isApiOnline,
      dbStatusText,
      refreshData: fetchAllFromBackend,
      categories, addCategory, updateCategory, deleteCategory,
      services, addService, updateService, deleteService,
      providers, addProvider, updateProvider, deleteProvider,
      bookings, addBooking, updateBookingStatus, deleteBooking,
      slides, addSlide, updateSlide, deleteSlide, toggleSlideActive,
      offers, addOffer, updateOffer, deleteOffer, toggleOfferActive,
      heroBanners, addHeroBanner, updateHeroBanner, toggleHeroBannerActive, setActiveHeroBanner, deleteHeroBanner,
      users, updateUserStatus, deleteUser,
      tickets, resolveTicket, addTicket,
      settings, updateSettings, resetAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};
