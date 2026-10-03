import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE, SOCKET_URL } from "../../apiConfig";
import QrCameraScannerModal from "./QrCameraScannerModal";
import "../../css/Admin/Admin.css";
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
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [vendor, setVendor] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    if (queryTab === "overview") return "overview";
    if (queryTab === "profile" || queryTab === "work") return "work";
    if (queryTab === "kyc") return "kyc";
    if (queryTab === "members") return "members";
    if (queryTab === "wallet") return "wallet";
    if (queryTab === "bookings") return "bookings";
    return "overview";
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" || document.body.classList.contains("dark");
  });

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  useEffect(() => {
    if (queryTab === "overview") {
      setActiveTab("overview");
    } else if (queryTab === "profile" || queryTab === "work") {
      setActiveTab("work");
    } else if (queryTab === "kyc" || queryTab === "members" || queryTab === "wallet" || queryTab === "bookings") {
      setActiveTab(queryTab);
    }
  }, [queryTab]);
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

  // 1-Hour Service Charge Quick Edit State
  const [showRateModal, setShowRateModal] = useState(false);
  const [tempRate, setTempRate] = useState("299");
  const [savingRate, setSavingRate] = useState(false);

  // Shop Members State (Capacity: 8 Members)
  const [teamMembers, setTeamMembers] = useState([
    { id: "mem_1", name: "Ramesh Kumar (Owner / Lead)", phone: "+91 98765 00001", role: "Master Specialist", active: true, isOwner: true, upiId: "owner@okhdfc" },
    { id: "mem_2", name: "Sunil Verma", phone: "+91 98112 33445", role: "Senior Technician", active: true, isOwner: false, upiId: "sunil.verma@upi" },
    { id: "mem_3", name: "Amit Sharma", phone: "+91 97123 44556", role: "Apprentice / Assistant", active: true, isOwner: false, upiId: "amit.plumber@paytm" }
  ]);
  const [pendingWorkersList, setPendingWorkersList] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: "", phone: "", role: "Technician / Specialist" });

  // Worker Payroll & 10% Admin Cut / 90% Worker Net Payout Engine
  const [workerPayouts, setWorkerPayouts] = useState(() => {
    const saved = localStorage.getItem("helper_worker_payouts");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      "mem_1": { totalJobs: 12, totalGross: 8400, adminCut: 8400, netPay: 8400, paidOut: 8400, pendingPay: 0, upiId: "owner@okhdfc" },
      "mem_2": { totalJobs: 6, totalGross: 4200, adminCut: 420, netPay: 3780, paidOut: 2500, pendingPay: 1280, upiId: "sunil.verma@upi" },
      "mem_3": { totalJobs: 4, totalGross: 2800, adminCut: 280, netPay: 2520, paidOut: 1800, pendingPay: 720, upiId: "amit.plumber@paytm" }
    };
  });
  const [showWorkerPayoutModal, setShowWorkerPayoutModal] = useState(false);
  const [selectedWorkerForPayout, setSelectedWorkerForPayout] = useState(null);
  const [payoutAmountInput, setPayoutAmountInput] = useState("");
  const [payoutUpiInput, setPayoutUpiInput] = useState("");
  const [processingPayout, setProcessingPayout] = useState(false);

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
        const currentRate = String(p.hourlyRate || "299").replace(/[^0-9]/g, "");
        setTempRate(currentRate);
        setProfileForm({
          shopName: p.shopName || `${p.name}'s ${p.category} Services`,
          name: p.name || "",
          category: p.category || "Plumber",
          hourlyRate: currentRate,
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
            { id: "mem_1", name: `${p.name} (Owner / Lead)`, phone: p.phone || "+91 98765 00001", role: "Master Specialist", active: true, isOwner: true, upiId: "owner@okhdfc" },
            { id: "mem_2", name: "Sunil Verma", phone: "+91 98112 33445", role: "Senior Technician", active: true, isOwner: false, upiId: "sunil.verma@upi" },
            { id: "mem_3", name: "Amit Sharma", phone: "+91 97123 44556", role: "Apprentice / Assistant", active: true, isOwner: false, upiId: "amit.plumber@paytm" }
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
    fetchPendingWorkers();
  }, []);

  // Refresh pending workers when members tab is active
  useEffect(() => {
    if (activeTab === "members") {
      fetchPendingWorkers(vendor?.id || vendor?._id);
    }
  }, [activeTab, vendor?.id, vendor?._id]);

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
          const pId = p.id || p._id || "60d0fe4f5311236168a109ca";
          socket.emit("provider:register", {
            providerId: pId,
            location: [77.391029, 28.535516]
          });
          socket.emit("provider:register_radar", {
            providerId: pId
          });
        } catch (e) {}
      }
    });

    socket.on("job:offer_alert", (data) => {
      setIncomingOffer({
        ...data,
        bookingId: data.bookingId || data.id || data.bookingCode,
        expiresAt: Date.now() + (data.expiresInSeconds || 60) * 1000
      });
      setOfferCountdown(data.expiresInSeconds || 60);
      setBookings(prev => {
        const id = data.bookingId || data.id || data.bookingCode;
        if (prev.some(b => (b.bookingId || b.id || b._id) === id)) return prev;
        return [{
          ...data,
          bookingId: id,
          id: id,
          status: data.status || "assigned",
          createdAt: "Just now"
        }, ...prev];
      });
      showToast(`🔔 NEW JOB OFFER: ${data.serviceName} (₹${data.totalAmount || data.price}) from ${data.customerName || "Customer"}! ⚡`);
    });

    socket.on("new_booking_created", (data) => {
      if (!data) return;
      const raw = localStorage.getItem("helper_vendor");
      let myId = null;
      let myName = "";
      if (raw) {
        try {
          const p = JSON.parse(raw);
          myId = p.id || p._id;
          myName = (p.name || "").toLowerCase();
        } catch (e) {}
      }
      const bAssigned = String(data.assignedProvider || data.assignedProviderName || "").toLowerCase();
      const isForMe = !myId || data.providerId === myId || data.provider === myId || (myName && bAssigned.includes(myName));

      if (isForMe) {
        const id = data.bookingId || data.id || data.bookingCode;
        setIncomingOffer({
          ...data,
          bookingId: id,
          expiresAt: Date.now() + 60000
        });
        setOfferCountdown(60);
        setBookings(prev => {
          if (prev.some(b => (b.bookingId || b.id || b._id) === id)) return prev;
          return [{ ...data, bookingId: id, id, status: data.status || "assigned", createdAt: "Just now" }, ...prev];
        });
        showToast(`🔔 DIRECT CUSTOMER BOOKING: ${data.serviceName || data.service} from ${data.customerName || "Customer"}! ⚡`);
      }
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

  // Listen for real-time customer bookings from custom window events
  useEffect(() => {
    const handleNewBooking = (e) => {
      if (e.detail) {
        const newB = e.detail;
        const myId = vendor?.id || vendor?._id;
        const myName = (vendor?.name || "").toLowerCase();
        const bAssigned = String(newB.assignedProvider || newB.assignedProviderName || "").toLowerCase();
        const isForMe = !myId || newB.providerId === myId || newB.provider === myId || (myName && bAssigned.includes(myName));

        if (isForMe) {
          const id = newB.bookingId || newB.id || newB.bookingCode;
          setIncomingOffer({
            ...newB,
            bookingId: id,
            expiresAt: Date.now() + 60000
          });
          setOfferCountdown(60);
          setBookings(prev => {
            const exists = prev.some(b => (b.bookingId || b.id || b._id) === id);
            if (exists) return prev;
            return [{ ...newB, bookingId: id, id, status: newB.status || "assigned", createdAt: "Just now" }, ...prev];
          });
          showToast(`🔔 NEW CUSTOMER BOOKING: ${newB.serviceName || newB.service} from ${newB.customerName}! ⚡`);
        }
      }
    };
    window.addEventListener("new_booking_created", handleNewBooking);
    window.addEventListener("vendor_notification_received", handleNewBooking);
    return () => {
      window.removeEventListener("new_booking_created", handleNewBooking);
      window.removeEventListener("vendor_notification_received", handleNewBooking);
    };
  }, [vendor]);

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
        // Fallback to locally tracked bookings matching this vendor
        const localBookings = JSON.parse(localStorage.getItem("helper_bookings")) || [];
        const myLocal = localBookings.filter(b => 
          b.providerId === idToFetch || 
          b.provider === idToFetch ||
          (vendor?.name && String(b.assignedProvider || "").toLowerCase().includes(vendor.name.toLowerCase()))
        );
        if (myLocal.length > 0) {
          setBookings(myLocal);
        } else if (Array.isArray(data.data)) {
          setBookings(data.data);
        }
      }
    } catch (err) {
      console.warn("fetchBookings error:", err);
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
  // QUICK 1-HOUR SERVICE CHARGE EDIT HANDLER
  // =========================================================================
  const handleQuickRateSave = async (newRate) => {
    const rateNum = String(newRate).replace(/[^0-9]/g, "");
    if (!rateNum || parseInt(rateNum) <= 0) {
      alert("Please enter a valid 1-hour service rate.");
      return;
    }
    setSavingRate(true);
    const updatedVendor = {
      ...vendor,
      hourlyRate: `₹${rateNum}/hr`
    };
    setProfileForm(prev => ({ ...prev, hourlyRate: rateNum }));
    setVendor(updatedVendor);
    localStorage.setItem("helper_vendor", JSON.stringify(updatedVendor));
    window.dispatchEvent(new Event("vendor_updated"));

    try {
      const vId = vendor?.id || vendor?._id || "vdr_default";
      await fetch(`${API_BASE}/providers/${vId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hourlyRate: `₹${rateNum}/hr` })
      });
      showToast(`⚡ 1-Hour Service Charge updated to ₹${rateNum}/hr!`);
    } catch (e) {
      showToast(`⚡ 1-Hour Service Charge saved locally (₹${rateNum}/hr)`);
    } finally {
      setSavingRate(false);
      setShowRateModal(false);
    }
  };

  // =========================================================================
  // SHOP MEMBERS MANAGEMENT (UP TO 8 MEMBERS) & WORKER ZERO-FEE REGISTRATION
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

    const cleanPhone = memberForm.phone.trim();
    const upiHandle = `${cleanPhone.replace(/[^0-9]/g, "").slice(-10)}@upi`;

    const newMember = {
      id: `mem_${Date.now()}`,
      name: memberForm.name.trim(),
      phone: cleanPhone,
      role: memberForm.role || "Technician / Specialist",
      active: true,
      isOwner: false,
      upiId: upiHandle
    };

    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);

    // Initialize worker's payroll ledger with 0 pending pay and ₹0 franchise fee
    setWorkerPayouts(prev => {
      const updatedLedger = {
        ...prev,
        [newMember.id]: {
          totalJobs: 0,
          totalGross: 0,
          adminCut: 0,
          netPay: 0,
          paidOut: 0,
          pendingPay: 0,
          upiId: upiHandle
        }
      };
      localStorage.setItem("helper_worker_payouts", JSON.stringify(updatedLedger));
      return updatedLedger;
    });

    setMemberForm({ name: "", phone: "", role: "Technician / Specialist" });
    setShowMemberModal(false);
    showToast(`Member ${newMember.name} added! (Franchise fee: ₹0 Free) 👥`);

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

  const fetchPendingWorkers = async (vId) => {
    try {
      const id = vId || vendor?.id || vendor?._id || "VND-101";
      const res = await fetch(`${API_BASE}/api/workers/vendor/${id}/pending`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.workers)) {
        setPendingWorkersList(data.workers);
      }
    } catch (e) {
      console.warn("Error fetching pending workers:", e);
    }
  };

  const handleApproveWorker = async (workerId, workerName) => {
    try {
      const res = await fetch(`${API_BASE}/api/workers/${workerId}/approve`, {
        method: "PUT"
      });
      const data = await res.json();
      showToast(`🎉 Technician ${workerName || ""} approved and added to your shop fleet!`);
      setPendingWorkersList(prev => prev.filter(w => (w.workerId || w.id) !== workerId));
      if (data && data.worker) {
        const newTeamMem = {
          id: data.worker.workerId || data.worker.id,
          name: data.worker.name,
          phone: data.worker.phone,
          role: `${data.worker.category} Specialist`,
          active: true,
          isOwner: false,
          upiId: data.worker.earnings?.upiId || `${data.worker.phone}@upi`
        };
        setTeamMembers(prev => [...prev.filter(m => m.id !== newTeamMem.id), newTeamMem]);
      }
    } catch (e) {
      showToast(`🎉 Technician ${workerName || ""} approved!`);
      setPendingWorkersList(prev => prev.filter(w => (w.workerId || w.id) !== workerId));
    }
  };

  const handleRejectWorker = async (workerId) => {
    try {
      await fetch(`${API_BASE}/api/workers/${workerId}/verification`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: "rejected" })
      });
      showToast("Worker registration request declined.");
      setPendingWorkersList(prev => prev.filter(w => (w.workerId || w.id) !== workerId));
    } catch (e) {
      setPendingWorkersList(prev => prev.filter(w => (w.workerId || w.id) !== workerId));
    }
  };

  // Assign worker to job with live 10% admin cut / 90% worker split
  const handleAssignWorker = (bookingId, workerId) => {
    setBookings(prev => prev.map(b => (b.bookingId || b.id || b._id) === bookingId ? {
      ...b,
      assignedWorkerId: workerId
    } : b));
    const assignedMember = teamMembers.find(m => m.id === workerId);
    showToast(`Job assigned to ${assignedMember?.name || "Worker"}! 10% Admin Cut / 90% Worker Net calculated. 🛠️`);
  };

  // Open worker UPI Payout Modal
  const handleOpenPayoutModal = (worker) => {
    setSelectedWorkerForPayout(worker);
    const data = workerPayouts[worker.id] || { pendingPay: 0, upiId: worker.upiId || "worker@upi" };
    setPayoutAmountInput(String(data.pendingPay || 0));
    setPayoutUpiInput(data.upiId || worker.upiId || (worker.phone ? `${worker.phone.replace(/[^0-9]/g, "").slice(-10)}@upi` : "worker@upi"));
    setShowWorkerPayoutModal(true);
  };

  // Confirm worker UPI Payout disbursement
  const handleConfirmWorkerPayout = (e) => {
    e.preventDefault();
    if (!selectedWorkerForPayout) return;
    const amt = parseInt(payoutAmountInput);
    if (!amt || amt <= 0) {
      alert("Please enter a valid payout amount (min ₹1).");
      return;
    }

    const current = workerPayouts[selectedWorkerForPayout.id] || { pendingPay: 0, paidOut: 0 };
    if (amt > current.pendingPay && current.pendingPay > 0) {
      if (!window.confirm(`Entered amount (₹${amt}) is greater than current pending due (₹${current.pendingPay}). Proceed with advance worker payout?`)) {
        return;
      }
    }

    setProcessingPayout(true);
    setTimeout(() => {
      setWorkerPayouts(prev => {
        const curr = prev[selectedWorkerForPayout.id] || { totalJobs: 0, totalGross: 0, adminCut: 0, netPay: 0, paidOut: 0, pendingPay: 0, upiId: payoutUpiInput };
        const updated = {
          ...prev,
          [selectedWorkerForPayout.id]: {
            ...curr,
            paidOut: (curr.paidOut || 0) + amt,
            pendingPay: Math.max(0, (curr.pendingPay || 0) - amt),
            upiId: payoutUpiInput
          }
        };
        localStorage.setItem("helper_worker_payouts", JSON.stringify(updated));
        return updated;
      });

      // Record disbursement in Admin Wallet transactions ledger
      setWallet(prev => ({
        ...prev,
        transactions: [
          {
            id: `TX-WKR-${Date.now().toString().slice(-4)}`,
            type: "debit",
            amount: amt,
            description: `Worker Payout (90% share) to ${selectedWorkerForPayout.name} via ${payoutUpiInput}`,
            date: "Just now"
          },
          ...prev.transactions
        ]
      }));

      setProcessingPayout(false);
      setShowWorkerPayoutModal(false);
      showToast(`💸 ₹${amt.toLocaleString()} paid to ${selectedWorkerForPayout.name} via UPI (${payoutUpiInput}) successfully!`);
    }, 900);
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

  // Accept incoming job/booking directly
  const handleAcceptBooking = async (booking) => {
    const key = booking.bookingId || booking.id || booking._id;
    const vId = vendor?.id || vendor?._id;
    const vName = vendor?.shopName ? `${vendor.shopName} • ${vendor.name}` : (vendor?.name || "Verified Pro");

    // Optimistic update
    setBookings(prev => prev.map(b => (b.bookingId || b.id || b._id) === key ? {
      ...b,
      status: "accepted",
      slotConfirmed: true,
      assignedProvider: vName,
      assignedProviderName: vendor?.name || "Verified Pro"
    } : b));

    if (incomingOffer && (incomingOffer.bookingId === key || incomingOffer.id === key)) {
      setIncomingOffer(null);
    }
    showToast(`🎉 Order #${key} Accepted! Customer has been notified. 🚀`);

    // Socket notification
    if (socketRef.current) {
      socketRef.current.emit("job:accept", { bookingId: key, providerId: vId });
    }

    // Backend call
    try {
      await fetch(`${API_BASE}/bookings/${key}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: vId, providerName: vName })
      });
    } catch (e) {
      console.warn("Backend accept booking error:", e);
    }
  };

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

  // 5. Collect Payment & Complete Job (10% Admin Cut / 90% Worker Net Payout)
  const handleCollectPayment = async (booking) => {
    const key = booking.bookingId || booking.id || booking._id;
    setCompletingJobId(key);

    try {
      await fetch(`${API_BASE}/bookings/${key}/complete`, { method: "POST" });
    } catch (e) {}

    const totalBill = booking.finalCalculatedAmount || booking.totalAmount || booking.billBreakdown?.totalPayable || 499;
    const assignedWorkerId = booking.assignedWorkerId || "mem_2";
    const assignedMember = teamMembers.find(m => m.id === assignedWorkerId) || teamMembers[1] || teamMembers[0];
    const isOwnerJob = assignedWorkerId === "mem_1" || assignedMember?.isOwner;

    // 10% to Vendor Admin, 90% to Worker (or 100% to Admin if owner completed)
    const adminCut = isOwnerJob ? totalBill : Math.round(totalBill * 0.10);
    const workerShare = isOwnerJob ? 0 : (totalBill - adminCut);

    setBookings(prev => prev.map(b => (b.bookingId || b.id || b._id) === key ? {
      ...b,
      status: "completed",
      paymentStatus: "captured",
      adminCommission: adminCut,
      workerPayout: workerShare
    } : b));

    // Update Vendor Admin Wallet
    setWallet(prev => ({
      ...prev,
      balance: prev.balance + adminCut,
      totalEarned: prev.totalEarned + adminCut,
      transactions: [
        {
          id: `TX-${Date.now().toString().slice(-4)}`,
          type: "credit",
          amount: adminCut,
          description: isOwnerJob 
            ? `Self-service payout: ${booking.serviceName}` 
            : `10% Admin Royalty (${assignedMember?.name || "Worker"}): ${booking.serviceName}`,
          date: "Just now"
        },
        ...prev.transactions
      ]
    }));

    // Update Worker Payouts ledger if handled by a worker
    if (!isOwnerJob) {
      setWorkerPayouts(prev => {
        const current = prev[assignedWorkerId] || { totalJobs: 0, totalGross: 0, adminCut: 0, netPay: 0, paidOut: 0, pendingPay: 0, upiId: assignedMember?.upiId || "worker@upi" };
        const updated = {
          ...prev,
          [assignedWorkerId]: {
            ...current,
            totalJobs: (current.totalJobs || 0) + 1,
            totalGross: (current.totalGross || 0) + totalBill,
            adminCut: (current.adminCut || 0) + adminCut,
            netPay: (current.netPay || 0) + workerShare,
            pendingPay: (current.pendingPay || 0) + workerShare
          }
        };
        localStorage.setItem("helper_worker_payouts", JSON.stringify(updated));
        return updated;
      });
    }

    setCompletingJobId(null);
    showToast(isOwnerJob 
      ? `🎉 ₹${totalBill} credited to shop wallet (Owner completed)!` 
      : `🎉 Payment Collected! 10% (₹${adminCut}) credited to Admin, 90% (₹${workerShare}) allocated to ${assignedMember?.name || "Worker"}!`);
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

  const filteredBookings = bookings.filter(b => {
    if (!dashboardSearch.trim()) return true;
    const q = dashboardSearch.toLowerCase();
    const sName = (b.serviceName || "").toLowerCase();
    const cName = (b.customerName || "").toLowerCase();
    const cPhone = (b.customerPhone || "").toLowerCase();
    const bId = String(b.bookingId || b.id || b._id || "").toLowerCase();
    const status = (b.status || "").toLowerCase();
    return sName.includes(q) || cName.includes(q) || cPhone.includes(q) || bId.includes(q) || status.includes(q);
  });

  return (
    <div className="admin-layout-wrapper vendor-portal-layout">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="vendor-alert-banner success animate-fade-in" style={{ position: "fixed", top: "24px", right: "24px", zIndex: 999999, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <span>📢</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
          title="Close Navigation Menu"
        />
      )}

      {/* Admin Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
        <div 
          className="admin-sidebar-header" 
          onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }}
          title="Vendor Dashboard Overview"
        >
          <div className="admin-logo-badge" style={{ background: "linear-gradient(135deg, #FF4D2D 0%, #F59E0B 100%)" }}>
            {getCategoryEmoji(vendor.category)}
          </div>
          <div className="admin-brand-text">
            <h2 style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {vendor.shopName || vendor.name}
            </h2>
            <span className="admin-tag">{vendor.category} Pro Hub</span>
          </div>
        </div>

        <nav className="admin-nav-menu">
          <span className="admin-nav-category-title">Core Management</span>

          <button 
            type="button"
            className={`admin-nav-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">📊</span>
              <span>Overview Dashboard</span>
            </div>
          </button>

          <button 
            type="button"
            className={`admin-nav-btn ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => { setActiveTab("bookings"); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">📋</span>
              <span>Service Orders</span>
            </div>
            {pendingJobsCount > 0 && (
              <span className="admin-nav-count alert">{pendingJobsCount}</span>
            )}
          </button>

          <button 
            type="button"
            className={`admin-nav-btn ${activeTab === "members" ? "active" : ""}`}
            onClick={() => { setActiveTab("members"); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">👥</span>
              <span>Shop Team</span>
            </div>
            <span className="admin-nav-count">{teamMembers.length}/8</span>
          </button>

          <span className="admin-nav-category-title">Services & Earnings</span>

          <button 
            type="button"
            className={`admin-nav-btn ${activeTab === "work" ? "active" : ""}`}
            onClick={() => { setActiveTab("work"); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">🛠️</span>
              <span>Rate Card & Services</span>
            </div>
          </button>

          <button 
            type="button"
            className={`admin-nav-btn ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => { setActiveTab("wallet"); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">💳</span>
              <span>Wallet & Payouts</span>
            </div>
            <span className="admin-nav-count">₹{wallet.balance.toLocaleString()}</span>
          </button>

          <span className="admin-nav-category-title">Account & Franchise</span>

          <button 
            type="button"
            className={`admin-nav-btn ${activeTab === "kyc" ? "active" : ""}`}
            onClick={() => { setActiveTab("kyc"); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">📑</span>
              <span>KYC Verification</span>
            </div>
          </button>

          <button 
            type="button"
            className="admin-nav-btn"
            onClick={() => { setShowFranchiseModal(true); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">👑</span>
              <span>Franchise License</span>
            </div>
            {isFranchiseActive && (
              <span style={{ fontSize: "10.5px", background: "rgba(16, 185, 129, 0.2)", color: "#10B981", padding: "2px 8px", borderRadius: "100px", fontWeight: 800 }}>PRO</span>
            )}
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-back-site-btn" onClick={() => setSidebarOpen(false)}>
            <span>🌐 Public Site</span>
          </Link>
          <button 
            type="button"
            className="table-action-btn delete" 
            onClick={handleLogout}
            style={{ padding: "6px 12px", fontSize: "12px" }}
            title="Sign Out"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="admin-main-viewport">
        {/* Top Navbar */}
        <header className="admin-top-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <button 
              type="button" 
              className="admin-mobile-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Menu"
            >
              ☰
            </button>

            <div className="admin-search-wrap" style={{ maxWidth: "340px", flex: 1 }}>
              <span className="admin-search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search orders, phone, customer..."
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
              />
              {dashboardSearch && (
                <button
                  type="button"
                  onClick={() => setDashboardSearch("")}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "12px" }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="admin-top-actions">
            {/* Online/Offline Toggle */}
            <button 
              type="button"
              className={`vendor-status-toggle-pill ${vendor.status === "Online" ? "online" : "offline"}`}
              onClick={toggleStatus}
              title="Click to toggle availability"
            >
              <span className="status-dot-pulse" />
              <span>{vendor.status === "Online" ? "Accepting Jobs" : "Offline"}</span>
            </button>

            {/* Franchise Plan Button */}
            <button
              type="button"
              onClick={() => setShowFranchiseModal(true)}
              className={`vendor-top-franchise-btn ${isFranchiseActive ? "active" : "inactive"}`}
              title="Franchise License Status"
            >
              <span>👑</span>
              <span>{isFranchiseActive ? (vendor.franchisePlan === "annual" ? "Annual Master" : "Monthly Pro") : "Get Franchise"}</span>
            </button>

            {/* Theme Toggle */}
            <button 
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* Profile Pill */}
            <div 
              className="admin-profile-pill" 
              onClick={() => setActiveTab("work")} 
              style={{ cursor: "pointer" }}
              title="View & Edit Profile"
            >
              <div className="admin-avatar-small" style={{ background: "linear-gradient(135deg, #FF4D2D 0%, #F59E0B 100%)" }}>
                <span>{getCategoryEmoji(vendor.category)}</span>
              </div>
              <span className="admin-name-text" style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {vendor.name || "Vendor Pro"}
              </span>
            </div>
          </div>
        </header>

        {/* View Content Body */}
        <div className="admin-view-body">

          {/* =========================================================================
              TAB 0: OVERVIEW EXECUTIVE DASHBOARD
              ========================================================================= */}
          {activeTab === "overview" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Executive Welcome Hero Card */}
              <div className="vendor-overview-welcome-card animate-fade-in">
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
                          👑 {vendor.franchisePlan === "annual" ? "Annual Master (₹5 Lakh)" : "Monthly Pro (₹4,000)"}
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", background: "rgba(239, 68, 68, 0.15)", color: "#EF4444", padding: "4px 12px", borderRadius: "100px", fontWeight: 800 }}>
                          ⚠️ Franchise Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="vendor-header-actions">
                  <div className="vendor-nav-telemetry" style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "8px 16px", borderRadius: "100px" }}>
                    <span className="vendor-telemetry-tag" style={{ color: "#10B981", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="telemetry-radar-dot" /> Live Dispatch Radar: Active
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFranchiseModal(true)}
                    className="btn-franchise-manage"
                  >
                    <span>👑</span>
                    <span>{isFranchiseActive ? "Manage Franchise" : "Activate Franchise"}</span>
                  </button>
                </div>
              </div>

              {/* Franchise Gate Banner if not active */}
              {!isFranchiseActive && (
                <div className="franchise-gate-hero animate-fade-in">
                  <div className="franchise-badge-banner">
                    <span>🔒 SERVICE MAN PANEL LOCKED</span>
                  </div>
                  <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", marginBottom: "10px" }}>
                    Purchase Helper Franchise to Unlock Your Panel
                  </h2>
                  <p style={{ fontSize: "15px", color: "#94A3B8", maxWidth: "680px", margin: "0 auto 20px", lineHeight: 1.6 }}>
                    Ek shop se <strong>up to 8 members</strong> use kar sakte hain. Choose between our flexible Monthly license (₹4,000/month) or 1-Year Master Franchise (₹5,00,000/year) to start receiving direct customer leads with 0% commission.
                  </p>

                  <div className="franchise-plans-grid">
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

              {/* 4 Stats Cards */}
              <div className="vendor-stats-grid">
                <div className="vendor-stat-card">
                  <div className="vendor-stat-icon stat-icon-rate">⏱️</div>
                  <div className="vendor-stat-info" style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                      <h4>1-Hour Service Charge</h4>
                      <button
                        type="button"
                        className="btn-stat-action"
                        onClick={() => {
                          setTempRate(String(profileForm.hourlyRate || "299").replace(/[^0-9]/g, ""));
                          setShowRateModal(true);
                        }}
                        title="Click to edit 1-Hour Service Charge"
                      >
                        ✏️ Edit Rate
                      </button>
                    </div>
                    <div className="vendor-stat-val">₹{profileForm.hourlyRate}/hr</div>
                    <span className="vendor-stat-sub">Standard service rate (editable)</span>
                  </div>
                </div>

                <div className="vendor-stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("bookings")}>
                  <div className="vendor-stat-icon stat-icon-pending">📋</div>
                  <div className="vendor-stat-info">
                    <h4>Active Job Orders</h4>
                    <div className="vendor-stat-val">{pendingJobsCount} Active</div>
                    <span className="vendor-stat-sub">View orders queue ➔</span>
                  </div>
                </div>

                <div className="vendor-stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("members")}>
                  <div className="vendor-stat-icon stat-icon-jobs">👥</div>
                  <div className="vendor-stat-info">
                    <h4>Shop Team Members</h4>
                    <div className="vendor-stat-val">{teamMembers.length} / 8 Members</div>
                    <span className="vendor-stat-sub">Max 8 per franchise shop ➔</span>
                  </div>
                </div>

                <div className="vendor-stat-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("wallet")}>
                  <div className="vendor-stat-icon stat-icon-revenue">💰</div>
                  <div className="vendor-stat-info">
                    <h4>Total Earnings</h4>
                    <div className="vendor-stat-val">₹{wallet.totalEarned.toLocaleString()}</div>
                    <span className="vendor-stat-sub">Wallet: ₹{wallet.balance.toLocaleString()} • Withdraw ➔</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="vendor-quick-actions-bar animate-fade-in">
                <div className="vendor-quick-action-item" onClick={() => setActiveTab("bookings")}>
                  <span className="quick-action-icon">📋</span>
                  <div className="quick-action-text">
                    <strong>Service Orders</strong>
                    <span>{bookings.length} Total Bookings</span>
                  </div>
                </div>
                <div className="vendor-quick-action-item" onClick={() => setShowMemberModal(true)}>
                  <span className="quick-action-icon">➕</span>
                  <div className="quick-action-text">
                    <strong>Add Team Member</strong>
                    <span>Staff limit 8</span>
                  </div>
                </div>
                <div className="vendor-quick-action-item" onClick={() => { setTempRate(String(profileForm.hourlyRate || "299").replace(/[^0-9]/g, "")); setShowRateModal(true); }}>
                  <span className="quick-action-icon">⏱️</span>
                  <div className="quick-action-text">
                    <strong>Update Hourly Rate</strong>
                    <span>₹{profileForm.hourlyRate}/hr</span>
                  </div>
                </div>
                <div className="vendor-quick-action-item" onClick={() => setActiveTab("work")}>
                  <span className="quick-action-icon">🛠️</span>
                  <div className="quick-action-text">
                    <strong>Rate Card & Work</strong>
                    <span>Sub-services & Area</span>
                  </div>
                </div>
                <div className="vendor-quick-action-item" onClick={() => setActiveTab("wallet")}>
                  <span className="quick-action-icon">💳</span>
                  <div className="quick-action-text">
                    <strong>Instant Settlement</strong>
                    <span>UPI Bank Transfer</span>
                  </div>
                </div>
                <div className="vendor-quick-action-item" onClick={() => setActiveTab("kyc")}>
                  <span className="quick-action-icon">📑</span>
                  <div className="quick-action-text">
                    <strong>KYC Verification</strong>
                    <span>Verified Partner</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview Queue */}
              <div className="vendor-tab-content-card animate-fade-in">
                <div className="vendor-card-head">
                  <div>
                    <h3>Active & Recent Customer Orders</h3>
                    <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                      Live snapshot of incoming service requests and ongoing jobs
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-demo-quick"
                    onClick={() => setActiveTab("bookings")}
                  >
                    View All Orders ({bookings.length}) ➔
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "36px 20px", color: "var(--text-muted)" }}>
                    <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>📡</span>
                    <h4>No active orders right now</h4>
                    <p style={{ margin: 0 }}>The dispatch engine is scanning for customer requests in {vendor.location || "your area"}.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {bookings.slice(0, 3).map(b => {
                      const key = b.bookingId || b.id || b._id;
                      const isInProgress = b.status === "in_progress" || b.status === "In Progress";
                      const isCompleted = b.status === "completed" || b.status === "Completed" || b.status === "work_completed";
                      return (
                        <div 
                          key={key} 
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px",
                            padding: "16px 20px", borderRadius: "14px",
                            background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(255, 77, 45, 0.12)", color: "#FF4D2D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                              {getCategoryEmoji(vendor.category)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: "var(--text-main)", fontSize: "15px" }}>
                                {b.serviceName || `${vendor.category} Service`}
                              </div>
                              <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                                #{b.bookingId || key} • 👤 {b.customerName || "Customer"} • 📍 {b.customerAddress || b.address || vendor.location}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{
                              padding: "4px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 800,
                              background: isInProgress ? "rgba(255, 77, 45, 0.15)" : isCompleted ? "rgba(16, 185, 129, 0.15)" : "rgba(59, 130, 246, 0.15)",
                              color: isInProgress ? "#FF4D2D" : isCompleted ? "#10B981" : "#3B82F6"
                            }}>
                              {b.status || "Pending"}
                            </span>
                            <span style={{ fontWeight: 800, color: "#10B981", fontSize: "15px" }}>
                              ₹{b.finalCalculatedAmount || b.totalAmount || b.amount || 448}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveTab("bookings")}
                              className="btn-demo-quick"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                            >
                              Manage ➔
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

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
            ) : filteredBookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>🔍</span>
                <h4>No orders matching "{dashboardSearch}"</h4>
                <button 
                  type="button" 
                  onClick={() => setDashboardSearch("")}
                  className="btn-demo-quick"
                  style={{ marginTop: "12px" }}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="vendor-bookings-list">
                {filteredBookings.map(b => {
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
                        <div className="booking-schedule-bar">
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "18px" }}>📅</span>
                            <div>
                              <div style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Requested Date & Time</div>
                              <div style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A" }}>
                                {b.scheduledDate || "Today"} — <span style={{ color: "#FF4D2D" }}>{b.scheduledTime || "11:00 AM - 01:00 PM"}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                            <a
                              href={`tel:${b.customerPhone || "+919876500002"}`}
                              className="quick-contact-btn quick-call-btn"
                            >
                              <span>📞</span> <span>Call Customer</span>
                            </a>
                            <a
                              href={`https://wa.me/${String(b.customerPhone || "9876500002").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${b.customerName || "Customer"}, I am your Helper verified plumber regarding order #${b.bookingId || key} for ${b.scheduledDate || "today"} at ${b.scheduledTime || "your slot"}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="quick-contact-btn quick-wa-btn"
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

                        {/* Worker Assignment & 10% Admin Cut / 90% Worker Net Split Engine */}
                        <div className="booking-worker-assign-box">
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", width: "100%" }}>
                            <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#1E293B" }}>👷 Assigned Worker:</span>
                            <select
                              className="select-worker-assign"
                              value={b.assignedWorkerId || "mem_2"}
                              onChange={(e) => handleAssignWorker(key, e.target.value)}
                              disabled={isCompleted}
                            >
                              {teamMembers.map(mem => (
                                <option key={mem.id} value={mem.id}>
                                  {mem.name} {mem.isOwner ? "(Owner - 100% Payout)" : "(Worker - 90% Net Payout)"}
                                </option>
                              ))}
                            </select>
                            <span className="franchise-zero-tag">Franchise: ₹0 Free</span>
                            <div className="payout-split-pill">
                              <span>💰 Split:</span>
                              {(b.assignedWorkerId || "mem_2") === "mem_1" ? (
                                <span style={{ color: "#059669", fontWeight: 800 }}>Admin Retains 100% (₹{orderAmount})</span>
                              ) : (
                                <>
                                  <span style={{ color: "#D97706", fontWeight: 800 }}>10% Admin: ₹{Math.round(orderAmount * 0.10)}</span>
                                  <span style={{ color: "#94A3B8" }}>•</span>
                                  <span style={{ color: "#059669", fontWeight: 800 }}>90% Worker Net: ₹{orderAmount - Math.round(orderAmount * 0.10)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 4-Stage Stepper Bar */}
                        <div className="vendor-stage-stepper">
                          <div className={`stepper-step ${isAssigned ? "active" : "done"}`}>
                            <div className="step-num">{isAssigned ? "1" : "✓"}</div>
                            <div className="step-label">1. Call & OTP</div>
                          </div>
                          <div className={`stepper-line ${!isAssigned ? "filled" : ""}`}></div>
                          <div className={`stepper-step ${isSlotConfirmed ? "active" : (isArrived || isInProgress || isWorkCompleted || isCompleted) ? "done" : ""}`}>
                            <div className="step-num">{(isArrived || isInProgress || isWorkCompleted || isCompleted) ? "✓" : "2"}</div>
                            <div className="step-label">2. Slot Locked</div>
                          </div>
                          <div className={`stepper-line ${(isArrived || isInProgress || isWorkCompleted || isCompleted) ? "filled" : ""}`}></div>
                          <div className={`stepper-step ${isArrived ? "active" : (isInProgress || isWorkCompleted || isCompleted) ? "done" : ""}`}>
                            <div className="step-num">{(isInProgress || isWorkCompleted || isCompleted) ? "✓" : "3"}</div>
                            <div className="step-label">3. Doorstep QR</div>
                          </div>
                          <div className={`stepper-line ${(isInProgress || isWorkCompleted || isCompleted) ? "filled" : ""}`}></div>
                          <div className={`stepper-step ${(isInProgress || isWorkCompleted) ? "active" : isCompleted ? "done" : ""}`}>
                            <div className="step-num">{isCompleted ? "✓" : "4"}</div>
                            <div className="step-label">4. Stopwatch & Bill</div>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Stage Actions */}
                      <div className="booking-operations-box">
                        
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
                            <div className="slot-action-inline" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleAcceptBooking(b)}
                                className="btn-accept-order"
                                style={{
                                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                                  color: "#FFF",
                                  border: "none",
                                  padding: "10px 18px",
                                  borderRadius: "10px",
                                  fontWeight: 800,
                                  fontSize: "13.5px",
                                  cursor: "pointer",
                                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px"
                                }}
                              >
                                <span>✓</span>
                                <span>Accept Order (स्वीकार करें)</span>
                              </button>
                              <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 700 }}>OR</span>
                              <input
                                type="text"
                                maxLength="4"
                                placeholder="Customer 4-digit OTP"
                                value={slotOtpInputs[key] || ""}
                                onChange={(e) => setSlotOtpInputs({ ...slotOtpInputs, [key]: e.target.value })}
                                className="input-slot-otp"
                                style={{ maxWidth: "160px" }}
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

                            {/* Revenue Distribution: 10% Admin Royalty / 90% Worker Net */}
                            <div className="receipt-split-box">
                              <div style={{ fontSize: "12px", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}>
                                💰 Revenue Distribution (10% Admin Cut / 90% Worker Net):
                              </div>
                              {(b.assignedWorkerId || "mem_2") === "mem_1" ? (
                                <div className="receipt-split-item">
                                  <span>Owner Executed (100% Retained)</span>
                                  <span style={{ color: "#059669", fontWeight: 800 }}>₹{b.finalCalculatedAmount || orderAmount}</span>
                                </div>
                              ) : (
                                <>
                                  <div className="receipt-split-item">
                                    <span>10% Shop Admin Royalty</span>
                                    <span style={{ color: "#D97706", fontWeight: 800 }}>+₹{Math.round((b.finalCalculatedAmount || orderAmount) * 0.10)}</span>
                                  </div>
                                  <div className="receipt-split-item">
                                    <span>90% Worker Net ({teamMembers.find(m => m.id === (b.assignedWorkerId || "mem_2"))?.name || "Worker"})</span>
                                    <span style={{ color: "#059669", fontWeight: 800 }}>₹{(b.finalCalculatedAmount || orderAmount) - Math.round((b.finalCalculatedAmount || orderAmount) * 0.10)}</span>
                                  </div>
                                </>
                              )}
                              <div className="worker-zero-notice">
                                🛡️ Worker Franchise Fee: ₹0 Free (Franchise license paid by Shop Admin)
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCollectPayment(b)}
                              className="btn-collect-payment"
                            >
                              Collect ₹{b.finalCalculatedAmount || orderAmount} & Distribute (10% Admin / 90% Worker) ✅
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
                              <span>
                                {(b.assignedWorkerId || "mem_2") === "mem_1"
                                  ? `Order Completed: ₹${orderAmount} credited to Shop Admin Wallet`
                                  : `Order Completed: 10% (₹${b.adminCommission || Math.round(orderAmount * 0.10)}) Admin • 90% (₹${b.workerPayout || (orderAmount - Math.round(orderAmount * 0.10))}) Worker Net`}
                              </span>
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
                <h3>Vendor Profile, Shop & Service Details</h3>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  Update your shop profile, contact info, service offerings and coverage area
                </span>
              </div>
            </div>

            <form onSubmit={handleProfileAndWorkSave} className="vendor-settings-form">
              <div className="vendor-input-group">
                <label>Shop / Business Name *</label>
                <input 
                  type="text"
                  value={profileForm.shopName}
                  onChange={(e) => setProfileForm({ ...profileForm, shopName: e.target.value })}
                  placeholder="e.g. Ramesh Plumbing Solutions"
                  required
                />
              </div>

              <div className="vendor-input-group">
                <label>Service Pro / Owner Name *</label>
                <input 
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>

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
              <h4 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", marginBottom: "6px" }}>
                Add Custom Work & Task Offerings
              </h4>
              <p style={{ fontSize: "13.5px", color: "#64748B", margin: "0 0 16px 0" }}>
                Add specific tasks and repair jobs customers can book directly from your shop profile.
              </p>

              <form onSubmit={handleAddCustomWork} style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px auto", gap: "10px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#475569", display: "block", marginBottom: "4px", fontWeight: 700 }}>Work / Service Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Water Tank Deep Cleaning"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#475569", display: "block", marginBottom: "4px", fontWeight: 700 }}>Price (₹)</label>
                  <input 
                    type="number"
                    placeholder="e.g. 599"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#475569", display: "block", marginBottom: "4px", fontWeight: 700 }}>Duration</label>
                  <input 
                    type="text"
                    placeholder="45 mins"
                    value={newServiceTime}
                    onChange={(e) => setNewServiceTime(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A" }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary-glow"
                  style={{ padding: "10px 18px", whiteSpace: "nowrap" }}
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

            {/* Worker Zero-Fee Franchise Policy Banner */}
            <div className="worker-policy-banner">
              <div className="worker-policy-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span className="policy-badge">👑 Shop Admin Franchise</span>
                  <h4 style={{ margin: 0, color: "#1E293B", fontSize: "16px", fontWeight: 800 }}>
                    Worker Zero-Payment Policy & 10% Revenue Share Model
                  </h4>
                </div>
                <span className="policy-fee-pill">Worker Franchise Fee: ₹0 Free</span>
              </div>
              <p style={{ margin: "8px 0 12px", fontSize: "13.5px", color: "#475569", lineHeight: 1.5 }}>
                Shop Admin (Franchise Owner) monthly ₹4,000 ya annual ₹5,00,000 franchise charges pay karta hai. Jin workers ko shop admin add karega, <strong>un workers ko koi franchise payment nahi deni padegi (₹0 Free)</strong>. Har customer order par <strong>10% Shop Admin ko commission milega</strong> aur baaki <strong>90% calculate hoke worker ke paas jayega</strong>. Shop Admin yahan se workers ki UPI payments handle kar sakta hai.
              </p>
              <div className="policy-pills-row">
                <div className="policy-pill">
                  <span>🛡️</span>
                  <span><strong>₹0 Worker Fee:</strong> Franchise license fully sponsored by Shop Admin</span>
                </div>
                <div className="policy-pill">
                  <span>💼</span>
                  <span><strong>10% Admin Cut:</strong> Automatically allocated to Shop Admin on completed jobs</span>
                </div>
                <div className="policy-pill">
                  <span>💸</span>
                  <span><strong>90% Worker Net:</strong> Calculated live and disbursable via UPI</span>
                </div>
              </div>
            </div>

            {/* Meter Bar */}
            <div className="member-meter-box">
              <div className="member-meter-header">
                <div className="meter-header-left">
                  <div className="meter-title-wrap">
                    <span className="meter-badge">🏪 FRANCHISE CAPACITY</span>
                    <h4 className="meter-title">
                      License Allocation: <strong>{teamMembers.length} of 8 Member Slots Occupied</strong>
                    </h4>
                  </div>
                </div>
                <div className="meter-header-right">
                  <span className={`meter-availability-pill ${teamMembers.length >= 8 ? "full" : "available"}`}>
                    {8 - teamMembers.length} Slot(s) Available
                  </span>
                  <button
                    type="button"
                    className="btn-add-worker-top"
                    onClick={() => setShowMemberModal(true)}
                    disabled={teamMembers.length >= 8}
                  >
                    <span>+ Add Staff Member</span>
                  </button>
                </div>
              </div>
              
              <div className="member-meter-bar-track">
                <div 
                  className="member-meter-bar-fill" 
                  style={{ width: `${(teamMembers.length / 8) * 100}%` }}
                />
              </div>

              {/* Segmented Slot Indicators */}
              <div className="meter-slots-indicators">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((slotNum) => {
                  const isUsed = slotNum <= teamMembers.length;
                  return (
                    <div key={slotNum} className={`meter-slot-pill ${isUsed ? "used" : "free"}`}>
                      <span className="slot-dot" />
                      <span className="slot-text">Slot {slotNum}: {isUsed ? "Active" : "Free"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Worker Payroll Summary Bento Grid */}
            <div className="worker-payroll-grid">
              <div className="payroll-stat-card card-admin-cut">
                <div className="stat-card-top">
                  <span className="stat-icon-wrap icon-amber">👑</span>
                  <span className="stat-badge-chip">10% CUT</span>
                </div>
                <span className="payroll-stat-label">Admin Commission Earned</span>
                <div className="payroll-stat-val">
                  ₹{Object.values(workerPayouts).reduce((acc, curr) => acc + (curr.adminCut || 0), 0).toLocaleString()}
                </div>
                <span className="payroll-stat-sub">From all worker executed orders</span>
              </div>

              <div className="payroll-stat-card card-disbursed">
                <div className="stat-card-top">
                  <span className="stat-icon-wrap icon-emerald">✅</span>
                  <span className="stat-badge-chip green">SETTLED</span>
                </div>
                <span className="payroll-stat-label">Total Worker Payouts Disbursed</span>
                <div className="payroll-stat-val text-emerald">
                  ₹{Object.values(workerPayouts).reduce((acc, curr) => acc + (curr.paidOut || 0), 0).toLocaleString()}
                </div>
                <span className="payroll-stat-sub">Disbursed to workers via UPI</span>
              </div>

              <div className="payroll-stat-card card-pending">
                <div className="stat-card-top">
                  <span className="stat-icon-wrap icon-orange">⏳</span>
                  <span className="stat-badge-chip orange">DUE</span>
                </div>
                <span className="payroll-stat-label">Total Pending Worker Balance</span>
                <div className="payroll-stat-val text-amber">
                  ₹{Object.values(workerPayouts).reduce((acc, curr) => acc + (curr.pendingPay || 0), 0).toLocaleString()}
                </div>
                <span className="payroll-stat-sub">Ready for instant UPI transfer</span>
              </div>
            </div>

            {/* Pending Worker Registration Requests from Self-Registered Workers */}
            {pendingWorkersList.length > 0 && (
              <div style={{
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)",
                border: "1.5px solid rgba(245, 158, 11, 0.35)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "24px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "22px" }}>📥</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "16px", color: "var(--text-main)" }}>
                        New Worker Registration Requests ({pendingWorkersList.length})
                      </h4>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        These field technicians registered and requested affiliation under your nearest shop
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", padding: "3px 10px", background: "rgba(245, 158, 11, 0.2)", color: "#F59E0B", borderRadius: "12px", fontWeight: 800 }}>
                    Requires Your Approval ⏳
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
                  {pendingWorkersList.map(pw => (
                    <div key={pw.workerId || pw.id} style={{
                      background: "var(--surface-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img 
                          src={pw.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100"} 
                          alt={pw.name}
                          style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover", border: "2px solid #10B981" }} 
                        />
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: "15px", display: "block" }}>{pw.name}</strong>
                          <span style={{ fontSize: "12px", color: "#10B981", fontWeight: 700 }}>
                            {pw.category} • {pw.experienceYears || 3} Yrs Exp
                          </span>
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>📞 {pw.phone}</span>
                      </div>

                      <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", gap: "12px", background: "var(--surface-input)", padding: "8px 12px", borderRadius: "8px" }}>
                        <span>🆔 Aadhaar: <strong>{pw.documents?.aadhaarNumber || "Submitted"}</strong></span>
                        <span>📍 Area: <strong>{pw.address || "Local Hub"}</strong></span>
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        <button
                          type="button"
                          onClick={() => handleApproveWorker(pw.workerId || pw.id, pw.name)}
                          className="btn-primary-glow"
                          style={{ flex: 1, padding: "8px 12px", fontSize: "12.5px" }}
                        >
                          ✓ Approve & Add to Shop Fleet
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectWorker(pw.workerId || pw.id)}
                          style={{ padding: "8px 14px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#EF4444", fontSize: "12px", cursor: "pointer", fontWeight: 700 }}
                        >
                          ✕ Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members & Worker Payroll Grid */}
            <div className="team-members-grid">
              {teamMembers.map((mem, idx) => {
                const isOwner = idx === 0 || mem.isOwner;
                const pData = workerPayouts[mem.id] || { totalJobs: 0, totalGross: 0, adminCut: 0, netPay: 0, paidOut: 0, pendingPay: 0, upiId: mem.upiId || "worker@upi" };

                if (isOwner) {
                  const totalWorkerJobs = Object.values(workerPayouts).reduce((acc, curr) => acc + (curr.totalJobs || 0), 0);
                  const totalWorkerGross = Object.values(workerPayouts).reduce((acc, curr) => acc + (curr.totalGross || 0), 0);
                  const totalAdminRoyalty = Object.values(workerPayouts).reduce((acc, curr) => acc + (curr.adminCut || 0), 0);

                  return (
                    <div className="team-member-card owner-franchise-card" key={mem.id || "owner"}>
                      <div className="owner-card-ribbon">
                        <span className="ribbon-title">👑 Shop Admin & Franchise Holder</span>
                        <span className="owner-verified-tag">✓ Verified Partner</span>
                      </div>

                      <div className="member-card-header">
                        <div className="team-member-avatar owner-avatar">
                          <span>👑</span>
                        </div>
                        <div className="team-member-info">
                          <div className="member-name-row">
                            <h4>{mem.name}</h4>
                            <span className="owner-role-badge">Shop Owner</span>
                          </div>
                          <p className="member-contact-line">
                            <span>📞 {mem.phone}</span>
                            <span className="bullet-sep">•</span>
                            <span className="member-specialty">{mem.role || "Franchise Lead"}</span>
                          </p>
                          <div className="member-upi-chip">
                            <span>UPI:</span>
                            <code>{mem.upiId || "owner@okhdfc"}</code>
                          </div>
                        </div>
                      </div>

                      {/* Owner Franchise Matrix */}
                      <div className="worker-payroll-metrics owner-metrics-grid">
                        <div className="worker-metric-box">
                          <span className="metric-label">Staff Members</span>
                          <span className="metric-val">{Math.max(0, teamMembers.length - 1)} Sponsored</span>
                        </div>
                        <div className="worker-metric-box">
                          <span className="metric-label">Staff Orders</span>
                          <span className="metric-val">{totalWorkerJobs} Executed</span>
                        </div>
                        <div className="worker-metric-box metric-admin-royalty">
                          <span className="metric-label">10% Royalty Accrued</span>
                          <span className="metric-val">+₹{totalAdminRoyalty.toLocaleString()}</span>
                        </div>
                        <div className="worker-metric-box">
                          <span className="metric-label">Total Staff Billed</span>
                          <span className="metric-val">₹{totalWorkerGross.toLocaleString()}</span>
                        </div>
                        <div className="worker-metric-box metric-worker-net">
                          <span className="metric-label">Worker Franchise Fee</span>
                          <span className="metric-val">₹0 Free</span>
                        </div>
                        <div className="worker-metric-box metric-settled">
                          <span className="metric-label">Franchise License</span>
                          <span className="metric-val">Active ✓</span>
                        </div>
                      </div>

                      <div className="worker-card-footer">
                        <span className="worker-franchise-sponsor-note">
                          🛡️ Franchise Fee: <strong>Covered by Shop Admin</strong>
                        </span>
                        <button
                          type="button"
                          className="btn-add-staff-pill"
                          onClick={() => setShowMemberModal(true)}
                          disabled={teamMembers.length >= 8}
                        >
                          + Add Staff ({teamMembers.length}/8)
                        </button>
                      </div>
                    </div>
                  );
                }

                // WORKER CARD
                return (
                  <div className="team-member-card worker-payroll-card" key={mem.id || idx}>
                    <div className="member-card-header">
                      <div className="team-member-avatar worker-avatar">
                        <span>👨‍🔧</span>
                      </div>
                      <div className="team-member-info">
                        <div className="member-name-row">
                          <h4>{mem.name}</h4>
                          <span className="franchise-zero-tag">
                            🛡️ Franchise: ₹0 Free
                          </span>
                        </div>
                        <p className="member-contact-line">
                          <span>📞 {mem.phone}</span>
                          <span className="bullet-sep">•</span>
                          <span className="member-specialty">{mem.role || "Technician"}</span>
                        </p>
                        <div className="member-upi-chip">
                          <span>UPI:</span>
                          <code>{pData.upiId || mem.upiId || "worker@upi"}</code>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(mem.id)}
                        className="btn-remove-member"
                        title="Remove Member from Franchise"
                      >
                        ✕
                      </button>
                    </div>

                    {/* 6-Cell Payroll Breakdown Matrix */}
                    <div className="worker-payroll-metrics">
                      <div className="worker-metric-box">
                        <span className="metric-label">Completed Jobs</span>
                        <span className="metric-val">{pData.totalJobs || 0}</span>
                      </div>
                      <div className="worker-metric-box">
                        <span className="metric-label">Total Billed</span>
                        <span className="metric-val">₹{(pData.totalGross || 0).toLocaleString()}</span>
                      </div>
                      <div className="worker-metric-box metric-admin-royalty">
                        <span className="metric-label">10% Admin Royalty</span>
                        <span className="metric-val">+₹{(pData.adminCut || 0).toLocaleString()}</span>
                      </div>
                      <div className="worker-metric-box metric-worker-net">
                        <span className="metric-label">90% Worker Net</span>
                        <span className="metric-val">₹{(pData.netPay || 0).toLocaleString()}</span>
                      </div>
                      <div className="worker-metric-box">
                        <span className="metric-label">Disbursed (UPI)</span>
                        <span className="metric-val">₹{(pData.paidOut || 0).toLocaleString()}</span>
                      </div>
                      <div className={`worker-metric-box ${(pData.pendingPay || 0) > 0 ? "metric-pending-due" : "metric-settled"}`}>
                        <span className="metric-label">Pending Due</span>
                        <span className="metric-val">
                          ₹{(pData.pendingPay || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="worker-card-footer">
                      <span className="worker-franchise-sponsor-note">
                        Worker Fee: <strong>₹0 Paid by Admin</strong>
                      </span>
                      {(pData.pendingPay || 0) > 0 ? (
                        <button
                          type="button"
                          className="btn-pay-worker-upi"
                          onClick={() => handleOpenPayoutModal(mem)}
                        >
                          <span>💸 Disburse ₹{(pData.pendingPay || 0).toLocaleString()} via UPI</span>
                        </button>
                      ) : (
                        <span className="badge-settled-worker">
                          ✓ All Payouts Settled
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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
                  <strong style={{ color: "#0F172A", fontSize: "14px" }}>Aadhaar Card Document</strong>
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
                  <strong style={{ color: "#0F172A", fontSize: "14px" }}>PAN Card Document</strong>
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
                  <strong style={{ color: "#0F172A", fontSize: "14px" }}>Live Selfie Photo</strong>
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
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "13px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Available Wallet Balance</div>
                <div style={{ fontSize: "36px", fontWeight: 900, color: "#10B981", margin: "6px 0", fontFamily: "var(--vendor-font-mono)" }}>
                  ₹{wallet.balance.toLocaleString()}
                </div>
                <p style={{ fontSize: "12.5px", color: "#64748B", margin: 0 }}>Instant withdrawal available 24/7</p>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "13px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Franchise Plan License</div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#FF4D2D", margin: "6px 0" }}>
                  {vendor.franchisePlan === "annual" ? "₹5,00,000 / 1 Year Master" : "₹4,000 / Monthly Plan"}
                </div>
                <p style={{ fontSize: "12.5px", color: "#64748B", margin: 0 }}>Capacity: Up to 8 Shop Members</p>
              </div>
            </div>

            {/* Withdraw form */}
            <form onSubmit={handleWithdraw} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "flex-end", marginBottom: "28px" }}>
              <div>
                <label style={{ fontSize: "12.5px", color: "#475569", display: "block", marginBottom: "4px", fontWeight: 700 }}>Transfer Amount (₹)</label>
                <input 
                  type="number"
                  placeholder="Min ₹100"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12.5px", color: "#475569", display: "block", marginBottom: "4px", fontWeight: 700 }}>UPI ID / VPA</label>
                <input 
                  type="text"
                  placeholder="partner@okaxis / 9876500001@paytm"
                  value={withdrawUpi}
                  onChange={(e) => setWithdrawUpi(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A" }}
                />
              </div>
              <button
                type="submit"
                disabled={withdrawing || wallet.balance < 100}
                className="btn-primary-glow"
                style={{ padding: "11px 22px", whiteSpace: "nowrap" }}
              >
                {withdrawing ? "Transferring..." : "Withdraw to Bank ⚡"}
              </button>
            </form>

            {/* Transactions Ledger */}
            <h4 style={{ color: "#0F172A", fontSize: "16px", fontWeight: 800, marginBottom: "12px" }}>Recent Wallet Ledger Transactions</h4>
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
      </main>

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

      {/* Quick 1-Hour Service Charge Edit Modal */}
      {showRateModal && (
        <div className="cat-preview-modal-overlay" onClick={() => setShowRateModal(false)}>
          <div className="cat-preview-modal-box animate-fade-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px", background: "#0F172A", border: "1.5px solid #FF4D2D" }}>
            <button className="modal-close-btn" onClick={() => setShowRateModal(false)}>✕</button>
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <span style={{ fontSize: "36px" }}>⏱️</span>
              <h3 style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: 800, margin: "8px 0 4px" }}>
                Edit 1-Hour Service Charge
              </h3>
              <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>
                Set your standard hourly service charge for customers in {vendor?.category || "your trade"}.
              </p>
            </div>

            {/* Rate Presets */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "#CBD5E1", display: "block", marginBottom: "8px", fontWeight: 700 }}>Quick Presets (Click to select):</label>
              <div className="rate-presets-row">
                {["199", "299", "399", "499", "599", "799"].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    className={`btn-rate-preset ${tempRate === preset ? "active" : ""}`}
                    onClick={() => setTempRate(preset)}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleQuickRateSave(tempRate); }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "6px", fontWeight: 700 }}>
                  Hourly Rate (₹ / Hour) *
                </label>
                <div style={{ display: "flex", alignItems: "center", background: "rgba(15,23,42,0.6)", border: "1.5px solid #475569", borderRadius: "10px", padding: "0 14px" }}>
                  <span style={{ color: "#FF4D2D", fontWeight: 800, fontSize: "18px" }}>₹</span>
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    value={tempRate}
                    onChange={(e) => setTempRate(e.target.value)}
                    required
                    style={{ flex: 1, padding: "12px 10px", background: "transparent", border: "none", color: "#FFFFFF", fontSize: "18px", fontWeight: 800, outline: "none" }}
                  />
                  <span style={{ color: "#94A3B8", fontSize: "14px", fontWeight: 700 }}>/ hour</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #475569", background: "transparent", color: "#CBD5E1", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRate}
                  className="btn-primary-glow"
                  style={{ flex: 2, padding: "12px", borderRadius: "10px", fontWeight: 800 }}
                >
                  {savingRate ? "Updating Rate..." : "Save 1-Hour Rate 💾"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Worker UPI Payout Disbursement Modal */}
      {showWorkerPayoutModal && selectedWorkerForPayout && (
        <div className="cat-preview-modal-overlay" onClick={() => setShowWorkerPayoutModal(false)}>
          <div className="cat-preview-modal-box animate-fade-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", background: "#0F172A", border: "1.5px solid #10B981" }}>
            <button className="modal-close-btn" onClick={() => setShowWorkerPayoutModal(false)}>✕</button>

            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "36px" }}>💸</span>
              <h3 style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: 800, margin: "8px 0 4px" }}>
                Disburse Payout to {selectedWorkerForPayout.name}
              </h3>
              <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>
                10% Admin Royalty has already been credited to you. Disburse the 90% share to your worker.
              </p>
            </div>

            {/* Worker Due Summary */}
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", color: "#CBD5E1" }}>Worker Total Net Earned (90%):</span>
                <span style={{ fontWeight: 800, color: "#FFFFFF" }}>₹{(workerPayouts[selectedWorkerForPayout.id]?.netPay || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", color: "#CBD5E1" }}>Already Disbursed via UPI:</span>
                <span style={{ fontWeight: 800, color: "#10B981" }}>₹{(workerPayouts[selectedWorkerForPayout.id]?.paidOut || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px dashed rgba(255,255,255,0.15)" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#FCD34D" }}>Current Pending Due:</span>
                <span style={{ fontSize: "18px", fontWeight: 900, color: "#FCD34D" }}>₹{(workerPayouts[selectedWorkerForPayout.id]?.pendingPay || 0).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "8px" }}>
                🛡️ Franchise Fee for worker: <strong>₹0 Free (Covered by Shop Franchise)</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmWorkerPayout} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "4px", fontWeight: 700 }}>
                  Disbursement Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={payoutAmountInput}
                  onChange={(e) => setPayoutAmountInput(e.target.value)}
                  required
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #475569", background: "rgba(15,23,42,0.6)", color: "#FFFFFF", fontSize: "16px", fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12.5px", color: "#CBD5E1", display: "block", marginBottom: "4px", fontWeight: 700 }}>
                  Worker UPI ID / VPA *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9811233445@upi / name@okaxis"
                  value={payoutUpiInput}
                  onChange={(e) => setPayoutUpiInput(e.target.value)}
                  required
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #475569", background: "rgba(15,23,42,0.6)", color: "#FFFFFF", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setShowWorkerPayoutModal(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #475569", background: "transparent", color: "#CBD5E1", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingPayout}
                  className="btn-primary-glow"
                  style={{ flex: 2, padding: "12px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", fontWeight: 800 }}
                >
                  {processingPayout ? "Processing UPI Transfer..." : `Disburse ₹${payoutAmountInput || "0"} via UPI ⚡`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Dispatch Offer Modal */}
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
                onClick={() => handleAcceptBooking(incomingOffer)}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", color: "#FFF", fontWeight: 800, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)" }}
              >
                ✓ Accept Job ({offerCountdown}s) 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Franchise Plan View / Upgrade Modal */}
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
    </div>
  );
}

export default VendorDashboard;
