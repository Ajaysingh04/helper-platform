import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE, SOCKET_URL } from "../../apiConfig";
import {
  broadcastBookingSync,
  getBookingDoorOtp,
  DEMO_WORKER,
  calculateDynamicWorkPricing,
  calculateScheduleDetails,
  handleDemoWorkerGoToLocation,
  handleDemoWorkerArrived,
  handleDemoWorkerVerifyOtp,
  handleDemoWorkerCompleteWork,
  handleDemoWorkerSubmitCustomerFeedback
} from "../../utils/bookingWorkflow";
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
  const [selectedTradeFilter, setSelectedTradeFilter] = useState("All Services");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 3;
  const [jobs, setJobs] = useState([]);
  const [, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark" || document.body.classList.contains("dark"));

  // Real-time ticker and 1-hour navigation lock state
  const [nowTime, setNowTime] = useState(Date.now());
  const [unlockedNavMap, setUnlockedNavMap] = useState({});

  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlockNavigation = (bId) => {
    setUnlockedNavMap(prev => ({ ...prev, [bId]: true }));
    showToast("⚡ Fast-Forward Demo: Location Navigation Unlocked!");
  };

  // Live stopwatch and dynamic cost for active job
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [doorOtpInput, setDoorOtpInput] = useState("");
  const [materialItemName, setMaterialItemName] = useState("");
  const [materialInput, setMaterialInput] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState("");
  const [, setIsScanningActive] = useState(false);
  const [, setScanningBookingId] = useState(null);

  // Customer Rating & Feedback Modal State (Worker -> Customer)
  const [customerFeedbackBooking, setCustomerFeedbackBooking] = useState(null);
  const [customerRating, setCustomerRating] = useState(5);
  const [customerHoverRating, setCustomerHoverRating] = useState(5);
  const [customerReview, setCustomerReview] = useState("");
  const [customerFeedbackTags, setCustomerFeedbackTags] = useState([]);
  const [sideTimerMinimized, setSideTimerMinimized] = useState(false);

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

  // Load worker data on mount (Requires actual login; redirects to /login if not authenticated)
  useEffect(() => {
    let activeWorker = null;
    const stored = localStorage.getItem("helper_worker");
    if (!stored) {
      // If not logged in, always open main login page
      navigate("/login");
      return;
    }

    try {
      activeWorker = JSON.parse(stored);
    } catch (e) {
      localStorage.removeItem("helper_worker");
      navigate("/login");
      return;
    }

    if (!activeWorker || (!activeWorker.workerId && !activeWorker.id && !activeWorker.phone)) {
      navigate("/login");
      return;
    }

    setWorker(activeWorker);
    setWithdrawUpi(activeWorker.earnings?.upiId || `${activeWorker.phone?.slice(-10)}@upi`);
    fetchWorkerProfile(activeWorker.workerId || activeWorker.id || "WRK-101");
    fetchWorkerJobs(activeWorker.workerId || activeWorker.id || "WRK-101");
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // New Job assigned alert (Instant Hit Update)
      s.on("worker:new_job_alert", (data) => {
        if (!data) return;
        showToast(`⚡ New Job Assigned: ${data.serviceName || "Service"}!`);
        const bKey = data.bookingId || data.bookingCode;
        if (bKey) {
          const newJobItem = {
            ...data,
            bookingId: bKey,
            bookingCode: data.bookingCode || bKey,
            id: bKey,
            _id: bKey,
            status: "ready_for_worker",
            workerStatus: "assigned"
          };
          setJobs(prev => {
            const isMatch = (j) => [j.bookingId, j.id, j._id, j.bookingCode].filter(Boolean).map(String).includes(String(bKey));
            if (prev.some(isMatch)) {
              return prev.map(j => isMatch(j) ? { ...j, ...newJobItem } : j);
            }
            return [newJobItem, ...prev];
          });
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker]);

  // Real-time cross-tab listener for incoming jobs from Demo Vendor (Instant Hit Update)
  useEffect(() => {
    const handleJobUpdate = () => {
      const wid = worker?.workerId || worker?.id || "WRK-101";
      fetchWorkerJobs(wid);
    };

    const handleNewOffer = (e) => {
      if (e?.detail) {
        showToast(`🔔 NEW JOB OFFER: ${e.detail.serviceName || e.detail.service} from Demo Vendor!`);
        const item = e.detail;
        const bKey = item.bookingId || item.id || item._id || item.bookingCode;
        if (bKey) {
          setJobs(prev => {
            const isMatch = (j) => [j.bookingId, j.id, j._id, j.bookingCode].filter(Boolean).map(String).includes(String(bKey));
            if (prev.some(isMatch)) {
              return prev.map(j => isMatch(j) ? { ...j, ...item } : j);
            }
            return [item, ...prev];
          });
        }
      }
      handleJobUpdate();
    };

    window.addEventListener("worker_new_offer", handleNewOffer);
    window.addEventListener("booking_workflow_updated", handleJobUpdate);
    window.addEventListener("booking_updated", handleJobUpdate);
    window.addEventListener("storage", handleJobUpdate);

    let syncCh = null;
    try {
      if (window.BroadcastChannel) {
        syncCh = new window.BroadcastChannel("helper_booking_sync");
        syncCh.onmessage = (ev) => {
          if (ev.data && ev.data.type === "BOOKING_WORKFLOW_UPDATE") {
            const patch = ev.data.patch;
            const bId = ev.data.bookingId;
            if (patch || bId) {
              setJobs(prev => {
                const targetKey = String(bId || patch?.bookingId || patch?.bookingCode || "");
                const isMatch = (j) => [j.bookingId, j.id, j._id, j.bookingCode].filter(Boolean).map(String).includes(targetKey);
                if (prev.some(isMatch)) {
                  return prev.map(j => isMatch(j) ? { ...j, ...(patch || {}) } : j);
                }
                const isDispatched = patch && (patch.vendorAccepted || patch.status === "ready_for_worker" || patch.workerStatus);
                if (isDispatched) return [patch, ...prev];
                return prev;
              });
            }
          }
        };
      }
    } catch (e) {}

    return () => {
      window.removeEventListener("worker_new_offer", handleNewOffer);
      window.removeEventListener("booking_workflow_updated", handleJobUpdate);
      window.removeEventListener("booking_updated", handleJobUpdate);
      window.removeEventListener("storage", handleJobUpdate);
      if (syncCh) syncCh.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker]);

  // Fetch updated worker profile
  const fetchWorkerProfile = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/workers/${id}`);
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
    let combined = [];

    // 1. Fetch from server /workers/:id/jobs API
    try {
      const res = await fetch(`${API_BASE}/workers/${id}/jobs`);
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
        combined = [...data.jobs];
      }
    } catch (e) {}

    // 2. Fetch from /bookings API if combined is empty
    if (combined.length === 0) {
      try {
        const res = await fetch(`${API_BASE}/bookings`);
        const data = await res.json();
        const all = Array.isArray(data.data) ? data.data : (Array.isArray(data.bookings) ? data.bookings : []);
        const workerJobs = all.filter(
          (b) =>
            b.assignedWorker?.workerId === id ||
            b.assignedWorker?.id === id ||
            (b.assignedWorkers || []).some((w) => w.workerId === id) ||
            b.status === "ready_for_worker" ||
            b.workerStatus === "assigned" ||
            b.status === "assigned"
        );
        combined = [...workerJobs];
      } catch (e) {}
    }

    // 3. ALWAYS scan and prioritize helper_worker_jobs (vendor accepted & dispatched)
    const acceptedMap = JSON.parse(localStorage.getItem("helper_accepted_orders") || "{}");

    try {
      const rawW = localStorage.getItem("helper_worker_jobs");
      if (rawW) {
        const listW = JSON.parse(rawW);
        if (Array.isArray(listW)) {
          listW.forEach((b) => {
            if (!b) return;
            const bId = b.bookingId || b.id || b._id || b.bookingCode;
            if (!bId) return;
            const formattedItem = {
              ...b,
              bookingCode: b.bookingCode || b.bookingId || b.id || bId,
              workerStatus: b.workerStatus || (b.status === "completed" ? "completed" : "assigned"),
              status: b.status || "ready_for_worker",
              vendorAccepted: true,
              timestamp: b.timestamp || (b.createdAt && !isNaN(new Date(b.createdAt).getTime()) ? new Date(b.createdAt).getTime() : Date.now()),
              createdAt: b.createdAt || new Date().toISOString()
            };
            const targetKeys = [bId, b.bookingCode, b.id, b._id].filter(Boolean).map(String);
            const existingIdx = combined.findIndex((j) => {
              const itemKeys = [j.bookingId, j.id, j._id, j.bookingCode].filter(Boolean).map(String);
              return itemKeys.some(k => targetKeys.includes(k));
            });
            if (existingIdx >= 0) {
              combined[existingIdx] = { ...combined[existingIdx], ...formattedItem };
            } else {
              combined.unshift(formattedItem);
            }
          });
        }
      }
    } catch (e) {}

    // 4. ALWAYS scan helper_user_bookings and helper_bookings so new bookings reach Demo Worker unconditionally!
    const otherStores = ["helper_user_bookings", "helper_bookings"];
    otherStores.forEach((k) => {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) return;
        const list = JSON.parse(raw);
        if (!Array.isArray(list)) return;

        list.forEach((b) => {
          if (!b) return;
          const bId = b.bookingId || b.id || b._id || b.bookingCode;
          if (!bId) return;
          if (b.status === "cancelled" || b.workerStatus === "cancelled") return;

          const targetKeys = [b.bookingId, b.id, b._id, b.bookingCode].filter(Boolean).map(String);
          const isLocallyAccepted = targetKeys.some(key => acceptedMap[key]);
          const isVendorApproved = Boolean(b.vendorAccepted) || b.status === "ready_for_worker" || isLocallyAccepted || !b.status || b.status === "pending" || b.status === "searching_provider";

          if (isVendorApproved) {
            const formattedItem = {
              ...b,
              bookingCode: b.bookingCode || b.bookingId || b.id || bId,
              workerStatus: b.workerStatus || (b.status === "completed" ? "completed" : "assigned"),
              status: (b.status === "completed") ? "completed" : ((b.status === "pending" || !b.status || b.status === "searching_provider") ? "ready_for_worker" : b.status),
              vendorAccepted: true,
              timestamp: b.timestamp || (b.createdAt && !isNaN(new Date(b.createdAt).getTime()) ? new Date(b.createdAt).getTime() : Date.now()),
              createdAt: b.createdAt || new Date().toISOString()
            };
            const existingIdx = combined.findIndex((j) => {
              const itemKeys = [j.bookingId, j.id, j._id, j.bookingCode].filter(Boolean).map(String);
              return itemKeys.some(key => targetKeys.includes(key));
            });
            if (existingIdx >= 0) {
              combined[existingIdx] = {
                ...formattedItem,
                ...combined[existingIdx],
                vendorAccepted: true
              };
            } else {
              combined.unshift(formattedItem);
            }
          }
        });
      } catch (err) {}
    });

    if (combined.length > 0) {
      setJobs(combined);
      checkActiveJobStopwatch(combined);
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
          bookingCode: "HLP-91044",
          serviceName: "Kitchen RO Water Purifier Servicing",
          customerName: "Ananya Deshmukh",
          customerPhone: "+91 98112 55443",
          customerAddress: "Villa 12, Palm Meadows, Indirapuram, Ghaziabad",
          scheduledDate: "Today",
          scheduledTime: "02:00 PM",
          price: 699,
          workerStatus: "assigned",
          status: "assigned",
          doorOtp: "7821",
          problemDescription: "Filter membrane replacement & TDS level calibration."
        }
      ]);
    }
    setLoading(false);
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
      await fetch(`${API_BASE}/workers/${workerId}/availability`, {
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
      await fetch(`${API_BASE}/workers/${workerId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: nextState ? "check_in" : "check_out" })
      });
    } catch (e) {}
  };

  // Stage 1: Accept Job
  const handleAcceptJob = async (bookingId) => {
    const primaryWorker = {
      id: worker?.workerId || worker?.id || DEMO_WORKER.id,
      workerId: worker?.workerId || worker?.id || DEMO_WORKER.workerId,
      name: worker?.name || DEMO_WORKER.name,
      phone: worker?.phone || DEMO_WORKER.phone,
      role: worker?.role || DEMO_WORKER.role,
      rating: worker?.rating || 4.95,
      totalJobs: 148,
      avatar: DEMO_WORKER.avatar
    };

    const patch = {
      workerStatus: "accepted",
      status: "slot_confirmed",
      slotConfirmed: true,
      workerAcceptedAt: new Date().toISOString(),
      assignedWorker: primaryWorker,
      assignedWorkerName: primaryWorker.name,
      assignedWorkerPhone: primaryWorker.phone
    };

    broadcastBookingSync(bookingId, patch);

    try {
      await fetch(`${API_BASE}/bookings/${bookingId}/worker-accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: primaryWorker.workerId,
          workerName: primaryWorker.name,
          workerPhone: primaryWorker.phone
        })
      });
      showToast("🎉 Job accepted! Your contact number, name and arrival schedule are now visible to customer.");
      updateJobStateLocally(bookingId, patch);
    } catch (e) {
      showToast("🎉 Job accepted! Customer can now view your contact details and schedule.");
      updateJobStateLocally(bookingId, patch);
    }
  };

  // Stage 2: Go to Location (Start Traveling & Open Google Maps)
  const handleStartTraveling = async (bookingId) => {
    const b = jobs.find((j) => (j.bookingId || j.id || j._id) === bookingId) || {};
    try {
      await handleDemoWorkerGoToLocation(b);
    } catch (e) {}

    // Open Google Maps navigation route in a new tab
    const dest = encodeURIComponent(b.customerAddress || b.address || "Sector 62, Noida");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, "_blank");

    showToast("📍 Map Route opened! Traveling to customer location.");
    updateJobStateLocally(bookingId, { workerStatus: "traveling" });

    try {
      await fetch(`${API_BASE}/bookings/${bookingId}/worker-traveling`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: worker?.workerId || worker?.id, etaMinutes: 15 })
      });
      if (socketRef.current) {
        socketRef.current.emit("worker:update_location", {
          workerId: worker?.workerId || worker?.id,
          bookingId,
          coordinates: [77.3653, 28.6280],
          speed: 26,
          etaMinutes: 15
        });
      }
    } catch (e) {}
  };

  // Stage 3: I am Arrived At Doorstep & Notify Customer
  const handleArrived = async (bookingId) => {
    const b = jobs.find((j) => (j.bookingId || j.id || j._id) === bookingId) || {};
    try {
      await handleDemoWorkerArrived(b);
    } catch (e) {}

    showToast("🏁 Arrived at customer doorstep! Please call customer or ask for 4-digit Service Start OTP.");
    updateJobStateLocally(bookingId, { workerStatus: "arrived" });

    // Send instant arrival notification to customer
    try {
      window.dispatchEvent(
        new CustomEvent("worker_arrived_notification", {
          detail: {
            bookingId,
            workerName: worker?.name || "Sunil Sharma",
            phone: worker?.phone || "9876500101",
            message: "Technician Sunil Sharma has arrived at your doorstep! Please share the 4-digit Service Start OTP with technician."
          }
        })
      );
    } catch (e) {}

    try {
      await fetch(`${API_BASE}/bookings/${bookingId}/worker-arrived`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: worker?.workerId || worker?.id })
      });
    } catch (e) {}
  };

  // Stage 4: Verify Door OTP & Start Work Countdown
  const handleStartJobWithOtp = async (bookingId, correctOtp) => {
    if (!doorOtpInput || doorOtpInput.length < 4) {
      alert("Please enter the 4-digit Service Start OTP from the customer.");
      return;
    }

    const b = jobs.find((j) => (j.bookingId || j.id || j._id) === bookingId) || {};
    try {
      await handleDemoWorkerVerifyOtp(b, doorOtpInput);
      setStopwatchRunning(true);
      setStopwatchSeconds(0);
      showToast("🔑 OTP Verified! Work countdown and stopwatch started.");
      updateJobStateLocally(bookingId, { workerStatus: "in_progress", status: "in_progress", workStartedAt: Date.now() });
      setDoorOtpInput("");
    } catch (err) {
      alert(err.message || "Invalid OTP. Please enter the 4-digit OTP shown on customer screen.");
      return;
    }

    try {
      await fetch(`${API_BASE}/bookings/${bookingId}/worker-start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: worker?.workerId || worker?.id, otp: doorOtpInput })
      });
    } catch (e) {}
  };

  // Stage 5: Complete Job & Generate Worker Completion QR (Dynamic pricing by time, 90% Worker split)
  const handleCompleteJob = async (bookingId, basePrice) => {
    const b = jobs.find((j) => (j.bookingId || j.id || j._id) === bookingId) || {};
    const matCost = parseInt(materialInput) || 0;
    const itemName = materialItemName.trim() || (matCost > 0 ? "Replacement Spare Parts" : "General Service Spares");
    const photo = completionPhotoUrl || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500";

    const elapsed = stopwatchSeconds > 0 ? stopwatchSeconds : 120;
    const calc = calculateDynamicWorkPricing(b, elapsed);
    const totalBill = calc.totalAmount + matCost;
    const workerEarnings = Math.round(totalBill * 0.90);
    const vendorProfit = Math.round(totalBill * 0.05);
    const adminProfit = totalBill - workerEarnings - vendorProfit;

    const patchData = {
      status: "awaiting_payment",
      workerStatus: "awaiting_payment",
      workCompletedAt: Date.now(),
      finalCalculatedAmount: totalBill,
      totalAmount: totalBill,
      finalTotalAmount: totalBill,
      price: `₹${totalBill}`,
      workerEarningsAmount: workerEarnings,
      vendorEarningsAmount: vendorProfit,
      adminEarningsAmount: adminProfit,
      payoutSplit: {
        totalAmount: totalBill,
        workerEarnings,
        vendorProfit,
        adminProfit,
        workerPercentage: 90,
        vendorPercentage: 5,
        adminPercentage: 5
      },
      materialsCost: matCost,
      materialCharge: matCost,
      replacedItemName: itemName,
      completionNotes: completionNotes || "Service successfully fulfilled.",
      completionPhotos: [photo],
      qrGenerated: true,
      qrGeneratedAt: new Date().toISOString()
    };

    setStopwatchRunning(false);
    broadcastBookingSync(bookingId, patchData);
    updateJobStateLocally(bookingId, patchData);

    showToast(`✅ Work Complete! Helper Payment QR generated with ₹${totalBill}. Waiting for customer to scan and pay.`);

    if (worker) {
      const updatedWorker = {
        ...worker,
        earnings: {
          ...worker.earnings,
          totalEarnings: (worker.earnings?.totalEarnings || 0) + workerEarnings,
          pendingPayout: (worker.earnings?.pendingPayout || 0) + workerEarnings
        },
        performance: {
          ...worker.performance,
          completedJobsCount: (worker.performance?.completedJobsCount || 0) + 1
        }
      };
      setWorker(updatedWorker);
      localStorage.setItem("helper_worker", JSON.stringify(updatedWorker));
    }

    try {
      await fetch(`${API_BASE}/bookings/${bookingId}/worker-complete`, {
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
    } catch (e) {}

    setMaterialInput("");
    setMaterialItemName("");
    setCompletionNotes("");
    setCompletionPhotoUrl("");
  };

  // Stage 6: Confirm Payment Received (Worker gets 90%)
  const handleConfirmPayment = async (bookingId, totalBill) => {
    const bill = Number(totalBill) || 499;
    const workerEarnings = Math.round(bill * 0.90);
    const vendorProfit = Math.round(bill * 0.05);
    const adminProfit = bill - workerEarnings - vendorProfit;

    const patchData = {
      paymentStatus: "paid",
      status: "completed",
      workerStatus: "completed",
      paidAt: new Date().toISOString(),
      workerEarningsAmount: workerEarnings,
      vendorEarningsAmount: vendorProfit,
      adminEarningsAmount: adminProfit
    };

    const targetKeys = [bookingId].filter(Boolean).map(String);
    const isTarget = (b) => {
      if (!b) return false;
      const itemKeys = [b.bookingId, b.id, b._id, b.bookingCode].filter(Boolean).map(String);
      return itemKeys.some((k) => targetKeys.includes(k));
    };

    // 1. Immediately update jobs state so the QR card is removed from activeJobsList immediately!
    setJobs((prev) => prev.map((b) => (isTarget(b) ? { ...b, ...patchData } : b)));

    // 2. Immediately credit worker wallet
    setWorker((prev) => {
      if (!prev) return prev;
      const curWallet = prev.earnings?.pendingPayout || 0;
      const curTotal = prev.earnings?.totalEarnings || 0;
      const updated = {
        ...prev,
        earnings: {
          ...prev.earnings,
          pendingPayout: curWallet + workerEarnings,
          totalEarnings: curTotal + workerEarnings
        }
      };
      try {
        localStorage.setItem("helper_worker", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Save to completed jobs store so Job History count and tab updates immediately
    try {
      const existingDone = JSON.parse(localStorage.getItem("helper_completed_jobs") || "[]");
      const matched = jobs.find(isTarget);
      const doneItem = { ...(matched || {}), ...patchData };
      localStorage.setItem("helper_completed_jobs", JSON.stringify([doneItem, ...existingDone.filter(j => !isTarget(j))]));
    } catch (e) {}

    // 4. Update sync stores and broadcast
    broadcastBookingSync(bookingId, patchData);
    updateJobStateLocally(bookingId, patchData);
    showToast(`🎉 Payment of ₹${bill} verified! ₹${workerEarnings} (90%) added to your wallet. Order completed!`);

    const foundBooking = jobs.find(isTarget);
    if (foundBooking) {
      setCustomerFeedbackBooking({ ...foundBooking, ...patchData });
    }

    try {
      await fetch(`${API_BASE}/bookings/${bookingId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "upi_qr",
          paidAmount: bill
        })
      });
    } catch (e) {}
  };

  // Stage 7: Submit Worker Review for Customer
  const handleSubmitCustomerFeedback = async (e) => {
    if (e) e.preventDefault();
    if (!customerFeedbackBooking) return;
    const bId = customerFeedbackBooking.bookingId || customerFeedbackBooking.id || customerFeedbackBooking._id || customerFeedbackBooking.bookingCode;
    try {
      const patch = await handleDemoWorkerSubmitCustomerFeedback(customerFeedbackBooking, {
        rating: customerRating,
        comment: customerReview || "Very polite and helpful customer. Prompt payment!",
        tags: customerFeedbackTags.length > 0 ? customerFeedbackTags : ["Polite Customer", "Prompt Payment", "Accurate Address"]
      });
      updateJobStateLocally(bId, patch);
      showToast("⭐ Customer review submitted successfully!");
      setCustomerFeedbackBooking(null);
      setCustomerReview("");
      setCustomerRating(5);
      setCustomerFeedbackTags([]);
    } catch (err) {
      showToast("Review submitted!");
      setCustomerFeedbackBooking(null);
    }
  };

  const updateJobStateLocally = (bookingId, patch) => {
    const targetKeys = [bookingId, patch?.bookingId, patch?.id, patch?._id, patch?.bookingCode].filter(Boolean).map(String);
    const isTarget = (b) => {
      if (!b) return false;
      const itemKeys = [b.bookingId, b.id, b._id, b.bookingCode].filter(Boolean).map(String);
      return itemKeys.some((k) => targetKeys.includes(k));
    };

    setJobs((prev) =>
      prev.map((b) => (isTarget(b) ? { ...b, ...patch } : b))
    );

    const syncStores = ["helper_worker_jobs", "helper_bookings", "helper_user_bookings"];
    syncStores.forEach((sk) => {
      try {
        const raw = localStorage.getItem(sk);
        if (raw) {
          const list = JSON.parse(raw).map((b) =>
            isTarget(b) ? { ...b, ...patch } : b
          );
          localStorage.setItem(sk, JSON.stringify(list));
        }
      } catch (e) {}
    });
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
      const res = await fetch(`${API_BASE}/workers/${worker?.workerId || worker?.id}/approve`, {
        method: "PUT"
      });
      await res.json();
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

  const handleCheckApprovalStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/workers/${worker?.workerId || worker?.id}`);
      const data = await res.json();
      if (data && data.success && data.worker) {
        if (data.worker.verificationStatus === "verified" || data.worker.status === "active") {
          const updated = {
            ...worker,
            ...data.worker,
            verificationStatus: "verified",
            status: "active",
            availability: { ...(worker?.availability || {}), isOnline: true }
          };
          setWorker(updated);
          localStorage.setItem("helper_worker", JSON.stringify(updated));
          showToast("🎉 Congratulations! Your nearest vendor approved your application! Unlocking Dashboard...");
        } else {
          showToast("⏳ Status: Still under vendor review. Please check back shortly.");
        }
      } else {
        showToast("⏳ Status: Under review by nearest vendor.");
      }
    } catch (e) {
      showToast("⏳ Status: Under review by nearest vendor.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("helper_worker");
    localStorage.removeItem("helper_worker_token");
    navigate("/login");
  };

  const activeJobsList = jobs.filter((b) => {
    const isNotDone = b.workerStatus !== "completed" || b.paymentStatus === "payment_due";
    if (!isNotDone) return false;
    if (!selectedTradeFilter || selectedTradeFilter === "All Services") return true;
    const sName = (b.serviceName || b.service || b.category || "").toLowerCase();
    if (!sName) return true;
    const filterKey = selectedTradeFilter.toLowerCase().replace(/ specialist| & deep cleaning| & sanitary| & hvac/g, "").trim();
    return sName.includes(filterKey) || filterKey.includes(sName);
  });

  // Guarantee newest bookings and newly assigned orders ALWAYS stay at the very top
  const sortedActiveJobsList = useMemo(() => {
    return [...activeJobsList].sort((a, b) => {
      // 1. Status priority: newly assigned/dispatched/ready orders stay at the top
      const statusPriority = {
        assigned: 1,
        vendor_accepted: 1,
        ready_for_worker: 1,
        dispatched: 1,
        accepted: 2,
        traveling: 3,
        on_the_way: 3,
        arrived: 4,
        in_progress: 5,
        awaiting_payment: 6,
        completed: 7
      };
      const pA = statusPriority[a.workerStatus || a.status] || 10;
      const pB = statusPriority[b.workerStatus || b.status] || 10;
      if (pA !== pB) return pA - pB;

      // 2. Newest updated/accepted/created timestamp on top
      const parseTime = (item) => {
        if (!item) return 0;
        if (typeof item.timestamp === "number" && item.timestamp > 0) return item.timestamp;
        if (typeof item._timestamp === "number" && item._timestamp > 0) return item._timestamp;
        const d = item.vendorAcceptedAt || item.updatedAt || item.createdAt || (item.date !== "Just now" && item.date !== "Today" ? item.date : null);
        if (d && !isNaN(new Date(d).getTime())) return new Date(d).getTime();
        if (item.scheduledTimestamp) return item.scheduledTimestamp;
        if (item.date === "Just now") return Date.now();
        const num = String(item.bookingCode || item.bookingId || item.id || item._id || "").replace(/\D/g, "");
        return parseInt(num, 10) || 0;
      };

      return parseTime(b) - parseTime(a);
    });
  }, [activeJobsList]);

  const totalPages = Math.ceil(sortedActiveJobsList.length / jobsPerPage) || 1;
  const paginatedActiveJobs = sortedActiveJobsList.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const completedJobsList = jobs.filter((b) => b.workerStatus === "completed" && b.paymentStatus !== "payment_due");

  const totalEarned = worker?.earnings?.totalEarnings || 42600;
  const pendingPayout = worker?.earnings?.pendingPayout || 1800;
  const ratingScore = worker?.performance?.rating || 4.9;
  const completedCount = worker?.performance?.completedJobsCount || completedJobsList.length || 142;

  // Render "Approval is Pending" screen if worker is self-registered and awaiting vendor approval
  const isPendingApproval = worker && (
    worker.verificationStatus === "pending" ||
    worker.status === "inactive" ||
    worker.status === "pending_approval"
  );

  if (isPendingApproval) {
    return (
      <div className="worker-pending-approval-page animate-fade-in">
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
              border: "1px solid rgba(245, 158, 11, 0.4)",
              animation: "adminSlideIn 0.3s ease"
            }}
          >
            <span>📢</span>
            <span>{toastMsg}</span>
          </div>
        )}

        <header className="worker-pending-header">
          <div className="worker-pending-logo">
            <span className="logo-emoji">👷</span>
            <div>
              <h3>HELPER FIELD PRO</h3>
              <span className="logo-sub">Partner Network • Verification Hub</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button 
              type="button" 
              onClick={toggleTheme} 
              className="worker-icon-btn" 
              title="Toggle Theme"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            <button 
              type="button" 
              onClick={handleLogout} 
              className="worker-logout-chip"
            >
              <span>🚪 Sign Out</span>
            </button>
          </div>
        </header>

        <main className="worker-pending-main-container">
          <div className="worker-pending-card">
            <div className="worker-pending-badge">
              <span className="pulse-dot"></span>
              <span>APPLICATION SUBMITTED • UNDER VENDOR REVIEW</span>
            </div>

            <div className="worker-pending-icon-circle">
              <span className="big-icon-hourglass">⏳</span>
            </div>

            <h1 className="worker-pending-title">APPROVAL IS PENDING</h1>
            <p className="worker-pending-desc">
              Aapki <strong>₹399 vendor onboarding fee</strong> successfully pay ho chuki hai. Aapke nearest vendor <strong>({worker.vendorName || "Amritam Services Hub"})</strong> ko verification aur review ke liye aapki application send kar di gayi hai.
            </p>

            <div className="worker-pending-info-grid">
              <div className="info-stat-box">
                <span className="stat-label">Onboarding Charge</span>
                <div className="stat-val text-emerald">
                  <span>₹{worker.feeAmount || 399} PAID</span>
                  <span className="check-mark">✓</span>
                </div>
                <span className="stat-hint">Txn: {worker.feeTxnId || "TX-ONBOARD-399"}</span>
              </div>

              <div className="info-stat-box">
                <span className="stat-label">Assigned Nearest Vendor</span>
                <div className="stat-val">
                  {worker.vendorName || "Amritam Services Hub"}
                </div>
                <span className="stat-hint">📍 Indore / Palasia Central</span>
              </div>

              <div className="info-stat-box">
                <span className="stat-label">Technician Trade</span>
                <div className="stat-val">
                  {worker.category || "Home Specialist"}
                </div>
                <span className="stat-hint">{worker.experienceYears || 3} Years Experience</span>
              </div>

              <div className="info-stat-box">
                <span className="stat-label">Aadhaar / ID Status</span>
                <div className="stat-val">
                  {worker.documents?.aadhaarNumber ? `Aadhaar •••• ${worker.documents.aadhaarNumber.slice(-4)}` : "Submitted ✓"}
                </div>
                <span className="stat-hint">Documents under review</span>
              </div>
            </div>

            <div className="worker-verification-stepper">
              <div className="v-step done">
                <div className="v-num">✓</div>
                <div className="v-text">
                  <strong>1. Registration</strong>
                  <span>Profile Created</span>
                </div>
              </div>
              <div className="v-line filled"></div>
              <div className="v-step done">
                <div className="v-num">✓</div>
                <div className="v-text">
                  <strong>2. ₹399 Fee Paid</strong>
                  <span>Vendor Onboarding</span>
                </div>
              </div>
              <div className="v-line filled"></div>
              <div className="v-step active">
                <div className="v-num">3</div>
                <div className="v-text">
                  <strong>3. Vendor Review</strong>
                  <span className="pulse-text">Approval Pending...</span>
                </div>
              </div>
              <div className="v-line"></div>
              <div className="v-step locked">
                <div className="v-num">🔒</div>
                <div className="v-text">
                  <strong>4. Dashboard</strong>
                  <span>Live Dispatch</span>
                </div>
              </div>
            </div>

            <div className="worker-pending-actions">
              <button 
                type="button"
                onClick={handleCheckApprovalStatus}
                className="btn-check-status"
              >
                <span>🔄</span>
                <span>Check Live Approval Status</span>
              </button>

              <button 
                type="button"
                onClick={handleInstantApproveSim}
                className="btn-simulate-approve"
                title="Instant Demo / Testing Shortcut"
              >
                <span>⚡</span>
                <span>Simulate Vendor Approval (Instant Test)</span>
              </button>
            </div>

            <div className="worker-vendor-contact-bar">
              <span>Need urgent approval? Call your nearest vendor directly:</span>
              <a href={`tel:${worker.vendorPhone || "+919876500001"}`} className="vendor-call-chip">
                <span>📞</span>
                <span>{worker.vendorPhone || "+91 98765 00001"}</span>
              </a>
            </div>

          </div>
        </main>
      </div>
    );
  }

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
              navigate("/login");
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
              className="wrk-duty-toggle"
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
              <span className="live-radar-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: worker?.availability?.isOnline !== false ? "#10B981" : "#94A3B8" }} />
              <span>{worker?.availability?.isOnline !== false ? "ONLINE (DUTY)" : "OFFLINE"}</span>
            </button>

            {/* Shift Punch Button */}
            <button 
              type="button"
              className="admin-action-btn punch-in"
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
                    New orders appear at the top. Accept orders, broadcast live GPS travel, verify doorstep OTP, and execute service with live stopwatch.
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {totalPages > 1 && (
                    <span style={{ fontSize: "12px", color: "var(--wrk-text-muted)", fontWeight: 700 }}>
                      Page {currentPage} of {totalPages}
                    </span>
                  )}
                  <span className="admin-count-pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                    {sortedActiveJobsList.length} Active Orders
                  </span>
                </div>
              </div>

              {/* Multi-Service Trade Filter Bar */}
              <div style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                padding: "12px 16px",
                background: "rgba(15, 23, 42, 0.04)",
                borderRadius: "14px",
                margin: "12px 0 16px 0",
                alignItems: "center",
                border: "1px solid rgba(0, 0, 0, 0.06)"
              }}>
                <span style={{ fontSize: "12.5px", fontWeight: 800, color: "var(--wrk-text-muted)", marginRight: "4px" }}>
                  ⚡ Service Filter:
                </span>
                {[
                  { id: "All Services", label: "🌟 All Services" },
                  { id: "House Cleaning", label: "🧹 House Cleaning" },
                  { id: "Plumber", label: "🔧 Plumber" },
                  { id: "Electrician", label: "💡 Electrician" },
                  { id: "AC Repair", label: "🧊 AC Repair" },
                  { id: "Driver", label: "🚗 Driver" },
                  { id: "Wall Painter", label: "🎨 Painter" },
                  { id: "Carpenter", label: "🪚 Carpenter" }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedTradeFilter(cat.id);
                      setCurrentPage(1);
                    }}
                    style={{
                      background: selectedTradeFilter === cat.id ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" : "rgba(255, 255, 255, 0.9)",
                      color: selectedTradeFilter === cat.id ? "#FFFFFF" : "#1E293B",
                      border: `1.5px solid ${selectedTradeFilter === cat.id ? "#10B981" : "rgba(0, 0, 0, 0.12)"}`,
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: selectedTradeFilter === cat.id ? "0 2px 8px rgba(16, 185, 129, 0.3)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {sortedActiveJobsList.length === 0 ? (
                <div className="admin-empty-state">
                  <span style={{ fontSize: "52px" }}>🎉</span>
                  <h4>All Assigned Jobs Completed!</h4>
                  <p>Your radar is live. New customer orders assigned by your vendor will appear here instantly at the top.</p>
                  <button 
                    type="button" 
                    className="btn-secondary-outline"
                    onClick={() => fetchWorkerJobs(worker?.workerId || worker?.id)}
                  >
                    🔄 Refresh Job Radar
                  </button>
                </div>
              ) : (
                paginatedActiveJobs.map((b) => {
                  const bookingId = b._id || b.id || b.bookingCode || b.bookingId;
                  const status = (b.workerStatus || b.status || "assigned").toLowerCase();
                  const isAssigned = (status === "assigned" || status === "vendor_accepted" || status === "dispatched") && b.workerStatus !== "awaiting_payment" && b.workerStatus !== "completed";
                  const isAccepted = status === "accepted";
                  const isTraveling = status === "traveling" || status === "on_the_way";
                  const isArrived = status === "arrived";
                  const isInProgress = status === "in_progress";
                  const isAwaitingPayment = (status === "awaiting_payment" || b.workerStatus === "awaiting_payment") && !isAssigned && !isAccepted && !isTraveling && !isArrived && !isInProgress && b.paymentStatus !== "paid";
                  const isPaid = b.paymentStatus === "paid";
                  const correctDoorOtp = getBookingDoorOtp(b);

                  // Calculate schedule countdown & 1-hour navigation availability
                  const sched = calculateScheduleDetails(b, nowTime);
                  const isNavLocked = sched ? (sched.diffMs > 3600000 && !unlockedNavMap[bookingId]) : false;

                  return (
                    <div className="wrk-active-job-card" key={bookingId}>
                      <div className="wrk-job-header">
                        <div className="wrk-job-header-left">
                          <span className="wrk-job-id-pill">#{b.bookingCode || "HLP-9841"}</span>
                          <span className={`wrk-job-status-chip ${status}`}>
                            {status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--wrk-text-main)" }}>
                            🕒 {b.scheduledDate || "Today"} — <span style={{ color: "#FF4D2D" }}>{b.scheduledTime || "11:00 AM"}</span>
                          </div>
                          {sched && (
                            <span style={{
                              fontSize: "11px",
                              fontWeight: 800,
                              padding: "2px 8px",
                              borderRadius: "10px",
                              background: sched.isPast ? "rgba(16, 185, 129, 0.15)" : sched.isTomorrow ? "rgba(245, 158, 11, 0.15)" : "rgba(37, 99, 235, 0.12)",
                              color: sched.isPast ? "#059669" : sched.isTomorrow ? "#D97706" : "#2563EB"
                            }}>
                              {sched.arrivalBadgeText || "Scheduled"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 5-Stage Stepper Track */}
                      <div className="wrk-stepper-track">
                        <div className={`wrk-step-node ${!isAssigned ? "completed" : "active"}`}>
                          <div className="wrk-step-circle">{!isAssigned ? "✓" : "1"}</div>
                          <span className="wrk-step-label">Accept</span>
                        </div>
                        <div className={`wrk-step-bar-line ${isTraveling || isArrived || isInProgress || isAwaitingPayment || isPaid ? "filled" : ""}`} />

                        <div className={`wrk-step-node ${isTraveling ? "active" : (isArrived || isInProgress || isAwaitingPayment || isPaid) ? "completed" : ""}`}>
                          <div className="wrk-step-circle">{(isArrived || isInProgress || isAwaitingPayment || isPaid) ? "✓" : "2"}</div>
                          <span className="wrk-step-label">Location</span>
                        </div>
                        <div className={`wrk-step-bar-line ${isArrived || isInProgress || isAwaitingPayment || isPaid ? "filled" : ""}`} />

                        <div className={`wrk-step-node ${isArrived ? "active" : (isInProgress || isAwaitingPayment || isPaid) ? "completed" : ""}`}>
                          <div className="wrk-step-circle">{(isInProgress || isAwaitingPayment || isPaid) ? "✓" : "3"}</div>
                          <span className="wrk-step-label">Arrived</span>
                        </div>
                        <div className={`wrk-step-bar-line ${isInProgress || isAwaitingPayment || isPaid ? "filled" : ""}`} />

                        <div className={`wrk-step-node ${isInProgress ? "active" : (isAwaitingPayment || isPaid) ? "completed" : ""}`}>
                          <div className="wrk-step-circle">{(isAwaitingPayment || isPaid) ? "✓" : (isInProgress ? "⏱️" : "4")}</div>
                          <span className="wrk-step-label">Work Timer</span>
                        </div>
                        <div className={`wrk-step-bar-line ${isAwaitingPayment || isPaid ? "filled" : ""}`} />

                        <div className={`wrk-step-node ${isAwaitingPayment ? "active" : isPaid ? "completed" : ""}`}>
                          <div className="wrk-step-circle">{isPaid ? "✓" : isAwaitingPayment ? "QR" : "5"}</div>
                          <span className="wrk-step-label">Scan QR</span>
                        </div>
                      </div>

                      {/* Job Body */}
                      <div className="wrk-job-body">
                        <div className="wrk-customer-meta-row">
                          <div className="wrk-customer-avatar-info">
                            <div className="wrk-cust-avatar">
                              {b.customerName ? b.customerName.charAt(0).toUpperCase() : (b.name ? b.name.charAt(0).toUpperCase() : "C")}
                            </div>
                            <div className="wrk-cust-text">
                              <strong style={{ fontSize: "15px", color: "var(--wrk-text-main)" }}>
                                {b.customerName || b.name || "Customer"}
                              </strong>
                              <span>Service: <strong>{b.serviceName || b.service || "Specialist Service"}</strong></span>
                            </div>
                          </div>

                          <div className="wrk-customer-actions">
                            <a href={`tel:${b.customerPhone || b.phone || "9876543210"}`} className="wrk-btn-call" title="Call Customer">
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
                              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.customerAddress || b.address || b.fullAddress || "Indore, MP")}`}
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
                              {b.customerAddress || b.address || b.fullAddress || "House #402, Block B, City Center"}
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
                          <div style={{ marginTop: "12px" }}>
                            <div style={{
                              background: "rgba(16, 185, 129, 0.08)",
                              border: "1px dashed #10B981",
                              borderRadius: "10px",
                              padding: "10px 14px",
                              marginBottom: "10px",
                              fontSize: "12.5px",
                              color: "#065F46"
                            }}>
                              ⚡ <strong>Demo Vendor Dispatched Order:</strong> Customer ne <strong>{b.serviceName || b.service}</strong> book ki hai. Accept karte hi slot lock ho jayega aur appointment schedule establish ho jayega.
                            </div>
                            <button 
                              type="button" 
                              className="wrk-btn-stage-action"
                              style={{
                                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                                boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
                                fontSize: "14px",
                                fontWeight: 800,
                                padding: "14px 22px"
                              }}
                              onClick={() => handleAcceptJob(bookingId)}
                            >
                              <span>✓ Accept Service Request &amp; Lock Slot (ऑर्डर स्वीकार करें) 🚀</span>
                            </button>
                          </div>
                        )}

                        {/* STAGE 2: GO TO LOCATION — LOCKED UNTIL 1 HOUR BEFORE SLOT */}
                        {isAccepted && (
                          <div style={{ marginTop: "12px" }}>
                            {isNavLocked ? (
                              <div style={{
                                background: "rgba(245, 158, 11, 0.08)",
                                border: "1.5px solid rgba(245, 158, 11, 0.35)",
                                borderRadius: "14px",
                                padding: "16px 18px",
                                marginBottom: "8px"
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                                  <span style={{ fontSize: "13.5px", fontWeight: 800, color: "#D97706", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                    🔒 Location Navigation Locked
                                  </span>
                                  <span style={{ fontSize: "11.5px", background: "rgba(245, 158, 11, 0.2)", color: "#B45309", padding: "3px 10px", borderRadius: "10px", fontWeight: 800 }}>
                                    ⏰ {sched?.countdownTitle || "Scheduled Ahead"}
                                  </span>
                                </div>
                                <p style={{ margin: "0 0 10px 0", fontSize: "12.5px", color: "#78350F", lineHeight: 1.5 }}>
                                  Customer ne booking <strong>{b.scheduledDate || "Tomorrow"} ({b.scheduledTime || "Appointment"})</strong> ke liye ki hai. Customer privacy aur safety rule ke mutabiq, doorstep location navigation appointment slot se <strong>1 ghante pahle</strong> automatically unlock hogi.
                                </p>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "8px", borderTop: "1px dashed rgba(245, 158, 11, 0.3)" }}>
                                  <span style={{ fontSize: "11.5px", color: "#92400E" }}>
                                    ⏱️ Unlocks at 1 hour before {b.scheduledTime || "slot time"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUnlockNavigation(bookingId)}
                                    style={{
                                      background: "rgba(245, 158, 11, 0.18)",
                                      border: "1px solid #D97706",
                                      color: "#B45309",
                                      padding: "6px 14px",
                                      borderRadius: "8px",
                                      fontSize: "12px",
                                      fontWeight: 800,
                                      cursor: "pointer"
                                    }}
                                    title="Fast-forward for demo testing without waiting"
                                  >
                                    ⚡ Fast-Test: Unlock 1-Hour Navigation Now
                                  </button>
                                </div>

                                <button 
                                  type="button" 
                                  disabled
                                  className="wrk-btn-stage-action"
                                  style={{
                                    background: "#94A3B8",
                                    color: "#FFFFFF",
                                    cursor: "not-allowed",
                                    boxShadow: "none",
                                    marginTop: "12px",
                                    opacity: 0.75
                                  }}
                                >
                                  <span>🔒 Go to Location (Locked • Unlocks 1 hour before slot)</span>
                                </button>
                              </div>
                            ) : (
                              <div>
                                <div style={{
                                  background: "rgba(37, 99, 235, 0.08)",
                                  border: "1px solid rgba(37, 99, 235, 0.25)",
                                  borderRadius: "10px",
                                  padding: "10px 14px",
                                  marginBottom: "8px",
                                  fontSize: "12.5px",
                                  color: "#1E40AF"
                                }}>
                                  🛵 <strong>Slot Time Window Active:</strong> Appointment slot 1 ghante ke daayre me hai! Click below to start traveling to customer doorstep.
                                </div>
                                <button 
                                  type="button" 
                                  className="wrk-btn-stage-action animate-pulse"
                                  style={{
                                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                                    fontSize: "14px",
                                    fontWeight: 800,
                                    padding: "14px 22px"
                                  }}
                                  onClick={() => handleStartTraveling(bookingId)}
                                >
                                  <span>📍 Go to Location (Start Traveling &amp; Open GPS) 🛵</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {isTraveling && (
                          <button 
                            type="button" 
                            className="wrk-btn-stage-action"
                            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)", boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)" }}
                            onClick={() => handleArrived(bookingId)}
                          >
                            <span>🏁 I am Arrived</span>
                          </button>
                        )}

                        {isArrived && (
                          <div className="wrk-stopwatch-box" style={{ background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)", border: "2px solid #F59E0B" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                              <span style={{ fontSize: "13px", fontWeight: 800, color: "#B45309" }}>
                                🔔 AT DOORSTEP • CUSTOMER VERIFICATION
                              </span>
                              <a
                                href={`tel:${(b.customerPhone || "9876543210").replace(/[^0-9+]/g, "")}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  background: "#10B981",
                                  color: "#ffffff",
                                  padding: "6px 14px",
                                  borderRadius: "10px",
                                  textDecoration: "none",
                                  fontWeight: 800,
                                  fontSize: "12.5px"
                                }}
                              >
                                📞 Call Customer ({b.customerPhone || "Call"})
                              </a>
                            </div>
                            <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#78350F" }}>
                              Ghar pahuch kar customer ko call karein ya doorbell bajayein, aur unki screen par dikh raha 4-digit Service Start OTP maangein:
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
                                Verify OTP & Start Work ⚡
                              </button>
                              <button
                                type="button"
                                onClick={() => setDoorOtpInput(correctDoorOtp)}
                                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px dashed #B45309", background: "rgba(245, 158, 11, 0.15)", color: "#B45309", fontSize: "12px", cursor: "pointer", fontWeight: 700 }}
                              >
                                Quick Fill ({correctDoorOtp})
                              </button>
                            </div>
                            <span style={{ fontSize: "11px", color: "#92400E" }}>
                              Customer screen par 4-digit OTP active hai: <strong>{correctDoorOtp}</strong>
                            </span>
                          </div>
                        )}

                        {isInProgress && (
                          <div className="wrk-completion-form">
                            <div className="wrk-stopwatch-box" style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", border: "2px solid #3B82F6" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800, color: "#1D4ED8" }}>
                                  ⏱️ LIVE SERVICE COUNTDOWN & STOPWATCH
                                </span>
                                <span style={{ background: "#2563EB", color: "#fff", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 700 }}>
                                  ACTIVE WORK
                                </span>
                              </div>
                              <div className="wrk-stopwatch-display" style={{ color: "#1E3A8A", fontSize: "36px", fontWeight: 900, margin: "8px 0" }}>
                                {formatTimer(stopwatchSeconds)}
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#3B82F6" }}>
                                <span>Estimated Slot: 1 - 2 Hours</span>
                                <span>Hourly Rate: ₹{b.hourlyRate || 299}/hr</span>
                              </div>
                            </div>

                            <div className="wrk-input-row">
                              <div className="wrk-input-group">
                                <label>Replaced Item / Spare Parts Name (Optional)</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Brass Angle Valve & Teflon Tape"
                                  value={materialItemName}
                                  onChange={(e) => setMaterialItemName(e.target.value)}
                                />
                              </div>
                              <div className="wrk-input-group">
                                <label>Spare Parts Cost (₹) (Optional)</label>
                                <input 
                                  type="number" 
                                  min="0" 
                                  placeholder="0 if no parts replaced"
                                  value={materialInput}
                                  onChange={(e) => setMaterialInput(e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Mathematical Bill Preview - Worker ONLY sees their 90% payout! */}
                            {(() => {
                              const visiting = Number(b.homeServiceCharge || 149);
                              const labor = Number(b.hourlyRate || 299);
                              const parts = parseInt(materialInput) || 0;
                              const previewTotal = visiting + labor + parts;
                              const workerShare = Math.round(previewTotal * 0.90);

                              return (
                                <div style={{
                                  background: "rgba(16, 185, 129, 0.08)",
                                  border: "1px solid rgba(16, 185, 129, 0.4)",
                                  borderRadius: "12px",
                                  padding: "14px 16px",
                                  fontSize: "13px"
                                }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                    <span style={{ color: "var(--wrk-text-muted)" }}>Estimated Customer Bill:</span>
                                    <strong>₹{previewTotal}</strong>
                                  </div>
                                  {parts > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "#2563EB" }}>
                                      <span>Spare Parts ({materialItemName || "Items"}):</span>
                                      <strong>+₹{parts}</strong>
                                    </div>
                                  )}
                                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "8px", marginTop: "6px" }}>
                                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#065F46" }}>Your 90% Net Take-home Payout:</span>
                                    <span style={{ fontSize: "16px", fontWeight: 900, color: "#10B981" }}>₹{workerShare}</span>
                                  </div>
                                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--wrk-text-muted)" }}>
                                    * 90% of total payment directly credited to your worker wallet upon completion.
                                  </p>
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
                              style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)", marginTop: "12px" }}
                              onClick={() => handleCompleteJob(bookingId, b.price)}
                            >
                              <span>✅ Complete Work & Generate Customer QR</span>
                            </button>
                          </div>
                        )}

                        {/* Stage: Worker Completion QR Generated - Waiting for Customer Scan & Pay */}
                        {isAwaitingPayment && (
                          <div style={{
                            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                            borderRadius: "18px",
                            padding: "24px 20px",
                            color: "#FFFFFF",
                            marginTop: "16px",
                            textAlign: "center",
                            border: "2px solid rgba(16, 185, 129, 0.5)",
                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
                          }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.2)", color: "#10B981", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 800, marginBottom: "14px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", animation: "pulseDot 1.2s infinite" }} />
                              <span>WORK COMPLETED • SERVICE QR GENERATED</span>
                            </div>

                            <h4 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 800, color: "#FFFFFF" }}>
                              Customer ko ye QR Scan karne ko kahein
                            </h4>
                            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#94A3B8" }}>
                              Demo User apne screen ke <strong>"📷 Scan Worker QR"</strong> option se scan karke pay karega
                            </p>

                            {/* Dynamic Worker Completion QR Code */}
                            <div style={{
                              width: "210px",
                              height: "210px",
                              margin: "0 auto 16px",
                              background: "#FFFFFF",
                              borderRadius: "16px",
                              padding: "12px",
                              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=186x186&data=${encodeURIComponent(`HELPER_WORK:${bookingId}:${b.finalCalculatedAmount || b.totalAmount || 499}:${Date.now()}`)}`}
                                alt="Worker Completion QR"
                                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
                              />
                            </div>

                            {/* Worker-Only Payout Display */}
                            {(() => {
                              const totalBill = b.finalCalculatedAmount || b.totalAmount || 499;
                              const workerPayout = b.workerEarningsAmount || Math.round(totalBill * 0.90);
                              return (
                                <div style={{
                                  background: "rgba(255, 255, 255, 0.06)",
                                  borderRadius: "12px",
                                  padding: "12px 16px",
                                  marginBottom: "16px",
                                  textAlign: "left"
                                }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", color: "#CBD5E1" }}>
                                    <span>Total Service Amount:</span>
                                    <strong>₹{totalBill}</strong>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", color: "#10B981", fontWeight: 800, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
                                    <span>Your 90% Take-home Earnings:</span>
                                    <span>₹{workerPayout}</span>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Realtime Waiting Indicator */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "12.5px", color: "#FBBF24", marginBottom: "14px" }}>
                              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#FBBF24" }} />
                              <span>Waiting for Customer to Scan & Pay...</span>
                            </div>

                            {/* Fast Simulation Trigger for Testing */}
                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(bookingId, b.finalCalculatedAmount || b.totalAmount || 499)}
                              style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "10px",
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "#10B981",
                                border: "1px dashed #10B981",
                                fontSize: "13px",
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              ⚡ Simulate Customer Instant Pay (Demo Sync)
                            </button>
                          </div>
                        )}

                        {/* Paid State Confirmation & Mutual Customer Review */}
                        {b.paymentStatus === "paid" && (
                          <div style={{
                            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.12) 100%)",
                            border: "1.5px solid #10B981",
                            borderRadius: "14px",
                            padding: "16px",
                            textAlign: "center",
                            marginTop: "16px"
                          }}>
                            <span style={{ fontSize: "28px" }}>🎉</span>
                            <h4 style={{ margin: "6px 0 2px", color: "#065F46", fontSize: "16px", fontWeight: 800 }}>
                              Payment Received Successfully!
                            </h4>
                            <p style={{ margin: 0, fontSize: "13px", color: "#047857" }}>
                              Your 90% net take-home earnings of <strong>₹{b.workerEarningsAmount || Math.round((b.totalAmount || 499) * 0.90)}</strong> have been credited to your worker wallet.
                            </p>

                            {/* Mutual Review: Worker -> Customer */}
                            {b.customerRating ? (
                              <div style={{
                                marginTop: "12px",
                                background: "rgba(255, 255, 255, 0.7)",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                textAlign: "left",
                                fontSize: "12.5px"
                              }}>
                                <span style={{ color: "#D97706", fontWeight: 800 }}>
                                  {"★".repeat(b.customerRating)} You rated customer: {b.customerRating}/5
                                </span>
                                {b.customerReview && (
                                  <p style={{ margin: "4px 0 0", color: "#065F46" }}>
                                    "{b.customerReview}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCustomerFeedbackBooking(b)}
                                style={{
                                  marginTop: "12px",
                                  width: "100%",
                                  padding: "10px 16px",
                                  borderRadius: "10px",
                                  background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                                  color: "#FFFFFF",
                                  border: "none",
                                  fontWeight: 800,
                                  fontSize: "13px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px",
                                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)"
                                }}
                              >
                                <span>⭐ Rate Customer Experience (ग्राहक को रेटिंग दें)</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Pagination Controls Bar */}
              {sortedActiveJobsList.length > 0 && totalPages > 1 && (
                <div className="wrk-pagination-bar" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  padding: "16px 20px",
                  background: "rgba(15, 23, 42, 0.03)",
                  borderRadius: "14px",
                  marginTop: "20px",
                  border: "1px solid rgba(0, 0, 0, 0.08)"
                }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--wrk-text-muted)" }}>
                    Showing <strong>{((currentPage - 1) * jobsPerPage) + 1} - {Math.min(currentPage * jobsPerPage, sortedActiveJobsList.length)}</strong> of <strong>{sortedActiveJobsList.length}</strong> Orders
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        border: "1px solid rgba(0, 0, 0, 0.15)",
                        background: currentPage <= 1 ? "rgba(0,0,0,0.04)" : "#FFFFFF",
                        color: currentPage <= 1 ? "#94A3B8" : "#1E293B",
                        cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        fontSize: "13px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: currentPage <= 1 ? "none" : "0 2px 6px rgba(0,0,0,0.06)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <span>← Prev Page</span>
                    </button>

                    <div style={{ display: "flex", gap: "4px" }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          type="button"
                          onClick={() => setCurrentPage(pg)}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            border: `1.5px solid ${currentPage === pg ? "#10B981" : "rgba(0,0,0,0.12)"}`,
                            background: currentPage === pg ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" : "#FFFFFF",
                            color: currentPage === pg ? "#FFFFFF" : "#1E293B",
                            fontWeight: 800,
                            fontSize: "13px",
                            cursor: "pointer",
                            boxShadow: currentPage === pg ? "0 2px 8px rgba(16,185,129,0.3)" : "none"
                          }}
                        >
                          {pg}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        border: "1px solid rgba(0, 0, 0, 0.15)",
                        background: currentPage >= totalPages ? "rgba(0,0,0,0.04)" : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                        color: currentPage >= totalPages ? "#94A3B8" : "#FFFFFF",
                        cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        fontSize: "13px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: currentPage >= totalPages ? "none" : "0 3px 10px rgba(16,185,129,0.3)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <span>Next Page (अगला पेज) →</span>
                    </button>
                  </div>
                </div>
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

      {/* ==========================================================================
         FLOATING SIDE COUNTDOWN / STOPWATCH WIDGET (WORK IN PROGRESS)
         "demo worker otp daleha uske screen me chota sa side countdown chalu ho jayega"
         ========================================================================== */}
      {(() => {
        const inProgressJob = jobs.find(
          (j) => j.workerStatus === "in_progress" || j.status === "in_progress"
        );
        if (!inProgressJob && !stopwatchRunning) return null;

        const currentJob = inProgressJob || jobs[0] || {};
        const bId = currentJob.bookingId || currentJob.id || currentJob._id || currentJob.bookingCode;
        const currentCalc = calculateDynamicWorkPricing(currentJob, stopwatchSeconds > 0 ? stopwatchSeconds : 120);

        if (sideTimerMinimized) {
          return (
            <div
              className="wrk-floating-side-timer minimized"
              onClick={() => setSideTimerMinimized(false)}
              title="Click to expand Work Timer"
            >
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981" }} />
              <span style={{ fontFamily: "Space Grotesk, monospace", fontWeight: 800, fontSize: "15px", color: "#38BDF8" }}>
                ⏱️ {formatTimer(stopwatchSeconds)}
              </span>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>• Expand</span>
            </div>
          );
        }

        return (
          <aside className="wrk-floating-side-timer" aria-label="Live Work Countdown Widget">
            <div className="wrk-side-timer-header">
              <div className="wrk-side-timer-badge">
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", animation: "wrk-ping 1.4s infinite" }} />
                <span>Live Work Countdown</span>
              </div>
              <button
                type="button"
                onClick={() => setSideTimerMinimized(true)}
                style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "16px", padding: "0 4px" }}
                title="Minimize timer"
              >
                ✕
              </button>
            </div>

            <div className="wrk-side-timer-clock">
              {formatTimer(stopwatchSeconds)}
            </div>

            <div className="wrk-side-timer-meta">
              <div>
                <strong style={{ display: "block", color: "#F1F5F9" }}>{currentJob.customerName || "Customer"}</strong>
                <span style={{ fontSize: "11px" }}>{currentJob.serviceName || "Active Service"}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "#94A3B8", display: "block" }}>Your 90% Net:</span>
                <strong style={{ color: "#10B981", fontSize: "14px" }}>₹{currentCalc.payoutSplit?.workerEarnings || 400}</strong>
              </div>
            </div>

            <button
              type="button"
              className="wrk-side-timer-btn-complete"
              onClick={() => {
                setActiveTab("active_jobs");
                handleCompleteJob(bId, currentJob.price);
              }}
            >
              <span>✅ Complete Work & Generate QR</span>
            </button>
          </aside>
        );
      })()}

      {/* ==========================================================================
         CUSTOMER RATING & FEEDBACK MODAL (WORKER -> CUSTOMER)
         "demo user aur demo worker dono ek dosre ko feed back de sakenge"
         ========================================================================== */}
      {customerFeedbackBooking && (
        <div className="admin-modal-overlay" onClick={() => setCustomerFeedbackBooking(null)}>
          <div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <button className="admin-modal-close" onClick={() => setCustomerFeedbackBooking(null)}>✕</button>

            <div className="modal-title-row">
              <span style={{ fontSize: "32px" }}>⭐</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px" }}>Rate Customer Experience</h3>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Share your experience with <strong>{customerFeedbackBooking.customerName || "Customer"}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitCustomerFeedback} className="admin-modal-form" style={{ marginTop: "16px" }}>
              {/* Star Rating Selector */}
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "8px 0" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setCustomerRating(star)}
                      onMouseEnter={() => setCustomerHoverRating(star)}
                      onMouseLeave={() => setCustomerHoverRating(customerRating)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "32px",
                        cursor: "pointer",
                        color: star <= (customerHoverRating || customerRating) ? "#F59E0B" : "rgba(255,255,255,0.2)",
                        transition: "transform 0.15s ease",
                        padding: "2px"
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#F59E0B" }}>
                  {customerRating === 5 && "Outstanding Customer! 🌟"}
                  {customerRating === 4 && "Very Good Experience 👍"}
                  {customerRating === 3 && "Average Experience 😐"}
                  {customerRating === 2 && "Could Be Better 👎"}
                  {customerRating === 1 && "Poor Experience ⚠️"}
                </span>
              </div>

              {/* Quick Experience Badges */}
              <div className="admin-form-group">
                <label style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quick Experience Tags</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "6px" }}>
                  {[
                    "Polite & Respectful",
                    "Prompt Payment",
                    "Accurate Location",
                    "Safe Work Environment",
                    "Offered Refreshments",
                    "Smooth OTP Handover"
                  ].map((tag) => {
                    const isSelected = customerFeedbackTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        className={`wrk-tag-pill ${isSelected ? "active" : ""}`}
                        onClick={() => {
                          setCustomerFeedbackTags((prev) =>
                            isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                          );
                        }}
                      >
                        {isSelected ? "✓ " : "+ "}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Comments */}
              <div className="admin-form-group" style={{ marginTop: "12px" }}>
                <label>Review Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Great customer! Met at the doorstep, handed over OTP promptly, and cleared the payment via Helper QR immediately."
                  value={customerReview}
                  onChange={(e) => setCustomerReview(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px" }}
                />
              </div>

              <div className="modal-actions-group" style={{ marginTop: "18px" }}>
                <button type="button" className="btn-modal-cancel" onClick={() => setCustomerFeedbackBooking(null)}>
                  Skip
                </button>
                <button type="submit" className="btn-primary-glow" style={{ flex: 1 }}>
                  Submit Rating & Review ⭐
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default WorkerDashboard;
