const popularCategories = require("./popularCategoriesData");

const initialCategories = popularCategories;

const initialServices = [
  {
    id: "s1",
    name: "Deep House Cleaning",
    category: "Cleaning",
    price: 1499,
    originalPrice: 1999,
    rating: 4.9,
    reviewsCount: 342,
    duration: "3-4 hrs",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "Complete sanitized cleaning for bedrooms, kitchen, bathrooms & living hall with professional machinery.",
    highlights: ["Eco-friendly disinfectants", "Advanced scrubbers", "Verified cleaner team"]
  },
  {
    id: "s2",
    name: "AC Deep Foam Jet Service",
    category: "Appliance Repair",
    price: 599,
    originalPrice: 899,
    rating: 4.8,
    reviewsCount: 512,
    duration: "45 mins",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "High pressure jet foam cleaning for indoor and outdoor cooling coils, improves efficiency and saves electricity.",
    highlights: ["2X cooling boost", "Anti-bacterial coating", "30-day warranty"]
  },
  {
    id: "s3",
    name: "Emergency Plumbing & Leak Fix",
    category: "Plumbing",
    price: 299,
    originalPrice: 499,
    rating: 4.7,
    reviewsCount: 220,
    duration: "30-60 mins",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "Quick detection and repair for leaking pipes, clogged drains, tap replacements, and tank valves.",
    highlights: ["30-minute rapid arrival", "Zero mess left behind", "Standard spare parts"]
  },
  {
    id: "s4",
    name: "Complete Wall Painting & Waterproofing",
    category: "Painting",
    price: 4999,
    originalPrice: 6499,
    rating: 4.9,
    reviewsCount: 189,
    duration: "1-2 days",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "Premium interior/exterior paint finish with laser measurement, primer coat, and damp protection.",
    highlights: ["Free color consultation", "Dust-free sanding", "1-year warranty"]
  },
  {
    id: "s5",
    name: "Smart Electrical Wiring & Switch Setup",
    category: "Electrical",
    price: 349,
    originalPrice: 500,
    rating: 4.8,
    reviewsCount: 275,
    duration: "45 mins",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Certified electrician for MCB repairs, smart switches, fan installations, and chandelier mounting.",
    highlights: ["Government licensed electricians", "Safety guaranteed", "Instant diagnostics"]
  },
  {
    id: "s6",
    name: "Custom Furniture & Door Woodwork",
    category: "Carpentry",
    price: 499,
    originalPrice: 799,
    rating: 4.6,
    reviewsCount: 140,
    duration: "1-2 hrs",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Expert carpenters for door lock alignment, hinge replacement, modular furniture assembly and repairs.",
    highlights: ["High precision tools", "Hardware assistance", "Smooth finishing"]
  }
];

const seedProviders = require("./seedProvidersData");

const initialProviders = seedProviders;

const initialBookings = [
  {
    id: "BK-9021",
    customerName: "Rahul Sharma",
    customerPhone: "+91 98765 00001",
    customerAddress: "Flat 402, Green Valley Apts, Sector 62, Noida",
    serviceName: "Deep House Cleaning",
    servicePrice: 1499,
    date: "2026-09-17",
    time: "10:00 AM",
    status: "Confirmed",
    assignedProvider: "Sunil Kumar",
    createdAt: "2026-09-15 14:30"
  },
  {
    id: "BK-9022",
    customerName: "Pooja Patel",
    customerPhone: "+91 98765 00002",
    customerAddress: "House 12, Block B, Golf Course Rd, Gurugram",
    serviceName: "AC Deep Foam Jet Service",
    servicePrice: 599,
    date: "2026-09-18",
    time: "02:00 PM",
    status: "Pending",
    assignedProvider: "Unassigned",
    createdAt: "2026-09-15 15:45"
  },
  {
    id: "BK-9020",
    customerName: "Vikas Malhotra",
    customerPhone: "+91 98765 00003",
    customerAddress: "Villa 9, Greater Kailash 1, New Delhi",
    serviceName: "Emergency Plumbing & Leak Fix",
    servicePrice: 299,
    date: "2026-09-15",
    time: "11:30 AM",
    status: "Completed",
    assignedProvider: "Rajesh Sharma",
    createdAt: "2026-09-15 09:10"
  }
];

const initialSlides = [
  {
    id: "sl1",
    title: "Festive Home Makeover 🪔",
    subtitle: "Flat 25% OFF on Professional Deep Cleaning & Sanitization",
    badge: "Limited Time Offer",
    discount: "25% OFF",
    code: "CLEAN25",
    bgGradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(168, 85, 247, 0.85) 100%)",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    ctaText: "Book Cleaning Now",
    ctaLink: "/services"
  },
  {
    id: "sl2",
    title: "Beat The Heat with AC Jet Clean ❄️",
    subtitle: "2X Faster Cooling & Instant Odor Removal with Foam Wash",
    badge: "Trending Now",
    discount: "Starting @ ₹599",
    code: "COOLJET",
    bgGradient: "linear-gradient(135deg, rgba(14, 165, 233, 0.85) 0%, rgba(59, 130, 246, 0.85) 100%)",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
    ctaText: "Book AC Service",
    ctaLink: "/services"
  },
  {
    id: "sl3",
    title: "Expert Electricians in 30 Mins ⚡",
    subtitle: "Safe, Certified & Standardized Wiring Fixes at Doorstep",
    badge: "Express Arrival",
    discount: "Guaranteed Safety",
    code: "POWERUP",
    bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.85) 0%, rgba(239, 68, 68, 0.85) 100%)",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
    ctaText: "Call Electrician",
    ctaLink: "/services"
  }
];

const initialUsers = [
  { id: "u1", name: "Rahul Sharma", email: "rahul.sharma@example.com", phone: "+91 98765 00001", totalBookings: 5, status: "Active", joined: "2025-11-10" },
  { id: "u2", name: "Pooja Patel", email: "pooja.patel@example.com", phone: "+91 98765 00002", totalBookings: 2, status: "Active", joined: "2026-01-14" },
  { id: "u3", name: "Vikas Malhotra", email: "vikas.m@example.com", phone: "+91 98765 00003", totalBookings: 8, status: "Active", joined: "2025-08-20" },
  { id: "u4", name: "Sneha Gupta", email: "sneha.g@example.com", phone: "+91 98765 00004", totalBookings: 0, status: "Active", joined: "2026-02-01" }
];

const initialTickets = [
  { id: "TK-101", customerName: "Rahul Sharma", subject: "Cleaner arrived 10 mins late", priority: "Low", status: "Resolved", date: "2026-09-14" },
  { id: "TK-102", customerName: "Pooja Patel", subject: "Invoice download error for AC service", priority: "Medium", status: "Open", date: "2026-09-15" }
];

const initialSettings = {
  platformCommission: 15,
  taxRate: 18,
  minBookingAdvanceHours: 2,
  supportHotline: "+91 80000 12345",
  supportEmail: "support@helperapp.in",
  serviceRadiusKm: 25,
  autoAssignProviders: true,
  maintenanceMode: false
};

module.exports = {
  initialCategories,
  initialServices,
  initialProviders,
  initialBookings,
  initialSlides,
  initialUsers,
  initialTickets,
  initialSettings
};
