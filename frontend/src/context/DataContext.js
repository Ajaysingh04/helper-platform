import React, { createContext, useState, useEffect } from "react";

export const DataContext = createContext();

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Initial Default Data
const initialCategories = [
  { id: 1, name: "Restaurants", icon: "🍽️", path: "restaurants", count: "140+ Places", tag: "Food" },
  { id: 2, name: "Hotels", icon: "🏨", path: "hotels", count: "85+ Stays", tag: "Travel" },
  { id: 3, name: "Beauty & Spa", icon: "💆‍♀️", path: "beauty-spa", count: "120+ Salons", tag: "Wellness" },
  { id: 4, name: "Home Decor", icon: "🛋️", path: "home-decor", count: "65+ Studios", tag: "Home" },
  { id: 5, name: "Wedding Planner", icon: "💍", path: "wedding-planning", count: "40+ Planners", tag: "Events" },
  { id: 6, name: "Education & Tutor", icon: "🎓", path: "education", count: "210+ Tutors", tag: "Study" },
  { id: 7, name: "Rent & Hire", icon: "🔑", path: "rent-hire", count: "90+ Rentals", tag: "Rental" },
  { id: 8, name: "Hospitals & Care", icon: "🏥", path: "hospitals", count: "55+ Centers", tag: "Health" },
  { id: 9, name: "Contractors", icon: "👷", path: "contractors", count: "80+ Builders", tag: "Repairs" },
  { id: 10, name: "Pet Care & Shops", icon: "🐾", path: "pet-shops", count: "45+ Clinics", tag: "Pets" },
  { id: 11, name: "PG & Hostels", icon: "🛏️", path: "pg-hostels", count: "110+ Rooms", tag: "Living" },
  { id: 12, name: "Real Estate Agent", icon: "🏘️", path: "estate-agent", count: "75+ Brokers", tag: "Living" },
  { id: 13, name: "Dentists & Clinics", icon: "🦷", path: "dentists", count: "60+ Doctors", tag: "Health" },
  { id: 14, name: "Gym & Fitness", icon: "🏋️", path: "gym", count: "95+ Centers", tag: "Wellness" },
  { id: 15, name: "Loans & Finance", icon: "💰", path: "loans", count: "30+ Advisors", tag: "Finance" },
  { id: 16, name: "Event Organisers", icon: "🎉", path: "event-organisers", count: "50+ Teams", tag: "Events" },
  { id: 17, name: "Driving Schools", icon: "🚗", path: "driving-schools", count: "40+ Trainers", tag: "Auto" },
  { id: 18, name: "Packers & Movers", icon: "🚚", path: "packers-movers", count: "85+ Shifters", tag: "Logistics" },
  { id: 19, name: "Courier Service", icon: "📦", path: "courier-service", count: "120+ Hubs", tag: "Logistics" }
];

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
  { id: 101, name: "The Grand Cuisine", category: "Restaurants", contact: "+91 98765 11111", rating: 4.9, status: "Active", verified: true, jobsDone: 142, distance: "0.5 km", address: "Commercial Hub, New Delhi", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600" },
  { id: 102, name: "Spice Route Gourmet", category: "Restaurants", contact: "+91 98765 22222", rating: 4.8, status: "Active", verified: true, jobsDone: 98, distance: "1.2 km", address: "Galleria Tower, New Delhi", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=600" },
  { id: 103, name: "Apex Electrical Solutions", category: "Electrician", contact: "+91 98765 33333", rating: 4.9, status: "Active", verified: true, jobsDone: 340, distance: "1.5 km", address: "Sector 14, Metro Zone", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600" },
  { id: 104, name: "ProClean Sanitization Hub", category: "Home Cleaner", contact: "+91 98765 44444", rating: 4.7, status: "Active", verified: true, jobsDone: 215, distance: "2.1 km", address: "Ring Road, Central City", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600" },
  { id: 105, name: "Rapid Flow Plumbing Works", category: "Plumber", contact: "+91 98765 55555", rating: 4.8, status: "Active", verified: false, jobsDone: 88, distance: "3.0 km", address: "North Avenue, City Center", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600" }
];

const initialBookings = [
  { id: "BK-9081", customerName: "Rahul Verma", phone: "+91 98765 12345", service: "AC Repair & Gas", price: "₹399", status: "Pending", date: "Today, 02:30 PM", address: "Flat 402, Green Valley Apartments", provider: "Apex Electrical Solutions" },
  { id: "BK-9080", customerName: "Priya Mehra", phone: "+91 98765 67890", service: "Home Cleaner", price: "₹499", status: "In Progress", date: "Today, 11:15 AM", address: "House 18, Block C, Metro Park", provider: "ProClean Sanitization Hub" },
  { id: "BK-9079", customerName: "Siddharth Jain", phone: "+91 98765 99887", service: "Electrician", price: "₹249", status: "Completed", date: "Yesterday, 04:00 PM", address: "Plot 89, Tech Residency", provider: "Apex Electrical Solutions" },
  { id: "BK-9078", customerName: "Ananya Roy", phone: "+91 98765 44332", service: "Plumber", price: "₹199", status: "Cancelled", date: "Yesterday, 10:00 AM", address: "Tower 2, Urban Heights", provider: "Rapid Flow Plumbing Works" }
];

const initialSlides = [
  { id: 1, tag: "🔥 LIMITED TIME OFFER", title: "Get Flat 20% OFF on Your First Service", desc: "Experience premier home cleaning, plumbing, repairs & electrical services with 100% verified experts.", btnText: "Claim Discount", icon: "🎁", actionPath: "/category/home-cleaner", active: true },
  { id: 2, tag: "🛡️ 100% VERIFIED PROFESSIONALS", title: "Reliable & Trusted Home Service Experts", desc: "Background-checked electricians, plumbers, carpenters & handymen ready at your doorstep within 30 minutes.", btnText: "Explore Services", icon: "⚡", actionPath: "/services", active: true },
  { id: 3, tag: "✨ HASSLE-FREE LIVING", title: "Save Time, Enjoy Life, Reduce Daily Stress", desc: "Book expert housekeepers, professional chefs and dedicated caretakers on your customized schedule.", btnText: "Book a Chef / Caretaker", icon: "🏠", actionPath: "/category/chef", active: true },
  { id: 4, tag: "🕒 24/7 INSTANT SUPPORT", title: "Emergency Repairs Anytime You Need", desc: "AC breakdown? Water leakage? Electrical short? Our rapid-response team is on call 24 hours a day.", btnText: "Emergency Help", icon: "🚨", actionPath: "/category/electrician", active: true }
];

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
  supportEmail: "support@helper.com",
  maintenanceMode: false,
  instantBookingEnabled: true,
  taxPercent: "5%"
};

export const DataProvider = ({ children }) => {
  // Load or initialize state with localStorage fallback
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("helper_categories");
    return saved ? JSON.parse(saved) : initialCategories;
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
    const saved = localStorage.getItem("helper_slides");
    return saved ? JSON.parse(saved) : initialSlides;
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

  // Probe Backend API Health & sync optionally
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") {
          setIsApiOnline(true);
        }
      })
      .catch(() => {
        setIsApiOnline(false);
      });
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("helper_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("helper_services", JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem("helper_providers", JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    localStorage.setItem("helper_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("helper_slides", JSON.stringify(slides));
  }, [slides]);

  useEffect(() => {
    localStorage.setItem("helper_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("helper_tickets", JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem("helper_settings", JSON.stringify(settings));
  }, [settings]);

  // ================= CRUD ACTION DISPATCHERS =================
  // Services
  const addService = (newServ) => {
    const item = { ...newServ, id: Date.now(), rating: 4.8, bookings: "New" };
    setServices(prev => [item, ...prev]);
  };

  const updateService = (id, updatedFields) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
  };

  const deleteService = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Categories
  const addCategory = (newCat) => {
    const item = { ...newCat, id: Date.now(), count: "10+ Pros", path: newCat.name.toLowerCase().replace(/\s+/g, '-') };
    setCategories(prev => [item, ...prev]);
  };

  const updateCategory = (id, updatedFields) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Providers
  const addProvider = (newProv) => {
    const item = { ...newProv, id: Date.now(), jobsDone: 0, rating: 5.0, verified: true, status: "Active" };
    setProviders(prev => [item, ...prev]);
  };

  const updateProvider = (id, updatedFields) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const deleteProvider = (id) => {
    setProviders(prev => prev.filter(p => p.id !== id));
  };

  // Bookings
  const addBooking = (bookingData) => {
    const item = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: bookingData.name || "Customer",
      phone: bookingData.phone || "+91 98765 00000",
      service: bookingData.service || "General Service",
      price: bookingData.price || "₹299",
      status: "Pending",
      date: "Just now",
      address: bookingData.address || "Local Delivery Area",
      provider: "Auto Assigned"
    };
    setBookings(prev => [item, ...prev]);
    return item;
  };

  const updateBookingStatus = (id, newStatus, assignedProvider = null) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        return { 
          ...b, 
          status: newStatus, 
          ...(assignedProvider ? { provider: assignedProvider } : {}) 
        };
      }
      return b;
    }));
  };

  const deleteBooking = (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  // Promo Slides
  const addSlide = (newSlide) => {
    const item = { ...newSlide, id: Date.now(), active: true };
    setSlides(prev => [item, ...prev]);
  };

  const updateSlide = (id, updatedFields) => {
    setSlides(prev => prev.map(sl => sl.id === id ? { ...sl, ...updatedFields } : sl));
  };

  const deleteSlide = (id) => {
    setSlides(prev => prev.filter(sl => sl.id !== id));
  };

  // Users
  const updateUserStatus = (id, status) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Tickets
  const resolveTicket = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "Resolved" } : t));
  };

  const addTicket = (ticketData) => {
    const item = {
      id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
      ...ticketData,
      status: "Open",
      date: "Just now"
    };
    setTickets(prev => [item, ...prev]);
  };

  // Settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Reset to Defaults
  const resetAllData = () => {
    setCategories(initialCategories);
    setServices(initialServices);
    setProviders(initialProviders);
    setBookings(initialBookings);
    setSlides(initialSlides);
    setUsers(initialUsers);
    setTickets(initialTickets);
    setSettings(initialSettings);
    localStorage.clear();
  };

  return (
    <DataContext.Provider value={{
      isApiOnline,
      categories, addCategory, updateCategory, deleteCategory,
      services, addService, updateService, deleteService,
      providers, addProvider, updateProvider, deleteProvider,
      bookings, addBooking, updateBookingStatus, deleteBooking,
      slides, addSlide, updateSlide, deleteSlide,
      users, updateUserStatus, deleteUser,
      tickets, resolveTicket, addTicket,
      settings, updateSettings, resetAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};
