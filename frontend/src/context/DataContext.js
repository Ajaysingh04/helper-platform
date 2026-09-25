import React, { createContext, useState, useEffect, useCallback } from "react";
import { popularCategories } from "../data/popularCategoriesData";
import { initialOffers } from "../data/offersData";
import { initialHeroBanners } from "../data/heroBannersData";
import { API_BASE } from "../apiConfig";

export const DataContext = createContext();

// Initial Default Data with 85 Popular Categories
const initialCategories = popularCategories;

const initialServices = [
  // Repairs
  { id: 1, name: "Electrician", icon: "💡", desc: "Short circuits, wiring, switchboards, inverter & fan repairs.", price: "₹249", tag: "Repairs", popular: true, bookings: "1.2k", rating: 4.9 },
  { id: 2, name: "Plumber", icon: "🚰", desc: "Leak repair, tap replacement, drainage clogs & water heaters.", price: "₹199", tag: "Repairs", popular: true, bookings: "980+", rating: 4.8 },
  { id: 8, name: "Carpenter", icon: "🪚", desc: "Furniture crafting, repair, lock assembly & custom woodwork.", price: "₹299", tag: "Repairs", popular: true, bookings: "1.1k", rating: 4.8 },
  { id: 12, name: "Door Locks & Hardware", icon: "🔐", desc: "Smart locks installation, broken cylinder replacement & safety latch fix.", price: "₹249", tag: "Repairs", popular: false, bookings: "410+", rating: 4.7 },

  // Cleaning
  { id: 3, name: "Home Cleaner", icon: "🧹", desc: "Full house deep cleaning, balcony pressure wash & sanitization.", price: "₹499", tag: "Cleaning", popular: true, bookings: "2.5k", rating: 4.9 },
  { id: 13, name: "Sofa & Carpet Sanitization", icon: "🛋️", desc: "Anti-allergen high extraction steam wash, removes deep stains & bad odors.", price: "₹599", tag: "Cleaning", popular: true, bookings: "890+", rating: 4.8 },
  { id: 14, name: "Pest & Termite Control", icon: "🐜", desc: "100% herbal eco-friendly cockroach, ant & bed bug eradication.", price: "₹799", tag: "Cleaning", popular: false, bookings: "640+", rating: 4.9 },
  { id: 15, name: "Bathroom & Tiles Descaling", icon: "🚿", desc: "Hard water scale removal, acid-free grout scrubbing & mirror polishing.", price: "₹399", tag: "Cleaning", popular: false, bookings: "520+", rating: 4.8 },

  // Daily Help
  { id: 5, name: "Home Keeper", icon: "🏠", desc: "Daily dusting, utensil assistance, organizing & housekeeping.", price: "₹349", tag: "Daily Help", popular: false, bookings: "620+", rating: 4.7 },
  { id: 6, name: "Nanny / Babysitter", icon: "👶", desc: "Trained, attentive and background-screened infant & toddler care.", price: "₹450", tag: "Daily Help", popular: false, bookings: "430+", rating: 4.9 },
  { id: 16, name: "Elderly Care Assistant", icon: "👵", desc: "Compassionate bedside assistance, vital monitoring & medicine support.", price: "₹499", tag: "Daily Help", popular: false, bookings: "380+", rating: 4.9 },
  { id: 17, name: "Driver / Chauffeur", icon: "🚗", desc: "Professional city & highway private car driving on per-hour basis.", price: "₹399", tag: "Daily Help", popular: true, bookings: "950+", rating: 4.8 },

  // Appliances
  { id: 10, name: "Appliance Repair", icon: "🛠️", desc: "Washing machine, fridge, microwave & TV fixing.", price: "₹299", tag: "Appliances", popular: false, bookings: "1.5k", rating: 4.8 },
  { id: 18, name: "AC Jet Service & Gas Refill", icon: "❄️", desc: "Foam jet filter wash, cooling coil flush & refrigerant top-up.", price: "₹499", tag: "Appliances", popular: true, bookings: "2.3k", rating: 4.9 },
  { id: 19, name: "RO Water Purifier Service", icon: "💧", desc: "Filter membrane replacement, TDS adjustment & sterilizing flush.", price: "₹299", tag: "Appliances", popular: false, bookings: "720+", rating: 4.8 },
  { id: 20, name: "Geyser & Heater Repair", icon: "♨️", desc: "Thermostat check, heating coil replacement & sediment descaling.", price: "₹349", tag: "Appliances", popular: false, bookings: "510+", rating: 4.7 },

  // Home Decor
  { id: 7, name: "Wall Painter", icon: "🎨", desc: "Interior, exterior, texture designs & waterproof painting.", price: "₹599", tag: "Home Decor", popular: false, bookings: "890+", rating: 4.8 },
  { id: 21, name: "False Ceiling & POP Works", icon: "🏛️", desc: "Modern gypsum board false ceiling, cove LED lighting & artistic plaster.", price: "₹899", tag: "Home Decor", popular: false, bookings: "340+", rating: 4.8 },
  { id: 22, name: "Curtains & Wallpaper Fitting", icon: "🖼️", desc: "Motorized curtain channel installation & 3D designer wallpaper pasting.", price: "₹399", tag: "Home Decor", popular: false, bookings: "460+", rating: 4.7 },

  // Kitchen
  { id: 4, name: "Home Chef", icon: "👨‍🍳", desc: "Daily nutritious meals, custom diet menus & party cuisine cooking.", price: "₹399", tag: "Kitchen", popular: false, bookings: "750+", rating: 4.8 },
  { id: 23, name: "Kitchen Chimney & Hob Cleaning", icon: "🍳", desc: "Degreasing motor suction, baffle filter steam wash & gas stove tuning.", price: "₹449", tag: "Kitchen", popular: true, bookings: "820+", rating: 4.9 },
  { id: 24, name: "Modular Kitchen Alignment", icon: "🍽️", desc: "Soft-close hydraulic hinge repair & tandem box drawer tracks.", price: "₹399", tag: "Kitchen", popular: false, bookings: "290+", rating: 4.8 },
  { id: 25, name: "Party Catering & Bartender Host", icon: "🍹", desc: "Mocktail crafting, live barbecue plating & culinary party assistance.", price: "₹999", tag: "Kitchen", popular: false, bookings: "370+", rating: 4.9 },

  // Wellness
  { id: 11, name: "Body Massage & Spa", icon: "💆‍♂️", desc: "Authentic Ayurvedic body massage, Swedish relaxation & aroma spa therapy by certified specialists.", price: "₹302", tag: "Spa & Wellness", popular: true, bookings: "2.1k", rating: 4.9, category: "body-massage-centres" }
];

const initialProviders = [
  {
    id: "vdr_rahul_amritam",
    name: "Rahul Gandhi",
    shopName: "Amritam",
    category: "Body Massage & Spa",
    serviceCategories: ["Body Massage & Spa", "Body Massage Centres", "Spa & Wellness", "Massage"],
    phone: "+91 98765 00001",
    contact: "+91 98765 00001",
    rating: 4.9,
    status: "Active",
    verified: true,
    jobsDone: 48,
    distance: "0.8 km",
    distanceKm: 0.8,
    hourlyRate: "₹302/hr",
    location: "Indore Ahinsha Tower, MG Road, Indore",
    address: "Ahinsa Tower, MG Road, Indore, Madhya Pradesh",
    experience: "5+ Years Exp",
    badges: ["Verified Pro", "Ayurvedic Massage", "Couple Suites", "Doorstep Visit"],
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600",
    avatar: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600"
  },
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
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400" 
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
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400" 
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
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=400" 
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
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400" 
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
    image: "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&q=80&w=400" 
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
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400" 
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
    image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=400" 
  },
  { 
    id: 109, 
    name: "Meena Sharma", 
    shopName: "SafeHands Nanny & Infant Care", 
    category: "Daily Help", 
    contact: "+91 98765 99009", 
    rating: 4.9, 
    status: "Active", 
    verified: true, 
    franchiseActive: true,
    franchisePlan: "annual",
    franchiseAmount: 500000,
    jobsDone: 320, 
    distance: "1.9 km", 
    hourlyRate: "₹450/hr",
    address: "Sector 50, Noida", 
    experience: "7+ Years Exp",
    badges: ["First-Aid Certified", "Police Verified"],
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400" 
  },
  { 
    id: 110, 
    name: "Kamal Saini", 
    shopName: "Apex False Ceiling & POP Studio", 
    category: "Home Decor", 
    contact: "+91 98765 11010", 
    rating: 4.8, 
    status: "Active", 
    verified: true, 
    franchiseActive: true,
    franchisePlan: "monthly",
    franchiseAmount: 4000,
    jobsDone: 180, 
    distance: "2.5 km", 
    hourlyRate: "₹899/hr",
    address: "DLF Phase 4, Gurgaon", 
    experience: "10+ Years Exp",
    badges: ["Laser Leveling", "Gypsum Pro"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" 
  },
  { 
    id: 111, 
    name: "Pooja Malhotra", 
    shopName: "SparkleClean Sofa & Balcony Spa", 
    category: "Cleaning", 
    contact: "+91 98765 22020", 
    rating: 4.9, 
    status: "Active", 
    verified: true, 
    jobsDone: 440, 
    distance: "1.2 km", 
    hourlyRate: "₹599/hr",
    address: "Indirapuram, Ghaziabad", 
    experience: "6+ Years Exp",
    badges: ["Steam Extraction", "Pet Safe"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" 
  },
  { 
    id: 112, 
    name: "Naveen Joshi", 
    shopName: "QuickLock Security & Key Masters", 
    category: "Repairs", 
    contact: "+91 98765 33030", 
    rating: 4.7, 
    status: "Active", 
    verified: false, 
    jobsDone: 95, 
    distance: "3.1 km", 
    hourlyRate: "₹249/hr",
    address: "Laxmi Nagar, Delhi", 
    experience: "4+ Years Exp",
    badges: ["Instant Arrival", "Keyless Locks"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" 
  },
  { 
    id: 113, 
    name: "Chef Ananya Sen", 
    shopName: "Royal Rajputana & Mughlai Dining", 
    category: "Kitchen", 
    contact: "+91 98765 44040", 
    rating: 4.9, 
    status: "Active", 
    verified: true, 
    franchiseActive: true,
    franchisePlan: "annual",
    franchiseAmount: 500000,
    jobsDone: 260, 
    distance: "2.0 km", 
    hourlyRate: "₹499/hr",
    address: "GK-2, South Delhi", 
    experience: "9+ Years Exp",
    badges: ["Master Chef Alumni", "5-Star Hygiene"],
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=400" 
  }
];

const initialBookings = [
  { id: "HLP-72819", bookingId: "HLP-72819", bookingCode: "HLP-72819", customerName: "Vikramaditya Roy", customerPhone: "+91 98260 12345", phone: "+91 98260 12345", service: "Body Massage & Spa", price: "₹302", totalAmount: 302, status: "Pending", doorOtp: "1234", date: "Today, 11:30 AM", address: "Palasia Square, Near AB Road, Indore", provider: "Amritam • Rahul Gandhi" },
  { id: "BK-9081", customerName: "Rahul Verma", phone: "+91 98765 12345", service: "AC Repair & Gas", price: "₹399", status: "Pending", date: "Today, 02:30 PM", address: "Flat 402, Green Valley Apartments, Sector 62", provider: "CoolTech AC & Jet Services" },
  { id: "BK-9080", customerName: "Priya Mehra", phone: "+91 98765 67890", service: "Home Cleaner", price: "₹499", status: "In Progress", date: "Today, 11:15 AM", address: "House 18, Block C, Metro Park, Noida", provider: "ProClean Sanitization Hub" },
  { id: "BK-9079", customerName: "Siddharth Jain", phone: "+91 98765 99887", service: "Electrician", price: "₹249", status: "Completed", date: "Yesterday, 04:00 PM", address: "Plot 89, Tech Residency, Sector 18", provider: "Sharma Express Electricals" },
  { id: "BK-9078", customerName: "Ananya Roy", phone: "+91 98765 44332", service: "Plumber", price: "₹199", status: "Cancelled", date: "Yesterday, 10:00 AM", address: "Tower 2, Urban Heights, Indirapuram", provider: "Rapid Flow Plumbing Works" },
  { id: "BK-9077", customerName: "Manish Agarwal", phone: "+91 98765 33112", service: "Carpenter", price: "₹299", status: "Completed", date: "24 Sep, 03:00 PM", address: "Villa 12, Palm Meadows, Greater Noida", provider: "Precision Woodcraft & Locks" },
  { id: "BK-9076", customerName: "Sneha Kapoor", phone: "+91 98765 88223", service: "Home Chef", price: "₹399", status: "In Progress", date: "24 Sep, 01:20 PM", address: "B-401, Royal Palms, Sector 137", provider: "Gourmet Home Dining Co." },
  { id: "BK-9075", customerName: "Gaurav Sen", phone: "+91 98765 55441", service: "Pest & Termite Control", price: "₹799", status: "Pending", date: "24 Sep, 11:00 AM", address: "Block D-14, Mayur Vihar, Delhi", provider: "ProClean Deep Sanitization" },
  { id: "BK-9074", customerName: "Kavita Nair", phone: "+91 98765 77665", service: "Nanny / Babysitter", price: "₹450", status: "Completed", date: "23 Sep, 09:30 AM", address: "Flat 102, Sunrise Towers, Noida", provider: "SafeHands Nanny Care" },
  { id: "BK-9073", customerName: "Amitabh Das", phone: "+91 98765 11998", service: "Wall Painter", price: "₹599", status: "In Progress", date: "23 Sep, 02:45 PM", address: "House 55, Sector 45, Gurgaon", provider: "ColorCraft Waterproofing & Walls" },
  { id: "BK-9072", customerName: "Ritu Singhania", phone: "+91 98765 22334", service: "Sofa & Carpet Sanitization", price: "₹599", status: "Completed", date: "22 Sep, 05:00 PM", address: "Penthouse 9, DLF Phase 5", provider: "ProClean Sanitization Hub" },
  { id: "BK-9071", customerName: "Kunal Bansal", phone: "+91 98765 66778", service: "Door Locks & Hardware", price: "₹249", status: "Completed", date: "22 Sep, 12:10 PM", address: "Flat 303, Cyber City Hub", provider: "Precision Woodcraft & Locks" },
  { id: "BK-9070", customerName: "Sunaina Joshi", phone: "+91 98765 44889", service: "Home Keeper", price: "₹349", status: "Pending", date: "21 Sep, 10:15 AM", address: "Row House 4, Greenfield Colony", provider: "SafeDrive Verified Chauffeurs" },
  { id: "BK-9069", customerName: "Arjun Rampal", phone: "+91 98765 99112", service: "RO Water Purifier Service", price: "₹299", status: "Completed", date: "21 Sep, 04:30 PM", address: "Plot 77, Sector 50, Noida", provider: "CoolTech AC & Jet Services" },
  { id: "BK-9068", customerName: "Meenakshi Sundaram", phone: "+91 98765 88334", service: "Kitchen Chimney Cleaning", price: "₹449", status: "Completed", date: "20 Sep, 01:00 PM", address: "A-12, Express Greens, Sector 76", provider: "Gourmet Home Dining Co." },
  { id: "BK-9067", customerName: "Harsh Vardhan", phone: "+91 98765 33771", service: "Personal Driver / Chauffeur", price: "₹399", status: "Cancelled", date: "20 Sep, 08:30 AM", address: "Terminal 3 Airport Pickup, Delhi", provider: "SafeDrive Verified Chauffeurs" },
  { id: "BK-9066", customerName: "Divya Chawla", phone: "+91 98765 55667", service: "Party Catering & Bartender Host", price: "₹999", status: "Completed", date: "19 Sep, 07:00 PM", address: "Club House, Eldeco Utopia", provider: "Gourmet Home Dining Co." },
  { id: "BK-9065", customerName: "Rohan Khanna", phone: "+91 98765 22990", service: "Washing Machine & Fridge Fix", price: "₹299", status: "In Progress", date: "19 Sep, 03:15 PM", address: "Flat 801, Supertech Capetown", provider: "CoolTech AC & Jet Services" }
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
        if (Array.isArray(parsed) && parsed.length >= 80 && parsed[0]?.name === "Body Massage Centres" && parsed[0]?.image) {
          return parsed;
        }
      }
    } catch (e) {}
    return initialCategories;
  });

  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem("helper_services");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) && 
          parsed.length >= 18 && 
          parsed.some(s => s.tag === "Kitchen") &&
          parsed.some(s => s.tag === "Daily Help") &&
          parsed.some(s => s.tag === "Home Decor") &&
          parsed.some(s => s.tag === "Appliances")
        ) {
          return parsed;
        }
      }
    } catch (e) {}
    return initialServices;
  });

  const [providers, setProviders] = useState(() => {
    let list = initialProviders;
    try {
      const saved = localStorage.getItem("helper_providers_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      }
      // Check active vendor from helper_vendor in localStorage
      const activeVendorRaw = localStorage.getItem("helper_vendor");
      if (activeVendorRaw) {
        const v = JSON.parse(activeVendorRaw);
        if (v && (v.name || v.shopName)) {
          const vCat = v.category || "General";
          let relCats = v.serviceCategories && v.serviceCategories.length ? v.serviceCategories : [];
          if (!relCats.length) {
            if (vCat.toLowerCase().includes("plumb")) relCats = ["Plumber", "Plumbers", "Plumbing & Sanitary", "Plumbing"];
            else if (vCat.toLowerCase().includes("massage") || vCat.toLowerCase().includes("spa")) relCats = ["Body Massage Centres", "Body Massage & Spa", "Spa & Wellness", "Beauty Spas", "Massage"];
            else if (vCat.toLowerCase().includes("electr")) relCats = ["Electrician", "Electricians", "Electrical", "Wiring"];
            else if (vCat.toLowerCase().includes("clean")) relCats = ["Home Cleaner", "Cleaning", "Deep Cleaning", "Sanitization"];
            else relCats = [vCat, `${vCat} Services`];
          }

          const defaultImg = vCat.toLowerCase().includes("plumb") 
            ? "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400"
            : vCat.toLowerCase().includes("electr")
            ? "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400"
            : vCat.toLowerCase().includes("clean")
            ? "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400"
            : "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600";

          const matchIdx = list.findIndex(p => p.id === v.id || (p.name && v.name && p.name.toLowerCase() === v.name.toLowerCase()));
          const formattedVendor = {
            id: v.id || `vdr_${Date.now()}`,
            name: v.name,
            shopName: v.shopName || `${v.name}'s ${vCat} Services`,
            category: vCat,
            serviceCategories: relCats,
            phone: v.phone || "+91 98765 00001",
            contact: v.phone || "+91 98765 00001",
            rating: v.rating || 5.0,
            status: "Active",
            verified: true,
            franchiseActive: v.franchiseActive !== false,
            franchisePlan: v.franchisePlan || "monthly",
            franchiseAmount: v.franchiseAmount || 4000,
            jobsDone: v.jobsCompleted || 12,
            distance: v.distance || "1.2 km",
            hourlyRate: v.hourlyRate ? (String(v.hourlyRate).startsWith("₹") ? v.hourlyRate : `₹${v.hourlyRate}/hr`) : "₹299/hr",
            location: v.location || "Indore / Delhi NCR",
            address: v.address || v.location || "14 Palm Avenue, City Central",
            image: v.image || v.avatar || defaultImg,
            avatar: v.avatar || v.image || defaultImg
          };
          if (matchIdx !== -1) {
            list[matchIdx] = { ...list[matchIdx], ...formattedVendor };
          } else {
            list = [formattedVendor, ...list];
          }
        }
      }
      // Ensure Rahul Gandhi (Amritam) is always present
      const rahul = initialProviders[0];
      if (!list.some(p => p.id === rahul.id || (p.name && p.name.toLowerCase().includes("rahul")))) {
        list = [rahul, ...list];
      }
    } catch (e) {}
    return list;
  });

  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem("helper_bookings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          return parsed;
        }
      }
    } catch (e) {}
    return initialBookings;
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
      const saved = localStorage.getItem("helper_hero_banners_v5");
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

        if (catRes.status === "fulfilled" && catRes.value?.data?.length) {
          const mergedCats = catRes.value.data.map(c => {
            if (!c.image) {
              const matched = initialCategories.find(ic => ic.id === c.id || ic.name === c.name);
              if (matched?.image) return { ...c, image: matched.image };
            }
            return c;
          });
          setCategories(mergedCats);
        }
        if (srvRes.status === "fulfilled" && srvRes.value?.data?.length) {
          const normalizeTag = (s) => {
            const raw = `${s.tag || ""} ${s.category || ""} ${s.name || ""}`.toLowerCase();
            if (raw.includes("kitchen") || raw.includes("cook") || raw.includes("chef") || raw.includes("chimney")) return "Kitchen";
            if (raw.includes("clean") || raw.includes("pest") || raw.includes("sanit") || raw.includes("scrub")) return "Cleaning";
            if (raw.includes("appliance") || raw.includes("ac") || raw.includes("fridge") || raw.includes("ro") || raw.includes("geyser")) return "Appliances";
            if (raw.includes("decor") || raw.includes("paint") || raw.includes("wall") || raw.includes("ceiling") || raw.includes("wallpaper")) return "Home Decor";
            if (raw.includes("daily") || raw.includes("help") || raw.includes("maid") || raw.includes("nanny") || raw.includes("keeper") || raw.includes("driver")) return "Daily Help";
            if (raw.includes("massage") || raw.includes("spa") || raw.includes("wellness")) return "Spa & Wellness";
            return s.tag || "Repairs";
          };

          const backendList = srvRes.value.data.map(s => ({
            ...s,
            desc: s.desc || s.description || "Standard home care consultation and certified service.",
            price: typeof s.price === "number" ? `₹${s.price}` : (s.price || "₹299"),
            tag: normalizeTag(s)
          }));

          const mergedServices = [...backendList];
          initialServices.forEach(initS => {
            if (!mergedServices.some(s => s.id === initS.id || (s.name && initS.name && s.name.toLowerCase() === initS.name.toLowerCase()))) {
              mergedServices.push(initS);
            }
          });
          setServices(mergedServices);
        }
        if (prvRes.status === "fulfilled" && prvRes.value?.data?.length) {
          let fetchedProviders = prvRes.value.data;
          const rahul = initialProviders[0];
          const hasRahul = fetchedProviders.some(p => p.id === rahul.id || p.name === rahul.name);
          let merged = hasRahul ? fetchedProviders : [rahul, ...fetchedProviders];

          try {
            const rawV = localStorage.getItem("helper_vendor");
            if (rawV) {
              const v = JSON.parse(rawV);
              if (v && (v.name || v.shopName)) {
                const matchIdx = merged.findIndex(p => p.id === v.id || (p.name && v.name && p.name.toLowerCase() === v.name.toLowerCase()));
                if (matchIdx !== -1) {
                  merged[matchIdx] = { ...merged[matchIdx], ...v };
                } else {
                  merged = [v, ...merged];
                }
              }
            }
          } catch (e) {}

          setProviders(merged);
        }
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

  // Listen to vendor profile updates in real-time from Service Man Panel
  useEffect(() => {
    const handleVendorUpdate = () => {
      try {
        const raw = localStorage.getItem("helper_vendor");
        if (raw) {
          const v = JSON.parse(raw);
          if (v && (v.name || v.shopName)) {
            const vCat = v.category || "General";
            let relCats = v.serviceCategories && v.serviceCategories.length ? v.serviceCategories : [];
            if (!relCats.length) {
              if (vCat.toLowerCase().includes("plumb")) relCats = ["Plumber", "Plumbers", "Plumbing & Sanitary", "Plumbing"];
              else if (vCat.toLowerCase().includes("massage") || vCat.toLowerCase().includes("spa")) relCats = ["Body Massage Centres", "Body Massage & Spa", "Spa & Wellness", "Beauty Spas", "Massage"];
              else if (vCat.toLowerCase().includes("electr")) relCats = ["Electrician", "Electricians", "Electrical", "Wiring"];
              else if (vCat.toLowerCase().includes("clean")) relCats = ["Home Cleaner", "Cleaning", "Deep Cleaning", "Sanitization"];
              else relCats = [vCat, `${vCat} Services`];
            }

            const defaultImg = vCat.toLowerCase().includes("plumb") 
              ? "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400"
              : vCat.toLowerCase().includes("electr")
              ? "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400"
              : vCat.toLowerCase().includes("clean")
              ? "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400"
              : "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600";

            setProviders(prev => {
              const exists = prev.find(p => p.id === v.id || (p.name && v.name && p.name.toLowerCase() === v.name.toLowerCase()));
              if (exists) {
                return prev.map(p => (p.id === exists.id) ? {
                  ...p,
                  name: v.name,
                  shopName: v.shopName || p.shopName,
                  category: vCat,
                  serviceCategories: relCats,
                  location: v.location || p.location,
                  address: v.address || v.location || p.address,
                  phone: v.phone || p.phone,
                  contact: v.phone || p.contact,
                  franchiseActive: true,
                  hourlyRate: v.hourlyRate ? (String(v.hourlyRate).startsWith("₹") ? v.hourlyRate : `₹${v.hourlyRate}/hr`) : p.hourlyRate,
                  image: v.image || v.avatar || p.image || defaultImg,
                  avatar: v.avatar || v.image || p.avatar || defaultImg
                } : p);
              }
              const newP = {
                id: v.id || `vdr_${Date.now()}`,
                name: v.name,
                shopName: v.shopName || `${v.name}'s ${vCat} Services`,
                category: vCat,
                serviceCategories: relCats,
                phone: v.phone || "+91 98765 00001",
                contact: v.phone || "+91 98765 00001",
                rating: 5.0,
                status: "Active",
                verified: true,
                franchiseActive: true,
                franchisePlan: v.franchisePlan || "monthly",
                franchiseAmount: v.franchiseAmount || 4000,
                jobsDone: 12,
                hourlyRate: v.hourlyRate ? (String(v.hourlyRate).startsWith("₹") ? v.hourlyRate : `₹${v.hourlyRate}/hr`) : "₹299/hr",
                location: v.location || "Indore / Delhi NCR",
                address: v.address || v.location || "14 Palm Avenue, City Central",
                image: v.image || v.avatar || defaultImg,
                avatar: v.avatar || v.image || defaultImg
              };
              return [newP, ...prev];
            });
          }
        }
      } catch (e) {}
    };

    window.addEventListener("vendor_updated", handleVendorUpdate);
    return () => window.removeEventListener("vendor_updated", handleVendorUpdate);
  }, []);

  // Sync state changes to localStorage for offline cache
  useEffect(() => { localStorage.setItem("helper_categories", JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem("helper_services", JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem("helper_providers_v2", JSON.stringify(providers)); }, [providers]);
  useEffect(() => { localStorage.setItem("helper_bookings", JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem("helper_slides", JSON.stringify(slides)); }, [slides]);
  useEffect(() => { localStorage.setItem("helper_hero_banners_v5", JSON.stringify(heroBanners)); }, [heroBanners]);
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
    const bookingCode = bookingData.id || bookingData.bookingCode || `HLP-${Math.floor(10000 + Math.random() * 90000)}`;
    const item = {
      id: bookingCode,
      bookingId: bookingCode,
      bookingCode: bookingCode,
      customerName: bookingData.name || bookingData.customerName || "Customer",
      customerPhone: bookingData.phone || bookingData.customerPhone || "+91 98765 00000",
      phone: bookingData.phone || bookingData.customerPhone || "+91 98765 00000",
      service: bookingData.service || bookingData.serviceName || "Body Massage & Spa",
      serviceName: bookingData.serviceName || bookingData.service || "Body Massage & Spa",
      serviceCategory: bookingData.serviceCategory || "Body Massage & Spa",
      price: bookingData.price || "₹302",
      totalAmount: parseInt(String(bookingData.price || bookingData.totalAmount || "302").replace(/[^0-9]/g, "")) || 302,
      status: "Pending",
      doorOtp: bookingData.doorOtp || "1234",
      date: bookingData.date || "Just now",
      address: bookingData.address || "Ahinsa Tower, Indore, MP",
      customerAddress: bookingData.address || "Ahinsa Tower, Indore, MP",
      provider: bookingData.provider || bookingData.assignedProvider || "Amritam • Rahul Gandhi",
      assignedProvider: bookingData.provider || bookingData.assignedProvider || "Amritam • Rahul Gandhi",
      assignedProviderName: bookingData.assignedProviderName || bookingData.provider || "Rahul Gandhi",
      providerId: bookingData.providerId || "vdr_rahul_amritam"
    };

    setBookings(prev => [item, ...prev]);

    // Dispatch real-time booking event so Service Man Panel and Admin receive it instantly
    window.dispatchEvent(new CustomEvent("new_booking_created", { detail: item }));

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      if (data.success && (data.data || data.booking)) {
        const saved = data.data || data.booking;
        setBookings(prev => prev.map(b => b.id === bookingCode ? { ...item, ...saved } : b));
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
