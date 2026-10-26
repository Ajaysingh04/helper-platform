const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const Category = require("../models/Category");
const Service = require("../models/Service");
const Provider = require("../models/Provider");
const Worker = require("../models/Worker");
const Slide = require("../models/Slide");
const Setting = require("../models/Setting");
const seedData = require("../data/seedData");

async function syncAll() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error("❌ MONGO_URI is not defined in .env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(mongoURI);
  console.log("✅ Connected to MongoDB");

  // Read database.json
  const dbPath = path.join(__dirname, "..", "data", "database.json");
  let dbJson = {};
  if (fs.existsSync(dbPath)) {
    try {
      dbJson = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    } catch (e) {
      console.warn("Could not parse database.json:", e.message);
    }
  }

  // 1. Sync Slides with authentic Helper uniform banners
  const cleanSlides = [
    {
      id: "sl1",
      title: "All Verified Experts. One Trusted Platform.",
      image: "/images/banner_all_experts_clean.png",
      active: true
    },
    {
      id: "sl2",
      title: "Certified Electricians & Diagnostics",
      image: "/images/banner_electrician.png",
      active: true
    },
    {
      id: "sl3",
      title: "Master Plumbing & Sanitary Fix",
      image: "/images/banner_plumber.png",
      active: true
    },
    {
      id: "sl4",
      title: "Master Wall Painters & Waterproofing",
      image: "/images/banner_painter.png",
      active: true
    },
    {
      id: "sl5",
      title: "Everything Your Home Needs in 15 Mins",
      image: "/images/banner_team.png",
      active: true
    }
  ];

  for (const sl of cleanSlides) {
    await Slide.findOneAndUpdate(
      { $or: [{ id: sl.id }, { title: sl.title }] },
      { $set: sl },
      { upsert: true, returnDocument: 'after' }
    );
  }
  console.log(`✅ Synced ${cleanSlides.length} Helper uniform slides into MongoDB`);

  // 2. Sync Services with verified clean high-res images
  const allServices = dbJson.services || seedData.initialServices || [];
  let serviceCount = 0;
  for (const srv of allServices) {
    if (!srv.name) continue;
    const updateData = { ...srv };
    const lower = (srv.name || "").toLowerCase();
    if (lower.includes("electric")) updateData.image = "/images/electrician.png";
    else if (lower.includes("plumb")) updateData.image = "/images/plumber.png";
    else if (lower.includes("paint")) updateData.image = "/images/painter.png";
    
    await Service.findOneAndUpdate(
      { $or: [{ id: srv.id }, { name: srv.name }] },
      { $set: updateData },
      { upsert: true, returnDocument: 'after' }
    );
    serviceCount++;
  }
  console.log(`✅ Synced ${serviceCount} services into MongoDB`);

  // 3. Sync Categories with icons & images
  const allCategories = (seedData.initialCategories && seedData.initialCategories.length > 0)
    ? seedData.initialCategories
    : (dbJson.categories || []);
  let catCount = 0;
  for (const cat of allCategories) {
    if (!cat.name) continue;
    let catImage = cat.image || "";
    const lower = cat.name.toLowerCase();
    if (lower.includes("electric")) catImage = "/images/electrician.png";
    else if (lower.includes("plumb")) catImage = "/images/plumber.png";
    else if (lower.includes("paint")) catImage = "/images/painter.png";
    else if (!catImage || catImage.trim() === "") catImage = "/images/banner_all_experts_clean.png";

    const cleanCat = {
      id: cat.id || (cat.name.toLowerCase().replace(/[^a-z0-9]/g, "-")),
      name: cat.name,
      icon: cat.icon || "🔧",
      path: cat.path || `/category/${cat.id || ""}`,
      count: cat.count || "50+ Pros",
      tag: cat.tag || "General",
      group: cat.group || "Services",
      popular: cat.popular !== false,
      order: cat.order || 0,
      image: catImage,
      active: cat.active !== false
    };
    await Category.findOneAndUpdate(
      { $or: [{ id: cleanCat.id }, { name: cleanCat.name }] },
      { $set: cleanCat },
      { upsert: true, returnDocument: 'after' }
    );
    catCount++;
  }
  console.log(`✅ Synced ${catCount} categories into MongoDB`);

  // 4. Sync Settings heroBanners (authentic Helper uniform dress images)
  const cleanHeroBanners = [
    {
      id: "hero-banner-all-experts",
      title: "All Verified Experts.",
      highlight: "One Trusted Platform.",
      subtitle: "Over 100+ on-demand home, technical, medical & emergency services delivered in 15 mins by police-verified professionals.",
      badge: "🛡️ 50,000+ POLICE-VERIFIED SPECIALISTS",
      city: "📍 INDORE & SURROUNDING REGIONS",
      image: "/images/banner_all_experts_clean.png",
      mobileImage: "/images/banner_all_experts_clean.png",
      tag: "🛡️ POLICE VERIFIED",
      price: 299,
      originalPrice: 599,
      active: true,
      categoryRoute: { id: "cleaning", name: "Cleaning", icon: "🧹" }
    },
    {
      id: "hero-banner-electrician",
      title: "Certified Electricians & Diagnostics",
      highlight: "Instant 15-Min Response.",
      subtitle: "Short circuit repair, wiring, switchboard fixing & installation by background-screened professionals.",
      badge: "⚡ 100% VERIFIED ELECTRICIANS",
      city: "📍 INSTANT DISPATCH",
      image: "/images/banner_electrician.png",
      mobileImage: "/images/banner_electrician.png",
      tag: "⚡ 15-MIN ARRIVAL",
      price: 199,
      originalPrice: 349,
      active: true,
      categoryRoute: { id: "electricians", name: "Electrician", icon: "⚡" }
    },
    {
      id: "hero-banner-plumber",
      title: "Master Plumbing & Sanitary Fix",
      highlight: "Leakage & Pipe Repair Guaranteed.",
      subtitle: "Leak repairs, tap fittings, pipe drainage & sanitary installations. Transparent upfront pricing.",
      badge: "🚰 CERTIFIED MASTER PLUMBERS",
      city: "📍 AT YOUR DOORSTEP",
      image: "/images/banner_plumber.png",
      mobileImage: "/images/banner_plumber.png",
      tag: "🚰 24/7 ARRIVAL",
      price: 249,
      originalPrice: 449,
      active: true,
      categoryRoute: { id: "plumbers", name: "Plumber", icon: "🚰" }
    },
    {
      id: "hero-banner-painter",
      title: "Master Wall Painters & Waterproofing",
      highlight: "Flawless Dust-Free Finish.",
      subtitle: "Dust-free roller painting & premium finish 1-day guarantee with 5-year anti-peel warranty.",
      badge: "🎨 1-DAY SERVICE",
      city: "📍 15 MIN ARRIVAL",
      image: "/images/banner_painter.png",
      mobileImage: "/images/banner_painter.png",
      tag: "🎨 1-DAY SERVICE",
      price: 499,
      originalPrice: 899,
      active: true,
      categoryRoute: { id: "painters", name: "Painting", icon: "🎨" }
    },
    {
      id: "hero-banner-team",
      title: "Everything Your Home Needs",
      highlight: "Delivered In 15 Mins.",
      subtitle: "Your everyday service team for instant home repairs, cleaning, maintenance, and wellness.",
      badge: "⭐ TRUSTED BY 25,000+ HOMES",
      city: "📍 INDORE & SURROUNDING REGIONS",
      image: "/images/banner_team.png",
      mobileImage: "/images/banner_team.png",
      tag: "⭐ #1 PLATFORM",
      price: 299,
      originalPrice: 499,
      active: true,
      categoryRoute: { id: "cleaning", name: "Cleaning", icon: "🧹" }
    }
  ];

  await Setting.findOneAndUpdate(
    { key: "global_settings" },
    { $set: { heroBanners: cleanHeroBanners } },
    { upsert: true, returnDocument: 'after' }
  );
  console.log("✅ Synced global settings & authentic Helper uniform hero banners into MongoDB");

  // 5. Ensure Indore Provider & Workers exist in MongoDB
  const indoreProvider = {
    id: "VND-IND-01",
    name: "Ramesh Sharma",
    shopName: "Indore Multi-Specialist Hub",
    phone: "9876543210",
    email: "indore.hub@helper.com",
    city: "Indore",
    state: "Madhya Pradesh",
    hourlyRate: 299,
    rating: 4.9,
    experience: "8 Yrs Exp",
    status: "approved",
    isAvailable: true,
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300",
    skills: ["AC Repair", "Electrician", "Plumber", "Cleaning"]
  };

  await Provider.findOneAndUpdate(
    { $or: [{ id: "VND-IND-01" }, { phone: "9876543210" }] },
    { $set: indoreProvider },
    { upsert: true, new: true }
  );
  console.log("✅ Synced Indore Multi-Specialist Hub provider into MongoDB");

  // Ensure Workers exist in MongoDB
  const initialWorkers = [
    {
      workerId: "WRK-101",
      id: "WRK-101",
      name: "Sunil Sharma",
      phone: "9876500101",
      email: "sunil.sharma@worker.helper.com",
      role: "Plumber",
      specialty: "Plumber",
      experience: "6 Yrs Exp",
      experienceYears: 6,
      rating: 4.9,
      city: "Indore",
      hubId: "VND-IND-01",
      providerId: "VND-IND-01",
      avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300",
      skills: ["Pipe Leakage", "Tap Repair", "Basin Installation", "Tank Cleaning", "Drainage Unclog"],
      status: "active",
      isOnDuty: true
    },
    {
      workerId: "WRK-102",
      id: "WRK-102",
      name: "Vikas Verma",
      phone: "9876500102",
      email: "vikas.verma@worker.helper.com",
      role: "Electrician",
      specialty: "Electrician",
      experience: "5 Yrs Exp",
      experienceYears: 5,
      rating: 4.8,
      city: "Indore",
      hubId: "VND-IND-01",
      providerId: "VND-IND-01",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
      skills: ["Short Circuit", "MCB Box", "Fan Regulator", "Concealed Wiring", "Geyser"],
      status: "active",
      isOnDuty: true
    },
    {
      workerId: "WRK-103",
      id: "WRK-103",
      name: "Amit Patel",
      phone: "9876500103",
      email: "amit.patel@worker.helper.com",
      role: "AC Technician",
      specialty: "AC Technician",
      experience: "7 Yrs Exp",
      experienceYears: 7,
      rating: 4.95,
      city: "Indore",
      hubId: "VND-IND-01",
      providerId: "VND-IND-01",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
      skills: ["AC Jet Foam", "Gas Charging R32", "Inverter PCB", "Copper Piping"],
      status: "active",
      isOnDuty: true
    }
  ];

  for (const wrk of initialWorkers) {
    await Worker.findOneAndUpdate(
      { $or: [{ workerId: wrk.workerId }, { id: wrk.id }, { phone: wrk.phone }] },
      { $set: wrk },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Synced ${initialWorkers.length} Indore technicians into MongoDB`);

  console.log("🎉 All images and models successfully synced to MongoDB Atlas!");
  process.exit(0);
}

syncAll().catch((err) => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});
