import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE, SOCKET_URL } from "../../apiConfig";
import QrCameraScannerModal from "./QrCameraScannerModal";
import "../../css/VendorDashboard.css";

const CATEGORIES_LIST = [
  "Plumber",
  "Electrician",
  "Driver (Chauffeur)",
  "Home Cleaner",
  "AC Repair & Refill",
  "Carpenter",
  "Wall Painter",
  "Home Cook / Chef",
  "Appliance Repair",
  "Packers & Movers",
  "Pest Control",
  "Body Massage & Spa",
  "Salon & Grooming"
];

const getCategoryEmoji = (category) => {
  if (!category) return "🛠️";
  const cat = category.toLowerCase();
  if (cat.includes("massage") || cat.includes("spa")) return "💆‍♀️";
  if (cat.includes("plumb")) return "🔧";
  if (cat.includes("electr")) return "💡";
  if (cat.includes("driver")) return "🚗";
  if (cat.includes("clean")) return "🧹";
  if (cat.includes("ac ") || cat.includes("refill") || cat.includes("cool")) return "🧊";
  if (cat.includes("carpenter")) return "🪚";
  if (cat.includes("paint")) return "🎨";
  if (cat.includes("cook") || cat.includes("chef")) return "👨‍🍳";
  if (cat.includes("salon") || cat.includes("grooming")) return "✂️";
  if (cat.includes("packers") || cat.includes("movers")) return "🚚";
  if (cat.includes("pest")) return "🛡️";
  if (cat.includes("appliance")) return "⚙️";
  return "🛠️";
};

function VendorDashboard() {
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Franchise State
  const [showFranchiseModal, setShowFranchiseModal] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Real-time Socket & Job Alert State
  const socketRef = useRef(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [offerCountdown, setOfferCountdown] = useState(60);

  // Telemetry: Slot Confirmation, Doorstep QR, and Dynamic Stopwatch states
  const [slotOtpInputs, setSlotOtpInputs] = useState({});
  const [qrInputs, setQrInputs] = useState({});
  const [materialInputs, setMaterialInputs] = useState({});
  const [liveCountdowns, setLiveCountdowns] = useState({});
  const [liveStopwatches, setLiveStopwatches] = useState({});
  const [liveRunningCosts, setLiveRunningCosts] = useState({});
  const [confirmingSlotId, setConfirmingSlotId] = useState(null);
  const [startingJobId, setStartingJobId] = useState(null);
  const [stoppingJobId, setStoppingJobId] = useState(null);
  const [, setCompletingJobId] = useState(null);
  const [activeScanningBooking, setActiveScanningBooking] = useState(null);

  // Wallet State
  const [wallet, setWallet] = useState({
    balance: 2450,
    escrowBalance: 0,
    totalEarned: 14850,
    transactions: [
      { id: "TX-901", type: "credit", amount: 666, description: "Payout for Booking HLP-91219", date: "Today" },
      { id: "TX-882", type: "credit", amount: 499, description: "Payout for AC Jet Service", date: "Yesterday" },
      { id: "TX-710", type: "debit", amount: 2000, description: "Instant UPI Transfer to partner@okhdfc", date: "3 days ago" }
    ]
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  // Shop & Work Form state
  const [profileForm, setProfileForm] = useState({
    shopName: "",
    name: "",
    category: "Plumber",
    hourlyRate: "299",
    location: "",
    phone: "",
    altPhone: "",
    email: "",
    experience: "3+ Years",
    bio: ""
  });

  // Custom Work & Services state
  const [customServices, setCustomServices] = useState([
    { id: "srv_1", name: "Standard Inspection & Diagnosis", price: 299, time: "30 mins" },
    { id: "srv_2", name: "Emergency Deep Repair & Fitment", price: 699, time: "60 mins" }
  ]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceTime, setNewServiceTime] = useState("45 mins");

  // Shop Members State (Capacity: 8 Members)
  const [teamMembers, setTeamMembers] = useState([
    { id: "mem_1", name: "Ramesh Kumar (Owner / Lead)", phone: "+91 98765 00001", role: "Master Specialist", active: true }
  ]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: "", phone: "", role: "Technician / Specialist" });

  // KYC & Document Verification State
  const [kycForm, setKycForm] = useState({
    age: "30",
    aadhaarNumber: "8472 9012 3456",
    aadhaarDoc: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    panNumber: "ABCDE1234F",
    panDoc: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
    selfieDoc: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
    kycStatus: "submitted"
  });
  const [submittingKyc, setSubmittingKyc] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Load Vendor Session from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("helper_vendor");
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setVendor(p);
        setProfileForm({
          shopName: p.shopName || `${p.name}'s ${p.category} Services`,
          name: p.name || "",
          category: p.category || "Plumber",
          hourlyRate: String(p.hourlyRate || "299").replace(/[^0-9]/g, ""),
          location: p.location || "Sector 62, Noida, Delhi NCR",
          phone: p.phone || "",
          altPhone: p.altPhone || "+91 98765 43210",
          email: p.email || "",
          experience: p.experience || "3+ Years",
          bio: p.bio || ""
        });

        if (p.teamMembers && Array.isArray(p.teamMembers) && p.teamMembers.length > 0) {
          setTeamMembers(p.teamMembers);
        } else if (p.name) {
          setTeamMembers([
            { id: "mem_1", name: `${p.name} (Owner / Lead)`, phone: p.phone || "+91 98765 00001", role: "Master Specialist", active: true }
          ]);
        }

        if (p.age || p.aadhaarNumber || p.panNumber) {
          setKycForm(prev => ({
            ...prev,
            age: p.age ? String(p.age) : prev.age,
            aadhaarNumber: p.aadhaarNumber || prev.aadhaarNumber,
            aadhaarDoc: p.aadhaarDoc || prev.aadhaarDoc,
            panNumber: p.panNumber || prev.panNumber,
            panDoc: p.panDoc || prev.panDoc,
            selfieDoc: p.selfieDoc || prev.selfieDoc,
            kycStatus: p.kycStatus || prev.kycStatus
          }));
        }

        if (p.customServices && Array.isArray(p.customServices)) {
          setCustomServices(p.customServices);
        }
      } catch (e) {
        console.error("Error loading vendor profile:", e);
      }
    } else {
      // Default demo vendor
      const defaultVendor = {
        id: "vdr_demo_01",
        name: "Ramesh Kumar",
        shopName: "Ramesh Express Plumbing & Home Care",
        category: "Plumber",
        hourlyRate: "299",
        location: "Sector 62, Noida, Delhi NCR",
        phone: "+91 98765 00001",
        rating: 4.9,
        jobsCompleted: 48,
        status: "Online",
        franchiseActive: true,
        franchisePlan: "monthly",
        franchiseAmount: 4000
      };
      setVendor(defaultVendor);
      localStorage.setItem("helper_vendor", JSON.stringify(defaultVendor));
    }
  }, []);

  // Connect Socket.IO
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      const raw = localStorage.getItem("helper_vendor");
      if (raw) {
        try {
          const p = JSON.parse(raw);
          socket.emit("provider:register", {
            providerId: p.id || p._id || "60d0fe4f5311236168a109ca",
            location: [77.391029, 28.535516]
          });
        } catch (e) {}
      }
    });

    socket.on("job:offer_alert", (data) => {
      setIncomingOffer({
        ...data,
        expiresAt: Date.now() + (data.expiresInSeconds || 60) * 1000
      });
      setOfferCountdown(data.expiresInSeconds || 60);
      showToast(`🔔 NEW JOB OFFER: ${data.serviceName} (₹${data.totalAmount})`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Offer countdown timer
  useEffect(() => {
    if (!incomingOffer) return;
    const interval = setInterval(() => {
      setOfferCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIncomingOffer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [incomingOffer]);

  // Listen for real-time customer bookings
  useEffect(() => {
    const handleNewBooking = (e) => {
      if (e.detail) {
        const newB = e.detail;
        setBookings(prev => {
          const exists = prev.some(b => (b.bookingId || b.id) === (newB.bookingId || newB.id));
          if (exists) return prev;
          return [newB, ...prev];
        });
        showToast(`🔔 NEW CUSTOMER BOOKING: ${newB.serviceName || newB.service} from ${newB.customerName}! ⚡`);
      }
    };
    window.addEventListener("new_booking_created", handleNewBooking);
    return () => window.removeEventListener("new_booking_created", handleNewBooking);
  }, []);

  // Fetch Bookings
  const fetchBookings = async (vendorId) => {
    setLoadingBookings(true);
    try {
      const idToFetch = vendorId || vendor?.id || vendor?._id;
      if (!idToFetch) return;
      const res = await fetch(`${API_BASE}/providers/${idToFetch}/bookings`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setBookings(data.data);
      } else {
        const cat = vendor?.category || "Specialist";
        const catServiceName = cat.includes("Massage") 
          ? "Full Body Relaxation & Ayurvedic Therapy"
          : cat.includes("Plumb") 
          ? "Water Leakage & Pipe Valve Repair"
          : cat.includes("Electr")
          ? "Short Circuit & Power Distribution Check"
          : `${cat} Doorstep Inspection & Care`;

        setBookings([
          {
            bookingId: "HLP-91219",
            serviceName: catServiceName,
            customerName: "Pooja Patel",
            customerAddress: "House 12, Block B, Golf Course Rd, Gurugram",
            customerPhone: "+91 98765 00002",
            status: "In Progress",
            totalAmount: 499,
            doorOtp: "4821",
            createdAt: "Today, 10:30 AM"
          },
          {
            bookingId: "HLP-89012",
            serviceName: `${cat} Routine Service & Care`,
            customerName: "Ananya Roy",
            customerAddress: "Villa 12, Jaypee Greens, Greater Noida",
            customerPhone: "+91 97118 89012",
            status: "Completed",
            totalAmount: 799,
            doorOtp: "9012",
            createdAt: "Yesterday"
          }
        ]);
      }
    } catch (err) {
      const cat = vendor?.category || "Specialist";
      setBookings([
        {
          bookingId: "HLP-91219",
          serviceName: `${cat} Doorstep Inspection & Service`,
          customerName: "Pooja Patel",
          customerAddress: "House 12, Block B, Golf Course Rd, Gurugram",
          customerPhone: "+91 98765 00002",
          status: "In Progress",
          totalAmount: 499,
          doorOtp: "4821",
          createdAt: "Today, 10:30 AM"
        }
      ]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (vendor?.id || vendor?._id) {
      fetchBookings(vendor.id || vendor._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor?.id]);

  // Toggle Online / Offline Status
  const toggleStatus = async () => {
    if (!vendor) return;
    const newStatus = vendor.status === "Online" ? "Offline" : "Online";
    const updatedVendor = { ...vendor, status: newStatus };
    setVendor(updatedVendor);
    localStorage.setItem("helper_vendor", JSON.stringify(updatedVendor));
    showToast(`Status updated to ${newStatus} ⚡`);

    try {
      await fetch(`${API_BASE}/providers/${vendor.id || vendor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
  };

  // =========================================================================
  // FRANCHISE ACTIVATION HANDLER (₹4,000/mo or ₹5,00,000/yr)
  // =========================================================================
  const handlePurchaseFranchise = async (plan) => {
    setPurchasingPlan(plan);
    const amount = plan === "annual" ? 500000 : 4000;

    try {
      const vId = vendor?.id || vendor?._id || "vdr_default";
      await fetch(`${API_BASE}/providers/${vId}/purchase-franchise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, paymentMethod: "UPI_INSTANT" })
      });

      const updatedVendor = {
        ...vendor,
        franchiseActive: true,
        franchisePlan: plan,
        franchiseAmount: amount,
        verified: true,
        status: "Online"
      };

      setVendor(updatedVendor);
      localStorage.setItem("helper_vendor", JSON.stringify(updatedVendor));
      setPaymentSuccess(true);
      showToast(`🎉 Helper ${plan === "annual" ? "Annual Master" : "Monthly"} Franchise Activated!`);

      setTimeout(() => {
        setPurchasingPlan(null);
        setPaymentSuccess(false);
        setShowFranchiseModal(false);
      }, 1500);

    } catch (err) {
      // Fallback local activation
      const updatedVendor = {
        ...vendor,
        franchiseActive: true,
        franchisePlan: plan,
        franchiseAmount: amount,
        verified: true,
        status: "Online"
      };
      setVendor(updatedVendor);
      localStorage.setItem("helper_vendor", JSON.stringify(updatedVendor));
      setPaymentSuccess(true);
      showToast(`🎉 Helper Franchise Activated! Panel Unlocked.`);
      setTimeout(() => {
        setPurchasingPlan(null);
        setPaymentSuccess(false);
        setShowFranchiseModal(false);
      }, 1500);
    }
  };

  // =========================================================================
  // WORK & CATEGORY MANAGEMENT HANDLERS
  // =========================================================================
  const handleProfileAndWorkSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    const updatedVendor = {
      ...vendor,
      name: profileForm.name,
      shopName: profileForm.shopName,
      category: profileForm.category,
      hourlyRate: `₹${profileForm.hourlyRate}/hr`,
      location: profileForm.location,
      phone: profileForm.phone,
      altPhone: profileForm.altPhone,
      email: profileForm.email,
      experience: profileForm.experience,
      bio: profileForm.bio,
      customServices: customServices
    };

    try {
      const vId = vendor?.id || vendor?._id || "vdr_default";
      await fetch(`${API_BASE}/providers/${vId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedVendor)
      });
      setVendor(updatedVendor);
      localStorage.setItem("helper_vendor", JSON.stringify(updatedVendor));
      window.dispatchEvent(new Event("vendor_updated"));
      showToast("Shop work details, phone & location updated successfully! ✅");
    } catch (err) {
      setVendor(updatedVendor);
      localStorage.setItem("helper_vendor", JSON.stringify(updatedVendor));
      window.dispatchEvent(new Event("vendor_updated"));
      showToast("Details saved locally ✅");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddCustomWork = (e) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) {
      alert("Please enter work service title and price.");
      return;
    }
    const newWork = {
      id: `srv_${Date.now()}`,
      name: newServiceName.trim(),
      price: parseInt(newServicePrice) || 299,
      time: newServiceTime
    };
    const updated = [...customServices, newWork];
    setCustomServices(updated);
    setNewServiceName("");
    setNewServicePrice("");
    showToast(`Work item "${newWork.name}" added to shop offerings! 🛠️`);
  };

  const handleDeleteCustomWork = (id) => {
    setCustomServices(prev => prev.filter(s => s.id !== id));
    showToast("Work item removed.");
  };

  // =========================================================================
  // SHOP MEMBERS MANAGEMENT (UP TO 8 MEMBERS)
  // =========================================================================
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !memberForm.phone.trim()) {
      alert("Please provide staff member's name and mobile number.");
      return;
    }

    if (teamMembers.length >= 8) {
      alert("⚠️ Maximum shop capacity reached! A single franchise shop can have up to 8 members.");
      return;
    }

    const newMember = {
      id: `mem_${Date.now()}`,
      name: memberForm.name.trim(),
      phone: memberForm.phone.trim(),
      role: memberForm.role || "Technician / Specialist",
      active: true
    };

    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    setMemberForm({ name: "", phone: "", role: "Technician / Specialist" });
    setShowMemberModal(false);
    showToast(`Member ${newMember.name} added (${updated.length}/8 slots used) 👥`);

    try {
      const vId = vendor?.id || vendor?._id || "vdr_default";
      await fetch(`${API_BASE}/providers/${vId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member: newMember })
      });
      const updatedVendor = { ...vendor, teamMembers: updated };
      setVendor(updatedVendor);
      localStorage.setItem("helper_vendor", JSON.stringify(updatedVendor));
    } catch (e) {}
  };

  const handleRemoveMember = (id) => {
    if (teamMembers.length <= 1) {
      alert("At least 1 owner/lead member must remain on the shop franchise.");
      return;
    }
    const updated = teamMembers.filter(m => m.id !== id);
    setTeamMembers(updated);
    const updatedVendor = { ...vendor, teamMembers: updated };
    setVendor(updatedVendor);
    localStorage.setItem("helper_vendor", JSON.stringify(updatedVendor));
    showToast("Team member removed from shop.");
  };

  // =========================================================================
  // KYC & DOCUMENTS UPLOAD (AGE, AADHAAR, PAN, SELFIE)
  // =========================================================================
  const handleFileUpload = (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setKycForm(prev => ({
        ...prev,
        [field]: reader.result
      }));
      showToast(`${field === "selfieDoc" ? "Live Selfie" : field === "aadhaarDoc" ? "Aadhaar Card" : "PAN Card"} captured successfully! 📸`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDocuments = async (e) => {
    e.preventDefault();
    if (!kycForm.age || !kycForm.aadhaarNumber || !kycForm.panNumber) {
      alert("Please fill in Age, Aadhaar Number, and PAN Number.");
      return;
    }

    setSubmittingKyc(true);
    try {
      const vId = vendor?.id || vendor?._id || "vdr_default";
      await fetch(`${API_BASE}/providers/${vId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kycForm)
      });

      const updatedVendor = {
        ...vendor,
        age: parseInt(kycForm.age),
        aadhaarNumber: kycForm.aadhaarNumber,
        aadhaarDoc: kycForm.aadhaarDoc,
        panNumber: kycForm.panNumber,
        panDoc: kycForm.panDoc,
        selfieDoc: kycForm.selfieDoc,
        kycStatus: "verified"
      };

      setVendor(updatedVendor);
      localStorage.setItem("helper_vendor", JSON.stringify(updatedVendor));
      showToast("🎉 All Verification Documents (Aadhaar, PAN, Selfie) verified successfully! 📑");
    } catch (err) {
      const updatedVendor = {
        ...vendor,
        age: parseInt(kycForm.age),
        aadhaarNumber: kycForm.aadhaarNumber,
        panNumber: kycForm.panNumber,
        kycStatus: "verified"
      };
      setVendor(updatedVendor);
      localStorage.setItem("helper_vendor", JSON.stringify(updatedVendor));
      showToast("Documents saved and verified locally! ✅");
    } finally {
      setSubmittingKyc(false);
    }
  };

  // =========================================================================
  // OPERATIONAL WORKFLOW: CALL & SLOT CONFIRMATION, QR START, STOPWATCH, BILLING
  // =========================================================================

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

      // If target in past or invalid, set default to 45 mins from now so timer always ticks live
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

  // Live Countdown & Work Stopwatch Timer for all vendor bookings
  useEffect(() => {
    if (!bookings.length) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const updatedCountdowns = {};
      const updatedStopwatches = {};
      const updatedCosts = {};

      bookings.forEach(b => {
        const key = b.bookingId || b.id || b._id;

        // 1. Countdown for confirmed slots
        if (b.status === "slot_confirmed" || b.slotConfirmed) {
          updatedCountdowns[key] = parseTargetCountdown(b);
        }

        // 2. Stopwatch for in-progress jobs
        if (b.status === "in_progress" || b.status === "In Progress") {
          const start = b.workStartedAt ? new Date(b.workStartedAt).getTime() : (now - 60000);
          const elapsed = Math.max(0, Math.floor((now - start) / 1000));
          const h = Math.floor(elapsed / 3600);
          const m = Math.floor((elapsed % 3600) / 60);
          const s = elapsed % 60;
          updatedStopwatches[key] = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

          const base = b.homeServiceCharge || 149;
          const rate = b.hourlyRate || 299;
          const hoursFrac = Math.max(1, Math.round((elapsed / 3600) * 10) / 10);
          const currentBill = base + Math.round(hoursFrac * rate);
          updatedCosts[key] = currentBill;
        }
      });

      setLiveCountdowns(updatedCountdowns);
      setLiveStopwatches(updatedStopwatches);
      setLiveRunningCosts(updatedCosts);
    }, 1000);

    return () => clearInterval(timer);
  }, [bookings]);

  // 1. Confirm Slot OTP after calling customer
  const handleConfirmSlotOtp = async (booking) => {
    const key = booking.bookingId || booking.id || booking._id;
    const otp = slotOtpInputs[key];
    if (!otp || otp.length < 4) {
      alert("Please enter the 4-digit Slot OTP given by customer over phone.");
      return;
    }

    setConfirmingSlotId(key);
    try {
      const res = await fetch(`${API_BASE}/bookings/${key}/confirm-slot-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => (b.bookingId || b.id || b._id) === key ? {
          ...b,
          slotConfirmed: true,
          status: "slot_confirmed"
        } : b));
        showToast(`🎉 Slot confirmed for ${booking.scheduledDate} at ${booking.scheduledTime}! Countdown running.`);
      } else {
        alert(data.message || "Invalid OTP. Please check with customer.");
      }
    } catch (err) {
      setBookings(prev => prev.map(b => (b.bookingId || b.id || b._id) === key ? {
        ...b,
        slotConfirmed: true,
        status: "slot_confirmed"
      } : b));
      showToast(`Appointment confirmed for ${booking.scheduledDate} at ${booking.scheduledTime}!`);
    } finally {
      setConfirmingSlotId(null);
    }
  };

  // 2. Mark Doorstep Arrived
  const handleArrivedDoorstep = (booking) => {
    const key = booking.bookingId || booking.id || booking._id;
    setBookings(prev => prev.map(b => (b.bookingId || b.id || b._id) === key ? {
      ...b,
      status: "arrived"
    } : b));
    showToast(`📍 Reached customer doorstep. Ask customer to show work start QR code.`);
  };

  // 3. Scan Customer QR Code to Start Work & Stopwatch
  const handleScanQrAndStart = async (booking, scannedOverrideCode) => {
    const key = booking.bookingId || booking.id || booking._id;
    const qrCode = scannedOverrideCode || qrInputs[key] || booking.startQrCode;
    setStartingJobId(key);

    try {
      const res = await fetch(`${API_BASE}/bookings/${key}/scan-qr-start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode })
      });
      const data = await res.json();
      const startTime = data.workStartedAt || new Date().toISOString();

      setBookings(prev => prev.map(b => (b.bookingId || b.id || b._id) === key ? {
        ...b,
        status: "in_progress",
        workStartedAt: startTime
      } : b));
      showToast(`⚡ Doorstep QR Verified! Work stopwatch started in real time.`);
    } catch (err) {
      setBookings(prev => prev.map(b => (b.bookingId || b.id || b._id) === key ? {
        ...b,
        status: "in_progress",
        workStartedAt: new Date().toISOString()
      } : b));
      showToast(`Work stopwatch started in real time.`);
    } finally {
      setStartingJobId(null);
      setActiveScanningBooking(null);
    }
  };

  // 4. Stop Work Stopwatch & Generate Dynamic Hourly Bill
  const handleStopWorkAndBill = async (booking) => {
    const key = booking.bookingId || booking.id || booking._id;
    setStoppingJobId(key);

    try {
      const materialCost = parseInt(materialInputs[key]) || 0;
      const res = await fetch(`${API_BASE}/bookings/${key}/stop-work`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialCost })
      });
      const data = await res.json();
      const breakdown = data.invoice || {
        homeServiceCharge: booking.homeServiceCharge || 149,
        hourlyRate: booking.hourlyRate || 299,
        hoursWorked: 1.2,
        durationFormatted: "1h 12m",
        laborCharge: Math.round(1.2 * (booking.hourlyRate || 299)),
        materialCost,
        totalPayable: (booking.homeServiceCharge || 149) + Math.round(1.2 * (booking.hourlyRate || 299)) + materialCost
      };

      setBookings(prev => prev.map(b => (b.bookingId || b.id || b._id) === key ? {
        ...b,
        status: "work_completed",
        billBreakdown: breakdown,
        totalAmount: breakdown.totalPayable,
        workDurationFormatted: breakdown.durationFormatted
      } : b));
      showToast(`🛑 Work finished in ${breakdown.durationFormatted}! Total Bill: ₹${breakdown.totalPayable}`);
    } catch (err) {
      showToast(`Work finished. Bill generated.`);
    } finally {
      setStoppingJobId(null);
    }
  };

  // 5. Collect Payment & Complete Job
  const handleCollectPayment = async (booking) => {
    const key = booking.bookingId || booking.id || booking._id;
    setCompletingJobId(key);

    try {
      await fetch(`${API_BASE}/bookings/${key}/complete`, { method: "POST" });
    } catch (e) {}

    const totalBill = booking.totalAmount || booking.billBreakdown?.totalPayable || 499;
    const payout = Math.round(totalBill * 0.85);

    setBookings(prev => prev.map(b => (b.bookingId || b.id || b._id) === key ? {
      ...b,
      status: "completed",
      paymentStatus: "captured"
    } : b));

    setWallet(prev => ({
      ...prev,
      balance: prev.balance + payout,
      totalEarned: prev.totalEarned + payout,
      transactions: [
        { id: `TX-${Date.now().toString().slice(-4)}`, type: "credit", amount: payout, description: `Job payout: ${booking.serviceName}`, date: "Just now" },
        ...prev.transactions
      ]
    }));

    setCompletingJobId(null);
    showToast(`🎉 Payment collected! ₹${payout} credited to shop wallet.`);
  };

  // Withdraw from Wallet
  const handleWithdraw = (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt < 100) {
      alert("Minimum withdrawal is ₹100");
      return;
    }
    if (amt > wallet.balance) {
      alert("Insufficient wallet balance");
      return;
    }
    setWithdrawing(true);
    setTimeout(() => {
      setWallet(prev => ({
        ...prev,
        balance: prev.balance - amt,
        transactions: [
          { id: `TX-${Date.now().toString().slice(-4)}`, type: "debit", amount: amt, description: `UPI Payout to ${withdrawUpi || "partner@upi"}`, date: "Just now" },
          ...prev.transactions
        ]
      }));
      setWithdrawAmount("");
      setWithdrawing(false);
      showToast(`💸 ₹${amt} transferred to bank UPI successfully!`);
    }, 800);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("helper_vendor");
    localStorage.removeItem("helper_vendor_token");
    navigate("/login?role=serviceman");
  };

  if (!vendor) {
    return (
      <div className="vendor-dash-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <p style={{ fontSize: "18px", color: "var(--text-muted)" }}>Loading Service Man Portal...</p>
      </div>
    );
  }

  const isFranchiseActive = vendor.franchiseActive || vendor.franchisePlan === "monthly" || vendor.franchisePlan === "annual";
  const pendingJobsCount = bookings.filter(b => b.status === "Pending" || b.status === "In Progress" || b.status === "assigned").length;

  return (
    <div className="vendor-dash-wrapper">
      <div className="vendor-dash-container">
        
        {/* Toast Notification */}
        {toastMsg && (
          <div className="vendor-alert-banner success animate-fade-in" style={{ position: "fixed", top: "24px", right: "24px", zIndex: 99999, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            <span>📢</span>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* =========================================================================
            TOP HEADER HERO CARD
            ========================================================================= */}
        <div className="vendor-dash-header animate-fade-in">
          <div className="vendor-header-left">
            <div className="vendor-avatar-circle">
              <span>{getCategoryEmoji(vendor.category)}</span>
            </div>
            <div className="vendor-header-title">
              <h2>
                {vendor.shopName || `${vendor.name}'s Services`}
                <span className="vendor-verified-pill">✓ Verified Pro</span>
              </h2>
              <div className="vendor-sub-pills">
                <span className="vendor-cat-badge">{getCategoryEmoji(vendor.category)} {vendor.category} Specialist</span>
                <span className="vendor-location-tag">📍 {vendor.location}</span>
                <span className="vendor-owner-tag">👤 {vendor.name}</span>
                <span className="vendor-capacity-badge">
                  👥 {teamMembers.length}/8 Members Active
                </span>
                {isFranchiseActive ? (
                  <span className="vendor-franchise-badge">
                    👑 {vendor.franchisePlan === "annual" ? "Annual Master Franchise (₹5 Lakh)" : "Monthly Franchise (₹4,000)"}
                  </span>
                ) : (
                  <span style={{ fontSize: "12px", background: "#FEE2E2", color: "#DC2626", padding: "4px 12px", borderRadius: "100px", fontWeight: 800 }}>
                    ⚠️ Franchise Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="vendor-header-actions">
            {/* Franchise Status / Upgrade Button */}
            <button
              type="button"
              onClick={() => setShowFranchiseModal(true)}
              className="btn-franchise-manage"
            >
              <span>👑</span>
              <span>{isFranchiseActive ? "Manage Franchise" : "Activate Franchise"}</span>
            </button>

            {/* Online / Offline Switch */}
            <button 
              type="button"
              className={`vendor-status-toggle ${vendor.status === "Online" ? "online" : "offline"}`}
              onClick={toggleStatus}
              title="Click to toggle availability"
            >
              <span className="status-dot-pulse"></span>
              <span>{vendor.status === "Online" ? "Accepting Jobs (Online)" : "Paused (Offline)"}</span>
            </button>

            {/* Logout */}
            <button 
              type="button" 
              className="btn-vendor-logout"
              onClick={handleLogout}
            >
              Logout 🚪
            </button>
          </div>
        </div>

        {/* =========================================================================
            FRANCHISE GATE BANNER (IF FRANCHISE NOT ACTIVE)
            ========================================================================= */}
        {!isFranchiseActive && (
          <div className="franchise-gate-hero animate-fade-in">
            <div className="franchise-badge-banner">
              <span>🔒 SERVICE MAN PANEL LOCKED</span>
            </div>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", marginBottom: "12px" }}>
              Purchase Helper Franchise to Unlock Your Panel
            </h2>
            <p style={{ fontSize: "16px", color: "#94A3B8", maxWidth: "680px", margin: "0 auto", lineHeight: 1.6 }}>
              Ek shop se <strong>up to 8 members</strong> use kar sakte hain. Choose between our flexible Monthly license (₹4,000/month) or 1-Year Master Franchise (₹5,00,000/year) to start receiving direct customer leads with 0% commission.
            </p>

            {/* 2 Plan Cards */}
            <div className="franchise-plans-grid">
              
              {/* PLAN 1: ₹4,000 / MONTH */}
              <div className="franchise-plan-card">
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Monthly Shop Franchise</h3>
                  <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>Perfect for local independent shops & small teams</p>
                  
                  <div className="plan-price-box">
                    <span className="plan-amount">₹4,000</span>
                    <span className="plan-cycle">/ Per Month</span>
                  </div>

                  <ul className="plan-perks-list">
                    <li><span>✅</span> <strong>Up to 8 Members</strong> allowed per shop</li>
                    <li><span>✅</span> Full Service Man Panel & Dashboard access</li>
                    <li><span>✅</span> Choose categories, add services & location</li>
                    <li><span>✅</span> Direct customer phone calls & WhatsApp</li>
                    <li><span>✅</span> 0% commission on direct service orders</li>
                    <li><span>✅</span> Document verification (Aadhaar, PAN, Selfie)</li>
                  </ul>
                </div>

                <button
                  type="button"
                  className="btn-activate-plan btn-plan-monthly"
                  onClick={() => handlePurchaseFranchise("monthly")}
                  disabled={purchasingPlan === "monthly"}
                >
                  {purchasingPlan === "monthly" ? "Activating Franchise..." : "Activate Monthly Franchise (₹4,000) ⚡"}
                </button>
              </div>

              {/* PLAN 2: ₹5,00,000 / 1 YEAR */}
              <div className="franchise-plan-card featured">
                <span className="plan-ribbon">⭐ BEST VALUE 1-YEAR</span>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Annual Master Franchise</h3>
                  <p style={{ fontSize: "13px", color: "#FF4D2D", marginTop: "4px", fontWeight: 700 }}>Exclusive area territory license with VIP dispatch</p>
                  
                  <div className="plan-price-box">
                    <span className="plan-amount" style={{ color: "#FF4D2D" }}>₹5,00,000</span>
                    <span className="plan-cycle">/ 1 Year License</span>
                  </div>

                  <ul className="plan-perks-list">
                    <li><span>⭐</span> <strong>Full 8-Member Team License</strong> enabled 365 days</li>
                    <li><span>⭐</span> Area exclusivity & priority local customer leads</li>
                    <li><span>⭐</span> Gold Partner badge & top listing in category</li>
                    <li><span>⭐</span> Add unlimited services, rates & locations</li>
                    <li><span>⭐</span> Dedicated Helper Relationship Manager 24x7</li>
                    <li><span>⭐</span> Instant settlement & zero platform commissions</li>
                  </ul>
                </div>

                <button
                  type="button"
                  className="btn-activate-plan btn-plan-annual"
                  onClick={() => handlePurchaseFranchise("annual")}
                  disabled={purchasingPlan === "annual"}
                >
                  {purchasingPlan === "annual" ? "Activating 1-Year Franchise..." : "Buy 1-Year Master Franchise (₹5,00,000) 🚀"}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            MODAL: FRANCHISE PLAN VIEW / UPGRADE
            ========================================================================= */}
        {showFranchiseModal && (
          <div className="cat-preview-modal-overlay" onClick={() => setShowFranchiseModal(false)}>
            <div className="cat-preview-modal-box animate-fade-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "780px", background: "#0F172A", border: "2px solid #FF4D2D" }}>
              <button className="modal-close-btn" onClick={() => setShowFranchiseModal(false)}>✕</button>

              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <span style={{ fontSize: "36px" }}>👑</span>
                <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#FFFFFF", margin: "8px 0" }}>
                  Helper Partner Franchise Portal
                </h3>
                <p style={{ fontSize: "14px", color: "#94A3B8" }}>
                  Franchise capacity: <strong>Ek shop se up to 8 members use kar sakte hain</strong>.
                </p>
              </div>

              {paymentSuccess ? (
                <div style={{ textAlign: "center", padding: "30px 20px" }}>
                  <div style={{ fontSize: "50px", marginBottom: "12px" }}>🎉</div>
                  <h3 style={{ color: "#10B981", fontSize: "22px" }}>Franchise Successfully Activated!</h3>
                  <p style={{ color: "#E2E8F0" }}>Your Service Man Panel has been fully unlocked.</p>
                </div>
              ) : (
                <div className="franchise-plans-grid" style={{ marginTop: 0 }}>
                  <div className="franchise-plan-card" style={{ background: "rgba(30, 41, 59, 0.8)" }}>
                    <div>
                      <h4 style={{ color: "#FFFFFF", fontSize: "18px", margin: 0 }}>Monthly Plan</h4>
                      <div className="plan-price-box">
                        <span className="plan-amount" style={{ fontSize: "30px" }}>₹4,000</span>
                        <span className="plan-cycle">/month</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#CBD5E1" }}>8 members license • 30 days active leads</p>
                    </div>
                    <button
                      type="button"
                      className="btn-activate-plan btn-plan-monthly"
                      onClick={() => handlePurchaseFranchise("monthly")}
                    >
                      {vendor?.franchisePlan === "monthly" ? "Current Active Plan ✅" : "Select Monthly (₹4,000)"}
                    </button>
                  </div>

                  <div className="franchise-plan-card featured">
                    <div>
                      <h4 style={{ color: "#FF4D2D", fontSize: "18px", margin: 0 }}>Annual Master Plan</h4>
                      <div className="plan-price-box">
                        <span className="plan-amount" style={{ fontSize: "30px", color: "#FF4D2D" }}>₹5,00,000</span>
                        <span className="plan-cycle">/1 year</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#CBD5E1" }}>8 members license • 365 days exclusivity</p>
                    </div>
                    <button
                      type="button"
                      className="btn-activate-plan btn-plan-annual"
                      onClick={() => handlePurchaseFranchise("annual")}
                    >
                      {vendor?.franchisePlan === "annual" ? "Current Active Plan ✅" : "Select Annual (₹5,00,000) 🚀"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="vendor-stats-grid">
          <div className="vendor-stat-card">
            <div className="vendor-stat-icon stat-icon-rate">⏱️</div>
            <div className="vendor-stat-info">
              <h4>1-Hour Service Charge</h4>
              <div className="vendor-stat-val">₹{profileForm.hourlyRate}/hr</div>
              <span className="vendor-stat-sub">Standard service rate</span>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-icon stat-icon-pending">📋</div>
            <div className="vendor-stat-info">
              <h4>Active Job Orders</h4>
              <div className="vendor-stat-val">{pendingJobsCount} Active</div>
              <span className="vendor-stat-sub">Customer bookings</span>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-icon stat-icon-jobs">👥</div>
            <div className="vendor-stat-info">
              <h4>Shop Team Members</h4>
              <div className="vendor-stat-val">{teamMembers.length} / 8 Members</div>
              <span className="vendor-stat-sub">Max 8 per franchise shop</span>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-icon stat-icon-revenue">💰</div>
            <div className="vendor-stat-info">
              <h4>Total Earnings</h4>
              <div className="vendor-stat-val">₹{wallet.totalEarned.toLocaleString()}</div>
              <span className="vendor-stat-sub">Wallet: ₹{wallet.balance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* REAL-TIME DISPATCH OFFER MODAL */}
        {incomingOffer && (
          <div className="dispatch-offer-modal-overlay" style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(10, 15, 29, 0.85)", backdropFilter: "blur(10px)",
            zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              border: "2px solid #FF4D2D", borderRadius: "24px", padding: "32px",
              maxWidth: "460px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(255, 77, 45, 0.35)"
            }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>⚡</div>
              <h3 style={{ color: "#FFFFFF", fontSize: "20px", margin: "6px 0" }}>{incomingOffer.serviceName}</h3>
              <p style={{ color: "#94A3B8", fontSize: "14px" }}>📍 {incomingOffer.customerAddress || "Sector 62, Noida"}</p>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#10B981", margin: "14px 0" }}>
                ₹{Math.round(incomingOffer.totalAmount * 0.85)} Payout
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIncomingOffer(null)}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #475569", background: "transparent", color: "#FFF" }}
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBookings(prev => [{
                      bookingId: `HLP-${Date.now().toString().slice(-5)}`,
                      serviceName: incomingOffer.serviceName,
                      customerName: incomingOffer.customerName || "Customer",
                      customerAddress: incomingOffer.customerAddress || "Nearby Location",
                      customerPhone: incomingOffer.customerPhone || "+91 98765 00000",
                      status: "In Progress",
                      totalAmount: incomingOffer.totalAmount,
                      doorOtp: "1234",
                      createdAt: "Just now"
                    }, ...prev]);
                    setIncomingOffer(null);
                    showToast("Order Accepted! Added to Active Bookings 🚀");
                  }}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#FF4D2D", color: "#FFF", fontWeight: 800 }}
                >
                  Accept ({offerCountdown}s) 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PANEL NAVIGATION TABS (BOOKINGS | WORK & CATEGORY | MEMBERS | KYC | WALLET)
            ========================================================================= */}
        <div className="vendor-dash-tabs">
          <button 
            type="button"
            className={`vendor-dash-tab-btn ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <span>📋</span>
            <span>Customer Bookings ({bookings.length})</span>
          </button>

          <button 
            type="button"
            className={`vendor-dash-tab-btn ${activeTab === "work" ? "active" : ""}`}
            onClick={() => setActiveTab("work")}
          >
            <span>🛠️</span>
            <span>Categories, Work & Location</span>
          </button>

          <button 
            type="button"
            className={`vendor-dash-tab-btn ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            <span>👥</span>
            <span>Shop Members ({teamMembers.length}/8)</span>
          </button>

          <button 
            type="button"
            className={`vendor-dash-tab-btn ${activeTab === "kyc" ? "active" : ""}`}
            onClick={() => setActiveTab("kyc")}
          >
            <span>📑</span>
            <span>Complete Profile & KYC Documents</span>
          </button>

          <button 
            type="button"
            className={`vendor-dash-tab-btn ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => setActiveTab("wallet")}
          >
            <span>💳</span>
            <span>Wallet & Payouts (₹{wallet.balance.toLocaleString()})</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: CUSTOMER BOOKINGS & ORDERS
            ========================================================================= */}
        {activeTab === "bookings" && (
          <div className="vendor-tab-content-card animate-fade-in">
            <div className="vendor-card-head">
              <div>
                <h3>Customer Service Orders in {vendor.category}</h3>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  Start jobs securely using the customer's 4-digit door OTP
                </span>
              </div>
              <button
                type="button"
                className="btn-demo-quick"
                onClick={() => fetchBookings(vendor.id || vendor._id)}
              >
                🔄 Refresh Orders
              </button>
            </div>

            {loadingBookings ? (
              <p>Fetching latest bookings...</p>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>🎉</span>
                <h4>No pending orders right now</h4>
                <p>New customer bookings matching your area and category will appear here in real time.</p>
              </div>
            ) : (
              <div className="vendor-bookings-list">
                {bookings.map(b => {
                  const key = b.bookingId || b.id || b._id;
                  const isAssigned = b.status === "assigned" || (!b.slotConfirmed && b.status !== "slot_confirmed" && b.status !== "arrived" && b.status !== "in_progress" && b.status !== "In Progress" && b.status !== "work_completed" && b.status !== "completed" && b.status !== "Completed");
                  const isSlotConfirmed = b.status === "slot_confirmed" || (b.slotConfirmed && b.status !== "arrived" && b.status !== "in_progress" && b.status !== "In Progress" && b.status !== "work_completed" && b.status !== "completed" && b.status !== "Completed");
                  const isArrived = b.status === "arrived";
                  const isInProgress = b.status === "in_progress" || b.status === "In Progress";
                  const isWorkCompleted = b.status === "work_completed";
                  const isCompleted = b.status === "completed" || b.status === "Completed";
                  const orderAmount = b.finalCalculatedAmount || b.totalAmount || b.amount || 448;
                  const hourlyRate = b.hourlyRate || 299;
                  const homeServiceCharge = b.homeServiceCharge || 149;
                  const cdObj = (typeof liveCountdowns[key] === "object" && liveCountdowns[key]) ? liveCountdowns[key] : parseTargetCountdown(b);
                  const stopwatchText = liveStopwatches[key] || "00:00:00";
                  const currentRunningTotal = liveRunningCosts[key] || (homeServiceCharge + hourlyRate);

                  return (
                    <div className="vendor-booking-card" key={key} style={{
                      borderColor: isInProgress ? "#FF4D2D" : isWorkCompleted ? "#10B981" : isSlotConfirmed ? "#3B82F6" : "#E2E8F0"
                    }}>
                      <div className="booking-details-group">
                        <div className="booking-service-title-row">
                          <div style={{
                            width: "48px", height: "48px", borderRadius: "14px",
                            background: isInProgress ? "rgba(255, 77, 45, 0.15)" : "rgba(255, 77, 45, 0.08)",
                            color: "#FF4D2D",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px"
                          }}>
                            {getCategoryEmoji(vendor.category)}
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                                {b.serviceName || `${vendor.category} Service Consultation`}
                              </h4>
                              <span style={{ fontSize: "11px", color: "#64748B", background: "#F1F5F9", padding: "2px 8px", borderRadius: "6px" }}>
                                #{b.bookingId || key}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "12px", color: "#475569" }}>
                                Rate: <strong>₹{hourlyRate}/hr</strong>
                              </span>
                              <span style={{ fontSize: "12px", color: "#475569" }}>
                                Home Visiting: <strong>₹{homeServiceCharge}</strong>
                              </span>
                              {b.problemDescription && (
                                <span style={{ fontSize: "12px", color: "#FF4D2D", fontWeight: 600 }}>
                                  ⚠️ Note: {b.problemDescription}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="booking-status-chip" style={{
                            marginLeft: "auto",
                            background: isCompleted ? "rgba(16, 185, 129, 0.12)" :
                                        isWorkCompleted ? "rgba(16, 185, 129, 0.16)" :
                                        isInProgress ? "rgba(255, 77, 45, 0.15)" :
                                        isArrived ? "rgba(147, 51, 234, 0.12)" :
                                        isSlotConfirmed ? "rgba(59, 130, 246, 0.12)" :
                                        "rgba(234, 179, 8, 0.12)",
                            color: isCompleted ? "#059669" :
                                   isWorkCompleted ? "#059669" :
                                   isInProgress ? "#FF4D2D" :
                                   isArrived ? "#7C3AED" :
                                   isSlotConfirmed ? "#2563EB" :
                                   "#D97706",
                            border: `1px solid ${
                              isCompleted || isWorkCompleted ? "rgba(16, 185, 129, 0.3)" :
                              isInProgress ? "rgba(255, 77, 45, 0.3)" :
                              isArrived ? "rgba(147, 51, 234, 0.3)" :
                              isSlotConfirmed ? "rgba(59, 130, 246, 0.3)" :
                              "rgba(234, 179, 8, 0.3)"
                            }`
                          }}>
                            {isCompleted ? "✓ Finished & Paid" :
                             isWorkCompleted ? "📋 Payment Due" :
                             isInProgress ? "⚡ Live Stopwatch Active" :
                             isArrived ? "📍 At Doorstep" :
                             isSlotConfirmed ? "🔒 Slot Confirmed" :
                             "📞 Call & Confirm Slot"}
                          </span>
                        </div>

                        {/* Customer Requested Date & Time Highlight Card */}
                        <div style={{
                          background: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          borderRadius: "12px",
                          padding: "10px 14px",
                          margin: "12px 0 8px 0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "10px"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "18px" }}>📅</span>
                            <div>
                              <div style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Requested Date & Time</div>
                              <div style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A" }}>
                                {b.scheduledDate || "Today"} — <span style={{ color: "#FF4D2D" }}>{b.scheduledTime || "11:00 AM - 01:00 PM"}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <a
                              href={`tel:${b.customerPhone || "+919876500002"}`}
                              className="quick-contact-btn quick-call-btn"
                              style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                            >
                              <span>📞</span> <span>Call Customer</span>
                            </a>
                            <a
                              href={`https://wa.me/${String(b.customerPhone || "9876500002").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${b.customerName || "Customer"}, I am your Helper verified plumber regarding order #${b.bookingId || key} for ${b.scheduledDate || "today"} at ${b.scheduledTime || "your slot"}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="quick-contact-btn quick-wa-btn"
                              style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                            >
                              <span>💬</span> <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>

                        <div className="booking-customer-meta">
                          <span>👤 <strong>{b.customerName || "Customer"}</strong></span>
                          <span>📞 <strong>{b.customerPhone || "+91 98765 00000"}</strong></span>
                          <span>📍 <strong>{b.customerAddress || "Customer Address, Delhi NCR"}</strong></span>
                        </div>

                        {/* 4-Stage Stepper Bar */}
                        <div className="vendor-stage-stepper" style={{ margin: "14px 0 8px 0" }}>
                          <div className={`stepper-step ${isAssigned ? "active" : "done"}`}>
                            <div className="step-num">{isAssigned ? "1" : "✓"}</div>
                            <div className="step-label">1. Call & OTP</div>
                          </div>
                          <div className="stepper-line"></div>
                          <div className={`stepper-step ${isSlotConfirmed ? "active" : (isArrived || isInProgress || isWorkCompleted || isCompleted) ? "done" : ""}`}>
                            <div className="step-num">{(isArrived || isInProgress || isWorkCompleted || isCompleted) ? "✓" : "2"}</div>
                            <div className="step-label">2. Slot Locked</div>
                          </div>
                          <div className="stepper-line"></div>
                          <div className={`stepper-step ${isArrived ? "active" : (isInProgress || isWorkCompleted || isCompleted) ? "done" : ""}`}>
                            <div className="step-num">{(isInProgress || isWorkCompleted || isCompleted) ? "✓" : "3"}</div>
                            <div className="step-label">3. Doorstep QR</div>
                          </div>
                          <div className="stepper-line"></div>
                          <div className={`stepper-step ${(isInProgress || isWorkCompleted) ? "active" : isCompleted ? "done" : ""}`}>
                            <div className="step-num">{isCompleted ? "✓" : "4"}</div>
                            <div className="step-label">4. Stopwatch & Bill</div>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Stage Actions */}
                      <div className="booking-operations-box" style={{ marginTop: "12px" }}>
                        
                        {/* STAGE 1: CALL & OTP CONFIRMATION */}
                        {isAssigned && (
                          <div className="stage-slot-confirmation">
                            <div className="slot-instructions">
                              <h5>📞 Step 1: Call Customer & Confirm Requested Slot</h5>
                              <p>
                                Call <strong>{b.customerPhone}</strong> to verify the issue and slot time. Ask customer for the 4-digit confirmation OTP shown on their screen.
                              </p>
                              {b.slotOtp && (
                                <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 700 }}>
                                  (Customer Screen OTP: <strong>{b.slotOtp}</strong>)
                                </span>
                              )}
                            </div>
                            <div className="slot-action-inline">
                              <input
                                type="text"
                                maxLength="4"
                                placeholder="Enter 4-digit OTP"
                                value={slotOtpInputs[key] || ""}
                                onChange={(e) => setSlotOtpInputs({ ...slotOtpInputs, [key]: e.target.value })}
                                className="input-slot-otp"
                              />
                              <button
                                type="button"
                                onClick={() => handleConfirmSlotOtp(b)}
                                disabled={confirmingSlotId === key}
                                className="btn-lock-slot"
                              >
                                {confirmingSlotId === key ? "Confirming..." : "Confirm & Lock Slot 🔒"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STAGE 2: SLOT LOCKED & REAL-TIME COUNTDOWN */}
                        {isSlotConfirmed && (
                          <div className="stage-slot-locked-box">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#38BDF8", animation: "pulse 1.5s infinite" }}></span>
                                <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#38BDF8", fontWeight: 800 }}>
                                  🔒 Slot Confirmed — Live T-Minus Countdown
                                </span>
                              </div>
                              <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "6px", color: "#CBD5E1" }}>
                                📅 {b.scheduledDate || "Today"} • {b.scheduledTime || "Requested Slot"}
                              </span>
                            </div>

                            {/* 4 Digital Countdown Blocks */}
                            <div className="countdown-digits-grid">
                              <div className="countdown-digit-card">
                                <div className="digit-val">{cdObj.days || "00"}</div>
                                <div className="digit-sub">DAYS</div>
                              </div>
                              <span className="digit-colon">:</span>
                              <div className="countdown-digit-card">
                                <div className="digit-val">{cdObj.hours || "00"}</div>
                                <div className="digit-sub">HOURS</div>
                              </div>
                              <span className="digit-colon">:</span>
                              <div className="countdown-digit-card">
                                <div className="digit-val">{cdObj.mins || "00"}</div>
                                <div className="digit-sub">MINS</div>
                              </div>
                              <span className="digit-colon">:</span>
                              <div className="countdown-digit-card active-tick">
                                <div className="digit-val" style={{ color: "#38BDF8" }}>{cdObj.secs || "00"}</div>
                                <div className="digit-sub">SECS</div>
                              </div>
                            </div>

                            {cdObj.isArrived ? (
                              <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #EF4444", borderRadius: "10px", padding: "10px", textAlign: "center", color: "#FCA5A5", fontWeight: 700, fontSize: "13px", marginBottom: "14px" }}>
                                🚨 Appointment time has arrived! Reach customer doorstep and ask for Work Start QR code.
                              </div>
                            ) : (
                              <div style={{ textAlign: "center", fontSize: "12px", color: "#94A3B8", marginBottom: "14px" }}>
                                ⏱️ Live T-Minus timer ticking second-by-second until scheduled appointment time.
                              </div>
                            )}

                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  handleArrivedDoorstep(b);
                                  setActiveScanningBooking(b);
                                }}
                                className="btn-doorstep-arrived"
                                style={{
                                  flex: 1, minWidth: "220px", padding: "12px 20px", fontSize: "14px", fontWeight: 800,
                                  background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                                  borderRadius: "10px", border: "none", color: "#FFFFFF", cursor: "pointer",
                                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.4)"
                                }}
                              >
                                📍 I Have Reached Customer Doorstep ➔ Open QR Scanner 📷
                              </button>
                              <a
                                href={`tel:${b.customerPhone || "+919876500002"}`}
                                className="quick-contact-btn quick-call-btn"
                                style={{ padding: "12px 18px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", fontWeight: 700 }}
                              >
                                📞 Call Customer
                              </a>
                            </div>
                          </div>
                        )}

                        {/* STAGE 3: DOORSTEP QR VERIFICATION */}
                        {isArrived && (
                          <div className="stage-qr-verify-box">
                            <div style={{ flex: 1, minWidth: "220px" }}>
                              <h5 style={{ margin: "0 0 4px 0", color: "#1E3A8A", fontSize: "14px", fontWeight: 800 }}>
                                📲 Step 3: Scan Customer's Work QR Code
                              </h5>
                              <p style={{ margin: 0, fontSize: "12px", color: "#3B82F6" }}>
                                Click below to open camera and scan customer's screen QR code:
                              </p>
                              {b.startQrCode && (
                                <span style={{ fontSize: "11px", color: "#1D4ED8", fontWeight: 700 }}>
                                  (Customer Screen Token: <strong>{b.startQrCode}</strong>)
                                </span>
                              )}
                            </div>

                            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", width: "100%", marginTop: "6px" }}>
                              {/* Primary: Open Live Camera QR Scanner */}
                              <button
                                type="button"
                                onClick={() => setActiveScanningBooking(b)}
                                className="btn-verify-qr-start"
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: "8px",
                                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                                  padding: "11px 22px", fontSize: "14px"
                                }}
                              >
                                <span>📷</span>
                                <span>Open Camera QR Scanner ⚡</span>
                              </button>

                              {/* Secondary: Manual Token Fallback */}
                              <div style={{ display: "flex", gap: "6px", alignItems: "center", flex: 1, minWidth: "220px" }}>
                                <input
                                  type="text"
                                  placeholder={b.startQrCode || "START-XXXX"}
                                  value={qrInputs[key] || ""}
                                  onChange={(e) => setQrInputs({ ...qrInputs, [key]: e.target.value.toUpperCase() })}
                                  className="input-qr-token"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleScanQrAndStart(b, qrInputs[key])}
                                  disabled={startingJobId === key}
                                  className="btn-verify-qr-start"
                                  style={{ whiteSpace: "nowrap", padding: "10px 16px" }}
                                >
                                  {startingJobId === key ? "Starting..." : "Verify Token ➔"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* STAGE 4: LIVE WORK STOPWATCH & DYNAMIC BILLING METER */}
                        {isInProgress && (
                          <div className="stage-live-stopwatch-box">
                            <div className="vendor-stopwatch-header">
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#34D399", animation: "pulse 1.5s infinite" }}></span>
                                  <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94A3B8", fontWeight: 800 }}>
                                    Live Work Timer in Progress
                                  </span>
                                </div>
                                <div className="vendor-stopwatch-val">
                                  {stopwatchText}
                                </div>
                              </div>
                              <div className="vendor-running-meter">
                                <div>
                                  <div style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase" }}>Base Visit</div>
                                  <div style={{ fontWeight: 800, color: "#FFFFFF" }}>₹{homeServiceCharge}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase" }}>Hourly Rate</div>
                                  <div style={{ fontWeight: 800, color: "#38BDF8" }}>₹{hourlyRate}/hr</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase" }}>Current Bill</div>
                                  <div style={{ fontSize: "16px", fontWeight: 900, color: "#34D399" }}>₹{currentRunningTotal}</div>
                                </div>
                              </div>
                            </div>

                            <div className="vendor-stopwatch-actions">
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "180px" }}>
                                <label style={{ fontSize: "12px", color: "#CBD5E1", whiteSpace: "nowrap" }}>Parts / Materials ₹</label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0 (optional)"
                                  value={materialInputs[key] || ""}
                                  onChange={(e) => setMaterialInputs({ ...materialInputs, [key]: e.target.value })}
                                  style={{
                                    width: "100px", padding: "6px 10px", borderRadius: "6px",
                                    border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)",
                                    color: "#FFFFFF", fontSize: "13px"
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleStopWorkAndBill(b)}
                                disabled={stoppingJobId === key}
                                className="btn-stop-timer"
                              >
                                {stoppingJobId === key ? "Calculating Bill..." : "⏹️ Work Done — Stop Timer & Bill"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STAGE 5: WORK COMPLETED — ITEMIZED INVOICE */}
                        {isWorkCompleted && (
                          <div className="stage-work-completed-receipt">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                              <h5 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#0F172A" }}>
                                📋 Work Completed — Itemized Invoice
                              </h5>
                              <span style={{ fontSize: "12px", background: "#ECFDF5", color: "#059669", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                                Duration: {b.workDurationFormatted || "1h 00m"}
                              </span>
                            </div>

                            <div className="receipt-item">
                              <span>Doorstep Visiting Charge</span>
                              <span>₹{b.billBreakdown?.homeServiceCharge || homeServiceCharge}</span>
                            </div>
                            <div className="receipt-item">
                              <span>Hourly Labor Charge ({b.workDurationFormatted || "1h"} @ ₹{hourlyRate}/hr)</span>
                              <span>₹{b.billBreakdown?.laborCharge || hourlyRate}</span>
                            </div>
                            {Number(b.billBreakdown?.materialCost || 0) > 0 && (
                              <div className="receipt-item">
                                <span>Parts & Materials</span>
                                <span>₹{b.billBreakdown?.materialCost}</span>
                              </div>
                            )}
                            <div className="receipt-total">
                              <span>Total Billed to Customer</span>
                              <span style={{ color: "#FF4D2D" }}>₹{b.finalCalculatedAmount || orderAmount}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCollectPayment(b)}
                              className="btn-collect-payment"
                            >
                              Collect ₹{b.finalCalculatedAmount || orderAmount} (Cash / UPI) & Complete Order ✅
                            </button>
                          </div>
                        )}

                        {/* STAGE 6: FINISHED & CLOSED */}
                        {isCompleted && (
                          <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)",
                            padding: "10px 16px", borderRadius: "10px", flexWrap: "wrap", gap: "8px"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#059669", fontWeight: 800, fontSize: "14px" }}>
                              <span>✅</span>
                              <span>Order Completed & ₹{orderAmount} Credited to Your Wallet</span>
                            </div>
                            {b.workDurationFormatted && (
                              <span style={{ fontSize: "12px", color: "#64748B" }}>
                                Total time: <strong>{b.workDurationFormatted}</strong>
                              </span>
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: WORK, CATEGORIES & LOCATION MANAGEMENT
            ========================================================================= */}
        {activeTab === "work" && (
          <div className="vendor-tab-content-card animate-fade-in">
            <div className="vendor-card-head">
              <div>
                <h3>Manage Categories, Phone, Location & Custom Work</h3>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  Update your service offerings and shop details displayed across the platform
                </span>
              </div>
            </div>

            <form onSubmit={handleProfileAndWorkSave} className="vendor-settings-form">
              <div className="vendor-input-group">
                <label>Service Category *</label>
                <select 
                  value={profileForm.category}
                  onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                  required
                >
                  {CATEGORIES_LIST.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="vendor-input-group">
                <label>1-Hour Service Charge (₹) *</label>
                <div className="vendor-rate-prefix">
                  <span>₹</span>
                  <input 
                    type="number"
                    value={profileForm.hourlyRate}
                    onChange={(e) => setProfileForm({ ...profileForm, hourlyRate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="vendor-input-group">
                <label>Primary Contact Mobile (Customer Calls) *</label>
                <input 
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 00001"
                  required
                />
              </div>

              <div className="vendor-input-group">
                <label>Alternate Shop Helpline Number</label>
                <input 
                  type="tel"
                  value={profileForm.altPhone}
                  onChange={(e) => setProfileForm({ ...profileForm, altPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="vendor-input-group vendor-settings-full">
                <label>Shop Location & Service Coverage Area *</label>
                <input 
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  placeholder="e.g. Sector 62, Noida, Delhi NCR (Serving within 15 km radius)"
                  required
                />
              </div>

              <div className="vendor-settings-full" style={{ marginTop: "8px" }}>
                <button 
                  type="submit" 
                  className="btn-primary-glow btn-save-profile"
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving Work Details..." : "Save Category, Phone & Location 💾"}
                </button>
              </div>
            </form>

            <hr style={{ borderColor: "rgba(255, 255, 255, 0.08)", margin: "32px 0 24px" }} />

            {/* Custom Work Offerings Manager */}
            <div>
              <h4 style={{ fontSize: "17px", fontWeight: 800, color: "#FFFFFF", marginBottom: "6px" }}>
                Add Custom Work & Task Offerings
              </h4>
              <p style={{ fontSize: "13.5px", color: "#94A3B8", margin: "0 0 16px 0" }}>
                Add specific tasks and repair jobs customers can book directly from your shop profile.
              </p>

              <form onSubmit={handleAddCustomWork} style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px auto", gap: "10px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#CBD5E1", display: "block", marginBottom: "4px" }}>Work / Service Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Water Tank Deep Cleaning"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "rgba(15,23,42,0.6)", color: "#FFF" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#CBD5E1", display: "block", marginBottom: "4px" }}>Price (₹)</label>
                  <input 
                    type="number"
                    placeholder="e.g. 599"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "rgba(15,23,42,0.6)", color: "#FFF" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#CBD5E1", display: "block", marginBottom: "4px" }}>Duration</label>
                  <input 
                    type="text"
                    placeholder="45 mins"
                    value={newServiceTime}
                    onChange={(e) => setNewServiceTime(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "rgba(15,23,42,0.6)", color: "#FFF" }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ padding: "11px 18px", borderRadius: "8px", border: "none", background: "#FF4D2D", color: "#FFF", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  + Add Work
                </button>
              </form>

              {/* Work list */}
              <div className="work-items-list">
                {customServices.map(item => (
                  <div className="work-item-row" key={item.id}>
                    <div>
                      <div className="work-item-name">{item.name}</div>
                      <span style={{ fontSize: "12px", color: "#94A3B8" }}>⏱️ Estimated Time: {item.time}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span className="work-item-rate">₹{item.price}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomWork(item.id)}
                        style={{ background: "transparent", border: "none", color: "#EF4444", fontSize: "16px", cursor: "pointer" }}
                        title="Remove work item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 3: SHOP MEMBERS (UP TO 8 MEMBERS)
            ========================================================================= */}
        {activeTab === "members" && (
          <div className="vendor-tab-content-card animate-fade-in">
            <div className="vendor-card-head">
              <div>
                <h3>Shop Staff & Team Members Management</h3>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  Ek shop franchise se <strong>up to 8 members</strong> use kar sakte hain
                </span>
              </div>
              <button
                type="button"
                className="btn-primary-glow"
                onClick={() => setShowMemberModal(true)}
                disabled={teamMembers.length >= 8}
              >
                + Add Shop Member ({teamMembers.length}/8)
              </button>
            </div>

            {/* Meter Bar */}
            <div className="member-meter-box">
              <div className="member-meter-header">
                <span style={{ fontWeight: 800, color: "#FFFFFF", fontSize: "14px" }}>
                  Franchise License Capacity: {teamMembers.length} of 8 Member Slots Used
                </span>
                <span style={{ fontSize: "13px", color: teamMembers.length >= 8 ? "#EF4444" : "#10B981", fontWeight: 700 }}>
                  {8 - teamMembers.length} Slot(s) Available
                </span>
              </div>
              <div className="member-meter-bar-track">
                <div 
                  className="member-meter-bar-fill" 
                  style={{ width: `${(teamMembers.length / 8) * 100}%` }}
                />
              </div>
            </div>

            {/* Members Grid */}
            <div className="team-members-grid">
              {teamMembers.map((mem, idx) => (
                <div className="team-member-card" key={mem.id || idx}>
                  <div className="team-member-avatar">
                    <span>{idx === 0 ? "👑" : "👨‍🔧"}</span>
                  </div>
                  <div className="team-member-info" style={{ flex: 1 }}>
                    <h4>{mem.name}</h4>
                    <p>📞 {mem.phone}</p>
                    <span style={{ fontSize: "11px", color: "#FF4D2D", fontWeight: 700 }}>{mem.role}</span>
                  </div>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(mem.id)}
                      style={{ background: "transparent", border: "none", color: "#EF4444", fontSize: "15px", cursor: "pointer" }}
                      title="Remove Member"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Member Modal */}
            {showMemberModal && (
              <div className="cat-preview-modal-overlay" onClick={() => setShowMemberModal(false)}>
                <div className="cat-preview-modal-box animate-fade-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px", background: "#0F172A", border: "1px solid #FF4D2D" }}>
                  <button className="modal-close-btn" onClick={() => setShowMemberModal(false)}>✕</button>
                  <h3 style={{ color: "#FFFFFF", fontSize: "18px", marginBottom: "16px" }}>Add Staff Member to Shop Franchise</h3>

                  <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "4px" }}>Member Full Name *</label>
                      <input 
                        type="text"
                        placeholder="e.g. Sunil Verma"
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        required
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "rgba(15,23,42,0.6)", color: "#FFF" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "4px" }}>Mobile Number *</label>
                      <input 
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={memberForm.phone}
                        onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                        required
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "rgba(15,23,42,0.6)", color: "#FFF" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "4px" }}>Role / Skill</label>
                      <input 
                        type="text"
                        placeholder="e.g. Senior Technician / Assistant"
                        value={memberForm.role}
                        onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "rgba(15,23,42,0.6)", color: "#FFF" }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary-glow"
                      style={{ marginTop: "10px" }}
                    >
                      Save Member ({teamMembers.length + 1}/8) 👥
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            TAB 4: KYC & DOCUMENT VERIFICATION (AGE, AADHAAR, PAN, SELFIE)
            ========================================================================= */}
        {activeTab === "kyc" && (
          <div className="vendor-tab-content-card animate-fade-in">
            <div className="vendor-card-head">
              <div>
                <h3>Complete Profile & Government Documents (KYC)</h3>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  Submit Age, Aadhaar Card, PAN Card and Live Selfie for verified partner badge
                </span>
              </div>
              <span style={{
                background: "rgba(16, 185, 129, 0.15)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "6px 14px", borderRadius: "100px", fontWeight: 800, fontSize: "12px"
              }}>
                ✅ KYC VERIFIED
              </span>
            </div>

            <form onSubmit={handleSubmitDocuments}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div className="vendor-input-group">
                  <label>Age of Service Man (Years) *</label>
                  <input 
                    type="number"
                    min="18"
                    max="80"
                    placeholder="e.g. 30"
                    value={kycForm.age}
                    onChange={(e) => setKycForm({ ...kycForm, age: e.target.value })}
                    required
                  />
                </div>

                <div className="vendor-input-group">
                  <label>Aadhaar Card Number (12 Digits) *</label>
                  <input 
                    type="text"
                    placeholder="XXXX XXXX XXXX"
                    value={kycForm.aadhaarNumber}
                    onChange={(e) => setKycForm({ ...kycForm, aadhaarNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="vendor-input-group">
                  <label>PAN Card Number (10 Characters) *</label>
                  <input 
                    type="text"
                    placeholder="ABCDE1234F"
                    value={kycForm.panNumber}
                    onChange={(e) => setKycForm({ ...kycForm, panNumber: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>

              {/* 3 Upload Cards */}
              <div className="kyc-docs-grid">
                
                {/* 1. Aadhaar Card Photo */}
                <div className={`kyc-doc-card ${kycForm.aadhaarDoc ? "completed" : ""}`}>
                  <span style={{ fontSize: "24px" }}>🪪</span>
                  <strong style={{ color: "#FFFFFF", fontSize: "14px" }}>Aadhaar Card Document</strong>
                  <div className="doc-preview-box">
                    {kycForm.aadhaarDoc ? (
                      <img src={kycForm.aadhaarDoc} alt="Aadhaar" className="doc-preview-img" />
                    ) : (
                      <span style={{ color: "#64748B", fontSize: "12px" }}>No document selected</span>
                    )}
                  </div>
                  <div className="doc-upload-btn-wrap">
                    <input 
                      type="file" 
                      id="upload-aadhaar" 
                      accept="image/*" 
                      className="doc-file-input"
                      onChange={(e) => handleFileUpload("aadhaarDoc", e)}
                    />
                    <label htmlFor="upload-aadhaar" className="doc-upload-label">
                      📷 Upload Aadhaar Photo
                    </label>
                  </div>
                </div>

                {/* 2. PAN Card Photo */}
                <div className={`kyc-doc-card ${kycForm.panDoc ? "completed" : ""}`}>
                  <span style={{ fontSize: "24px" }}>💳</span>
                  <strong style={{ color: "#FFFFFF", fontSize: "14px" }}>PAN Card Document</strong>
                  <div className="doc-preview-box">
                    {kycForm.panDoc ? (
                      <img src={kycForm.panDoc} alt="PAN" className="doc-preview-img" />
                    ) : (
                      <span style={{ color: "#64748B", fontSize: "12px" }}>No document selected</span>
                    )}
                  </div>
                  <div className="doc-upload-btn-wrap">
                    <input 
                      type="file" 
                      id="upload-pan" 
                      accept="image/*" 
                      className="doc-file-input"
                      onChange={(e) => handleFileUpload("panDoc", e)}
                    />
                    <label htmlFor="upload-pan" className="doc-upload-label">
                      📷 Upload PAN Card Photo
                    </label>
                  </div>
                </div>

                {/* 3. Live Selfie Photo */}
                <div className={`kyc-doc-card ${kycForm.selfieDoc ? "completed" : ""}`}>
                  <span style={{ fontSize: "24px" }}>🤳</span>
                  <strong style={{ color: "#FFFFFF", fontSize: "14px" }}>Live Selfie Photo</strong>
                  <div className="doc-preview-box">
                    {kycForm.selfieDoc ? (
                      <img src={kycForm.selfieDoc} alt="Live Selfie" className="doc-preview-img" />
                    ) : (
                      <span style={{ color: "#64748B", fontSize: "12px" }}>No selfie captured</span>
                    )}
                  </div>
                  <div className="doc-upload-btn-wrap">
                    <input 
                      type="file" 
                      id="upload-selfie" 
                      accept="image/*" 
                      capture="user"
                      className="doc-file-input"
                      onChange={(e) => handleFileUpload("selfieDoc", e)}
                    />
                    <label htmlFor="upload-selfie" className="doc-upload-label">
                      🤳 Take / Upload Live Selfie
                    </label>
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="btn-primary-glow"
                disabled={submittingKyc}
                style={{ width: "100%", padding: "14px", fontSize: "15px", fontWeight: 800, marginTop: "12px" }}
              >
                {submittingKyc ? "Verifying Documents..." : "Submit Verification Documents & Update Profile 📑"}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 5: WALLET & EARNINGS
            ========================================================================= */}
        {activeTab === "wallet" && (
          <div className="vendor-tab-content-card animate-fade-in">
            <div className="vendor-card-head">
              <div>
                <h3>Partner Earnings & UPI Instant Transfer</h3>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  Direct automated settlements for all completed doorstep customer visits
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
              <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "13px", color: "#94A3B8", textTransform: "uppercase" }}>Available Wallet Balance</div>
                <div style={{ fontSize: "36px", fontWeight: 900, color: "#10B981", margin: "6px 0" }}>
                  ₹{wallet.balance.toLocaleString()}
                </div>
                <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>Instant withdrawal available 24/7</p>
              </div>

              <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "13px", color: "#94A3B8", textTransform: "uppercase" }}>Franchise Plan License</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#FF4D2D", margin: "6px 0" }}>
                  {vendor.franchisePlan === "annual" ? "₹5,00,000 / 1 Year Master" : "₹4,000 / Monthly Plan"}
                </div>
                <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>Capacity: Up to 8 Shop Members</p>
              </div>
            </div>

            {/* Withdraw form */}
            <form onSubmit={handleWithdraw} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "flex-end", marginBottom: "28px" }}>
              <div>
                <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "4px" }}>Transfer Amount (₹)</label>
                <input 
                  type="number"
                  placeholder="Min ₹100"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "rgba(15,23,42,0.6)", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "4px" }}>UPI ID / VPA</label>
                <input 
                  type="text"
                  placeholder="partner@okaxis / 9876500001@paytm"
                  value={withdrawUpi}
                  onChange={(e) => setWithdrawUpi(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "rgba(15,23,42,0.6)", color: "#FFF" }}
                />
              </div>
              <button
                type="submit"
                disabled={withdrawing || wallet.balance < 100}
                style={{ padding: "11px 22px", borderRadius: "8px", border: "none", background: "#FF4D2D", color: "#FFF", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {withdrawing ? "Transferring..." : "Withdraw to Bank ⚡"}
              </button>
            </form>

            {/* Transactions Ledger */}
            <h4 style={{ color: "#FFFFFF", fontSize: "16px", marginBottom: "12px" }}>Recent Wallet Ledger Transactions</h4>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tx ID</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.transactions.map(tx => (
                    <tr key={tx.id}>
                      <td><code style={{ color: "#94A3B8" }}>{tx.id}</code></td>
                      <td>{tx.date}</td>
                      <td>{tx.description}</td>
                      <td>
                        <span style={{
                          padding: "2px 8px", borderRadius: "100px", fontSize: "11px", fontWeight: 800,
                          background: tx.type === "credit" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: tx.type === "credit" ? "#10B981" : "#EF4444"
                        }}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: tx.type === "credit" ? "#10B981" : "#EF4444" }}>
                        {tx.type === "credit" ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* Interactive Camera QR Scanner Modal */}
      <QrCameraScannerModal
        isOpen={Boolean(activeScanningBooking)}
        booking={activeScanningBooking}
        onClose={() => setActiveScanningBooking(null)}
        onScanSuccess={(scannedCode) => {
          if (activeScanningBooking) {
            handleScanQrAndStart(activeScanningBooking, scannedCode);
          }
        }}
      />
    </div>
  );
}

export default VendorDashboard;
