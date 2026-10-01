import React, { useState, useContext, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import "../css/Services.css";

// Comprehensive fallback catalog matching all 27 on-demand capabilities
// Comprehensive fallback catalog matching all 27 on-demand capabilities with dedicated photos
export const getServiceImage = (item) => {
  if (item?.image && typeof item.image === "string" && item.image.trim() !== "") {
    return item.image;
  }
  const name = (item?.name || "").toLowerCase();
  const tag = (item?.tag || "").toLowerCase();
  const cat = (item?.category || "").toLowerCase();

  if (name.includes("electr") || tag.includes("electr")) {
    return "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("plumb") || tag.includes("plumb")) {
    return "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("carpent") || name.includes("wood")) {
    return "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("lock") || name.includes("door")) {
    return "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("deep") || (name.includes("clean") && !name.includes("sofa") && !name.includes("chimney") && !name.includes("tile"))) {
    return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("sofa") || name.includes("carpet")) {
    return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("pest") || name.includes("termite")) {
    return "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("tile") || name.includes("descal") || name.includes("bath")) {
    return "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("ac") || name.includes("cool") || name.includes("jet")) {
    return "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("ro ") || name.includes("water") || name.includes("purif")) {
    return "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("geyser") || name.includes("heater")) {
    return "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("appliance") || name.includes("tv") || name.includes("fridge") || name.includes("wash")) {
    return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("maid") || name.includes("keeper") || name.includes("house keeper")) {
    return "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("nanny") || name.includes("baby")) {
    return "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("elder") || name.includes("senior")) {
    return "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("driver") || name.includes("chauffeur") || name.includes("car")) {
    return "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("chef") || name.includes("cook")) {
    return "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("chimney") || name.includes("hob")) {
    return "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("modular") || name.includes("kitchen align")) {
    return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("cater") || name.includes("bartend") || name.includes("party")) {
    return "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("paint") || name.includes("waterproof")) {
    return "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("ceiling") || name.includes("pop")) {
    return "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("curtain") || name.includes("wallpaper")) {
    return "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes("spa") || name.includes("massage") || cat.includes("massage")) {
    return "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=700&q=80";
  }
  return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=80";
};

const defaultServices = [
  // Repairs
  { 
    id: 1, 
    name: "Electrician", 
    icon: "electrical", 
    desc: "Short circuits, wiring, switchboards, inverter & fan repairs.", 
    price: "₹249", 
    tag: "Repairs", 
    popular: true, 
    speed: "20 min dispatch", 
    bookings: "1.2k+", 
    rating: 4.9, 
    category: "electricians",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 2, 
    name: "Plumber", 
    icon: "plumbing", 
    desc: "Leak repair, tap replacement, drainage clogs & water heaters.", 
    price: "₹199", 
    tag: "Repairs", 
    popular: true, 
    speed: "25 min dispatch", 
    bookings: "980+", 
    rating: 4.8, 
    category: "plumbers",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 8, 
    name: "Carpenter & Woodcraft", 
    icon: "carpentry", 
    desc: "Furniture crafting, repair, lock assembly & custom woodwork.", 
    price: "₹299", 
    tag: "Repairs", 
    popular: true, 
    speed: "30 min dispatch", 
    bookings: "1.1k+", 
    rating: 4.8, 
    category: "carpenters",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 12, 
    name: "Door Locks & Hardware", 
    icon: "lock", 
    desc: "Smart locks installation, broken cylinder replacement & safety latch fix.", 
    price: "₹249", 
    tag: "Repairs", 
    popular: false, 
    speed: "30 min dispatch", 
    bookings: "410+", 
    rating: 4.7, 
    category: "carpenters",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=700&q=80"
  },

  // Cleaning
  { 
    id: 3, 
    name: "Deep Home Cleaning", 
    icon: "cleaning", 
    desc: "Full house deep cleaning, balcony pressure wash & sanitization.", 
    price: "₹899", 
    tag: "Cleaning", 
    popular: true, 
    speed: "Same day dispatch", 
    bookings: "2.5k+", 
    rating: 4.9, 
    category: "cleaning",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 13, 
    name: "Sofa & Carpet Sanitization", 
    icon: "sofa", 
    desc: "Anti-allergen high extraction steam wash, removes deep stains & odors.", 
    price: "₹599", 
    tag: "Cleaning", 
    popular: true, 
    speed: "40 min dispatch", 
    bookings: "890+", 
    rating: 4.8, 
    category: "cleaning",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 14, 
    name: "Pest & Termite Control", 
    icon: "shield", 
    desc: "100% herbal eco-friendly cockroach, ant & termite eradication.", 
    price: "₹799", 
    tag: "Cleaning", 
    popular: false, 
    speed: "Next hour dispatch", 
    bookings: "640+", 
    rating: 4.9, 
    category: "cleaning",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 15, 
    name: "Bathroom & Tiles Descaling", 
    icon: "sparkles", 
    desc: "Hard water scale removal, acid-free grout scrubbing & mirror polishing.", 
    price: "₹399", 
    tag: "Cleaning", 
    popular: false, 
    speed: "30 min dispatch", 
    bookings: "520+", 
    rating: 4.8, 
    category: "cleaning",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=700&q=80"
  },

  // Appliances
  { 
    id: 10, 
    name: "Appliance Repair", 
    icon: "tools", 
    desc: "Washing machine, fridge, microwave & TV diagnostics and genuine parts.", 
    price: "₹299", 
    tag: "Appliances", 
    popular: false, 
    speed: "35 min dispatch", 
    bookings: "1.5k+", 
    rating: 4.8, 
    category: "appliances",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 18, 
    name: "AC Jet Service & Gas Refill", 
    icon: "cooling", 
    desc: "High-pressure foam jet filter wash, cooling coil flush & refrigerant refill.", 
    price: "₹499", 
    tag: "Appliances", 
    popular: true, 
    speed: "30 min dispatch", 
    bookings: "2.3k+", 
    rating: 4.9, 
    category: "ac-repair-services",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 19, 
    name: "RO Water Purifier Service", 
    icon: "droplet", 
    desc: "Filter membrane replacement, TDS adjustment & sterilizing tank flush.", 
    price: "₹299", 
    tag: "Appliances", 
    popular: false, 
    speed: "45 min dispatch", 
    bookings: "720+", 
    rating: 4.8, 
    category: "appliances",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 20, 
    name: "Geyser & Heater Repair", 
    icon: "heater", 
    desc: "Thermostat check, heating coil replacement & sediment descaling.", 
    price: "₹349", 
    tag: "Appliances", 
    popular: false, 
    speed: "30 min dispatch", 
    bookings: "510+", 
    rating: 4.7, 
    category: "appliances",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=700&q=80"
  },

  // Daily Help
  { 
    id: 5, 
    name: "House Keeper & Maid", 
    icon: "home", 
    desc: "Daily dusting, utensil assistance, organizing & housekeeping.", 
    price: "₹349", 
    tag: "Daily Help", 
    popular: false, 
    speed: "Immediate dispatch", 
    bookings: "620+", 
    rating: 4.7, 
    category: "daily-help",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 6, 
    name: "Nanny / Babysitter", 
    icon: "heart", 
    desc: "Trained, attentive and background-screened infant & toddler care.", 
    price: "₹450", 
    tag: "Daily Help", 
    popular: false, 
    speed: "Instant matching", 
    bookings: "430+", 
    rating: 4.9, 
    category: "daily-help",
    image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 16, 
    name: "Elderly Care Assistant", 
    icon: "heart", 
    desc: "Compassionate bedside assistance, vital monitoring & medicine support.", 
    price: "₹499", 
    tag: "Daily Help", 
    popular: false, 
    speed: "Verified pro match", 
    bookings: "380+", 
    rating: 4.9, 
    category: "daily-help",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 17, 
    name: "Driver / Chauffeur", 
    icon: "car", 
    desc: "Professional city & highway private car driving on per-hour basis.", 
    price: "₹399", 
    tag: "Daily Help", 
    popular: true, 
    speed: "30 min dispatch", 
    bookings: "950+", 
    rating: 4.8, 
    category: "daily-help",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=700&q=80"
  },

  // Kitchen
  { 
    id: 4, 
    name: "Home Chef & Cook", 
    icon: "chef", 
    desc: "Daily nutritious meals, custom diet menus & party cuisine cooking.", 
    price: "₹399", 
    tag: "Kitchen", 
    popular: false, 
    speed: "Immediate match", 
    bookings: "750+", 
    rating: 4.8, 
    category: "daily-help",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 23, 
    name: "Kitchen Chimney & Hob Cleaning", 
    icon: "sparkles", 
    desc: "Degreasing motor suction, baffle filter steam wash & gas stove tuning.", 
    price: "₹449", 
    tag: "Kitchen", 
    popular: true, 
    speed: "40 min dispatch", 
    bookings: "820+", 
    rating: 4.9, 
    category: "cleaning",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 24, 
    name: "Modular Kitchen Alignment", 
    icon: "tools", 
    desc: "Soft-close hydraulic hinge repair & tandem box drawer tracks.", 
    price: "₹399", 
    tag: "Kitchen", 
    popular: false, 
    speed: "Next hour dispatch", 
    bookings: "290+", 
    rating: 4.8, 
    category: "carpenters",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 25, 
    name: "Party Catering & Bartender Host", 
    icon: "glass", 
    desc: "Mocktail crafting, live barbecue plating & culinary party assistance.", 
    price: "₹999", 
    tag: "Kitchen", 
    popular: false, 
    speed: "Pre-book on demand", 
    bookings: "370+", 
    rating: 4.9, 
    category: "daily-help",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=700&q=80"
  },

  // Home Decor
  { 
    id: 7, 
    name: "Wall Painter & Waterproofing", 
    icon: "paint", 
    desc: "Interior, exterior, texture designs & waterproof wall putty painting.", 
    price: "₹599", 
    tag: "Home Decor", 
    popular: false, 
    speed: "Same day survey", 
    bookings: "890+", 
    rating: 4.8, 
    category: "painters",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 21, 
    name: "False Ceiling & POP Works", 
    icon: "ceiling", 
    desc: "Modern gypsum board false ceiling, cove LED lighting & artistic plaster.", 
    price: "₹899", 
    tag: "Home Decor", 
    popular: false, 
    speed: "Free site quote", 
    bookings: "340+", 
    rating: 4.8, 
    category: "painters",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80"
  },
  { 
    id: 22, 
    name: "Curtains & Wallpaper Fitting", 
    icon: "wallpaper", 
    desc: "Motorized curtain channel installation & 3D designer wallpaper pasting.", 
    price: "₹399", 
    tag: "Home Decor", 
    popular: false, 
    speed: "Same day dispatch", 
    bookings: "460+", 
    rating: 4.7, 
    category: "carpenters",
    image: "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=700&q=80"
  },

  // Spa & Wellness
  { 
    id: "srv-spa-amritam", 
    name: "Body Massage & Spa", 
    icon: "spa", 
    desc: "Authentic Ayurvedic body massage, Swedish relaxation & aroma spa therapy by certified specialists.", 
    price: "₹302", 
    tag: "Spa & Wellness", 
    popular: true, 
    speed: "Verified Center • Amritam", 
    bookings: "2.1k+", 
    rating: 4.9, 
    category: "body-massage-centres",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=700&q=80"
  }
];

// High-precision SVGs to elevate from plain emojis to executive design
function ServiceIcon({ type }) {
  switch (type) {
    case "electrical":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "plumbing":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );
    case "cooling":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
        </svg>
      );
    case "cleaning":
    case "sparkles":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.912 4.928L19 9.84l-4.044 3.432.956 5.228L12 16.036l-3.912 2.464.956-5.228L5 9.84l5.088-1.912L12 3z" />
        </svg>
      );
    case "carpentry":
    case "tools":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "paint":
    case "ceiling":
    case "wallpaper":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
        </svg>
      );
    case "chef":
    case "glass":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
          <line x1="6" y1="17" x2="18" y2="17" />
        </svg>
      );
    case "spa":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="11" r="3" />
        </svg>
      );
    case "lock":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "home":
    case "sofa":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "car":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
  }
}

function Services() {
  const dataContext = useContext(DataContext);
  const rawList = dataContext?.services?.length ? dataContext.services : defaultServices;
  const gridTopRef = useRef(null);

  // Enrich with icons & defaults if raw data doesn't have it
  const servicesList = useMemo(() => {
    return rawList.map((item, index) => {
      let iconType = "electrical";
      const tagLower = (item.tag || "").toLowerCase();
      const nameLower = (item.name || "").toLowerCase();

      if (tagLower.includes("repairs") || nameLower.includes("plumb")) {
        iconType = nameLower.includes("plumb") ? "plumbing" : (nameLower.includes("carpenter") || nameLower.includes("wood") ? "carpentry" : (nameLower.includes("lock") ? "lock" : "electrical"));
      } else if (tagLower.includes("cleaning")) {
        iconType = nameLower.includes("sofa") ? "sofa" : (nameLower.includes("chimney") || nameLower.includes("descal") ? "sparkles" : "cleaning");
      } else if (tagLower.includes("appliances") || nameLower.includes("ac") || nameLower.includes("jet")) {
        iconType = nameLower.includes("ac") ? "cooling" : (nameLower.includes("ro") || nameLower.includes("water") ? "plumbing" : "tools");
      } else if (tagLower.includes("daily") || nameLower.includes("maid") || nameLower.includes("nanny")) {
        iconType = nameLower.includes("driver") ? "car" : (nameLower.includes("nanny") || nameLower.includes("elderly") ? "heart" : "home");
      } else if (tagLower.includes("kitchen") || nameLower.includes("chef") || nameLower.includes("cook")) {
        iconType = nameLower.includes("cater") || nameLower.includes("bar") ? "glass" : "chef";
      } else if (tagLower.includes("decor") || nameLower.includes("paint") || nameLower.includes("wall")) {
        iconType = "paint";
      } else if (tagLower.includes("spa") || tagLower.includes("wellness")) {
        iconType = "spa";
      }

      return {
        ...item,
        image: item.image || getServiceImage(item),
        iconType: item.iconType || iconType,
        rating: item.rating || 4.8,
        bookings: item.bookings || `${(index * 70 + 350)}+`,
        speed: item.speed || "30 min dispatch"
      };
    });
  }, [rawList]);

  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const categories = [
    { id: "All", label: "All Services" },
    { id: "Repairs", label: "Repairs & Fixes" },
    { id: "Cleaning", label: "Deep Cleaning" },
    { id: "Appliances", label: "Appliances & AC" },
    { id: "Daily Help", label: "Daily Help & Maid" },
    { id: "Kitchen", label: "Kitchen & Cooking" },
    { id: "Home Decor", label: "Decor & Painting" },
    { id: "Spa & Wellness", label: "Spa & Wellness" }
  ];

  // Filtering & Sorting
  const filteredServices = useMemo(() => {
    let result = servicesList.filter((s) => {
      const matchesCategory =
        activeFilter === "All" ||
        s.tag === activeFilter ||
        (s.category && s.category.toLowerCase().includes(activeFilter.toLowerCase()));

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        (s.desc && s.desc.toLowerCase().includes(query)) ||
        (s.tag && s.tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => {
        const pA = parseInt((a.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
        const pB = parseInt((b.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
        return pA - pB;
      });
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    } else {
      // Default: popular first
      result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    return result;
  }, [servicesList, activeFilter, searchQuery, sortBy]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, sortBy, itemsPerPage]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredServices.length);
  const paginatedServices = useMemo(() => {
    return filteredServices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredServices, startIndex, itemsPerPage]);

  // Smooth scroll to top of service catalog on page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (gridTopRef.current) {
        gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="services-page-wrapper">
      {/* Background ambient radial glow */}
      <div className="services-ambient-glow" aria-hidden="true">
        <div className="srv-glow srv-glow-1" />
        <div className="srv-glow srv-glow-2" />
      </div>

      <div className="services-container">
        
        {/* ================= Studio Hero Section ================= */}
        <section className="services-studio-hero">
          <div className="hero-pill-badge">
            <span className="live-status-dot" />
            <span>ON-DEMAND CAPABILITIES & SERVICES</span>
          </div>

          <h1 className="services-studio-title">
            Services & Capabilities.<br />
            <span className="title-gradient-accent">Built for Every Need.</span>
          </h1>

          <p className="services-studio-subtitle">
            Smart dispatch connects your request with background-verified, certified local professionals in less than 30 seconds.
          </p>

          {/* Search bar & quick filters */}
          <div className="services-search-wrapper">
            <div className="search-bar-glass">
              <span className="search-svg-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search across 27+ capabilities: AC jet service, emergency plumbing, painting..."
                className="search-input-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Clean Horizontal Category Tabs */}
          <div className="category-tabs-container">
            <div className="category-tabs-scroll">
              {categories.map((cat) => {
                const count = servicesList.filter(
                  (s) => cat.id === "All" || s.tag === cat.id || (s.category && s.category.toLowerCase().includes(cat.id.toLowerCase()))
                ).length;

                const isActive = activeFilter === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cat-tab-btn ${isActive ? "active" : ""}`}
                    onClick={() => setActiveFilter(cat.id)}
                  >
                    <span>{cat.label}</span>
                    <span className="cat-count-badge">{count}</span>
                    {isActive && <span className="cat-active-pill" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Bar: Results count, Per-page & Sort Dropdown */}
          <div className="services-meta-bar" ref={gridTopRef}>
            <div className="meta-results-count">
              <span>Showing <strong>{filteredServices.length ? startIndex + 1 : 0}–{endIndex}</strong> of <strong>{filteredServices.length}</strong> services</span>
              {activeFilter !== "All" && (
                <button 
                  type="button" 
                  className="reset-filter-tag"
                  onClick={() => setActiveFilter("All")}
                >
                  Filter: {activeFilter} ✕
                </button>
              )}
            </div>

            <div className="meta-controls-right">
              {/* Items Per Page Selector */}
              <div className="meta-per-page-box">
                <span className="control-label">Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="control-dropdown"
                >
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                  <option value={24}>24</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="meta-sort-box">
                <span className="control-label">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="control-dropdown"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>

        </section>

        {/* ================= Trust Highlights Bar ================= */}
        <section className="services-trust-bar">
          <div className="trust-bar-item">
            <span className="trust-icon-dot">🛡️</span>
            <div>
              <strong>100% Background-Screened</strong>
              <span>Govt. ID & police vetted pros</span>
            </div>
          </div>
          <div className="trust-bar-item">
            <span className="trust-icon-dot">⏱️</span>
            <div>
              <strong>Sub-30 Min Rapid Dispatch</strong>
              <span>Nearest specialist auto-routed</span>
            </div>
          </div>
          <div className="trust-bar-item">
            <span className="trust-icon-dot">💎</span>
            <div>
              <strong>30-Day Revisit Warranty</strong>
              <span>Zero-cost inspection if needed</span>
            </div>
          </div>
          <div className="trust-bar-item">
            <span className="trust-icon-dot">💳</span>
            <div>
              <strong>Pay After Complete Work</strong>
              <span>Zero upfront cancellation fees</span>
            </div>
          </div>
        </section>

        {/* ================= Services Bento Grid ================= */}
        {paginatedServices.length > 0 ? (
          <>
            <div className="services-bento-grid">
              {paginatedServices.map((item) => (
                <div className="service-bento-card" key={item.id}>
                  
                  {/* Card Top: Distinct Trade Image Box */}
                  <div className="service-card-image-box">
                    <img 
                      src={item.image || getServiceImage(item)} 
                      alt={item.name} 
                      className="service-card-img" 
                      loading="lazy" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getServiceImage(item);
                      }}
                    />
                    <div className="service-card-img-gradient" />

                    <div className="card-badge-cluster">
                      {item.popular && (
                        <span className="badge-flame">
                          <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          POPULAR
                        </span>
                      )}
                      <span className="badge-status-pill">{item.speed || "VERIFIED"}</span>
                    </div>

                    <div className="service-icon-floating" title={item.tag || item.name}>
                      <ServiceIcon type={item.iconType} />
                    </div>
                  </div>

                  {/* Card Main Info */}
                  <div className="card-main-content">
                    <div className="service-title-row">
                      <h3 className="service-card-title">{item.name}</h3>
                    </div>

                    <p className="service-card-desc">
                      {item.desc || "Certified professionals for reliable and prompt doorstep completion."}
                    </p>

                    <div className="service-meta-stats">
                      <span className="stat-rating">
                        <span className="star-char">★</span> {item.rating || 4.9}
                      </span>
                      <span className="stat-bullet">•</span>
                      <span className="stat-bookings">{item.bookings || "850+"} jobs done</span>
                    </div>
                  </div>

                  {/* Card Bottom: Price & Action */}
                  <div className="card-bottom-footer">
                    <div className="price-tag-wrap">
                      <span className="price-lead-label">Starts at</span>
                      <div className="price-figure">
                        <span className="price-num">{item.price || "₹199"}</span>
                      </div>
                    </div>

                    <Link 
                      to={`/category/${(item.category || item.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`} 
                      className="btn-book-service"
                    >
                      <span>Book Now</span>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    </Link>
                  </div>

                  <div className="card-hover-ambient-glow" />
                </div>
              ))}
            </div>

            {/* ================= Professional Pagination Bar ================= */}
            {totalPages > 1 && (
              <div className="services-pagination-bar">
                <div className="pagination-count-indicator">
                  <span>
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredServices.length} total capabilities)
                  </span>
                </div>

                <div className="pagination-action-controls">
                  <button
                    type="button"
                    className="pagination-nav-btn prev-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Go to previous page"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                    <span>Previous</span>
                  </button>

                  <div className="pagination-pages-group">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        className={`pagination-num-btn ${currentPage === pageNum ? "active" : ""}`}
                        onClick={() => handlePageChange(pageNum)}
                        title={`Page ${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="pagination-nav-btn next-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Go to next page"
                  >
                    <span>Next</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty Search State */
          <div className="services-empty-state">
            <div className="empty-icon-box">🔍</div>
            <h3>No capabilities match "{searchQuery}"</h3>
            <p>Try searching for general terms like plumbing, AC, electrician, cleaning, or reset your filters.</p>
            <button
              type="button"
              className="btn-reset-search"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All");
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* ================= Bottom Enterprise Banner ================= */}
        <section className="services-enterprise-banner">
          <div className="banner-ambient-orb" />
          
          <div className="enterprise-info">
            <div className="enterprise-pill">
              <span className="pulse-enterprise-dot" />
              <span>ENTERPRISE & COMMERCIAL DISPATCH</span>
            </div>
            <h2>Need a Custom Commercial or Facility Setup?</h2>
            <p>
              Helper handles scheduled fleet maintenance, corporate office sanitization, retail chain repairs, and gated society partnerships with dedicated SLA managers.
            </p>

            <div className="enterprise-perks-row">
              <span className="enterprise-perk">✓ Dedicated Account Manager</span>
              <span className="enterprise-perk">✓ GST-Compliant Monthly Invoicing</span>
              <span className="enterprise-perk">✓ Guaranteed 2-Hour Escalation SLA</span>
            </div>
          </div>

          <div className="enterprise-actions">
            <Link to="/contact" className="btn-enterprise-primary">
              <span>Talk to Commercial Dispatch</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
            <Link to="/grow-business" className="btn-enterprise-secondary">
              Partner as a Vendor
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Services;
