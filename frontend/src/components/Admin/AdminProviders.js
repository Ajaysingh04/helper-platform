import React, { useContext, useState, useMemo, useEffect } from "react";
import { DataContext } from "../../context/DataContext";
import { API_BASE } from "../../apiConfig";

const DEFAULT_WORKERS = [
  {
    workerId: "WRK-101",
    id: "WRK-101",
    name: "Sunil Sharma",
    phone: "+91 98765 00101",
    category: "Plumber",
    skills: ["Pipe Leakage", "Bathroom Fitting", "Water Tank Cleaning", "Geyser Repair"],
    experienceYears: 6,
    vendorId: "vnd_101",
    vendorName: "Amritam Services Hub",
    status: "active",
    verificationStatus: "verified",
    documents: { aadhaarNumber: "8472 9012 3456", panNumber: "ABCDE1234F" },
    availability: { isOnline: true, isEmergencyAvailable: true },
    performance: { rating: 4.9, completedJobsCount: 142 },
    earnings: { totalEarnings: 42600, pendingPayout: 1800, upiId: "sunil.plumb@upi" }
  },
  {
    workerId: "WRK-102",
    id: "WRK-102",
    name: "Amit Verma",
    phone: "+91 98765 00102",
    category: "Electrician",
    skills: ["Short Circuit Fix", "MCB Box Wiring", "Inverter Installation", "Fan & Lights"],
    experienceYears: 5,
    vendorId: "vnd_101",
    vendorName: "Amritam Services Hub",
    status: "active",
    verificationStatus: "verified",
    documents: { aadhaarNumber: "7823 4561 9012", panNumber: "BGTYU7821K" },
    availability: { isOnline: true, isEmergencyAvailable: true },
    performance: { rating: 4.85, completedJobsCount: 198 },
    earnings: { totalEarnings: 58200, pendingPayout: 2400, upiId: "amit.electric@upi" }
  },
  {
    workerId: "WRK-103",
    id: "WRK-103",
    name: "Manoj Chauffeur",
    phone: "+91 98765 00103",
    category: "Driver",
    skills: ["Automatic & Manual", "City & Highway Travel", "Luxury Sedan", "Night Duty"],
    experienceYears: 8,
    vendorId: "vnd_102",
    vendorName: "Urban Fleet Pro",
    status: "active",
    verificationStatus: "verified",
    documents: { aadhaarNumber: "6512 8934 0123", panNumber: "CLKMN5541L" },
    availability: { isOnline: true, isEmergencyAvailable: false },
    performance: { rating: 4.95, completedJobsCount: 260 },
    earnings: { totalEarnings: 74000, pendingPayout: 3100, upiId: "manoj.driver@upi" }
  },
  {
    workerId: "WRK-104",
    id: "WRK-104",
    name: "Imran Khan",
    phone: "+91 98765 00104",
    category: "AC Repair",
    skills: ["AC Gas Refill", "Compressor Servicing", "Cooling Jet Wash", "Duct Cleaning"],
    experienceYears: 4,
    vendorId: "vnd_101",
    vendorName: "Amritam Services Hub",
    status: "active",
    verificationStatus: "pending",
    documents: { aadhaarNumber: "9123 4567 8901", panNumber: "DFGHJ2345M" },
    availability: { isOnline: false, isEmergencyAvailable: false },
    performance: { rating: 4.75, completedJobsCount: 88 },
    earnings: { totalEarnings: 28400, pendingPayout: 1200, upiId: "imran.ac@upi" }
  },
  {
    workerId: "WRK-105",
    id: "WRK-105",
    name: "Vikram Chauhan",
    phone: "+91 98765 00105",
    category: "Carpenter",
    skills: ["Furniture Assembly", "Door Lock Installation", "Modular Kitchen Woodwork"],
    experienceYears: 7,
    vendorId: "vnd_103",
    vendorName: "Sharma Woodcraft",
    status: "active",
    verificationStatus: "verified",
    documents: { aadhaarNumber: "4321 8765 2109", panNumber: "MNBVC9876P" },
    availability: { isOnline: true, isEmergencyAvailable: false },
    performance: { rating: 4.88, completedJobsCount: 114 },
    earnings: { totalEarnings: 39900, pendingPayout: 0, upiId: "vikram.carpenter@upi" }
  }
];


const getCategoryBadgeClass = (cat) => {
  const c = (cat || "").toLowerCase();
  if (c.includes("clean") || c.includes("pest") || c.includes("sanit")) return "cat-pill-cleaning";
  if (c.includes("electr") || c.includes("wire") || c.includes("appliance")) return "cat-pill-electrical";
  if (c.includes("plumb") || c.includes("water") || c.includes("leak")) return "cat-pill-plumbing";
  if (c.includes("banquet") || c.includes("lawn") || c.includes("event") || c.includes("wedding")) return "cat-pill-events";
  if (c.includes("gym") || c.includes("fit") || c.includes("crossfit") || c.includes("train")) return "cat-pill-fitness";
  if (c.includes("hosp") || c.includes("clinic") || c.includes("doctor") || c.includes("health")) return "cat-pill-medical";
  if (c.includes("skin") || c.includes("hair") || c.includes("derma") || c.includes("salon") || c.includes("beauty")) return "cat-pill-salon";
  return "cat-pill-default";
};

function AdminProviders() {
  const { providers, services, bookings, addProvider, updateProvider, deleteProvider } = useContext(DataContext);
  const [activeRoleTab, setActiveRoleTab] = useState("vendors"); // "vendors" | "workers"
  const [filterType, setFilterType] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All"); // "All" | "app" | "web"
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [showModal, setShowModal] = useState(false);
  const [editingProv, setEditingProv] = useState(null);

  // Partner Details & Custom Services Modal State
  const [selectedPartnerForServices, setSelectedPartnerForServices] = useState(null);
  const [partnerModalTab, setPartnerModalTab] = useState("services"); // "services" | "completed_orders" | "feedbacks"

  // Worker Management State
  const [workersList, setWorkersList] = useState(DEFAULT_WORKERS);
  const [, setLoadingWorkers] = useState(false);
  const [workerFilterType, setWorkerFilterType] = useState("All");
  const [workerSearchQuery, setWorkerSearchQuery] = useState("");
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [newWorkerForm, setNewWorkerForm] = useState({
    name: "",
    phone: "",
    category: "Plumber",
    vendorId: "vnd_101",
    vendorName: "Amritam Services Hub",
    experienceYears: 3,
    hourlyRate: 350
  });

  // Fetch Workers from API
  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const res = await fetch(`${API_BASE}/api/workers`);
      const data = await res.json();
      if (data.success && Array.isArray(data.workers) && data.workers.length > 0) {
        setWorkersList(data.workers);
      }
    } catch (e) {
      console.warn("fetchWorkers fallback to seed:", e);
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleVerifyWorker = async (workerId, newStatus) => {
    try {
      await fetch(`${API_BASE}/api/workers/${workerId}/verification`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
    setWorkersList(prev => prev.map(w => (w.workerId === workerId || w.id === workerId) ? { ...w, verificationStatus: newStatus } : w));
  };

  const handleToggleWorkerStatus = async (workerId, newStatus) => {
    try {
      await fetch(`${API_BASE}/api/workers/${workerId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
    setWorkersList(prev => prev.map(w => (w.workerId === workerId || w.id === workerId) ? { ...w, status: newStatus } : w));
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    const createdWorker = {
      workerId: `WRK-${Date.now().toString().slice(-4)}`,
      id: `WRK-${Date.now().toString().slice(-4)}`,
      ...newWorkerForm,
      status: "active",
      verificationStatus: "verified",
      documents: { aadhaarNumber: "8765 4321 0987", panNumber: "ABCDE1234F" },
      availability: { isOnline: true, isEmergencyAvailable: true },
      performance: { rating: 5.0, completedJobsCount: 0 },
      earnings: { totalEarnings: 0, pendingPayout: 0, upiId: `${newWorkerForm.phone.replace(/[^0-9]/g, "").slice(-10)}@upi` }
    };

    try {
      const res = await fetch(`${API_BASE}/api/workers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWorkerForm)
      });
      const data = await res.json();
      if (data.success && data.worker) {
        setWorkersList(prev => [data.worker, ...prev]);
      } else {
        setWorkersList(prev => [createdWorker, ...prev]);
      }
    } catch (e) {
      setWorkersList(prev => [createdWorker, ...prev]);
    }
    setShowWorkerModal(false);
    setNewWorkerForm({ name: "", phone: "", category: "Plumber", vendorId: "vnd_101", vendorName: "Amritam Services Hub", experienceYears: 3, hourlyRate: 350 });
  };

  // Form states
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState("Electrician");
  const [contact, setContact] = useState("+91 ");
  const [hourlyRate, setHourlyRate] = useState("₹299/hr");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState("");
  const [verified, setVerified] = useState(true);
  const [franchiseActive, setFranchiseActive] = useState(false);
  const [franchisePlan, setFranchisePlan] = useState("monthly");

  // Summary Metrics
  const totalCount = providers.length;
  const verifiedCount = providers.filter((p) => p.verified).length;
  const pendingCount = providers.filter((p) => !p.verified).length;
  const franchiseCount = providers.filter((p) => p.franchiseActive).length;
  const totalJobsDone = providers.reduce((sum, p) => sum + (p.jobsDone || 0), 0);

  const getProviderPlatform = (p) => {
    if (p.source === "app" || p.source === "mobile" || p.platform === "app" || p.platform === "mobile") return "app";
    if (p.source === "web" || p.platform === "web") return "web";
    if (p.email?.includes("gmail.com") && p.phone) return "app";
    return "web";
  };

  const getPartnerServices = (p) => {
    if (Array.isArray(p.customServices) && p.customServices.length > 0) return p.customServices;
    const pId = String(p.id || p._id || "");
    const pName = (p.name || "").toLowerCase().trim();
    const pShop = (p.shopName || "").toLowerCase().trim();
    const pCat = (p.category || "").toLowerCase().trim();
    const matched = (services || []).filter((s) => {
      const sProvId = String(s.providerId || "");
      const sProvName = (s.providerName || "").toLowerCase().trim();
      const sCat = (s.category || s.tag || "").toLowerCase().trim();
      return (
        (sProvId && sProvId === pId) ||
        (pName && sProvName && sProvName.includes(pName)) ||
        (pShop && sProvName && sProvName.includes(pShop)) ||
        (pCat && sCat && (sCat === pCat || pCat.includes(sCat) || sCat.includes(pCat)))
      );
    });
    if (matched.length > 0) return matched;
    return [
      {
        id: `srv_${p.id || 1}`,
        name: `${p.category || "Specialist"} Inspection & Diagnostics`,
        category: p.category || "General",
        price: p.hourlyRate || "₹299",
        originalPrice: "₹499",
        duration: "45 mins",
        rating: p.rating || 4.9,
        image: p.image || p.avatar || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600",
        description: `Full diagnostics, genuine equipment inspection and doorstep delivery by ${p.shopName || p.name}.`
      }
    ];
  };

  const getPartnerCompletedBookings = (p) => {
    if (Array.isArray(p.completedBookings) && p.completedBookings.length > 0) return p.completedBookings;
    const pId = String(p.id || p._id || "");
    const pName = (p.name || "").toLowerCase().trim();
    const pShop = (p.shopName || "").toLowerCase().trim();
    const matched = (bookings || []).filter((b) => {
      const isCompleted = ["completed", "paid", "work_completed"].includes((b.status || "").toLowerCase());
      const matchProv =
        String(b.providerId) === pId ||
        String(b.provider) === pId ||
        (b.assignedProvider && (b.assignedProvider.toLowerCase().includes(pName) || b.assignedProvider.toLowerCase().includes(pShop))) ||
        (b.assignedProviderName && (b.assignedProviderName.toLowerCase().includes(pName) || b.assignedProviderName.toLowerCase().includes(pShop))) ||
        (b.provider && (b.provider.toLowerCase().includes(pName) || b.provider.toLowerCase().includes(pShop)));
      return isCompleted && matchProv;
    });
    if (matched.length > 0) return matched;
    const count = p.jobsDone || p.jobsCompleted || 0;
    if (count > 0) {
      return Array.from({ length: Math.min(count, 3) }, (_, i) => ({
        id: `BK-DELIV-${p.id || 100}-${i + 1}`,
        customerName: ["Ajay Singh", "Pooja Patel", "Rahul Sharma"][i % 3],
        phone: ["9589310704", "9876500002", "9876500001"][i % 3],
        service: `${p.category || "Specialist"} Execution`,
        price: p.hourlyRate || "₹499",
        date: ["Today, 11:30 AM", "Yesterday, 04:00 PM", "18 Nov, 02:15 PM"][i % 3],
        status: "Completed",
        feedback: ["Timely arrival, very polite and neat work!", "Fixed the issue in 20 mins, highly recommended.", "Great service, transparent pricing."][i % 3],
        rating: 5
      }));
    }
    return [];
  };

  const appProvidersCount = providers.filter((p) => getProviderPlatform(p) === "app").length;
  const webProvidersCount = providers.filter((p) => getProviderPlatform(p) === "web").length;

  // Filter Providers
  const filtered = useMemo(() => {
    return providers.filter((p) => {
      // 1. Status / Tag Filter
      let matchType = true;
      if (filterType === "Verified") matchType = p.verified === true;
      else if (filterType === "Pending") matchType = p.verified === false;
      else if (filterType === "Franchise") matchType = p.franchiseActive === true;

      // Platform Filter
      const pPlatform = getProviderPlatform(p);
      const matchPlatform =
        platformFilter === "All" ||
        (platformFilter === "app" && pPlatform === "app") ||
        (platformFilter === "web" && pPlatform === "web");

      // 2. Search Query Filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.shopName && p.shopName.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.contact && p.contact.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q));

      return matchType && matchPlatform && matchSearch;
    });
  }, [providers, filterType, platformFilter, searchQuery]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginatedProviders = filtered.slice(startIndex, endIndex);

  const goToPage = (page) => {
    const target = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(target);
    const elem = document.getElementById("providers-management-header");
    if (elem) {
      const topOffset = elem.getBoundingClientRect().top + window.pageYOffset - 85;
      window.scrollTo({ top: Math.max(0, topOffset), left: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages];
  };

  const openAdd = () => {
    setEditingProv(null);
    setName("");
    setShopName("");
    setCategory("Electrician");
    setContact("+91 ");
    setHourlyRate("₹299/hr");
    setAddress("Metro Zone, City Center");
    setImage("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600");
    setVerified(true);
    setFranchiseActive(false);
    setFranchisePlan("monthly");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProv(p);
    setName(p.name || "");
    setShopName(p.shopName || "");
    setCategory(p.category || "Electrician");
    setContact(p.contact || p.phone || "+91 ");
    setHourlyRate(p.hourlyRate || "₹299/hr");
    setAddress(p.address || p.location || "");
    setImage(p.image || p.avatar || "");
    setVerified(p.verified !== false);
    setFranchiseActive(Boolean(p.franchiseActive));
    setFranchisePlan(p.franchisePlan || "monthly");
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      shopName: shopName.trim() || `${name.trim()}'s Services`,
      category: category.trim(),
      contact: contact.trim(),
      phone: contact.trim(),
      hourlyRate: hourlyRate.trim(),
      address: address.trim(),
      location: address.trim(),
      image: image.trim() || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600",
      avatar: image.trim() || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600",
      verified,
      franchiseActive,
      franchisePlan,
      franchiseAmount: franchisePlan === "annual" ? 500000 : 4000
    };

    if (editingProv) {
      updateProvider(editingProv.id || editingProv._id, payload);
    } else {
      addProvider({
        ...payload,
        id: `vdr_${Date.now()}`,
        rating: 5.0,
        jobsDone: 0,
        status: "Active"
      });
    }
    setShowModal(false);
    setCurrentPage(1);
  };

  // Filtered workers list
  const filteredWorkers = useMemo(() => {
    return workersList.filter((w) => {
      let matchType = true;
      if (workerFilterType === "Verified") matchType = w.verificationStatus === "verified";
      else if (workerFilterType === "Pending") matchType = w.verificationStatus === "pending";
      else if (workerFilterType === "Online") matchType = w.availability?.isOnline === true;
      else if (workerFilterType === "Suspended") matchType = w.status === "suspended";

      const q = workerSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (w.name && w.name.toLowerCase().includes(q)) ||
        (w.category && w.category.toLowerCase().includes(q)) ||
        (w.phone && w.phone.toLowerCase().includes(q)) ||
        (w.vendorName && w.vendorName.toLowerCase().includes(q)) ||
        (w.workerId && w.workerId.toLowerCase().includes(q));

      return matchType && matchSearch;
    });
  }, [workersList, workerFilterType, workerSearchQuery]);

  return (
    <div className="admin-providers-tab animate-fade-in" id="providers-management-header">
      
      {/* Top Role Segment Switcher: Vendors vs Workers */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setActiveRoleTab("vendors")}
          style={{
            padding: "12px 24px",
            borderRadius: "12px",
            fontWeight: 800,
            fontSize: "14px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: activeRoleTab === "vendors" ? "linear-gradient(135deg, #FF4D2D 0%, #FF8C38 100%)" : "rgba(255, 255, 255, 0.05)",
            color: activeRoleTab === "vendors" ? "#FFFFFF" : "var(--text-main)",
            border: activeRoleTab === "vendors" ? "1px solid #FF4D2D" : "1px solid rgba(148, 163, 184, 0.2)",
            boxShadow: activeRoleTab === "vendors" ? "0 4px 14px rgba(255, 77, 45, 0.35)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          <span>🏪</span>
          <span>Vendors & Franchise Shops ({providers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveRoleTab("workers")}
          style={{
            padding: "12px 24px",
            borderRadius: "12px",
            fontWeight: 800,
            fontSize: "14px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: activeRoleTab === "workers" ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" : "rgba(255, 255, 255, 0.05)",
            color: activeRoleTab === "workers" ? "#FFFFFF" : "var(--text-main)",
            border: activeRoleTab === "workers" ? "1px solid #10B981" : "1px solid rgba(148, 163, 184, 0.2)",
            boxShadow: activeRoleTab === "workers" ? "0 4px 14px rgba(16, 185, 129, 0.35)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          <span>👷</span>
          <span>Field Technicians & Workers Fleet ({workersList.length})</span>
          <span style={{ fontSize: "10px", padding: "2px 7px", background: activeRoleTab === "workers" ? "rgba(255,255,255,0.25)" : "rgba(16, 185, 129, 0.2)", color: activeRoleTab === "workers" ? "#FFF" : "#10B981", borderRadius: "10px", fontWeight: 800 }}>LIVE ⚡</span>
        </button>
      </div>

      {activeRoleTab === "vendors" ? (
        <>
          {/* Top Stat Summary Grid */}
          <div className="admin-stats-summary-grid">
            <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366F1" }}>
            👥
          </div>
          <div>
            <div className="summary-card-num">{totalCount}</div>
            <div className="summary-card-label">Total Registered Partners</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
            🛡️
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#10B981" }}>{verifiedCount}</div>
            <div className="summary-card-label">100% ID Verified Pros</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#D97706" }}>
            ⏳
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#D97706" }}>{pendingCount}</div>
            <div className="summary-card-label">Pending Document Checks</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(255, 77, 45, 0.12)", color: "#FF4D2D" }}>
            👑
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#FF4D2D" }}>{franchiseCount}</div>
            <div className="summary-card-label">Franchise Elite Partners</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(147, 51, 234, 0.12)", color: "#9333EA" }}>
            ⭐
          </div>
          <div>
            <div className="summary-card-num">{totalJobsDone}+</div>
            <div className="summary-card-label">Customer Orders Fulfilled</div>
          </div>
        </div>
      </div>

      {/* Main Providers Section */}
      <div className="admin-card-section">
        
        {/* Header Row */}
        <div className="admin-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>Verified Service Providers & Partners</h3>
              <span className="admin-count-pill">
                Page {safeCurrentPage} of {totalPages} ({filtered.length} Pros)
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0" }}>
              Manage background-checked local experts, franchise plans, and real-time live dispatches
            </p>
          </div>

          <button className="btn-primary-glow" onClick={openAdd}>
            <span>+</span> <span>Register New Partner</span>
          </button>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="table-controls-bar">
          <div className="search-box-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by partner name, business, category, phone, or city..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Segmented Filter Tabs with Live Badges */}
          <div className="filters-group" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* Platform Filter */}
            <div className="segmented-control">
              <button 
                type="button"
                className={`seg-all ${platformFilter === "All" ? "active" : ""}`}
                onClick={() => {
                  setPlatformFilter("All");
                  setCurrentPage(1);
                }}
              >
                <span>All Sources</span>
              </button>
              <button 
                type="button"
                className={`seg-active ${platformFilter === "app" ? "active" : ""}`}
                onClick={() => {
                  setPlatformFilter("app");
                  setCurrentPage(1);
                }}
              >
                <span>📱 App ({appProvidersCount})</span>
              </button>
              <button 
                type="button"
                className={`seg-inactive ${platformFilter === "web" ? "active" : ""}`}
                onClick={() => {
                  setPlatformFilter("web");
                  setCurrentPage(1);
                }}
              >
                <span>🌐 Web ({webProvidersCount})</span>
              </button>
            </div>

            <div className="segmented-control">
              {[
                { id: "All", label: "All Pros", count: totalCount, icon: "👥" },
                { id: "Verified", label: "Verified", count: verifiedCount, icon: "🛡️" },
                { id: "Pending", label: "Pending ID", count: pendingCount, icon: "⏳" },
                { id: "Franchise", label: "Franchise Elite", count: franchiseCount, icon: "👑" }
              ].map((st) => {
                const isActive = filterType === st.id;
                let specificClass = "";
                if (st.id === "All") specificClass = "seg-all";
                else if (st.id === "Verified") specificClass = "seg-verified";
                else if (st.id === "Pending") specificClass = "seg-pending";
                else if (st.id === "Franchise") specificClass = "seg-franchise";

                return (
                  <button
                    key={st.id}
                    type="button"
                    className={`${isActive ? "active" : ""} ${specificClass}`}
                    onClick={() => {
                      setFilterType(st.id);
                      setCurrentPage(1);
                    }}
                  >
                    <span>{st.icon}</span>
                    <span>{st.label}</span>
                    {isActive && (st.id === "Verified" || st.id === "Franchise") && (
                      <span className="seg-live-dot" />
                    )}
                    <span className="seg-count-badge">{st.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Providers Table / Cards */}
        {filtered.length === 0 ? (
          <div className="admin-empty-state">
            <span style={{ fontSize: "42px" }}>🔍</span>
            <h4>No matching service partners found</h4>
            <p>Try searching with another keyword or reset the filter.</p>
            <button
              className="btn-secondary-outline"
              onClick={() => {
                setSearchQuery("");
                setFilterType("All");
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Visible > 992px) */}
            <div className="admin-table-container admin-desktop-table-view">
                            <table className="admin-table providers-table">
                <thead>
                  <tr>
                    <th className="col-prov-profile">Partner / Business Hub</th>
                    <th className="col-prov-platform">Platform</th>
                    <th className="col-prov-cat">Category Sector</th>
                    <th className="col-prov-services">Services Catalog</th>
                    <th className="col-prov-rate">Rate & Share</th>
                    <th className="col-prov-contact">Contact Phone</th>
                    <th className="col-prov-rating">Performance & Orders</th>
                    <th className="col-prov-verify">ID Verification</th>
                    <th className="col-prov-franchise">Franchise Tier</th>
                    <th className="col-prov-status">Account Status</th>
                    <th className="col-prov-actions" style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProviders.map((p) => {
                    const fallbackImg = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
                    const imgSrc = p.image || p.avatar || fallbackImg;
                    const plat = getProviderPlatform(p);
                    const partnerServices = getPartnerServices(p);
                    const completedBookings = getPartnerCompletedBookings(p);

                    return (
                                            <tr key={p.id || p._id}>
                        <td className="col-prov-profile">
                          <div className="provider-cell-profile">
                            <img 
                              src={imgSrc} 
                              alt={p.name} 
                              className="provider-avatar-img"
                              onError={(e) => { e.currentTarget.src = fallbackImg; }}
                            />
                            <div className="provider-info-wrap">
                              <strong className="provider-name-title">{p.shopName || p.name}</strong>
                              {p.shopName && p.name && p.shopName !== p.name && (
                                <div className="provider-owner-sub">
                                  <span style={{ opacity: 0.75 }}>Owner:</span> {p.name}
                                </div>
                              )}
                              <div className="provider-address-sub">
                                <span>📍</span>
                                <span>{p.address || p.location || "City Center"}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="col-prov-platform">
                          <span className={`platform-pill ${plat === "app" ? "app" : "web"}`}>
                            {plat === "app" ? "📱 Mobile App" : "🌐 Website"}
                          </span>
                        </td>

                        <td className="col-prov-cat">
                          <span className={`service-sector-pill ${getCategoryBadgeClass(p.category)}`}>
                            {p.category || "General Services"}
                          </span>
                        </td>

                        <td className="col-prov-services">
                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedPartnerForServices(p);
                              setPartnerModalTab("services");
                            }}
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              borderRadius: "20px",
                              border: "1px solid rgba(255, 77, 45, 0.35)",
                              background: "rgba(255, 77, 45, 0.08)",
                              color: "#FF4D2D",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              whiteSpace: "nowrap"
                            }}
                            title="Click to view added services, prices, images & descriptions"
                          >
                            <span>🏷️</span>
                            <span>Services ({partnerServices.length})</span>
                          </button>
                        </td>

                        <td className="col-prov-rate">
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <strong className="provider-rate-tag">{p.hourlyRate || "₹299 onwards"}</strong>
                            <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>90% Payout</span>
                          </div>
                        </td>

                        <td className="col-prov-contact">
                          <a href={`tel:${p.contact || p.phone}`} className="booking-cust-phone" title="Click to call partner">
                            📞 {p.contact || p.phone || "—"}
                          </a>
                        </td>

                        <td className="col-prov-rating">
                          <div className="provider-rating-box">
                            <span className="provider-stars">★ {p.rating || 4.9}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedPartnerForServices(p);
                                setPartnerModalTab("completed_orders");
                              }}
                              style={{
                                background: "rgba(16, 185, 129, 0.12)",
                                border: "1px solid rgba(16, 185, 129, 0.25)",
                                color: "#059669",
                                padding: "3px 8px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: 700,
                                cursor: "pointer",
                                marginTop: "2px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                              title="Click to view completed bookings analytics"
                            >
                              📦 {completedBookings.length || p.jobsDone || p.jobsCompleted || 0} Delivered
                            </button>
                          </div>
                        </td>

                        <td className="col-prov-verify">
                          <button
                            type="button"
                            className={`provider-verify-toggle-btn ${p.verified ? "verified" : "pending"}`}
                            onClick={() => updateProvider(p.id || p._id, { verified: !p.verified })}
                            title="Click to toggle ID verification status"
                          >
                            {p.verified ? "🛡️ Verified" : "⏳ Pending ID"}
                          </button>
                        </td>

                        <td className="col-prov-franchise">
                          {p.franchiseActive ? (
                            <span className="provider-franchise-badge active">
                              👑 {p.franchisePlan === "annual" ? "₹5L / yr" : "₹4k / mo"}
                            </span>
                          ) : (
                            <span className="provider-franchise-badge standard">
                              Standard
                            </span>
                          )}
                        </td>

                        <td className="col-prov-status">
                          <span className={`status-pill ${p.status === "Suspended" || p.isBlocked ? "status-suspended" : "status-active"}`}>
                            <span style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              background: p.status === "Suspended" || p.isBlocked ? "#EF4444" : "#10B981",
                              display: "inline-block"
                            }} />
                            {p.status === "Suspended" || p.isBlocked ? "Suspended" : "Active"}
                          </span>
                        </td>

                        <td className="col-prov-actions">
                          <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "flex-end" }}>
                            <button 
                              type="button"
                              className={`table-action-btn status-toggle ${p.status === "Suspended" || p.isBlocked ? "activate" : "suspend"}`}
                              onClick={() => {
                                const willSuspend = p.status !== "Suspended" && !p.isBlocked;
                                updateProvider(p.id || p._id, {
                                  status: willSuspend ? "Suspended" : "Active",
                                  isBlocked: willSuspend
                                });
                              }}
                              title={p.status === "Suspended" || p.isBlocked ? "Activate Partner Hub" : "Suspend / Block Partner Hub"}
                              style={{
                                padding: "6px 10px",
                                fontSize: "12px",
                                fontWeight: 700,
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                background: p.status === "Suspended" || p.isBlocked ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                                color: p.status === "Suspended" || p.isBlocked ? "#10B981" : "#EF4444",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              {p.status === "Suspended" || p.isBlocked ? "✓ Activate" : "🚫 Suspend"}
                            </button>
                            <button 
                              type="button"
                              className="btn-card-action edit icon-only"
                              onClick={() => openEdit(p)}
                              title={`Edit ${p.name}`}
                            >
                              ✏️
                            </button>
                            <button 
                              type="button"
                              className="btn-card-action delete icon-only"
                              onClick={() => {
                                if (window.confirm(`Remove provider "${p.name}" from platform?`)) {
                                  deleteProvider(p.id || p._id);
                                }
                              }}
                              title={`Delete ${p.name}`}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card Grid View (Visible <= 992px) */}
            <div className="admin-mobile-cards-view">
              {paginatedProviders.map((p) => {
                const fallbackImg = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
                const imgSrc = p.image || p.avatar || fallbackImg;
                const plat = getProviderPlatform(p);
                const partnerServices = getPartnerServices(p);
                const completedBookings = getPartnerCompletedBookings(p);

                return (
                  <div key={`card-${p.id || p._id}`} className="admin-order-card" style={{
                    borderRadius: "18px",
                    padding: "18px",
                    border: "1px solid var(--border-color, #E2E8F0)",
                    background: "var(--bg-card, #FFFFFF)",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                    marginBottom: "14px"
                  }}>
                    {/* Header: Profile & Quick Actions */}
                    <div className="order-card-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
                      <div className="provider-cell-profile" style={{ flex: 1, minWidth: 0 }}>
                        <img 
                          src={imgSrc} 
                          alt={p.name} 
                          className="provider-avatar-img"
                          onError={(e) => { e.currentTarget.src = fallbackImg; }}
                        />
                        <div className="provider-info-wrap">
                          <strong className="provider-name-title" style={{ fontSize: "15px" }}>{p.shopName || p.name}</strong>
                          {p.shopName && p.name && p.shopName !== p.name && (
                            <div className="provider-owner-sub">Owner: {p.name}</div>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                            <span className={`platform-pill ${plat === "app" ? "app" : "web"}`}>
                              {plat === "app" ? "📱 App" : "🌐 Web"}
                            </span>
                            <span className="provider-address-sub">
                              <span>📍</span>
                              <span>{p.address || p.location || "City Center"}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                        <button 
                          type="button"
                          className="btn-card-action edit icon-only"
                          onClick={() => openEdit(p)}
                          title={`Edit ${p.name}`}
                        >
                          ✏️
                        </button>
                        <button 
                          type="button"
                          className="btn-card-action delete icon-only"
                          onClick={() => {
                            if (window.confirm(`Remove provider "${p.name}" from platform?`)) {
                              deleteProvider(p.id || p._id);
                            }
                          }}
                          title="Delete Partner"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Sector, Rate & Services Button Row */}
                    <div className="order-card-service-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", margin: "10px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={`service-sector-pill ${getCategoryBadgeClass(p.category)}`}>
                          {p.category}
                        </span>
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedPartnerForServices(p);
                            setPartnerModalTab("services");
                          }}
                          style={{
                            padding: "4px 10px",
                            fontSize: "11px",
                            fontWeight: 700,
                            borderRadius: "14px",
                            border: "1px solid rgba(255, 77, 45, 0.35)",
                            background: "rgba(255, 77, 45, 0.08)",
                            color: "#FF4D2D",
                            cursor: "pointer"
                          }}
                        >
                          🏷️ {partnerServices.length} Services
                        </button>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong className="provider-rate-tag">{p.hourlyRate || "₹299/hr"}</strong>
                        <div style={{ fontSize: "10.5px", color: "#10B981", fontWeight: 700 }}>90% Payout</div>
                      </div>
                    </div>

                    {/* Contact & Rating Row */}
                    <div className="order-card-cust-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "10px 0" }}>
                      <a href={`tel:${p.contact || p.phone}`} className="booking-cust-phone">
                        📞 {p.contact || p.phone || "—"}
                      </a>
                      <div className="provider-rating-box" style={{ alignItems: "flex-end" }}>
                        <span className="provider-stars">★ {p.rating || 4.9}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedPartnerForServices(p);
                            setPartnerModalTab("completed_orders");
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#059669",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                            textDecoration: "underline"
                          }}
                        >
                          📦 {completedBookings.length || p.jobsDone || 0} Delivered
                        </button>
                      </div>
                    </div>

                    {/* Verification & Suspend Actions Footer */}
                    <div className="order-card-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-color, #E2E8F0)", gap: "10px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          type="button"
                          className={`provider-verify-toggle-btn ${p.verified ? "verified" : "pending"}`}
                          onClick={() => updateProvider(p.id || p._id, { verified: !p.verified })}
                          title="Click to toggle ID verification status"
                        >
                          {p.verified ? "🛡️ Verified" : "⏳ Pending ID"}
                        </button>

                        {p.franchiseActive ? (
                          <span className="provider-franchise-badge active">
                            👑 {p.franchisePlan === "annual" ? "₹5L / yr" : "₹4k / mo"}
                          </span>
                        ) : (
                          <span className="provider-franchise-badge standard">
                            Standard Partner
                          </span>
                        )}
                      </div>

                      <button 
                        type="button"
                        className={`table-action-btn status-toggle ${p.status === "Suspended" || p.isBlocked ? "activate" : "suspend"}`}
                        onClick={() => {
                          const willSuspend = p.status !== "Suspended" && !p.isBlocked;
                          updateProvider(p.id || p._id, {
                            status: willSuspend ? "Suspended" : "Active",
                            isBlocked: willSuspend
                          });
                        }}
                        title={p.status === "Suspended" || p.isBlocked ? "Activate Partner Hub" : "Suspend / Block Partner Hub"}
                        style={{
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: 700,
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          background: p.status === "Suspended" || p.isBlocked ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                          color: p.status === "Suspended" || p.isBlocked ? "#10B981" : "#EF4444",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        {p.status === "Suspended" || p.isBlocked ? "✓ Activate Account" : "🚫 Suspend Account"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="admin-pagination-wrapper">
                <div className="admin-pagination-info">
                  Showing <strong>{startIndex + 1}</strong> - <strong>{endIndex}</strong> of <strong>{filtered.length}</strong> partners
                  <span className="pagination-page-indicator">
                    Page {safeCurrentPage} / {totalPages}
                  </span>
                </div>

                <div className="admin-pagination-controls">
                  {/* Items per page selector */}
                  <div className="items-per-page-select-wrapper">
                    <span>Show:</span>
                    <select 
                      value={itemsPerPage} 
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="admin-per-page-select"
                    >
                      <option value={8}>8 / page</option>
                      <option value={12}>12 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>

                  {/* First button */}
                  <button
                    type="button"
                    className="btn-pagination nav-btn"
                    onClick={() => goToPage(1)}
                    disabled={safeCurrentPage === 1}
                    title="First Page"
                  >
                    « First
                  </button>

                  {/* Prev button */}
                  <button
                    type="button"
                    className="btn-pagination nav-btn"
                    onClick={() => goToPage(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    title="Previous Page"
                  >
                    ‹ Prev
                  </button>

                  {/* Page number buttons */}
                  <div className="pagination-numbers-list">
                    {getPageNumbers().map((num, idx) => {
                      if (num === "...") {
                        return <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>;
                      }
                      const isActive = num === safeCurrentPage;
                      return (
                        <button
                          key={num}
                          type="button"
                          className={`btn-pagination num-btn ${isActive ? "active" : ""}`}
                          onClick={() => goToPage(num)}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next button */}
                  <button
                    type="button"
                    className="btn-pagination nav-btn"
                    onClick={() => goToPage(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    title="Next Page"
                  >
                    Next ›
                  </button>

                  {/* Last button */}
                  <button
                    type="button"
                    className="btn-pagination nav-btn"
                    onClick={() => goToPage(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    title="Last Page"
                  >
                    Last »
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </>
  ) : (
    /* Workers & Technicians Fleet Management View */
    <>
      {/* Worker Fleet Stats Grid */}
      <div className="admin-stats-summary-grid">
        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
            👷
          </div>
          <div>
            <div className="summary-card-num">{workersList.length}</div>
            <div className="summary-card-label">Total Field Workers</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(34, 197, 94, 0.12)", color: "#22C55E" }}>
            🟢
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#22C55E" }}>
              {workersList.filter(w => w.availability?.isOnline !== false).length}
            </div>
            <div className="summary-card-label">Online On-Duty</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366F1" }}>
            🛡️
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#6366F1" }}>
              {workersList.filter(w => w.verificationStatus === "verified").length}
            </div>
            <div className="summary-card-label">KYC Verified ID</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#D97706" }}>
            ⏳
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#D97706" }}>
              {workersList.filter(w => w.verificationStatus === "pending").length}
            </div>
            <div className="summary-card-label">Pending Approval</div>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="summary-card-icon" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#EF4444" }}>
            🚫
          </div>
          <div>
            <div className="summary-card-num" style={{ color: "#EF4444" }}>
              {workersList.filter(w => w.status === "suspended").length}
            </div>
            <div className="summary-card-label">Suspended Accounts</div>
          </div>
        </div>
      </div>

      {/* Main Workers Card Section */}
      <div className="admin-card-section">
        
        {/* Header Row */}
        <div className="admin-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>Field Workforce & Technician Operations</h3>
              <span className="admin-count-pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                {filteredWorkers.length} Technicians Active
              </span>
            </div>
            <p style={{ margin: "4px 0 0 0" }}>
              Monitor field technicians across Plumber, Electrician, Chauffeur, AC Tech, Cleaner, Chef, Doctor & Carpenter trades
            </p>
          </div>

          <button 
            className="btn-primary-glow" 
            style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)" }}
            onClick={() => setShowWorkerModal(true)}
          >
            <span>+</span> <span>Register Field Worker</span>
          </button>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="table-controls-bar">
          <div className="search-box-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by worker name, category/trade, mobile, or vendor shop..."
              value={workerSearchQuery}
              onChange={(e) => setWorkerSearchQuery(e.target.value)}
            />
            {workerSearchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setWorkerSearchQuery("")}
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Segmented Filter Tabs */}
          <div className="filters-group">
            <div className="segmented-control">
              {[
                { id: "All", label: "All Fleet", count: workersList.length, icon: "👷" },
                { id: "Online", label: "Online", count: workersList.filter(w => w.availability?.isOnline !== false).length, icon: "🟢" },
                { id: "Verified", label: "KYC Verified", count: workersList.filter(w => w.verificationStatus === "verified").length, icon: "🛡️" },
                { id: "Pending", label: "Pending KYC", count: workersList.filter(w => w.verificationStatus === "pending").length, icon: "⏳" },
                { id: "Suspended", label: "Suspended", count: workersList.filter(w => w.status === "suspended").length, icon: "🚫" }
              ].map((st) => {
                const isActive = workerFilterType === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    className={isActive ? "active" : ""}
                    onClick={() => setWorkerFilterType(st.id)}
                  >
                    <span>{st.icon}</span>
                    <span>{st.label}</span>
                    <span className="seg-count-badge">{st.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Worker Table */}
        {filteredWorkers.length === 0 ? (
          <div className="admin-empty-state">
            <span style={{ fontSize: "42px" }}>👷</span>
            <h4>No field workers found matching criteria</h4>
            <p>Try searching another keyword or resetting the filter.</p>
            <button
              className="btn-secondary-outline"
              onClick={() => {
                setWorkerSearchQuery("");
                setWorkerFilterType("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Worker Specialist</th>
                  <th>Trade & Skills</th>
                  <th>Vendor Franchise</th>
                  <th>ID Verification (KYC)</th>
                  <th>Live Duty</th>
                  <th>Rating & Jobs</th>
                  <th>90% Net Payout</th>
                  <th>Account Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((w) => {
                  const isVerified = w.verificationStatus === "verified";
                  const isOnline = w.availability?.isOnline !== false;
                  const isSuspended = w.status === "suspended";

                  return (
                    <tr key={w.workerId || w.id}>
                      {/* Specialist Info */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div 
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "10px",
                              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                              fontWeight: 800,
                              color: "#10B981"
                            }}
                          >
                            {w.name ? w.name.charAt(0).toUpperCase() : "W"}
                          </div>
                          <div>
                            <strong style={{ fontSize: "14px", display: "block" }}>{w.name}</strong>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                              📞 {w.phone} • {w.workerId || w.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Trade & Category */}
                      <td>
                        <div>
                          <span style={{ fontSize: "12px", fontWeight: 700, padding: "2px 8px", background: "rgba(99, 102, 241, 0.1)", color: "#6366F1", borderRadius: "6px" }}>
                            {w.category || "Technician"}
                          </span>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                            {w.skills && Array.isArray(w.skills) ? w.skills.slice(0, 2).join(", ") : `${w.experienceYears || 3}+ yrs exp`}
                          </div>
                        </div>
                      </td>

                      {/* Vendor Franchise */}
                      <td>
                        <div>
                          <strong style={{ fontSize: "12.5px" }}>{w.vendorName || "Amritam Services Hub"}</strong>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Franchise Verified</div>
                        </div>
                      </td>

                      {/* KYC Verification */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span 
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "8px",
                              width: "fit-content",
                              background: isVerified ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                              color: isVerified ? "#10B981" : "#D97706"
                            }}
                          >
                            {isVerified ? "✓ Verified ID" : "⏳ Pending Review"}
                          </span>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                            Aadhaar: {w.documents?.aadhaarNumber ? `••• ${w.documents.aadhaarNumber.slice(-4)}` : "Verified"}
                          </span>
                        </div>
                      </td>

                      {/* Live Duty */}
                      <td>
                        <span 
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            color: isOnline ? "#10B981" : "var(--text-muted)"
                          }}
                        >
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isOnline ? "#10B981" : "#94A3B8" }} />
                          {isOnline ? "Online (Ready)" : "Offline"}
                        </span>
                      </td>

                      {/* Rating & Jobs */}
                      <td>
                        <div>
                          <span style={{ fontWeight: 800, color: "#F59E0B", fontSize: "13px" }}>
                            ★ {w.performance?.rating || 4.9}
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "4px" }}>
                            ({w.performance?.completedJobsCount || 0} jobs)
                          </span>
                        </div>
                      </td>

                      {/* 90% Net Payout */}
                      <td>
                        <div>
                          <strong style={{ color: "#10B981", fontSize: "13px" }}>
                            ₹{(w.earnings?.totalEarnings || 0).toLocaleString()}
                          </strong>
                          <div style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>
                            Due: ₹{(w.earnings?.pendingPayout || 0).toLocaleString()}
                          </div>
                        </div>
                      </td>

                      {/* Account Status */}
                      <td>
                        <span 
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: isSuspended ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            color: isSuspended ? "#EF4444" : "#10B981"
                          }}
                        >
                          {isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {!isVerified ? (
                            <button
                              type="button"
                              className="btn-action-view"
                              style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}
                              onClick={() => handleVerifyWorker(w.workerId || w.id, "verified")}
                              title="Approve Worker KYC Documents"
                            >
                              ✓ Approve
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-action-view"
                              style={{ background: "rgba(245, 158, 11, 0.12)", color: "#D97706" }}
                              onClick={() => handleVerifyWorker(w.workerId || w.id, "pending")}
                              title="Re-open Verification"
                            >
                              Revoke
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn-action-view"
                            style={{ 
                              background: isSuspended ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)", 
                              color: isSuspended ? "#10B981" : "#EF4444" 
                            }}
                            onClick={() => handleToggleWorkerStatus(w.workerId || w.id, isSuspended ? "active" : "suspended")}
                            title={isSuspended ? "Activate Worker Account" : "Suspend Worker Account"}
                          >
                            {isSuspended ? "Activate" : "Suspend"}
                          </button>

                          <button
                            type="button"
                            className="btn-action-view"
                            style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366F1" }}
                            onClick={() => {
                              localStorage.setItem("helper_worker", JSON.stringify(w));
                              window.open("/worker/dashboard", "_blank");
                            }}
                            title="Simulate / View Worker Mobile Workplace"
                          >
                            Console ↗
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </>
  )}

  {/* Add / Edit Provider Modal */}
  {showModal && (
    <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            
            <div className="modal-title-row">
              <span style={{ fontSize: "28px" }}>{editingProv ? "✏️" : "🛡️"}</span>
              <div>
                <h3 style={{ margin: 0 }}>{editingProv ? `Edit Partner: ${editingProv.name}` : "Register New Verified Partner"}</h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Partner will be immediately listed across User Booking & Search directories.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Professional Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Business / Shop Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma Express Electricals"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Primary Service Category *</label>
                  <input
                    type="text"
                    placeholder="e.g. Electrician, Plumber, Home Chef"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Contact Phone / Hotline *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Hourly / Base Rate *</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹299/hr"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>City & Operating Area *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 62, Noida"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Photo / Avatar URL (Unsplash or CDN)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              {/* Photo Preview */}
              {image && (
                <div className="modal-image-preview-box">
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Avatar Preview</span>
                  <img
                    src={image}
                    alt="Preview"
                    style={{ width: "64px", height: "64px", borderRadius: "14px", objectFit: "cover", marginTop: "6px" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              )}

              {/* Verification & Franchise Toggles */}
              <div className="admin-checkbox-group" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                  />
                  <span>🛡️ Grant 100% Background Verified Badge</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={franchiseActive}
                    onChange={(e) => setFranchiseActive(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#FF4D2D" }}
                  />
                  <span>👑 Enable Franchise Partner Privileges</span>
                </label>

                {franchiseActive && (
                  <div style={{ marginLeft: "26px", marginTop: "4px" }}>
                    <label style={{ fontSize: "12.5px", color: "var(--text-muted)", marginRight: "8px" }}>Plan Tier:</label>
                    <select
                      value={franchisePlan}
                      onChange={(e) => setFranchisePlan(e.target.value)}
                      className="admin-per-page-select"
                    >
                      <option value="monthly">Monthly Plan (₹4,000 / month)</option>
                      <option value="annual">Annual Elite Plan (₹5,00,000 / year)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-actions-group">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-glow" style={{ flex: 1 }}>
                  {editingProv ? "Save Partner Profile 💾" : "Register Partner ⚡"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Field Worker Modal */}
      {showWorkerModal && (
        <div className="admin-modal-overlay" onClick={() => setShowWorkerModal(false)}>
          <div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowWorkerModal(false)}>✕</button>
            
            <div className="modal-title-row">
              <span style={{ fontSize: "28px" }}>👷</span>
              <div>
                <h3 style={{ margin: 0 }}>Register New Field Technician</h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Add a verified specialist under a registered vendor shop with zero franchise fees.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateWorker} className="admin-modal-form">
              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Technician Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={newWorkerForm.name}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Mobile Number (For Job SMS & Login) *</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={newWorkerForm.phone}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Primary Service Trade *</label>
                  <select
                    value={newWorkerForm.category}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, category: e.target.value })}
                    className="admin-per-page-select"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                  >
                    <option value="Plumber">🔧 Plumber</option>
                    <option value="Electrician">💡 Electrician</option>
                    <option value="Driver">🚗 Driver (Chauffeur)</option>
                    <option value="AC Repair">🧊 AC Repair & Refill</option>
                    <option value="Cleaner">🧹 Home Cleaner</option>
                    <option value="Carpenter">🪚 Carpenter</option>
                    <option value="Wall Painter">🎨 Wall Painter</option>
                    <option value="Chef">👨‍🍳 Chef / Cook</option>
                    <option value="Doctor">🩺 Doctor (Home Visit)</option>
                    <option value="Nanny">👶 Nanny & Babysitter</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Assigned Vendor Franchise Shop *</label>
                  <select
                    value={newWorkerForm.vendorId}
                    onChange={(e) => {
                      const selectedProv = providers.find(p => String(p.id) === e.target.value);
                      setNewWorkerForm({
                        ...newWorkerForm,
                        vendorId: e.target.value,
                        vendorName: selectedProv?.shopName || selectedProv?.name || "Amritam Services Hub"
                      });
                    }}
                    className="admin-per-page-select"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.shopName || p.name} ({p.category || "Service"})
                      </option>
                    ))}
                    <option value="vnd_101">Amritam Services Hub (Plumber & Electrician)</option>
                    <option value="vnd_102">Urban Fleet Pro (Drivers & Transport)</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newWorkerForm.experienceYears}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, experienceYears: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Base Hourly Rate (₹)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={newWorkerForm.hourlyRate}
                    onChange={(e) => setNewWorkerForm({ ...newWorkerForm, hourlyRate: parseInt(e.target.value) || 299 })}
                  />
                </div>
              </div>

              <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#10B981", display: "block", marginBottom: "4px" }}>
                  🛡️ Zero Franchise Fee Policy & Split
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Workers are sponsored under the vendor license. On completed jobs, 90% is allocated directly to this worker and 10% to the shop vendor.
                </span>
              </div>

              <div className="modal-actions-group">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowWorkerModal(false)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary-glow" 
                  style={{ flex: 1, background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
                >
                  Onboard Worker ⚡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partner Custom Services, Completed Orders & Activity Modal */}
      {selectedPartnerForServices && (
        <div className="admin-modal-overlay" onClick={() => setSelectedPartnerForServices(null)}>
          <div
            className="admin-modal-box provider-services-modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "880px", width: "95%", maxHeight: "90vh", overflowY: "auto", borderRadius: "20px" }}
          >
            <button
              className="admin-modal-close"
              onClick={() => setSelectedPartnerForServices(null)}
              title="Close modal"
            >
              ✕
            </button>

            {/* Modal Header: Partner Banner */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingBottom: "18px", borderBottom: "1px solid var(--border-color, #E2E8F0)", marginBottom: "18px" }}>
              <img
                src={selectedPartnerForServices.image || selectedPartnerForServices.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                alt={selectedPartnerForServices.name}
                style={{ width: "64px", height: "64px", borderRadius: "18px", objectFit: "cover", border: "2px solid #E2E8F0" }}
                onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png"; }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-main)" }}>
                    {selectedPartnerForServices.shopName || selectedPartnerForServices.name}
                  </h3>
                  <span className={`platform-pill ${getProviderPlatform(selectedPartnerForServices) === "app" ? "app" : "web"}`}>
                    {getProviderPlatform(selectedPartnerForServices) === "app" ? "📱 Mobile App Partner" : "🌐 Website Partner"}
                  </span>
                  <span className={`service-sector-pill ${getCategoryBadgeClass(selectedPartnerForServices.category)}`}>
                    {selectedPartnerForServices.category}
                  </span>
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  <span>Owner: <strong>{selectedPartnerForServices.name}</strong></span>
                  <span style={{ margin: "0 8px" }}>•</span>
                  <span>📞 {selectedPartnerForServices.contact || selectedPartnerForServices.phone || "—"}</span>
                  <span style={{ margin: "0 8px" }}>•</span>
                  <span>📍 {selectedPartnerForServices.address || selectedPartnerForServices.location || "Indore"}</span>
                </div>
              </div>
            </div>

            {/* Modal Tabs Bar */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid var(--border-color, #E2E8F0)", paddingBottom: "10px" }}>
              <button
                type="button"
                className={`partner-modal-tab-btn ${partnerModalTab === "services" ? "active" : ""}`}
                onClick={() => setPartnerModalTab("services")}
              >
                🏷️ Added Services Catalog ({getPartnerServices(selectedPartnerForServices).length})
              </button>
              <button
                type="button"
                className={`partner-modal-tab-btn ${partnerModalTab === "completed_orders" ? "active" : ""}`}
                onClick={() => setPartnerModalTab("completed_orders")}
              >
                📊 Completed Orders ({getPartnerCompletedBookings(selectedPartnerForServices).length})
              </button>
              <button
                type="button"
                className={`partner-modal-tab-btn ${partnerModalTab === "feedbacks" ? "active" : ""}`}
                onClick={() => setPartnerModalTab("feedbacks")}
              >
                ⭐ Customer Feedback & Reviews
              </button>
            </div>

            {/* TAB 1: Added Services Catalog */}
            {partnerModalTab === "services" && (
              <div className="partner-services-catalog-view">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
                  {getPartnerServices(selectedPartnerForServices).map((s, idx) => (
                    <div key={`s-${s.id || idx}`} className="provider-services-card">
                      <img
                        src={s.image || selectedPartnerForServices.image || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600"}
                        alt={s.name}
                        className="provider-service-img"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600"; }}
                      />
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                            <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>{s.name}</strong>
                            <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.12)", color: "#4F46E5" }}>
                              {s.category || s.tag || selectedPartnerForServices.category}
                            </span>
                          </div>
                          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 8px 0", lineHeight: "1.4" }}>
                            {s.description || s.desc || "Doorstep service execution with 100% genuine parts and guaranteed customer satisfaction."}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px dashed var(--border-color, #E2E8F0)" }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                            <span style={{ fontSize: "16px", fontWeight: 900, color: "#FF4D2D" }}>{s.price || "₹299"}</span>
                            {s.originalPrice && (
                              <span style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "line-through" }}>{s.originalPrice}</span>
                            )}
                          </div>
                          <span style={{ fontSize: "11.5px", color: "#10B981", fontWeight: 700 }}>
                            ⏱️ {s.duration || "45 Mins"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Completed Orders Breakdown & Analytics */}
            {partnerModalTab === "completed_orders" && (
              <div className="partner-orders-analytics-view">
                {/* Metrics Summary Strip */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "18px" }}>
                  <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "14px", borderRadius: "14px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                    <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>TOTAL COMPLETED ORDERS</span>
                    <strong style={{ fontSize: "22px", color: "#10B981", fontWeight: 900 }}>
                      {getPartnerCompletedBookings(selectedPartnerForServices).length || selectedPartnerForServices.jobsDone || 0} Delivered
                    </strong>
                  </div>
                  <div style={{ background: "rgba(79, 70, 229, 0.08)", padding: "14px", borderRadius: "14px", border: "1px solid rgba(79, 70, 229, 0.2)" }}>
                    <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>ESTIMATED GROSS REVENUE</span>
                    <strong style={{ fontSize: "22px", color: "#4F46E5", fontWeight: 900 }}>
                      ₹{((getPartnerCompletedBookings(selectedPartnerForServices).length || selectedPartnerForServices.jobsDone || 1) * 499).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div style={{ background: "rgba(255, 77, 45, 0.08)", padding: "14px", borderRadius: "14px", border: "1px solid rgba(255, 77, 45, 0.2)" }}>
                    <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>90% PARTNER TAKE-HOME</span>
                    <strong style={{ fontSize: "22px", color: "#FF4D2D", fontWeight: 900 }}>
                      ₹{Math.round(((getPartnerCompletedBookings(selectedPartnerForServices).length || selectedPartnerForServices.jobsDone || 1) * 499) * 0.9).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                {/* Orders List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {getPartnerCompletedBookings(selectedPartnerForServices).map((bk, i) => (
                    <div
                      key={`co-${bk.id || i}`}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "14px",
                        background: "var(--surface-input, #F8FAFC)",
                        border: "1px solid var(--border-color, #E2E8F0)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "10px"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 800, fontSize: "14px", color: "var(--text-main)" }}>
                            {bk.service || `${selectedPartnerForServices.category} Service`}
                          </span>
                          <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 6px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.15)", color: "#059669" }}>
                            ✅ Completed
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                          <span>Customer: <strong>{bk.customerName || "Customer"}</strong> ({bk.phone || "—"})</span>
                          <span style={{ margin: "0 6px" }}>•</span>
                          <span>📅 {bk.date || "Completed Recently"}</span>
                        </div>
                        {bk.feedback && (
                          <div style={{ fontSize: "12px", color: "#4F46E5", marginTop: "4px", fontStyle: "italic" }}>
                            “{bk.feedback}” — ★★★★★
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ fontSize: "16px", color: "var(--text-main)", display: "block" }}>
                          {bk.price || "₹499"}
                        </strong>
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>
                          Door OTP Verified ✓
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Customer Feedback & Reviews */}
            {partnerModalTab === "feedbacks" && (
              <div className="partner-feedbacks-view">
                <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(255, 180, 0, 0.12) 0%, rgba(255, 77, 45, 0.08) 100%)", border: "1px solid rgba(255, 180, 0, 0.3)", marginBottom: "18px" }}>
                  <div style={{ fontSize: "36px", fontWeight: 900, color: "#D97706" }}>
                    ★ {selectedPartnerForServices.rating || 4.9}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--text-main)" }}>
                      Exceptional Customer Rating & Trust Score
                    </h4>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "var(--text-muted)" }}>
                      Based on verified doorstep execution, customer safety ratings, and door OTP handshakes.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { name: "Ajay Singh", date: "Yesterday", rating: 5, comment: "Specialist arrived sharp on scheduled time, polite behaviour and flawless installation." },
                    { name: "Pooja Patel", date: "3 Days ago", rating: 5, comment: "Quick diagnostics and very genuine billing without any hidden charges." },
                    { name: "Rahul Sharma", date: "Last week", rating: 5, comment: "Cleaned up the workspace after repair. Very satisfied with Helper platform." }
                  ].map((fb, idx) => (
                    <div key={`fb-${idx}`} style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--border-color, #E2E8F0)", background: "var(--surface-input, #F8FAFC)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                        <strong style={{ fontSize: "13.5px", color: "var(--text-main)" }}>{fb.name}</strong>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{fb.date}</span>
                      </div>
                      <div style={{ color: "#F59E0B", fontSize: "13px", marginBottom: "6px" }}>
                        {"★".repeat(fb.rating)} <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>(Verified Customer)</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-main)", lineHeight: "1.4" }}>
                        "{fb.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminProviders;

