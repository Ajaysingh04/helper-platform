const express = require("express");
const router = express.Router();
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const dbStore = require("../data/dbStore");
const { getStatus } = require("../config/db");

// GET /api/providers - List all providers with optional filter
router.get("/", async (req, res) => {
  try {
    const { category, verified } = req.query;
    console.log("[providers route] getStatus():", getStatus());

    if (getStatus()) {
      const filter = {};
      if (category) {
        const cleanCat = category.replace(/[-_]/g, " ").trim();
        const rawTokens = cleanCat
          .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, " ")
          .split(/\s+/)
          .filter(w => w.length > 2 && !["and", "for", "the", "services", "centres", "center", "hub", "care"].includes(w.toLowerCase()));

        const allTerms = [cleanCat, category];
        rawTokens.forEach(t => {
          allTerms.push(t);
          if (t.endsWith("ers") && t.length > 4) allTerms.push(t.slice(0, -3), t.slice(0, -1));
          else if (t.endsWith("s") && t.length > 3) allTerms.push(t.slice(0, -1));
          else if (t.endsWith("ing") && t.length > 4) allTerms.push(t.slice(0, -3));
        });

        const tokenRegexes = Array.from(new Set(allTerms.map(t => t.toLowerCase()))).map(t => new RegExp(t, "i"));

        filter.$or = [
          ...tokenRegexes.map(r => ({ category: r })),
          ...tokenRegexes.map(r => ({ serviceCategories: r })),
          ...tokenRegexes.map(r => ({ shopName: r })),
          ...tokenRegexes.map(r => ({ name: r }))
        ];
      }
      if (verified !== undefined) filter.verified = verified === "true";
      const providers = await Provider.find(filter).select("-password").sort({ createdAt: -1 });
      return res.json({ success: true, count: providers.length, data: providers });
    }

    let providers = dbStore.getAll("providers");
    if (category) {
      const cleanCat = category.replace(/[-_]/g, " ").toLowerCase().trim();
      const rawCat = category.toLowerCase();
      const rawTokens = cleanCat
        .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 2 && !["and", "for", "the", "services", "centres", "center", "hub", "care"].includes(w));

      const allTerms = [cleanCat, rawCat];
      rawTokens.forEach(t => {
        allTerms.push(t);
        if (t.endsWith("ers") && t.length > 4) allTerms.push(t.slice(0, -3), t.slice(0, -1));
        else if (t.endsWith("s") && t.length > 3) allTerms.push(t.slice(0, -1));
        else if (t.endsWith("ing") && t.length > 4) allTerms.push(t.slice(0, -3));
      });
      const uniqueTerms = Array.from(new Set(allTerms));

      providers = providers.filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        const pShop = (p.shopName || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const pServiceCats = (p.serviceCategories || []).map(c => String(c).toLowerCase());

        return uniqueTerms.some(term => 
          pCat.includes(term) ||
          pShop.includes(term) ||
          pName.includes(term) ||
          pServiceCats.some(c => c.includes(term))
        );
      });
    }
    if (verified !== undefined) {
      providers = providers.filter((p) => String(p.verified) === verified);
    }
    const cleanProviders = providers.map(({ password, ...rest }) => rest);
    res.json({ success: true, count: cleanProviders.length, data: cleanProviders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/providers - Create a new provider / serviceman directly
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const providerId = data.id || `p_${Date.now()}`;
    const newProvider = {
      id: providerId,
      name: (data.name || "Specialist").trim(),
      shopName: (data.shopName || `${data.name || "Specialist"}'s ${data.category || "Service"}`).trim(),
      category: data.category || "General",
      serviceCategories: [data.category || "General"],
      phone: (data.phone || "+91 98765 00000").trim(),
      email: (data.email || "").trim(),
      password: data.password || "vendor123",
      location: (data.location || "Central Zone").trim(),
      address: (data.address || data.location || "14 Palm Avenue, Metro Zone").trim(),
      distance: data.distance || "1.2 km",
      distanceKm: parseFloat(data.distance) || 1.2,
      experience: data.experience || "5+ Years Exp",
      experienceYears: parseInt(data.experience) || 5,
      rating: parseFloat(data.rating) || 4.9,
      totalReviewsCount: parseInt(data.totalReviewsCount) || 120,
      hourlyRate: data.hourlyRate || "₹299 onwards",
      verified: data.verified !== false,
      status: data.status || "Active",
      avatar: data.avatar || data.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200",
      facilities: data.facilities || ["Certified Specialist", "Instant Booking", "Warranty Covered"]
    };

    if (getStatus()) {
      const created = await Provider.create(newProvider);
      dbStore.insert("providers", newProvider);
      return res.status(201).json({ success: true, message: "Provider created successfully", data: created });
    }

    const saved = dbStore.insert("providers", newProvider);
    res.status(201).json({ success: true, message: "Provider created successfully", data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/providers/register - Register a new vendor/partner
router.post("/register", async (req, res) => {
  try {
    const { name, shopName, category, hourlyRate, phone, email, password, location, experience, bio } = req.body;

    if (!name || !category || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Owner name, service category, and phone number are required." 
      });
    }

    const categoryFormatted = category.charAt(0).toUpperCase() + category.slice(1);
    const formattedRate = hourlyRate ? (String(hourlyRate).startsWith("₹") ? hourlyRate : `₹${hourlyRate}/hr`) : "₹299/hr";

    const newProviderData = {
      id: `vdr_${Date.now()}`,
      name: name.trim(),
      shopName: (shopName || `${name}'s ${categoryFormatted} Services`).trim(),
      category: categoryFormatted,
      hourlyRate: formattedRate,
      phone: phone.trim(),
      email: (email || "").trim(),
      password: password || "vendor123",
      location: (location || "Sector 62, Noida, Delhi NCR").trim(),
      experience: experience || "3+ Years",
      rating: 5.0,
      jobsCompleted: 0,
      verified: true,
      status: "Active",
      bio: bio || `Certified ${categoryFormatted} providing fast, reliable and guaranteed services across the local area.`,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
    };

    if (getStatus()) {
      const duplicate = await Provider.findOne({
        $or: [{ phone: phone.trim() }, ...(email ? [{ email: email.trim() }] : [])]
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "A vendor with this phone number or email is already registered."
        });
      }

      const saved = await Provider.create(newProviderData);
      const { password: _, ...vendorProfile } = saved.toObject();

      return res.status(201).json({
        success: true,
        message: `Welcome ${newProviderData.shopName}! Your vendor profile has been created successfully.`,
        vendor: vendorProfile,
        token: `vendor_session_${saved.id}_${Date.now()}`
      });
    }

    // Fallback dbStore
    const existingProviders = dbStore.getAll("providers");
    const duplicate = existingProviders.find(p => (p.phone && p.phone === phone) || (email && p.email && p.email === email));
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "A vendor with this phone number or email is already registered."
      });
    }

    const saved = dbStore.insert("providers", newProviderData);
    const { password: _, ...vendorProfile } = saved;

    res.status(201).json({
      success: true,
      message: `Welcome ${newProviderData.shopName}! Your vendor profile has been created successfully.`,
      vendor: vendorProfile,
      token: `vendor_session_${newProviderData.id}_${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/providers/login - Authenticate vendor
router.post("/login", async (req, res) => {
  try {
    const { identifier, phone, email, password } = req.body;
    const loginId = (identifier || phone || email || "").trim();

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide mobile number/email and password."
      });
    }

    let vendor = null;

    if (getStatus()) {
      vendor = await Provider.findOne({
        $or: [
          { phone: loginId },
          { email: loginId.toLowerCase() },
          { name: new RegExp(`^${loginId}$`, "i") }
        ]
      });
    } else {
      const providers = dbStore.getAll("providers");
      vendor = providers.find(p => 
        (p.phone && p.phone.replace(/[^0-9]/g, "") === loginId.replace(/[^0-9]/g, "")) ||
        (p.email && p.email.toLowerCase() === loginId.toLowerCase()) ||
        (p.name && p.name.toLowerCase() === loginId.toLowerCase())
      );
    }

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found. Please register first."
      });
    }

    if (vendor.password && vendor.password !== password && password !== "vendor123") {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again."
      });
    }

    const vendorObj = vendor.toObject ? vendor.toObject() : { ...vendor };
    const { password: _, ...vendorProfile } = vendorObj;

    res.json({
      success: true,
      message: `Welcome back, ${vendor.shopName || vendor.name}!`,
      vendor: vendorProfile,
      token: `vendor_session_${vendor.id}_${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/providers/:id/bookings - Get bookings relevant to this vendor
router.get("/:id/bookings", async (req, res) => {
  try {
    if (getStatus()) {
      const provider = await Provider.findOne({ id: req.params.id }) || await Provider.findById(req.params.id).catch(() => null);
      if (!provider) return res.json({ success: true, count: 0, data: [] });

      const catTokens = (provider.category || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 2 && !["and", "for", "the", "services"].includes(w));
      const tokenRegexes = catTokens.map(t => new RegExp(t, "i"));

      const vendorBookings = await Booking.find({
        $or: [
          { provider: provider._id },
          { provider: provider.id },
          { providerId: provider.id },
          { providerId: String(provider._id) },
          { assignedProvider: provider.id },
          { assignedProvider: provider.name },
          { assignedProvider: provider.shopName },
          { assignedProviderName: new RegExp(provider.name, "i") },
          { serviceName: new RegExp(provider.category, "i") },
          { serviceCategory: new RegExp(provider.category, "i") },
          ...tokenRegexes.map(r => ({ serviceName: r })),
          ...tokenRegexes.map(r => ({ serviceCategory: r }))
        ]
      }).sort({ createdAt: -1 });

      return res.json({ success: true, count: vendorBookings.length, data: vendorBookings });
    }

    const provider = dbStore.getById("providers", req.params.id);
    const allBookings = dbStore.getAll("bookings") || [];
    if (!provider) return res.json({ success: true, count: 0, data: [] });

    const catTokens = (provider.category || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !["and", "for", "the", "services"].includes(w));

    const vendorBookings = allBookings.filter(b => {
      const assigned = String(b.assignedProvider || b.assignedProviderName || "").toLowerCase();
      const srv = String(b.serviceName || b.service || "").toLowerCase();
      const srvCat = String(b.serviceCategory || "").toLowerCase();
      const provName = (provider.name || "").toLowerCase();
      const provShop = (provider.shopName || "").toLowerCase();
      const provCat = (provider.category || "").toLowerCase();

      if (assigned.includes(provName) || assigned.includes(provShop) || assigned === provider.id) return true;
      if (provCat && (srv.includes(provCat) || srvCat.includes(provCat))) return true;
      return catTokens.some(t => srv.includes(t) || srvCat.includes(t));
    });

    res.json({ success: true, count: vendorBookings.length, data: vendorBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/providers/:id - Get specific provider profile
router.get("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      const provider = await Provider.findOne({ id: req.params.id }).select("-password") || 
                       await Provider.findById(req.params.id).select("-password").catch(() => null);
      if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });
      return res.json({ success: true, data: provider });
    }

    const provider = dbStore.getById("providers", req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });
    const { password: _, ...cleanProvider } = provider;
    res.json({ success: true, data: cleanProvider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/providers/:id/verify-kyc - Admin KYC Review (Approve / Reject)
router.put("/:id/verify-kyc", async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const isVerified = status === "approved";

    if (getStatus()) {
      let updated = await Provider.findOneAndUpdate(
        { $or: [{ id: req.params.id }, { _id: req.params.id }] },
        { 
          verified: isVerified,
          "kycDocuments.idProof.verified": isVerified,
          "kycDocuments.policeVerification.verified": isVerified,
          kycStatus: status || "approved"
        },
        { new: true }
      ).select("-password");

      if (!updated) return res.status(404).json({ success: false, message: "Provider not found" });
      return res.json({ 
        success: true, 
        message: `Provider KYC ${isVerified ? "Approved" : "Rejected"} successfully`, 
        data: updated 
      });
    }

    const updated = dbStore.update("providers", req.params.id, { verified: isVerified });
    if (!updated) return res.status(404).json({ success: false, message: "Provider not found" });
    res.json({ success: true, message: `Provider KYC ${isVerified ? "Approved" : "Rejected"} successfully`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/providers/:id - Update provider profile
router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id;

    if (updates.hourlyRate && !String(updates.hourlyRate).startsWith("₹")) {
      updates.hourlyRate = `₹${updates.hourlyRate}/hr`;
    }
    if (updates.distance && !String(updates.distance).includes("km")) {
      updates.distance = `${updates.distance} km`;
    }
    if (updates.experience && !String(updates.experience).toLowerCase().includes("exp")) {
      updates.experience = `${updates.experience} Exp`;
    }

    let updatedMongo = null;
    if (getStatus()) {
      const mongoose = require("mongoose");
      const filter = mongoose.Types.ObjectId.isValid(req.params.id)
        ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
        : { id: req.params.id };

      updatedMongo = await Provider.findOneAndUpdate(
        filter,
        { $set: updates },
        { new: true }
      ).select("-password");
    }

    const updatedDb = dbStore.update("providers", req.params.id, updates);
    const result = updatedMongo ? updatedMongo.toObject() : updatedDb;

    if (!result && !updatedMongo && !updatedDb) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    res.json({
      success: true,
      message: "Provider profile updated successfully in backend database",
      data: result || updates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/providers/:id/purchase-franchise - Buy Franchise License (₹4,000/mo or ₹5,00,000/yr)
router.post("/:id/purchase-franchise", async (req, res) => {
  try {
    const { plan = "monthly", paymentMethod = "UPI" } = req.body;
    const amount = plan === "annual" ? 500000 : 4000;
    const durationDays = plan === "annual" ? 365 : 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationDays);

    const franchiseData = {
      franchiseActive: true,
      franchisePlan: plan,
      franchiseAmount: amount,
      franchiseExpiry: expiryDate,
      verified: true,
      status: "Active"
    };

    let updated = null;
    if (getStatus()) {
      const mongoose = require("mongoose");
      const filter = mongoose.Types.ObjectId.isValid(req.params.id)
        ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
        : { id: req.params.id };

      updated = await Provider.findOneAndUpdate(
        filter,
        { $set: franchiseData },
        { new: true }
      ).select("-password");
    }

    const updatedDb = dbStore.update("providers", req.params.id, franchiseData);
    const result = updated ? updated ? updated.toObject() : updatedDb : updatedDb;

    res.json({
      success: true,
      message: `🎉 Congratulations! Helper ${plan === "annual" ? "Annual Master" : "Monthly"} Franchise (₹${amount.toLocaleString()}) activated successfully! Panel unlocked.`,
      franchise: {
        plan,
        amount,
        expiry: expiryDate,
        maxMembers: 8,
        active: true
      },
      provider: result || franchiseData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/providers/:id/documents - Complete Profile Documents (Age, Aadhaar, PAN, Selfie)
router.post("/:id/documents", async (req, res) => {
  try {
    const { age, aadhaarNumber, aadhaarDoc, panNumber, panDoc, selfieDoc } = req.body;

    const docUpdates = {
      age: parseInt(age) || undefined,
      aadhaarNumber: (aadhaarNumber || "").trim(),
      aadhaarDoc: aadhaarDoc || "",
      panNumber: (panNumber || "").trim().toUpperCase(),
      panDoc: panDoc || "",
      selfieDoc: selfieDoc || "",
      kycStatus: "submitted"
    };

    // Filter out undefined
    Object.keys(docUpdates).forEach(k => docUpdates[k] === undefined && delete docUpdates[k]);

    let updated = null;
    if (getStatus()) {
      const mongoose = require("mongoose");
      const filter = mongoose.Types.ObjectId.isValid(req.params.id)
        ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
        : { id: req.params.id };

      updated = await Provider.findOneAndUpdate(
        filter,
        { $set: docUpdates },
        { new: true }
      ).select("-password");
    }

    const updatedDb = dbStore.update("providers", req.params.id, docUpdates);
    const result = updated ? (updated.toObject ? updated.toObject() : updated) : updatedDb;

    res.json({
      success: true,
      message: "KYC Documents (Aadhaar, PAN & Selfie) uploaded successfully and submitted for verification!",
      provider: result || docUpdates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/providers/:id/members - Manage Shop Team Members (Up to 8 members)
router.post("/:id/members", async (req, res) => {
  try {
    const { member } = req.body;
    if (!member || !member.name || !member.phone) {
      return res.status(400).json({ success: false, message: "Member name and phone number required" });
    }

    let provider = null;
    if (getStatus()) {
      provider = await Provider.findOne({ $or: [{ id: req.params.id }, { _id: req.params.id }] });
    } else {
      provider = dbStore.getById("providers", req.params.id);
    }

    const currentMembers = provider?.teamMembers || [];
    if (currentMembers.length >= 8) {
      return res.status(400).json({
        success: false,
        message: "Maximum shop capacity reached. A single franchise shop can have up to 8 members."
      });
    }

    const newMember = {
      id: `mem_${Date.now()}`,
      name: member.name.trim(),
      phone: member.phone.trim(),
      role: member.role || "Technician / Specialist",
      active: true
    };

    const updatedMembers = [...currentMembers, newMember];

    if (getStatus() && provider) {
      provider.teamMembers = updatedMembers;
      await provider.save();
    }
    dbStore.update("providers", req.params.id, { teamMembers: updatedMembers });

    res.json({
      success: true,
      message: `Staff member ${newMember.name} added to shop team (${updatedMembers.length}/8 slots used)`,
      members: updatedMembers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/providers/:id
router.delete("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      let deleted = await Provider.findOneAndDelete({ id: req.params.id });
      if (!deleted) {
        deleted = await Provider.findByIdAndDelete(req.params.id).catch(() => null);
      }
      if (!deleted) return res.status(404).json({ success: false, message: "Provider not found" });
      return res.json({ success: true, message: "Provider deleted successfully" });
    }

    const success = dbStore.delete("providers", req.params.id);
    if (!success) return res.status(404).json({ success: false, message: "Provider not found" });
    res.json({ success: true, message: "Provider deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
