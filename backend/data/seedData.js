const popularCategories = require("./popularCategoriesData");

const initialCategories = popularCategories;

const initialServices = [
  // Repairs
  {
    id: "s1",
    name: "Electrician - Wiring & Switchboard",
    category: "Repairs",
    tag: "Repairs",
    price: 249,
    originalPrice: 399,
    rating: 4.9,
    reviewsCount: 380,
    duration: "30-60 mins",
    icon: "💡",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "Certified electrician for MCB tripping, switchboard installation, fan regulator, and chandelier mount.",
    highlights: ["Govt licensed electricians", "Safety gear certified", "Instant 30-min arrival"]
  },
  {
    id: "s2",
    name: "Emergency Plumbing & Leak Fix",
    category: "Repairs",
    tag: "Repairs",
    price: 199,
    originalPrice: 349,
    rating: 4.8,
    reviewsCount: 290,
    duration: "30-45 mins",
    icon: "🚰",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "Quick detection and repair for leaking pipes, clogged drains, tap replacements, and tank valves.",
    highlights: ["Rapid response", "Zero mess left behind", "Standard spare parts"]
  },
  {
    id: "s3",
    name: "Carpenter & Woodcraft Specialist",
    category: "Repairs",
    tag: "Repairs",
    price: 299,
    originalPrice: 499,
    rating: 4.8,
    reviewsCount: 210,
    duration: "1-2 hrs",
    icon: "🪚",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "Expert carpenters for door lock alignment, hinge replacement, modular furniture assembly and repairs.",
    highlights: ["High precision tools", "Hardware assistance", "Smooth finishing"]
  },
  {
    id: "s4",
    name: "Smart Door Locks & Security Hardware",
    category: "Repairs",
    tag: "Repairs",
    price: 249,
    originalPrice: 450,
    rating: 4.7,
    reviewsCount: 160,
    duration: "45 mins",
    icon: "🔐",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Digital smart locks installation, broken cylinder extraction, and ultra-secure deadlock latch fitting.",
    highlights: ["Compatible with wooden & metal doors", "Keyless access setup", "30-day warranty"]
  },

  // Cleaning
  {
    id: "s5",
    name: "Full House Deep Sanitization",
    category: "Cleaning",
    tag: "Cleaning",
    price: 1499,
    originalPrice: 1999,
    rating: 4.9,
    reviewsCount: 420,
    duration: "3-4 hrs",
    icon: "🧹",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "Complete sanitized cleaning for bedrooms, kitchen, bathrooms & living hall with professional machinery.",
    highlights: ["Eco-friendly disinfectants", "Advanced scrubbers", "Verified cleaner team"]
  },
  {
    id: "s6",
    name: "Sofa & Carpet Shampoo Sanitization",
    category: "Cleaning",
    tag: "Cleaning",
    price: 599,
    originalPrice: 899,
    rating: 4.8,
    reviewsCount: 260,
    duration: "1-2 hrs",
    icon: "🛋️",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "Anti-allergen high extraction steam wash, removes deep stains, dirt mites, and bad odors from fabric.",
    highlights: ["Quick dry technology", "Non-toxic organic shampoo", "Color protection"]
  },
  {
    id: "s7",
    name: "Pest & Termite Eradication",
    category: "Cleaning",
    tag: "Cleaning",
    price: 799,
    originalPrice: 1199,
    rating: 4.9,
    reviewsCount: 310,
    duration: "1 hr",
    icon: "🐜",
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "100% herbal eco-friendly gel & spray treatment for cockroaches, termites, bedbugs, and ants.",
    highlights: ["Child & pet friendly", "Odorless formula", "90-day protection guarantee"]
  },
  {
    id: "s8",
    name: "Bathroom & Tiles Descaling",
    category: "Cleaning",
    tag: "Cleaning",
    price: 399,
    originalPrice: 599,
    rating: 4.8,
    reviewsCount: 180,
    duration: "45 mins",
    icon: "🚿",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Hard water scale removal, acid-free grout scrubbing, showerhead descaling & gleaming chrome polishing.",
    highlights: ["Acid-free safe liquids", "Mirror & tap sparkling shine", "Anti-fungal shield"]
  },

  // Daily Help
  {
    id: "s9",
    name: "Home Keeper & Housekeeping",
    category: "Daily Help",
    tag: "Daily Help",
    price: 349,
    originalPrice: 499,
    rating: 4.7,
    reviewsCount: 270,
    duration: "Per Visit / Daily",
    icon: "🏠",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Daily dusting, floor mopping, utensil management, clothes organizing, and kitchen assistance.",
    highlights: ["Police-verified domestic help", "Trained etiquette", "Flexible morning/evening slots"]
  },
  {
    id: "s10",
    name: "Nanny & Babysitter Assistant",
    category: "Daily Help",
    tag: "Daily Help",
    price: 450,
    originalPrice: 650,
    rating: 4.9,
    reviewsCount: 190,
    duration: "Hourly / Daily",
    icon: "👶",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Trained, attentive and background-screened infant & toddler care, baby feeding, and safe play supervision.",
    highlights: ["CPR & First-aid certified", "Kind & patient staff", "Live status updates"]
  },
  {
    id: "s11",
    name: "Elderly Care Assistant",
    category: "Daily Help",
    tag: "Daily Help",
    price: 499,
    originalPrice: 700,
    rating: 4.9,
    reviewsCount: 150,
    duration: "Hourly / Shift",
    icon: "👵",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Compassionate bedside assistance, vital monitoring, mobility walking support, and medicine management.",
    highlights: ["Patient-focused care", "Empathetic nurses", "Emergency protocol ready"]
  },
  {
    id: "s12",
    name: "Personal Driver & Chauffeur",
    category: "Daily Help",
    tag: "Daily Help",
    price: 399,
    originalPrice: 550,
    rating: 4.8,
    reviewsCount: 340,
    duration: "Per Hour / Day",
    icon: "🚗",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "Professional licensed drivers for manual & automatic luxury cars, city navigation, and outstation trips.",
    highlights: ["Zero accident record", "Uniformed & polite", "Instant on-demand booking"]
  },

  // Appliances
  {
    id: "s13",
    name: "AC Deep Foam Jet Service & Gas",
    category: "Appliances",
    tag: "Appliances",
    price: 499,
    originalPrice: 899,
    rating: 4.9,
    reviewsCount: 512,
    duration: "45 mins",
    icon: "❄️",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "High pressure jet foam cleaning for indoor and outdoor cooling coils, improves cooling boost and saves power.",
    highlights: ["2X cooling boost", "Anti-bacterial coating", "30-day warranty"]
  },
  {
    id: "s14",
    name: "Washing Machine & Refrigerator Fix",
    category: "Appliances",
    tag: "Appliances",
    price: 299,
    originalPrice: 450,
    rating: 4.8,
    reviewsCount: 390,
    duration: "45 mins",
    icon: "🛠️",
    image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Front load/top load drum vibration, drainage pump, cooling compressor, and PCB repairs.",
    highlights: ["Original OEM spare parts", "Transparent diagnosis", "Warranty included"]
  },
  {
    id: "s15",
    name: "RO Water Purifier Service",
    category: "Appliances",
    tag: "Appliances",
    price: 299,
    originalPrice: 499,
    rating: 4.8,
    reviewsCount: 280,
    duration: "40 mins",
    icon: "💧",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Sediment filter, carbon block, and RO membrane replacement with TDS adjustment and purity check.",
    highlights: ["Food grade filters", "100% pure water TDS", "Same day doorstep visit"]
  },
  {
    id: "s16",
    name: "Geyser & Water Heater Repair",
    category: "Appliances",
    tag: "Appliances",
    price: 349,
    originalPrice: 500,
    rating: 4.7,
    reviewsCount: 195,
    duration: "45 mins",
    icon: "♨️",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Thermostat check, heating coil replacement, tank leak sealing & hard water sediment cleaning.",
    highlights: ["Safety shockproof testing", "Instant hot water restoration", "Genuine copper coils"]
  },

  // Home Decor
  {
    id: "s17",
    name: "Wall Painting & Waterproofing",
    category: "Home Decor",
    tag: "Home Decor",
    price: 599,
    originalPrice: 899,
    rating: 4.9,
    reviewsCount: 220,
    duration: "1-2 days",
    icon: "🎨",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "Premium interior/exterior paint finish with laser measurement, primer coat, and damp protection.",
    highlights: ["Free color consultation", "Dust-free sanding", "1-year warranty"]
  },
  {
    id: "s18",
    name: "False Ceiling & Designer POP",
    category: "Home Decor",
    tag: "Home Decor",
    price: 899,
    originalPrice: 1299,
    rating: 4.8,
    reviewsCount: 130,
    duration: "2-3 days",
    icon: "🏛️",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Modern gypsum board false ceilings, indirect cove LED lighting slots, and plaster architectural designs.",
    highlights: ["Laser leveled frames", "Fire & moisture resistant", "Custom 3D patterns"]
  },
  {
    id: "s19",
    name: "Curtains, Blinds & 3D Wallpaper",
    category: "Home Decor",
    tag: "Home Decor",
    price: 399,
    originalPrice: 599,
    rating: 4.7,
    reviewsCount: 175,
    duration: "2-3 hrs",
    icon: "🖼️",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Motorized & manual curtain channel installation, designer wallpaper pasting, and artwork hanging.",
    highlights: ["Seamless wallpaper joints", "Heavy duty brackets", "Wrinkle-free drape"]
  },

  // Kitchen
  {
    id: "s20",
    name: "Home Chef & Gourmet Dining Cook",
    category: "Kitchen",
    tag: "Kitchen",
    price: 399,
    originalPrice: 599,
    rating: 4.9,
    reviewsCount: 310,
    duration: "Per Meal / Day",
    icon: "👨‍🍳",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "Daily nutritious home cooked meals, custom fitness diet prep, and gourmet North/South/Continental dishes.",
    highlights: ["Hygienic kitchen protocols", "Customized spice levels", "Party menus available"]
  },
  {
    id: "s21",
    name: "Kitchen Chimney & Hob Deep Cleaning",
    category: "Kitchen",
    tag: "Kitchen",
    price: 449,
    originalPrice: 699,
    rating: 4.8,
    reviewsCount: 240,
    duration: "1 hr",
    icon: "🍳",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
    popular: true,
    description: "High temperature steam degreasing of suction blower, baffle filter carbon removal, and gas burner tuning.",
    highlights: ["Zero grease residue", "Suction airflow restored", "Flame blue tuning"]
  },
  {
    id: "s22",
    name: "Modular Kitchen Alignment & Woodwork",
    category: "Kitchen",
    tag: "Kitchen",
    price: 399,
    originalPrice: 550,
    rating: 4.8,
    reviewsCount: 160,
    duration: "1-2 hrs",
    icon: "🍽️",
    image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Soft close hydraulic hinges repair, tandem box basket tracks, and waterproof sink cabinet lining.",
    highlights: ["Smooth sliding drawers", "Rust-proof stainless steel fittings", "Door gap leveling"]
  },
  {
    id: "s23",
    name: "Party Catering & Bartender Host",
    category: "Kitchen",
    tag: "Kitchen",
    price: 999,
    originalPrice: 1499,
    rating: 4.9,
    reviewsCount: 190,
    duration: "Event / 3-4 hrs",
    icon: "🍹",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
    popular: false,
    description: "Professional mocktail bartender, live barbecue grilling, appetizer service, and culinary event host.",
    highlights: ["Crafted signature drinks", "Polite hospitality staff", "Full event cleanup assistance"]
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
