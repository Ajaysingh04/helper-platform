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

function AdminProviders() {
  const { providers, addProvider, updateProvider, deleteProvider } = useContext(DataContext);
  const [activeRoleTab, setActiveRoleTab] = useState("vendors"); // "vendors" | "workers"
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [showModal, setShowModal] = useState(false);
  const [editingProv, setEditingProv] = useState(null);

  // Worker Management State
  const [workersList, setWorkersList] = useState(DEFAULT_WORKERS);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
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

  // Filter Providers
  const filtered = useMemo(() => {
    return providers.filter((p) => {
      // 1. Status / Tag Filter
      let matchType = true;
      if (filterType === "Verified") matchType = p.verified === true;
      else if (filterType === "Pending") matchType = p.verified === false;
      else if (filterType === "Franchise") matchType = p.franchiseActive === true;

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

      return matchType && matchSearch;
    });
  }, [providers, filterType, searchQuery]);

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
      updateProvider(editingProv.id, payload);
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
          <div className="filters-group">
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
                    <th className="col-prov-profile">Partner / Business</th>
                    <th className="col-prov-cat">Category Sector</th>
                    <th className="col-prov-rate">Hourly Charge</th>
                    <th className="col-prov-contact">Contact Phone</th>
                    <th className="col-prov-rating">Rating & Jobs</th>
                    <th className="col-prov-verify">ID Verification</th>
                    <th className="col-prov-franchise">Franchise Status</th>
                    <th className="col-prov-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProviders.map((p) => {
                    const fallbackImg = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
                    const imgSrc = p.image || p.avatar || fallbackImg;

                    return (
                      <tr key={p.id}>
                        <td className="col-prov-profile">
                          <div className="provider-cell-profile">
                            <img 
                              src={imgSrc} 
                              alt={p.name} 
                              className="provider-avatar-img"
                              onError={(e) => { e.currentTarget.src = fallbackImg; }}
                            />
                            <div>
                              <strong className="provider-name-title">{p.shopName || p.name}</strong>
                              {p.shopName && p.name && p.shopName !== p.name && (
                                <div className="provider-owner-sub">Owner: {p.name}</div>
                              )}
                              <div className="provider-address-sub">📍 {p.address || p.location || "City Center"}</div>
                            </div>
                          </div>
                        </td>

                        <td className="col-prov-cat">
                          <span className="service-sector-pill" style={{ fontSize: "12px", fontWeight: 700 }}>
                            {p.category}
                          </span>
                        </td>

                        <td className="col-prov-rate">
                          <strong className="provider-rate-tag">{p.hourlyRate || "₹299/hr"}</strong>
                        </td>

                        <td className="col-prov-contact">
                          <a href={`tel:${p.contact || p.phone}`} className="booking-cust-phone">
                            📞 {p.contact || p.phone || "—"}
                          </a>
                        </td>

                        <td className="col-prov-rating">
                          <div className="provider-rating-box">
                            <span className="provider-stars">★ {p.rating || 4.9}</span>
                            <span className="provider-jobs-count">{p.jobsDone || 0} Delivered</span>
                          </div>
                        </td>

                        <td className="col-prov-verify">
                          <button
                            type="button"
                            className={`provider-verify-toggle-btn ${p.verified ? "verified" : "pending"}`}
                            onClick={() => updateProvider(p.id, { verified: !p.verified })}
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

                        <td className="col-prov-actions">
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
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
                                  deleteProvider(p.id);
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

                return (
                  <div key={`card-${p.id}`} className="admin-order-card">
                    {/* Header: Profile & Actions */}
                    <div className="order-card-header">
                      <div className="provider-cell-profile">
                        <img 
                          src={imgSrc} 
                          alt={p.name} 
                          className="provider-avatar-img"
                          onError={(e) => { e.currentTarget.src = fallbackImg; }}
                        />
                        <div>
                          <strong className="provider-name-title">{p.shopName || p.name}</strong>
                          {p.shopName && p.name && p.shopName !== p.name && (
                            <div className="provider-owner-sub">Owner: {p.name}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
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
                              deleteProvider(p.id);
                            }
                          }}
                          title="Delete Partner"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Sector & Hourly Rate */}
                    <div className="order-card-service-row">
                      <span className="service-sector-pill" style={{ fontSize: "12px", fontWeight: 700 }}>
                        {p.category}
                      </span>
                      <strong className="provider-rate-tag">{p.hourlyRate || "₹299/hr"}</strong>
                    </div>

                    {/* Contact & Rating Row */}
                    <div className="order-card-cust-row">
                      <a href={`tel:${p.contact || p.phone}`} className="booking-cust-phone">
                        📞 {p.contact || p.phone || "—"}
                      </a>
                      <div className="provider-rating-box" style={{ alignItems: "flex-end" }}>
                        <span className="provider-stars">★ {p.rating || 4.9}</span>
                        <span className="provider-jobs-count">{p.jobsDone || 0} Delivered</span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="order-card-address">
                      <span>📍</span>
                      <span>{p.address || p.location || "City Center"}</span>
                    </div>

                    {/* Verification & Franchise Status */}
                    <div className="order-card-footer">
                      <button
                        type="button"
                        className={`provider-verify-toggle-btn ${p.verified ? "verified" : "pending"}`}
                        onClick={() => updateProvider(p.id, { verified: !p.verified })}
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

    </div>
  );
}

export default AdminProviders;

