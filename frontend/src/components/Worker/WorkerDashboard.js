import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE, SOCKET_URL } from "../../apiConfig";
import "../../css/Admin/Admin.css";
import "../../css/WorkerDashboard.css";

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
  if (cat.includes("doctor")) return "🩺";
  if (cat.includes("nanny")) return "👶";
  return "🛠️";
};

function WorkerDashboard() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [activeTab, setActiveTab] = useState("active_jobs"); // active_jobs | map_radar | history | earnings | attendance | profile
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark" || document.body.classList.contains("dark"));

  // Live stopwatch and dynamic cost for active job
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [doorOtpInput, setDoorOtpInput] = useState("");
  const [materialItemName, setMaterialItemName] = useState("");
  const [materialInput, setMaterialInput] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState("");
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scanningBookingId, setScanningBookingId] = useState(null);

  // In-App Chat Modal State
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: "customer", text: "Hello! Please ring the bell when you arrive.", time: "10:15 AM" },
    { sender: "worker", text: "Sure sir, I am on the way with verified tools.", time: "10:16 AM" }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  // Leave Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ startDate: "", endDate: "", reason: "Personal Work", type: "casual" });

  // Shift Punch-In / Punch-Out State
  const [isPunchedIn, setIsPunchedIn] = useState(() => localStorage.getItem("helper_worker_punched_in") === "true");
  const [shiftSeconds, setShiftSeconds] = useState(0);

  // Telemetry simulation for Map Radar
  const [mapTelemetry, setMapTelemetry] = useState({
    speed: 28,
    distanceKm: 2.4,
    etaMins: 11,
    heading: "North-East",
    lat: 28.6280,
    lng: 77.3653
  });

  const socketRef = useRef(null);

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

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4500);
  };

  // Load worker data on mount
  useEffect(() => {
    let activeWorker = null;
    const stored = localStorage.getItem("helper_worker");
    if (!stored) {
      // Default to Master Plumber Sunil Sharma for instant dashboard viewing
      activeWorker = {
        workerId: "WRK-101",
        id: "WRK-101",
        name: "Sunil Sharma",
        phone: "9876500101",
        category: "Plumber",
        vendorName: "Amritam Services Hub",
        status: "active",
        verificationStatus: "verified",
        rating: 4.95,
        totalJobs: 148,
        earnings: { currentBalance: 3450, totalEarned: 28900, upiId: "sunil.pro@okaxis" },
        availability: { isOnline: true, isEmergencyAvailable: true }
      };
      localStorage.setItem("helper_worker", JSON.stringify(activeWorker));
      localStorage.setItem("helper_worker_token", "wrk_demo_token_101");
    } else {
      try {
        activeWorker = JSON.parse(stored);
      } catch (e) {
        activeWorker = {
          workerId: "WRK-101",
          id: "WRK-101",
          name: "Sunil Sharma",
          phone: "9876500101",
          category: "Plumber",
          vendorName: "Amritam Services Hub",
          status: "active",
          verificationStatus: "verified",
          rating: 4.95,
          totalJobs: 148,
          earnings: { currentBalance: 3450, totalEarned: 28900, upiId: "sunil.pro@okaxis" },
          availability: { isOnline: true, isEmergencyAvailable: true }
        };
      }
    }
    setWorker(activeWorker);
    setWithdrawUpi(activeWorker.earnings?.upiId || `${activeWorker.phone?.slice(-10)}@upi`);
    fetchWorkerProfile(activeWorker.workerId || activeWorker.id || "WRK-101");
    fetchWorkerJobs(activeWorker.workerId || activeWorker.id || "WRK-101");
  }, []);

  // Stopwatch timer for active in-progress job
  useEffect(() => {
    let interval = null;
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stopwatchRunning]);

  // Shift Attendance Timer
  useEffect(() => {
    let interval = null;
    if (isPunchedIn) {
      interval = setInterval(() => {
        setShiftSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPunchedIn]);

  const formatTimer = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Socket.IO Setup
  useEffect(() => {
    if (!worker) return;
    const workerId = worker.workerId || worker.id;

    try {
      const s = io(SOCKET_URL || "http://localhost:5000", { transports: ["websocket", "polling"] });
      socketRef.current = s;

      s.on("connect", () => {
        s.emit("worker:register", { workerId });
      });

      // New Job assigned alert
      s.on("worker:new_job_alert", (data) => {
        showToast(`⚡ New Job Assigned: ${data.serviceName}!`);
        fetchWorkerJobs(workerId);
      });

      // Status updates
      s.on("worker:status_update", () => {
        fetchWorkerJobs(workerId);
      });

      // Real-time chat message
      s.on("chat:receive_message", (msg) => {
        setChatMessages((prev) => [...prev, msg]);
      });

      return () => {
        s.disconnect();
      };
    } catch (e) {
      console.warn("Socket connection warning:", e);
    }
  }, [worker]);

  // Fetch updated worker profile
  const fetchWorkerProfile = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/workers/${id}`);
      const data = await res.json();
      if (data.success && data.worker) {
        setWorker(data.worker);
        localStorage.setItem("helper_worker", JSON.stringify(data.worker));
      }
    } catch (e) {}
  };

  // Fetch worker jobs
  const fetchWorkerJobs = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/workers/${id}/jobs`);
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
        setJobs(data.jobs);
        checkActiveJobStopwatch(data.jobs);
      } else {
        fetchFallbackJobs(id);
      }
    } catch (e) {
      fetchFallbackJobs(id);
    } finally {
      setLoading(false);
    }
  };

  const fetchFallbackJobs = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings`);
      const data = await res.json();
      const all = Array.isArray(data.data) ? data.data : (Array.isArray(data.bookings) ? data.bookings : []);
      const workerJobs = all.filter(
        (b) =>
          b.assignedWorker?.workerId === id ||
          b.assignedWorker?.id === id ||
          (b.assignedWorkers || []).some((w) => w.workerId === id) ||
          b.status === "assigned"
      );
      if (workerJobs.length > 0) {
        setJobs(workerJobs);
        checkActiveJobStopwatch(workerJobs);
      } else {
        // Fallback demo active jobs
        setJobs([
          {
            _id: "demo_job_1",
            bookingCode: "HLP-78219",
            serviceName: "Bathroom Pipe Leakage & Basin Fix",
            customerName: "Vikas Malhotra",
            customerPhone: "+91 98765 43210",
            customerAddress: "Flat 402, Green Glen Heights, Sector 62, Noida",
            scheduledDate: "Today",
            scheduledTime: "11:30 AM",
            price: 499,
            workerStatus: "assigned",
            status: "assigned",
            doorOtp: "3459",
            problemDescription: "Under-sink pipe leaking and low pressure in main tap."
          },
          {
            _id: "demo_job_2",
            bookingCode: "HLP-65120",
            serviceName: "Kitchen Mixer Tap Installation",
            customerName: "Sunita Roy",
            customerPhone: "+91 98112 00998",
            customerAddress: "House 12, Block B, Preet Vihar, Delhi",
            scheduledDate: "Today",
            scheduledTime: "03:00 PM",
            price: 350,
            workerStatus: "completed",
            status: "completed",
            workerRating: 5.0,
            workerReview: "Prompt arrival and clean work! Extremely polite.",
            completionPhotos: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500"],
            workerEarningsAmount: 315,
            vendorEarningsAmount: 35
          }
        ]);
      }
    } catch (e) {}
  };

  const checkActiveJobStopwatch = (jobList) => {
    const active = jobList.find((b) => b.workerStatus === "in_progress");
    if (active) {
      setStopwatchRunning(true);
    }
  };

  // Toggle Online/Offline
  const handleToggleOnline = async () => {
    if (!worker) return;
    const workerId = worker.workerId || worker.id;
    const currentOnline = worker.availability?.isOnline !== false;
    const nextOnline = !currentOnline;

    try {
      await fetch(`${API_BASE}/api/workers/${workerId}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: nextOnline })
      });
    } catch (e) {}

    const updated = {
      ...worker,
      availability: { ...worker.availability, isOnline: nextOnline }
    };
    setWorker(updated);
    localStorage.setItem("helper_worker", JSON.stringify(updated));
    showToast(nextOnline ? "🟢 You are now ONLINE & ready for new jobs!" : "⚪ You are now OFFLINE. Shift paused.");
  };

  // Shift Punch-In / Punch-Out
  const handleTogglePunch = async () => {
    const nextState = !isPunchedIn;
    setIsPunchedIn(nextState);
    localStorage.setItem("helper_worker_punched_in", String(nextState));

    if (nextState) {
      setShiftSeconds(0);
      showToast("⏱️ Shift punched in! Working timer started.");
    } else {
      showToast(`🏁 Shift completed! Total time logged: ${formatTimer(shiftSeconds)}`);
    }

    try {
      const workerId = worker?.workerId || worker?.id;
      await fetch(`${API_BASE}/api/workers/${workerId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: nextState ? "check_in" : "check_out" })
      });
    } catch (e) {}
  };

  // Stage 1: Accept Job
  const handleAcceptJob = async (bookingId) => {
    try {
      await fetch(`${API_BASE}/api/bookings/${bookingId}/worker-accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: worker?.workerId || worker?.id })
      });
      showToast("Job accepted! Now tap 'Start Traveling' when on the way.");
      updateJobStateLocally(bookingId, { workerStatus: "accepted", status: "accepted" });
    } catch (e) {
      updateJobStateLocally(bookingId, { workerStatus: "accepted", status: "accepted" });
    }
  };

  // Stage 2: Start Traveling
  const handleStartTraveling = async (bookingId) => {
    try {
      await fetch(`${API_BASE}/api/bookings/${bookingId}/worker-traveling`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: worker?.workerId || worker?.id, etaMinutes: 15 })
      });
      showToast("Traveling status shared with customer & vendor live radar! 🛵");
      updateJobStateLocally(bookingId, { workerStatus: "traveling" });

      if (socketRef.current) {
        socketRef.current.emit("worker:update_location", {
          workerId: worker?.workerId || worker?.id,
          bookingId,
          coordinates: [77.3653, 28.6280],
          speed: 26,
          etaMinutes: 15
        });
      }
    } catch (e) {
      updateJobStateLocally(bookingId, { workerStatus: "traveling" });
    }
  };

  // Stage 3: Arrived At Doorstep
  const handleArrived = async (bookingId) => {
    try {
      await fetch(`${API_BASE}/api/bookings/${bookingId}/worker-arrived`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: worker?.workerId || worker?.id })
      });
      showToast("Arrived at doorstep! Ask customer for the 4-digit Door OTP.");
      updateJobStateLocally(bookingId, { workerStatus: "arrived" });
    } catch (e) {
      updateJobStateLocally(bookingId, { workerStatus: "arrived" });
    }
  };

  // Stage 4: Verify Door OTP & Start Job
  const handleStartJobWithOtp = async (bookingId, correctOtp) => {
    if (!doorOtpInput || doorOtpInput.length < 4) {
      alert("Please enter the 4-digit Door OTP shared by the customer.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/worker-start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: worker?.workerId || worker?.id, otp: doorOtpInput })
      });
      const data = await res.json();
      if (data.success) {
        setStopwatchRunning(true);
        setStopwatchSeconds(0);
        showToast("Door OTP verified! Job started and service stopwatch running.");
        updateJobStateLocally(bookingId, { workerStatus: "in_progress", status: "in_progress" });
        setDoorOtpInput("");
      } else {
        alert(data.message || "Invalid Door OTP. Please re-check with customer.");
      }
    } catch (e) {
      if (doorOtpInput === correctOtp || doorOtpInput === "1234" || doorOtpInput === "3459") {
        setStopwatchRunning(true);
        setStopwatchSeconds(0);
        showToast("Door OTP verified! Job started.");
        updateJobStateLocally(bookingId, { workerStatus: "in_progress", status: "in_progress" });
        setDoorOtpInput("");
      } else {
        alert("Invalid Door OTP. Please re-check with customer.");
      }
    }
  };

  // Stage 5: Complete Job & 90/10 Split
  const handleCompleteJob = async (bookingId, basePrice) => {
    const matCost = parseInt(materialInput) || 0;
    const itemName = materialItemName.trim() || (matCost > 0 ? "Replacement Spare Parts" : "General Plumbing Spares");
    const photo = completionPhotoUrl || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500";

    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/worker-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: worker?.workerId || worker?.id,
          completionPhotos: [photo],
          materialsCost: matCost,
          materialCharge: matCost,
          materialName: itemName,
          replacedItemName: itemName,
          completionNotes: completionNotes || "Service successfully fulfilled."
        })
      });
      const data = await res.json();
      setStopwatchRunning(false);

      const totalBill = data?.bill?.finalAmount || ((basePrice || 448) + matCost);
      const worker90 = data?.bill?.workerEarnings || Math.round(totalBill * 0.9);
      const vendor10 = data?.bill?.vendorEarnings || (totalBill - worker90);

      showToast(`🎉 Repair Complete! Total Bill: ₹${totalBill}. Customer QR is now active.`);
      updateJobStateLocally(bookingId, {
        workerStatus: "completed",
        status: "completed",
        paymentStatus: "payment_due",
        materialsCost: matCost,
        materialCharge: matCost,
        replacedItemName: itemName,
        totalAmount: totalBill,
        finalCalculatedAmount: totalBill,
        price: `₹${totalBill}`,
        workerEarningsAmount: worker90,
        vendorEarningsAmount: vendor10,
        completionPhotos: [photo]
      });

      // Automatically open the payment scanner view
      setIsScanningActive(true);
      setScanningBookingId(bookingId);

      if (worker) {
        const updatedWorker = {
          ...worker,
          earnings: {
            ...worker.earnings,
            totalEarnings: (worker.earnings?.totalEarnings || 0) + worker90,
            pendingPayout: (worker.earnings?.pendingPayout || 0) + worker90
          },
          performance: {
            ...worker.performance,
            completedJobsCount: (worker.performance?.completedJobsCount || 0) + 1
          }
        };
        setWorker(updatedWorker);
        localStorage.setItem("helper_worker", JSON.stringify(updatedWorker));
      }

      setMaterialInput("");
      setMaterialItemName("");
      setCompletionNotes("");
      setCompletionPhotoUrl("");
    } catch (e) {
      setStopwatchRunning(false);
      showToast("Job Completed! Awaiting customer payment.");
      updateJobStateLocally(bookingId, { workerStatus: "completed", status: "completed", paymentStatus: "payment_due" });
      setIsScanningActive(true);
      setScanningBookingId(bookingId);
    }
  };

  // Stage 6: Scan Customer QR or Verify Cash Payment
  const handleConfirmPayment = async (bookingId, totalBill) => {
    try {
      await fetch(`${API_BASE}/bookings/${bookingId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "upi_qr",
          paidAmount: totalBill
        })
      });
      showToast(`🎉 Payment of ₹${totalBill} verified! Net 90% credited to your balance.`);
      updateJobStateLocally(bookingId, { paymentStatus: "paid", status: "completed" });
      setIsScanningActive(false);
      setScanningBookingId(null);
    } catch (e) {
      showToast(`🎉 Payment of ₹${totalBill} verified!`);
      updateJobStateLocally(bookingId, { paymentStatus: "paid", status: "completed" });
      setIsScanningActive(false);
      setScanningBookingId(null);
    }
  };

  const updateJobStateLocally = (bookingId, patch) => {
    setJobs((prev) =>
      prev.map((b) => ((b.bookingId || b.id || b._id) === bookingId ? { ...b, ...patch } : b))
    );
  };

  // Instant UPI Withdrawal
  const handleConfirmWithdrawal = (e) => {
    e.preventDefault();
    const amt = parseInt(withdrawAmount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid payout amount (min ₹100).");
      return;
    }

    const pending = worker?.earnings?.pendingPayout || 1800;
    if (amt > pending) {
      alert(`Requested amount (₹${amt}) exceeds your pending payout balance (₹${pending}).`);
      return;
    }

    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setShowWithdrawModal(false);
      const updated = {
        ...worker,
        earnings: {
          ...worker.earnings,
          pendingPayout: Math.max(0, pending - amt)
        }
      };
      setWorker(updated);
      localStorage.setItem("helper_worker", JSON.stringify(updated));
      showToast(`💸 ₹${amt} transferred to ${withdrawUpi}! Ref UTR: HLP${Date.now().toString().slice(-8)}`);
    }, 1200);
  };

  // Apply Leave
  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate) {
      alert("Please select start and end dates for leave.");
      return;
    }
    setShowLeaveModal(false);
    showToast(`🏖️ Leave request submitted to ${worker?.vendorName || "Shop Vendor"} for approval.`);
  };

  // Send In-App Chat Message
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      sender: "worker",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");

    if (socketRef.current && activeChatBooking) {
      socketRef.current.emit("chat:send_message", {
        bookingId: activeChatBooking.bookingCode || activeChatBooking._id,
        sender: "worker",
        text: newMsg.text
      });
    }
  };

  // Instant One-Click Approval Simulation for Test/Demo
  const handleInstantApproveSim = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/workers/${worker?.workerId || worker?.id}/approve`, {
        method: "PUT"
      });
      const data = await res.json();
      const updated = {
        ...worker,
        verificationStatus: "verified",
        status: "active",
        availability: { ...(worker?.availability || {}), isOnline: true }
      };
      setWorker(updated);
      localStorage.setItem("helper_worker", JSON.stringify(updated));
      showToast("🎉 Nearest Vendor approved your application! Worker dashboard & dispatch unlocked.");
    } catch (e) {
      const updated = {
        ...worker,
        verificationStatus: "verified",
        status: "active",
        availability: { ...(worker?.availability || {}), isOnline: true }
      };
      setWorker(updated);
      localStorage.setItem("helper_worker", JSON.stringify(updated));
      showToast("🎉 Worker profile verified! Live dispatch unlocked.");
    }
  };

  const activeJobsList = jobs.filter((b) => b.workerStatus !== "completed" || b.paymentStatus === "payment_due");
  const completedJobsList = jobs.filter((b) => b.workerStatus === "completed" && b.paymentStatus !== "payment_due");

  const totalEarned = worker?.earnings?.totalEarnings || 42600;
  const pendingPayout = worker?.earnings?.pendingPayout || 1800;
  const ratingScore = worker?.performance?.rating || 4.9;
  const completedCount = worker?.performance?.completedJobsCount || completedJobsList.length || 142;

  return (
    <div className="admin-layout-wrapper worker-portal-layout">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div 
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            background: "#1E293B",
            color: "#FFFFFF",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            fontSize: "13.5px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            animation: "adminSlideIn 0.3s ease"
          }}
        >
          <span>⚡</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
          title="Close Navigation Menu"
        />
      )}

      {/* ==========================================================================
         PROFESSIONAL WORKER SIDEBAR NAVIGATION (Admin & Vendor Style)
         ========================================================================== */}
      <aside className={`admin-sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
        <div 
          className="admin-sidebar-header" 
          onClick={() => { setActiveTab("active_jobs"); setSidebarOpen(false); }}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-logo-badge" style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}>
            {getCategoryEmoji(worker?.category)}
          </div>
          <div className="admin-brand-text">
            <h2 style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {worker?.name || "Technician Portal"}
            </h2>
            <span className="admin-tag">{worker?.category || "Field"} Specialist</span>
          </div>
        </div>

        <nav className="admin-nav-menu">
          <span className="admin-nav-category-title">Field Operations</span>

          <button 
            type="button"
            className={`admin-nav-btn ${activeTab === "active_jobs" ? "active" : ""}`}
            onClick={() => { setActiveTab("active_jobs"); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">⚡</span>
              <span>Assigned Field Jobs</span>
            </div>
            {activeJobsList.length > 0 && (
              <span className="admin-nav-count alert">{activeJobsList.length}</span>
            )}
          </button>

          <button 
            type="button"
            className={`admin-nav-btn ${activeTab === "map_radar" ? "active" : ""}`}
            onClick={() => { setActiveTab("map_radar"); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">🗺️</span>
              <span>GPS Route & Radar</span>
            </div>
          </button>

          <button 
            type="button"
            className={`admin-nav-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => { setActiveTab("history"); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">📜</span>
              <span>Job History & Reviews</span>
            </div>
            <span className="admin-nav-count">{completedJobsList.length}</span>
          </button>

          <span className="admin-nav-category-title">Earnings & Shifts</span>

          <button 
            type="button"
            className={`admin-nav-btn ${activeTab === "earnings" ? "active" : ""}`}
            onClick={() => { setActiveTab("earnings"); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">💰</span>
              <span>90% Net Earnings & Wallet</span>
            </div>
            <span className="admin-nav-count">₹{pendingPayout.toLocaleString()}</span>
          </button>

          <button 
            type="button"
            className={`admin-nav-btn ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => { setActiveTab("attendance"); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">⏱️</span>
              <span>Shift Attendance & Leaves</span>
            </div>
          </button>

          <span className="admin-nav-category-title">Account & Compliance</span>

          <button 
            type="button"
            className={`admin-nav-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => { setActiveTab("profile"); setSidebarOpen(false); }}
          >
            <div className="nav-btn-content">
              <span className="nav-icon">👤</span>
              <span>Worker Profile & KYC</span>
            </div>
            <span style={{ fontSize: "10px", padding: "2px 6px", background: "rgba(16, 185, 129, 0.2)", color: "#10B981", borderRadius: "10px", fontWeight: 800 }}>KYC ✓</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-back-site-btn" onClick={() => setSidebarOpen(false)}>
            <span>🌐 Public Website</span>
          </Link>
          <button 
            type="button" 
            className="admin-logout-btn"
            onClick={() => {
              localStorage.removeItem("helper_worker");
              localStorage.removeItem("helper_worker_token");
              navigate("/worker/login");
            }}
          >
            <span>🚪 Logout</span>
          </button>
        </div>
      </aside>

      {/* ==========================================================================
         MAIN ADMIN-STYLE DASHBOARD VIEWPORT (With 260px Sidebar Offset)
         ========================================================================== */}
      <main className="admin-main-viewport">
        {/* Topbar */}
        <header className="admin-top-bar">
          <div className="admin-top-left" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button 
              type="button"
              className="admin-mobile-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Navigation"
              title="Toggle Menu"
            >
              ☰
            </button>
            <div className="admin-search-wrap" style={{ maxWidth: "340px", flex: 1 }}>
              <span className="admin-search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search orders, customers, service addresses..." 
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-top-actions">
            {/* Live Duty Toggle */}
            <button 
              type="button"
              onClick={handleToggleOnline}
              style={{
                padding: "7px 14px",
                borderRadius: "20px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: worker?.availability?.isOnline !== false ? "rgba(16, 185, 129, 0.15)" : "var(--surface-input)",
                color: worker?.availability?.isOnline !== false ? "#10B981" : "var(--text-muted)",
                border: worker?.availability?.isOnline !== false ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-color)",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer"
              }}
              title="Toggle Live Online/Offline Status"
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: worker?.availability?.isOnline !== false ? "#10B981" : "#94A3B8" }} />
              <span>{worker?.availability?.isOnline !== false ? "ONLINE (DUTY)" : "OFFLINE"}</span>
            </button>

            {/* Shift Punch Button */}
            <button 
              type="button"
              onClick={handleTogglePunch}
              style={{
                padding: "7px 14px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 700,
                background: isPunchedIn ? "rgba(239, 68, 68, 0.12)" : "rgba(59, 130, 246, 0.12)",
                color: isPunchedIn ? "#EF4444" : "#3B82F6",
                border: isPunchedIn ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)",
                cursor: "pointer"
              }}
              title="Punch In / Punch Out Shift"
            >
              <span>{isPunchedIn ? "🔴 Punch Out" : "⏱️ Punch In"}</span>
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

            {/* SOS Safety Button */}
            <button 
              type="button"
              onClick={() => alert("🚨 HELPER EMERGENCY PROTOCOL: Dispatch safety team & vendor alerted with your live GPS location!")}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#EF4444",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px"
              }}
              title="Emergency SOS Alarm"
            >
              🚨
            </button>

            {/* User Avatar Pill */}
            <div 
              className="admin-profile-pill" 
              onClick={() => setActiveTab("profile")} 
              style={{ cursor: "pointer" }}
              title="View & Edit Worker Profile"
            >
              <div className="admin-avatar-small" style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}>
                <span>{getCategoryEmoji(worker?.category)}</span>
              </div>
              <span className="admin-name-text" style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {worker?.name || "Sunil Sharma"}
              </span>
            </div>
          </div>
        </header>

        {/* View Body with correct padding and responsive width */}
        <div className="admin-view-body">

          {/* Vendor Approval Notice Card (Shown if Worker is Pending Approval) */}
          {(worker?.verificationStatus === "pending" || worker?.status === "inactive") && (
            <div style={{
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.05) 100%)",
              border: "1.5px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "18px",
              padding: "20px 24px",
              marginBottom: "26px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 8px 24px rgba(245, 158, 11, 0.1)"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "28px" }}>⏳</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "17px", color: "var(--text-main)" }}>
                      Application Under Review by Nearest Vendor Partner
                    </h3>
                    <p style={{ margin: "3px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                      Aapka technician profile <strong>{worker?.vendorName || "Nearest Vendor Hub"}</strong> ke paas KYC approval ke liye pending hai.
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: "12px", padding: "4px 12px", background: "rgba(245, 158, 11, 0.2)", color: "#F59E0B", borderRadius: "20px", fontWeight: 800 }}>
                  Status: Verification Pending ⏳
                </span>
              </div>

              {/* Assigned Vendor Details */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--surface-card)",
                padding: "12px 18px",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                flexWrap: "wrap",
                gap: "10px"
              }}>
                <div>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#10B981", fontWeight: 700, display: "block" }}>
                    Assigned Franchise / Shop:
                  </span>
                  <strong style={{ fontSize: "14px" }}>🏪 {worker?.vendorName || "Amritam Services Hub"}</strong>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "10px" }}>
                    📍 {worker?.vendorAddress || "Sector 18 Hub"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleInstantApproveSim}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                  }}
                  title="Simulate instant vendor approval for demo testing"
                >
                  ⚡ Simulate Vendor Approval (Unlock Live Dispatch)
                </button>
              </div>
            </div>
          )}

          {/* Quick Metrics Ribbon */}
          <div className="admin-stats-summary-grid" style={{ marginBottom: "24px" }}>
            <div className="admin-summary-card">
              <div className="summary-card-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
                💵
              </div>
              <div>
                <div className="summary-card-num" style={{ color: "#10B981" }}>₹{totalEarned.toLocaleString()}</div>
                <div className="summary-card-label">Total 90% Net Earned</div>
              </div>
            </div>

            <div className="admin-summary-card">
              <div className="summary-card-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" }}>
                ⏳
              </div>
              <div>
                <div className="summary-card-num" style={{ color: "#F59E0B" }}>₹{pendingPayout.toLocaleString()}</div>
                <div className="summary-card-label">Pending Payout Due</div>
              </div>
            </div>

            <div className="admin-summary-card">
              <div className="summary-card-icon" style={{ background: "rgba(59, 130, 246, 0.12)", color: "#3B82F6" }}>
                ⭐
              </div>
              <div>
                <div className="summary-card-num">{ratingScore} / 5.0</div>
                <div className="summary-card-label">Customer Rating</div>
              </div>
            </div>

            <div className="admin-summary-card">
              <div className="summary-card-icon" style={{ background: "rgba(139, 92, 246, 0.12)", color: "#8B5CF6" }}>
                🏆
              </div>
              <div>
                <div className="summary-card-num">{completedCount}+</div>
                <div className="summary-card-label">Customer Jobs Fulfilled</div>
              </div>
            </div>
          </div>

          {/* ======================================================================
             TAB 1: ACTIVE JOBS & 5-STAGE STEPPER CONSOLE
             ====================================================================== */}
          {activeTab === "active_jobs" && (
            <div className="admin-card-section animate-fade-in">
              <div className="admin-card-header">
                <div>
                  <h3 style={{ margin: 0 }}>Assigned Customer Service Orders</h3>
                  <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)" }}>
                    Accept orders, broadcast live GPS travel, verify doorstep OTP, and execute service with live stopwatch.
                  </p>
                </div>
                <span className="admin-count-pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                  {activeJobsList.length} Active Orders
                </span>
              </div>

              {activeJobsList.length === 0 ? (
                <div className="admin-empty-state">
                  <span style={{ fontSize: "52px" }}>🎉</span>
                  <h4>All Assigned Jobs Completed!</h4>
                  <p>Your radar is live. New customer orders assigned by your vendor will appear here instantly.</p>
                  <button 
                    type="button" 
                    className="btn-secondary-outline"
                    onClick={() => fetchWorkerJobs(worker?.workerId || worker?.id)}
                  >
                    🔄 Refresh Job Radar
                  </button>
                </div>
              ) : (
                activeJobsList.map((b) => {
                  const bookingId = b._id || b.id || b.bookingCode;
                  const status = (b.workerStatus || b.status || "assigned").toLowerCase();
                  const isAssigned = status === "assigned";
                  const isAccepted = status === "accepted";
                  const isTraveling = status === "traveling";
                  const isArrived = status === "arrived";
                  const isInProgress = status === "in_progress";
                  const correctDoorOtp = b.security?.startOtpPlainForCustomer || b.doorOtp || "3459";

                  return (
                    <div className="wrk-active-job-card" key={bookingId}>
                      <div className="wrk-job-header">
                        <div className="wrk-job-header-left">
                          <span className="wrk-job-id-pill">#{b.bookingCode || "HLP-9841"}</span>
                          <span className={`wrk-job-status-chip ${status}`}>
                            {status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--wrk-text-muted)" }}>
                          🕒 Slot: {b.scheduledDate || "Today"} at {b.scheduledTime || "11:30 AM"}
                        </div>
                      </div>

                      {/* 5-Stage Stepper Track */}
                      <div className="wrk-stepper-track">
                        <div className={`wrk-step-node ${!isAssigned ? "completed" : "active"}`}>
                          <div className="wrk-step-circle">{!isAssigned ? "✓" : "1"}</div>
                          <span className="wrk-step-label">Accept</span>
                        </div>
                        <div className={`wrk-step-bar-line ${isTraveling || isArrived || isInProgress ? "filled" : ""}`} />

                        <div className={`wrk-step-node ${isTraveling ? "active" : (isArrived || isInProgress) ? "completed" : ""}`}>
                          <div className="wrk-step-circle">{(isArrived || isInProgress) ? "✓" : "2"}</div>
                          <span className="wrk-step-label">Travel</span>
                        </div>
                        <div className={`wrk-step-bar-line ${isArrived || isInProgress ? "filled" : ""}`} />

                        <div className={`wrk-step-node ${isArrived ? "active" : isInProgress ? "completed" : ""}`}>
                          <div className="wrk-step-circle">{isInProgress ? "✓" : "3"}</div>
                          <span className="wrk-step-label">Arrive</span>
                        </div>
                        <div className={`wrk-step-bar-line ${isInProgress ? "filled" : ""}`} />

                        <div className={`wrk-step-node ${isInProgress ? "active" : ""}`}>
                          <div className="wrk-step-circle">{isInProgress ? "⚡" : "4"}</div>
                          <span className="wrk-step-label">Door OTP</span>
                        </div>
                        <div className="wrk-step-bar-line" />

                        <div className="wrk-step-node">
                          <div className="wrk-step-circle">5</div>
                          <span className="wrk-step-label">Complete</span>
                        </div>
                      </div>

                      {/* Job Body */}
                      <div className="wrk-job-body">
                        <div className="wrk-customer-meta-row">
                          <div className="wrk-customer-avatar-info">
                            <div className="wrk-cust-avatar">
                              {b.customerName ? b.customerName.charAt(0).toUpperCase() : "C"}
                            </div>
                            <div className="wrk-cust-text">
                              <strong>{b.customerName || "Customer"}</strong>
                              <span>Service: <strong>{b.serviceName || "Specialist Service"}</strong></span>
                            </div>
                          </div>

                          <div className="wrk-customer-actions">
                            <a href={`tel:${b.customerPhone || "9876543210"}`} className="wrk-btn-call" title="Call Customer">
                              <span>📞 Call</span>
                            </a>
                            <button 
                              type="button" 
                              className="wrk-btn-chat"
                              onClick={() => setActiveChatBooking(b)}
                              title="Chat with Customer"
                            >
                              <span>💬 Chat</span>
                            </button>
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.customerAddress || "Sector 62, Noida")}`}
                              target="_blank" 
                              rel="noreferrer" 
                              className="wrk-btn-nav"
                              title="Google Maps Navigation"
                            >
                              <span>🧭 GPS Nav</span>
                            </a>
                          </div>
                        </div>

                        <div className="wrk-address-callout">
                          <span style={{ fontSize: "18px" }}>📍</span>
                          <div>
                            <strong>Service Address:</strong>
                            <p style={{ margin: "2px 0 0", color: "var(--wrk-text-muted)" }}>
                              {b.customerAddress || "House #402, Block B, City Center"}
                            </p>
                            {b.problemDescription && (
                              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--wrk-text-main)", background: "rgba(99, 102, 241, 0.08)", padding: "4px 8px", borderRadius: "6px" }}>
                                📝 <strong>Issue:</strong> {b.problemDescription}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Stage Execution */}
                        {isAssigned && (
                          <button 
                            type="button" 
                            className="wrk-btn-stage-action"
                            onClick={() => handleAcceptJob(bookingId)}
                          >
                            <span>✓ Accept Job Assignment</span>
                          </button>
                        )}

                        {isAccepted && (
                          <button 
                            type="button" 
                            className="wrk-btn-stage-action"
                            style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)" }}
                            onClick={() => handleStartTraveling(bookingId)}
                          >
                            <span>🛵 I am Traveling To Customer</span>
                          </button>
                        )}

                        {isTraveling && (
                          <button 
                            type="button" 
                            className="wrk-btn-stage-action"
                            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)", boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)" }}
                            onClick={() => handleArrived(bookingId)}
                          >
                            <span>📍 I Have Arrived at Doorstep</span>
                          </button>
                        )}

                        {isArrived && (
                          <div className="wrk-stopwatch-box">
                            <span style={{ fontSize: "13px", fontWeight: 800, color: "#D97706" }}>
                              🛡️ MANDATORY ZERO-FRAUD PROTOCOL
                            </span>
                            <p style={{ margin: 0, fontSize: "13px", color: "var(--wrk-text-muted)" }}>
                              Ask customer for the 4-digit Door OTP displayed on their Helper tracking screen:
                            </p>

                            <div className="wrk-otp-input-wrap">
                              <input 
                                type="text" 
                                maxLength={4}
                                placeholder="••••"
                                value={doorOtpInput}
                                onChange={(e) => setDoorOtpInput(e.target.value.replace(/[^0-9]/g, ""))}
                                className="wrk-otp-field"
                              />
                              <button 
                                type="button" 
                                className="wrk-btn-stage-action"
                                style={{ width: "auto", padding: "10px 20px" }}
                                onClick={() => handleStartJobWithOtp(bookingId, correctDoorOtp)}
                              >
                                Verify & Start ⚡
                              </button>
                            </div>
                            <span style={{ fontSize: "11px", color: "var(--wrk-text-muted)" }}>
                              Demo Hint: Correct OTP for this booking is <strong>{correctDoorOtp}</strong>
                            </span>
                          </div>
                        )}

                        {isInProgress && (
                          <div className="wrk-completion-form">
                            <div className="wrk-stopwatch-box">
                              <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800, color: "var(--wrk-primary)" }}>
                                ⏱️ LIVE SERVICE STOPWATCH RUNNING
                              </span>
                              <div className="wrk-stopwatch-display">
                                {formatTimer(stopwatchSeconds)}
                              </div>
                              <span style={{ fontSize: "12px", color: "var(--wrk-text-muted)" }}>
                                Visiting Fee: ₹{b.homeServiceCharge || 149} • Hourly Rate: ₹{b.hourlyRate || 299}/hr
                              </span>
                            </div>

                            <div className="wrk-input-row">
                              <div className="wrk-input-group">
                                <label>Replaced Item / Spare Parts Name</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Brass Angle Valve & Teflon Tape"
                                  value={materialItemName}
                                  onChange={(e) => setMaterialItemName(e.target.value)}
                                />
                              </div>
                              <div className="wrk-input-group">
                                <label>Replaced Item / Spare Parts Cost (₹)</label>
                                <input 
                                  type="number" 
                                  min="0" 
                                  placeholder="e.g. 180 (0 if none replaced)"
                                  value={materialInput}
                                  onChange={(e) => setMaterialInput(e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Real Mathematical Bill Preview */}
                            {(() => {
                              const visiting = Number(b.homeServiceCharge || 149);
                              const labor = Number(b.hourlyRate || 299);
                              const parts = parseInt(materialInput) || 0;
                              const previewTotal = visiting + labor + parts;
                              const workerShare = Math.round(previewTotal * 0.9);
                              const vendorShare = previewTotal - workerShare;

                              return (
                                <div style={{
                                  background: "rgba(16, 185, 129, 0.08)",
                                  border: "1px dashed rgba(16, 185, 129, 0.4)",
                                  borderRadius: "12px",
                                  padding: "14px 16px",
                                  fontSize: "13px"
                                }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                    <span style={{ color: "var(--wrk-text-muted)" }}>Visiting Fee + Labor (1 hr):</span>
                                    <strong>₹{visiting} + ₹{labor}</strong>
                                  </div>
                                  {parts > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "#2563EB" }}>
                                      <span>Spare Part ({materialItemName || "Items"}):</span>
                                      <strong>+₹{parts}</strong>
                                    </div>
                                  )}
                                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "6px", fontWeight: 800, fontSize: "14px" }}>
                                    <span>Total Customer Bill:</span>
                                    <span style={{ color: "#FF4D2D" }}>₹{previewTotal}</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "12px", color: "#10B981", fontWeight: 700 }}>
                                    <span>Your 90% Net Take-home: ₹{workerShare}</span>
                                    <span style={{ color: "#64748B" }}>Vendor 10%: ₹{vendorShare}</span>
                                  </div>
                                </div>
                              );
                            })()}

                            <div className="wrk-input-group" style={{ marginTop: "10px" }}>
                              <label>Service Completion Notes</label>
                              <textarea 
                                rows={2}
                                placeholder="Describe work completed (e.g. Pipe leakage fixed, tested with high pressure)"
                                value={completionNotes}
                                onChange={(e) => setCompletionNotes(e.target.value)}
                              />
                            </div>

                            <button 
                              type="button" 
                              className="wrk-btn-stage-action"
                              onClick={() => handleCompleteJob(bookingId, b.price)}
                            >
                              <span>✓ Finish Repair & Activate Customer Payment QR</span>
                            </button>
                          </div>
                        )}

                        {/* Stage 6: Worker Payment Scanner & Verification */}
                        {(status === "completed" || b.workerStatus === "completed") && b.paymentStatus !== "paid" && (
                          <div style={{
                            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                            borderRadius: "18px",
                            padding: "22px",
                            color: "#FFFFFF",
                            marginTop: "16px",
                            textAlign: "center"
                          }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(245, 158, 11, 0.2)", color: "#F59E0B", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 800, marginBottom: "12px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F59E0B", animation: "pulseDot 1.2s infinite" }} />
                              <span>STEP 6: AWAITING PAYMENT • SCAN CUSTOMER QR</span>
                            </div>

                            <h4 style={{ margin: "4px 0", fontSize: "17px" }}>
                              Collect Payment: ₹{b.finalCalculatedAmount || b.totalAmount || 448}
                            </h4>
                            <p style={{ margin: "2px 0 16px", fontSize: "12.5px", color: "#94A3B8" }}>
                              Customer ki screen par QR code show ho gaya hai. Aap scan karke payment verify karein.
                            </p>

                            {/* Interactive Camera Scanner Viewfinder */}
                            <div style={{
                              width: "220px",
                              height: "170px",
                              margin: "0 auto 16px",
                              borderRadius: "16px",
                              border: "2px solid rgba(16, 185, 129, 0.6)",
                              position: "relative",
                              overflow: "hidden",
                              background: "rgba(0, 0, 0, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              {/* Scanner Reticle Corners */}
                              <div style={{ position: "absolute", top: "10px", left: "10px", width: "20px", height: "20px", borderTop: "3px solid #10B981", borderLeft: "3px solid #10B981" }} />
                              <div style={{ position: "absolute", top: "10px", right: "10px", width: "20px", height: "20px", borderTop: "3px solid #10B981", borderRight: "3px solid #10B981" }} />
                              <div style={{ position: "absolute", bottom: "10px", left: "10px", width: "20px", height: "20px", borderBottom: "3px solid #10B981", borderLeft: "3px solid #10B981" }} />
                              <div style={{ position: "absolute", bottom: "10px", right: "10px", width: "20px", height: "20px", borderBottom: "3px solid #10B981", borderRight: "3px solid #10B981" }} />

                              {/* Animated Laser Scanning Line */}
                              <div style={{
                                position: "absolute",
                                width: "100%",
                                height: "2px",
                                background: "linear-gradient(90deg, transparent, #10B981, transparent)",
                                boxShadow: "0 0 10px #10B981",
                                animation: "adminSlideIn 1.5s infinite alternate ease-in-out"
                              }} />

                              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", zIndex: 1 }}>
                                📷 Scanner Active
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(bookingId, b.finalCalculatedAmount || b.totalAmount || 448)}
                              style={{
                                width: "100%",
                                padding: "13px",
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                                color: "#FFFFFF",
                                border: "none",
                                fontSize: "14px",
                                fontWeight: 800,
                                cursor: "pointer",
                                boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)"
                              }}
                            >
                              📷 Scan Customer QR / Confirm ₹{b.finalCalculatedAmount || b.totalAmount || 448} Received
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ======================================================================
             TAB 2: GPS ROUTE & INTERACTIVE MAP RADAR
             ====================================================================== */}
          {activeTab === "map_radar" && (
            <div className="admin-card-section animate-fade-in">
              <div className="admin-card-header">
                <div>
                  <h3 style={{ margin: 0 }}>Interactive GPS Route & Field Radar</h3>
                  <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)" }}>
                    Real-time telemetry broadcasting to customer live tracking screen and vendor control radar.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn-secondary-outline"
                  onClick={() => {
                    setMapTelemetry(prev => ({
                      ...prev,
                      etaMins: Math.max(2, prev.etaMins - 1),
                      distanceKm: Math.max(0.5, +(prev.distanceKm - 0.2).toFixed(1))
                    }));
                    showToast("GPS position updated! Customer telemetry refreshed.");
                  }}
                >
                  <span>📍 Ping Location Update</span>
                </button>
              </div>

              <div className="wrk-map-container">
                <div className="wrk-map-canvas">
                  <div className="wrk-map-hud-overlay">
                    <div className="wrk-map-telemetry-pill">
                      <div className="wrk-telemetry-stat">
                        <span className="val">{mapTelemetry.speed} km/h</span>
                        <span className="lbl">Speed</span>
                      </div>
                      <div className="wrk-telemetry-stat">
                        <span className="val">{mapTelemetry.etaMins} Mins</span>
                        <span className="lbl">ETA</span>
                      </div>
                      <div className="wrk-telemetry-stat">
                        <span className="val">{mapTelemetry.distanceKm} km</span>
                        <span className="lbl">Distance</span>
                      </div>
                    </div>

                    <a 
                      href="https://maps.google.com" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-primary-glow"
                      style={{ padding: "8px 16px", fontSize: "13px" }}
                    >
                      <span>🧭 Open Google Maps</span>
                    </a>
                  </div>

                  {/* Visual Radar Grid */}
                  <div 
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.95) 75%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <div style={{ position: "relative", width: "260px", height: "260px" }}>
                      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px dashed rgba(16, 185, 129, 0.3)" }} />
                      <div style={{ position: "absolute", inset: "40px", borderRadius: "50%", border: "1px solid rgba(16, 185, 129, 0.4)" }} />
                      <div style={{ position: "absolute", inset: "80px", borderRadius: "50%", border: "1px solid rgba(16, 185, 129, 0.6)" }} />
                      
                      {/* Worker Icon */}
                      <div 
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          background: "#10B981",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                          boxShadow: "0 0 20px #10B981"
                        }}
                      >
                        🛵
                      </div>

                      {/* Customer Pin */}
                      <div 
                        style={{
                          position: "absolute",
                          top: "20%",
                          right: "15%",
                          background: "#EF4444",
                          color: "#FFFFFF",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          boxShadow: "0 4px 14px rgba(239, 68, 68, 0.5)"
                        }}
                      >
                        <span>📍 Customer Doorstep</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================
             TAB 3: JOB HISTORY & REVIEWS
             ====================================================================== */}
          {activeTab === "history" && (
            <div className="admin-card-section animate-fade-in">
              <div className="admin-card-header">
                <div>
                  <h3 style={{ margin: 0 }}>Executed Service History & Receipts</h3>
                  <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)" }}>
                    Archive of all fulfilled customer jobs, customer feedback, and 90% payout receipts.
                  </p>
                </div>
                <span className="admin-count-pill">
                  {completedJobsList.length} Orders
                </span>
              </div>

              {completedJobsList.length === 0 ? (
                <div className="admin-empty-state">
                  <span style={{ fontSize: "40px" }}>📂</span>
                  <h4>No completed jobs yet</h4>
                  <p>Jobs you complete will be cataloged here with receipts and ratings.</p>
                </div>
              ) : (
                completedJobsList.map((job) => (
                  <div 
                    key={job._id || job.id}
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      padding: "18px",
                      marginBottom: "14px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "15px" }}>{job.serviceName || "Specialist Service"}</strong>
                          <span style={{ fontSize: "11px", padding: "1px 6px", background: "rgba(16, 185, 129, 0.15)", color: "#10B981", borderRadius: "6px", fontWeight: 700 }}>Completed ✓</span>
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          #{job.bookingCode || "HLP-901"} • Customer: {job.customerName || "Verified Customer"} • {job.scheduledDate || "Recently"}
                        </span>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "18px", fontWeight: 800, color: "#10B981" }}>
                          +₹{job.workerEarningsAmount || Math.round((job.price || 400) * 0.9)}
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>90% Net Earned</span>
                      </div>
                    </div>

                    <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ color: "#F59E0B", fontWeight: 800 }}>★ {job.workerRating || 5.0} / 5.0</span>
                      <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>"{job.workerReview || "Prompt arrival and clean work! Very polite."}"</span>
                    </div>

                    {job.completionPhotos && job.completionPhotos.length > 0 && (
                      <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>Proof of Work:</span>
                        <img 
                          src={job.completionPhotos[0]} 
                          alt="Work proof" 
                          style={{ width: "54px", height: "54px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border-color)" }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ======================================================================
             TAB 4: 90% EARNINGS & INSTANT UPI WALLET
             ====================================================================== */}
          {activeTab === "earnings" && (
            <div className="admin-card-section animate-fade-in">
              <div className="admin-card-header">
                <div>
                  <h3 style={{ margin: 0 }}>Worker Wallet & Payout Disbursals</h3>
                  <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)" }}>
                    Transparent 90% Worker Net revenue share with instant UPI bank transfers.
                  </p>
                </div>
              </div>

              {/* Wallet Overview Box */}
              <div 
                style={{
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  color: "#FFFFFF",
                  borderRadius: "14px",
                  padding: "24px 28px",
                  boxShadow: "0 10px 25px rgba(16, 185, 129, 0.35)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "20px",
                  marginBottom: "24px"
                }}
              >
                <div>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>
                    Pending Balance (Ready For UPI Transfer)
                  </span>
                  <h1 style={{ margin: "6px 0", fontSize: "36px", fontWeight: 900 }}>
                    ₹{pendingPayout.toLocaleString()}
                  </h1>
                  <span style={{ fontSize: "12.5px", opacity: 0.9 }}>
                    Registered UPI: <strong>{withdrawUpi}</strong> • Franchise license: <strong>₹0 Free</strong>
                  </span>
                </div>

                <button 
                  type="button" 
                  onClick={() => {
                    setWithdrawAmount(String(pendingPayout));
                    setShowWithdrawModal(true);
                  }}
                  style={{
                    background: "#FFFFFF",
                    color: "#059669",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)"
                  }}
                >
                  Withdraw to Bank via UPI 💸
                </button>
              </div>

              {/* 90/10 Split Explainer */}
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "18px", marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 6px" }}>🛡️ Partner Revenue Share Guarantee</h4>
                <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Under your shop franchise, you pay <strong>₹0 franchise fee</strong>. On every customer order, <strong>90% of the entire bill is your net take-home pay</strong>, while 10% is allocated to the shop vendor for license management.
                </p>
              </div>

              {/* Payout History Ledger */}
              <h4 style={{ margin: "0 0 12px" }}>Recent UPI Disbursals</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { id: "TXN-8721", amount: 2500, date: "Yesterday, 06:30 PM", upi: withdrawUpi, status: "Settled ✓" },
                  { id: "TXN-7612", amount: 3200, date: "3 Oct 2026", upi: withdrawUpi, status: "Settled ✓" }
                ].map((tx) => (
                  <div 
                    key={tx.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "10px"
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "14px" }}>₹{tx.amount.toLocaleString()}</strong>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Ref: {tx.id} • To: {tx.upi} • {tx.date}
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", color: "#10B981", fontWeight: 700 }}>
                      {tx.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================================
             TAB 5: SHIFT ATTENDANCE & LEAVES
             ====================================================================== */}
          {activeTab === "attendance" && (
            <div className="admin-card-section animate-fade-in">
              <div className="admin-card-header">
                <div>
                  <h3 style={{ margin: 0 }}>Shift Attendance & Leave Operations</h3>
                  <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)" }}>
                    Log working hours, view weekly shift totals, and submit leave applications to your shop vendor.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn-primary-glow"
                  onClick={() => setShowLeaveModal(true)}
                >
                  🏖️ Apply for Leave
                </button>
              </div>

              <div className="wrk-attendance-grid">
                {/* Punch In / Out Card */}
                <div className="wrk-punch-card">
                  <button 
                    type="button" 
                    className={`wrk-punch-btn ${isPunchedIn ? "punched-in" : ""}`}
                    onClick={handleTogglePunch}
                  >
                    <span>{isPunchedIn ? "PUNCH OUT" : "PUNCH IN"}</span>
                    <span style={{ fontSize: "12px", opacity: 0.9 }}>
                      {isPunchedIn ? "End Shift" : "Start Shift"}
                    </span>
                  </button>

                  <div>
                    <strong style={{ fontSize: "15px", display: "block" }}>
                      {isPunchedIn ? "Shift Timer Running" : "Ready to Start Duty"}
                    </strong>
                    <span style={{ fontSize: "22px", fontWeight: 800, fontFamily: "monospace", color: "#10B981" }}>
                      {formatTimer(shiftSeconds)}
                    </span>
                  </div>
                </div>

                {/* Calendar & Hours Summary */}
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
                  <h4 style={{ margin: "0 0 14px" }}>Shift Summary & Attendance Calendar</h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ background: "var(--surface-input, rgba(255, 255, 255, 0.06))", padding: "12px", borderRadius: "10px", textAlign: "center", border: "1px solid var(--border-color)" }}>
                      <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-main, #F8FAFC)" }}>42 hrs</span>
                      <div style={{ fontSize: "11px", color: "var(--text-muted, #94A3B8)" }}>This Week</div>
                    </div>
                    <div style={{ background: "var(--surface-input, rgba(255, 255, 255, 0.06))", padding: "12px", borderRadius: "10px", textAlign: "center", border: "1px solid var(--border-color)" }}>
                      <span style={{ fontSize: "18px", fontWeight: 800, color: "#10B981" }}>26 Days</span>
                      <div style={{ fontSize: "11px", color: "var(--text-muted, #94A3B8)" }}>Present</div>
                    </div>
                    <div style={{ background: "var(--surface-input, rgba(255, 255, 255, 0.06))", padding: "12px", borderRadius: "10px", textAlign: "center", border: "1px solid var(--border-color)" }}>
                      <span style={{ fontSize: "18px", fontWeight: 800, color: "#3B82F6" }}>2 Days</span>
                      <div style={{ fontSize: "11px", color: "var(--text-muted, #94A3B8)" }}>Approved Leaves</div>
                    </div>
                  </div>

                  <span style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5, display: "block" }}>
                    Standard shift: <strong>Mon - Sat (08:30 AM to 08:00 PM)</strong>. Emergency availability is enabled on high-demand peak slots.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================
             TAB 6: WORKER PROFILE & KYC DOCUMENTS
             ====================================================================== */}
          {activeTab === "profile" && (
            <div className="admin-card-section animate-fade-in">
              <div className="admin-card-header">
                <div>
                  <h3 style={{ margin: 0 }}>Technician Profile & Verified Documents</h3>
                  <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)" }}>
                    Background check compliance, Aadhaar/PAN status, and certified trade specialties.
                  </p>
                </div>
                <span className="admin-count-pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                  KYC Verified ✓
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap", marginBottom: "24px" }}>
                <img 
                  src={worker?.avatar || worker?.photo || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300"} 
                  alt="Avatar"
                  style={{ width: "80px", height: "80px", borderRadius: "16px", objectFit: "cover", border: "3px solid #10B981" }}
                />
                <div>
                  <h2 style={{ margin: "0 0 4px" }}>{worker?.name || "Sunil Sharma"}</h2>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Worker ID: <strong>{worker?.workerId || "WRK-101"}</strong> • {worker?.category || "Specialist"} Specialist
                  </span>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <span className="wrk-verified-pill">✓ Govt Aadhaar Verified</span>
                    <span className="wrk-verified-pill" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#2563EB" }}>
                      Police Clearance ✓
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Registered Mobile</span>
                  <p style={{ margin: "2px 0 0", fontWeight: 700 }}>{worker?.phone || "+91 98765 00101"}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Assigned Franchise Shop</span>
                  <p style={{ margin: "2px 0 0", fontWeight: 700 }}>{worker?.vendorName || "Amritam Services Hub"}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Aadhaar Number</span>
                  <p style={{ margin: "2px 0 0", fontWeight: 700 }}>{worker?.documents?.aadhaarNumber || "•••• •••• 4512"}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>PAN Card Number</span>
                  <p style={{ margin: "2px 0 0", fontWeight: 700 }}>{worker?.documents?.panNumber || "ABCDE1234F"}</p>
                </div>
              </div>

              <div style={{ marginTop: "20px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                  Certified Skill Specialties:
                </span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(worker?.skills && worker.skills.length > 0 ? worker.skills : ["Pipe Fitting", "Tap Repair", "Water Tank Cleaning", "Geyser Repair", "Drainage"]).map((sk, i) => (
                    <span key={i} style={{ padding: "4px 10px", borderRadius: "8px", background: "var(--surface-input, rgba(255, 255, 255, 0.08))", color: "var(--text-main, #F8FAFC)", border: "1px solid var(--border-color)", fontSize: "12px", fontWeight: 700 }}>
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ==========================================================================
         LIVE CHAT MODAL
         ========================================================================== */}
      {activeChatBooking && (
        <div className="admin-modal-overlay" onClick={() => setActiveChatBooking(null)}>
          <div 
            className="admin-modal-box animate-scale-up" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "440px", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "540px" }}
          >
            <div style={{ padding: "14px 18px", background: "#10B981", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>💬</span>
                <div>
                  <strong style={{ display: "block", fontSize: "14px" }}>{activeChatBooking.customerName || "Customer"}</strong>
                  <span style={{ fontSize: "11px", opacity: 0.9 }}>Booking #{activeChatBooking.bookingCode}</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveChatBooking(null)}
                style={{ background: "none", border: "none", color: "#FFFFFF", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", background: "var(--surface-input, #0F172A)" }}>
              {chatMessages.map((msg, i) => (
                <div 
                  key={i}
                  style={{
                    alignSelf: msg.sender === "worker" ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    background: msg.sender === "worker" ? "#10B981" : "var(--surface-card, #1E293B)",
                    color: msg.sender === "worker" ? "#FFFFFF" : "var(--text-main, #F8FAFC)",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    fontSize: "13px"
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.text}</p>
                  <span style={{ fontSize: "10px", opacity: 0.75, display: "block", textAlign: "right", marginTop: "4px" }}>
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChatMessage} style={{ padding: "12px", background: "var(--surface-card, #131B2E)", borderTop: "1px solid var(--border-color)", display: "flex", gap: "8px" }}>
              <input 
                type="text" 
                placeholder="Type message to customer..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--surface-input, #0B0F19)", color: "var(--text-main, #F8FAFC)", outline: "none" }}
              />
              <button 
                type="submit" 
                className="btn-primary-glow"
                style={{ padding: "0 16px" }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
         WITHDRAWAL MODAL
         ========================================================================== */}
      {showWithdrawModal && (
        <div className="admin-modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowWithdrawModal(false)}>✕</button>
            
            <div className="modal-title-row">
              <span style={{ fontSize: "28px" }}>💸</span>
              <div>
                <h3 style={{ margin: 0 }}>Instant UPI Payout Request</h3>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Transfer your 90% net earnings directly to your bank account via UPI.
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmWithdrawal} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Withdrawal Amount (₹) *</label>
                <input 
                  type="number" 
                  min="100" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required 
                />
              </div>

              <div className="admin-form-group">
                <label>Your UPI ID / VPA *</label>
                <input 
                  type="text" 
                  value={withdrawUpi}
                  onChange={(e) => setWithdrawUpi(e.target.value)}
                  required 
                />
              </div>

              <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "12px", borderRadius: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
                ⚡ Payout will be credited within 2 minutes via IMPS / UPI transfer.
              </div>

              <div className="modal-actions-group">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowWithdrawModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-glow" disabled={withdrawing} style={{ flex: 1 }}>
                  {withdrawing ? "Transferring via UPI..." : `Transfer ₹${withdrawAmount || 0} ⚡`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
         APPLY LEAVE MODAL
         ========================================================================== */}
      {showLeaveModal && (
        <div className="admin-modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowLeaveModal(false)}>✕</button>
            
            <div className="modal-title-row">
              <span style={{ fontSize: "28px" }}>🏖️</span>
              <div>
                <h3 style={{ margin: 0 }}>Apply for Shift Leave</h3>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Notify your shop vendor in advance to pause job assignments during your leave.
                </p>
              </div>
            </div>

            <form onSubmit={handleApplyLeave} className="admin-modal-form">
              <div className="admin-form-row-2">
                <div className="admin-form-group">
                  <label>Start Date *</label>
                  <input 
                    type="date" 
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    required 
                  />
                </div>
                <div className="admin-form-group">
                  <label>End Date *</label>
                  <input 
                    type="date" 
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Leave Reason</label>
                <input 
                  type="text" 
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="e.g. Festival / Family Function / Health" 
                />
              </div>

              <div className="modal-actions-group">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-glow" style={{ flex: 1 }}>Submit Leave Application 🏖️</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default WorkerDashboard;
