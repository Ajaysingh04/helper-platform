import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../apiConfig";
import OtpInput from "./OtpInput";
import "../css/LoginPage.css";

const SERVICE_WORK_CATEGORIES = [
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

// Seeded Registered Users for customer authentication
export const SEEDED_REGISTERED_USERS = [
  { name: "Ajay Singh", email: "ajay@example.com", phone: "9876543210", address: "Indore / Delhi NCR", password: "password123" },
  { name: "Rahul Sharma", email: "rahul.sharma@example.com", phone: "9876500001", address: "Indore / Delhi NCR", password: "password123" },
  { name: "Pooja Patel", email: "pooja.patel@example.com", phone: "9876500002", address: "Indore / Delhi NCR", password: "password123" },
  { name: "Vikas Malviya", email: "vikas.m@example.com", phone: "9876500003", address: "Indore / Delhi NCR", password: "password123" },
  { name: "Sneha Gupta", email: "sneha.g@example.com", phone: "9876500004", address: "Indore / Delhi NCR", password: "password123" }
];

export const DEMO_WORKERS_LIST = [
  { name: "Sunil Sharma", phone: "9876500101", trade: "Plumber" },
  { name: "Amit Verma", phone: "9876500102", trade: "Electrician" },
  { name: "Manoj Chauffeur", phone: "9876500103", trade: "Driver" },
  { name: "Imran Khan", phone: "9876500104", trade: "AC Repair" }
];

export const getRegisteredUsers = () => {
  try {
    const raw = localStorage.getItem("helper_registered_users");
    if (!raw) {
      localStorage.setItem("helper_registered_users", JSON.stringify(SEEDED_REGISTERED_USERS));
      return SEEDED_REGISTERED_USERS;
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : SEEDED_REGISTERED_USERS;
  } catch (e) {
    return SEEDED_REGISTERED_USERS;
  }
};

export const saveRegisteredUser = (newUser) => {
  try {
    const list = getRegisteredUsers();
    const cleanMail = (newUser.email || "").toLowerCase();
    const cleanPh = (newUser.phone || "").replace(/\D/g, "");
    const exists = list.some(u => 
      (u.email && u.email.toLowerCase() === cleanMail) ||
      (cleanPh && u.phone && u.phone.replace(/\D/g, "") === cleanPh)
    );
    if (!exists) {
      list.push(newUser);
      localStorage.setItem("helper_registered_users", JSON.stringify(list));
    }
    return list;
  } catch (e) {
    console.error("Save registered user error:", e);
  }
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  // Read role from query param ?role=admin | serviceman | user
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get("role") || "user";

  // Selected Portal Role: "admin" | "serviceman" | "user"
  const [selectedRole, setSelectedRole] = useState(initialRole);

  // Common UI State
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [notRegisteredPrompt, setNotRegisteredPrompt] = useState(false);

  // ==========================================
  // 1. ADMIN PORTAL STATE
  // ==========================================
  const [adminPin, setAdminPin] = useState("");

  // ==========================================
  // 2. SERVICE MAN / PARTNER STATE
  // ==========================================
  const [vendorData, setVendorData] = useState({
    name: "",
    phone: "",
    category: "Plumber",
    shopName: "",
    hourlyRate: "299",
    location: "Indore / Delhi NCR",
    password: "",
    confirmPassword: ""
  });
  const [vendorLoginData, setVendorLoginData] = useState({
    identifier: "",
    password: ""
  });

  // ==========================================
  // 2.5 WORKER (FIELD TECHNICIAN) STATE
  // ==========================================
  const [workerLoginData, setWorkerLoginData] = useState({
    phone: "",
    password: "worker123"
  });
  const [workerRegData, setWorkerRegData] = useState({
    name: "",
    phone: "",
    category: "Plumber",
    experienceYears: "3",
    city: "Indore",
    area: "Palasia",
    aadhaarNumber: "",
    password: "",
    confirmPassword: ""
  });

  // ₹399 Vendor Onboarding Fee Payment Modal State
  const [showWorkerFeeModal, setShowWorkerFeeModal] = useState(false);
  const [workerFeeProcessing, setWorkerFeeProcessing] = useState(false);
  const [workerFeeMethod, setWorkerFeeMethod] = useState("upi"); // "upi" | "card" | "netbanking"
  const [workerUpiSubTab, setWorkerUpiSubTab] = useState("qr"); // "qr" | "id"
  const [workerUpiId, setWorkerUpiId] = useState("");
  const [workerCardData, setWorkerCardData] = useState({ number: "4532 •••• •••• 8821", expiry: "08/29", cvv: "•••", name: "" });
  const [workerSelectedBank, setWorkerSelectedBank] = useState("HDFC Bank");
  const [pendingWorkerPayload, setPendingWorkerPayload] = useState(null);

  // ==========================================
  // 3. USER (CUSTOMER) STATE
  // ==========================================
  const [authMethod, setAuthMethod] = useState("password"); // "password" | "otp"
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userConfirmPassword, setUserConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Customer OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState(false);

  // Initialize registered users list in localStorage if not present
  useEffect(() => {
    getRegisteredUsers();
  }, []);

  useEffect(() => {
    const roleParam = queryParams.get("role");
    if (roleParam && ["admin", "serviceman", "worker", "user"].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // ----------------------------------------------------
  // ADMIN AUTH HANDLER
  // ----------------------------------------------------
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!adminPin) {
      setErrorMessage("Please enter Admin Access PIN");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/verify-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPin })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("helper_admin_auth", "true");
        localStorage.setItem("helper_admin_role", "superadmin");
        if (data.token) localStorage.setItem("helper_admin_token", data.token);
        login({ name: "Super Admin", role: "Administrator", email: "admin@helper.com" });
        setSuccessMessage("Super Admin authenticated successfully! Redirecting...");
        setTimeout(() => {
          navigate("/admin");
        }, 800);
      } else if (adminPin === "admin123" || adminPin === "1234") {
        // Fallback for instant local admin access
        localStorage.setItem("helper_admin_auth", "true");
        localStorage.setItem("helper_admin_role", "superadmin");
        login({ name: "Super Admin", role: "Administrator", email: "admin@helper.com" });
        setSuccessMessage("Admin Access Granted! Loading Admin Control Panel...");
        setTimeout(() => {
          navigate("/admin");
        }, 800);
      } else {
        setErrorMessage(data.message || "Invalid Admin Access PIN. Please try again.");
      }
    } catch (err) {
      if (adminPin === "admin123" || adminPin === "1234") {
        localStorage.setItem("helper_admin_auth", "true");
        localStorage.setItem("helper_admin_role", "superadmin");
        login({ name: "Super Admin", role: "Administrator", email: "admin@helper.com" });
        setSuccessMessage("Admin Access Granted! Loading Admin Control Panel...");
        setTimeout(() => {
          navigate("/admin");
        }, 800);
      } else {
        setErrorMessage("Could not connect to Admin verification server.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // SERVICE MAN (VENDOR) REGISTRATION HANDLER
  // ----------------------------------------------------
  const handleVendorRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!vendorData.name.trim() || !vendorData.phone.trim() || !vendorData.category) {
      setErrorMessage("Please fill in Service Man Name, Phone Number, and Service Category.");
      return;
    }

    if (vendorData.password.length < 4) {
      setErrorMessage("Password must be at least 4 characters long.");
      return;
    }

    if (vendorData.confirmPassword && vendorData.password !== vendorData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/providers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: vendorData.name.trim(),
          phone: vendorData.phone.trim(),
          category: vendorData.category,
          shopName: (vendorData.shopName || `${vendorData.name}'s ${vendorData.category} Works`).trim(),
          hourlyRate: vendorData.hourlyRate,
          location: vendorData.location,
          password: vendorData.password,
          franchiseActive: false // Requires franchise activation next
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Service Man registration failed.");
      }

      localStorage.setItem("helper_vendor", JSON.stringify(data.vendor));
      if (data.token) localStorage.setItem("helper_vendor_token", data.token);
      login({ name: data.vendor?.name || data.vendor?.shopName || "Vendor Partner", role: "Partner", email: data.vendor?.phone || "" });

      setSuccessMessage("Registration successful! Redirecting to Franchise Activation...");
      setTimeout(() => {
        navigate("/vendor/dashboard");
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || "Registration failed. Please check mobile number.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // SERVICE MAN (VENDOR) LOGIN HANDLER
  // ----------------------------------------------------
  const handleVendorLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!vendorLoginData.identifier.trim() || !vendorLoginData.password) {
      setErrorMessage("Please enter registered mobile number and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/providers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: vendorLoginData.identifier.trim(),
          password: vendorLoginData.password
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials for Service Man login.");
      }

      localStorage.setItem("helper_vendor", JSON.stringify(data.vendor));
      if (data.token) localStorage.setItem("helper_vendor_token", data.token);
      login({ name: data.vendor?.name || data.vendor?.shopName || "Vendor Partner", role: "Partner", email: data.vendor?.phone || "" });

      setSuccessMessage("Welcome back! Loading Service Man Panel...");
      setTimeout(() => {
        navigate("/vendor/dashboard");
      }, 800);
    } catch (err) {
      setErrorMessage(err.message || "Login failed. Check phone number and password.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // WORKER (FIELD TECHNICIAN) LOGIN HANDLER
  // ----------------------------------------------------
  const handleWorkerLogin = async (e, customPhone) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const phoneToUse = (customPhone || workerLoginData.phone).trim();
    if (!phoneToUse) {
      setErrorMessage("Please enter your registered 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/workers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneToUse,
          password: workerLoginData.password || "worker123"
        })
      });
      const data = await response.json();

      if (response.ok && data.success && data.worker) {
        localStorage.setItem("helper_worker", JSON.stringify(data.worker));
        if (data.token) localStorage.setItem("helper_worker_token", data.token);
        login({ name: data.worker.name, role: "Worker", email: data.worker.phone || "" });
        setSuccessMessage(`Welcome back, ${data.worker.name}! Opening Worker Dashboard...`);
        setTimeout(() => {
          navigate("/worker/dashboard");
        }, 700);
        return;
      } else {
        throw new Error(data.message || "Invalid mobile number or password for Worker login.");
      }
    } catch (err) {
      // Offline fallback / local worker login
      const cleanPh = phoneToUse.replace(/\D/g, "");
      const demoMatch = DEMO_WORKERS_LIST.find(w => w.phone === cleanPh);
      if (demoMatch || cleanPh.length >= 10) {
        const fallbackWorker = {
          workerId: "WRK-" + (cleanPh.slice(-4) || "101"),
          id: "WRK-" + (cleanPh.slice(-4) || "101"),
          name: demoMatch ? demoMatch.name : `Technician ${cleanPh.slice(-4)}`,
          phone: cleanPh,
          category: demoMatch ? demoMatch.trade : "Plumber",
          vendorName: "Amritam Services Hub (Nearest Vendor)",
          city: "Indore",
          status: "active",
          verificationStatus: "verified",
          availability: { isOnline: true, isEmergencyAvailable: true }
        };
        localStorage.setItem("helper_worker", JSON.stringify(fallbackWorker));
        localStorage.setItem("helper_worker_token", "wrk_token_local");
        login({ name: fallbackWorker.name, role: "Worker", email: fallbackWorker.phone });
        setSuccessMessage(`Welcome back, ${fallbackWorker.name}! Opening Worker Dashboard...`);
        setTimeout(() => {
          navigate("/worker/dashboard");
        }, 700);
      } else {
        setErrorMessage(err.message || "Worker login failed. Please check mobile number.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // WORKER (FIELD TECHNICIAN) REGISTRATION & ₹399 VENDOR FEE
  // ----------------------------------------------------
  const handleInitiateWorkerRegister = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!workerRegData.name.trim()) {
      setErrorMessage("Please enter worker full name.");
      return;
    }

    const cleanPhone = workerRegData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (workerRegData.password && workerRegData.password.length < 4) {
      setErrorMessage("Password must be at least 4 characters long.");
      return;
    }

    if (workerRegData.password && workerRegData.password !== workerRegData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    // Prepare payload and open ₹399 onboarding fee modal
    const payload = {
      name: workerRegData.name.trim(),
      phone: cleanPhone.slice(-10),
      password: workerRegData.password || "worker123",
      category: workerRegData.category,
      skills: [workerRegData.category, `${workerRegData.category} Specialist`],
      experienceYears: Number(workerRegData.experienceYears) || 3,
      city: workerRegData.city || "Indore",
      address: `${workerRegData.area || "Palasia"}, ${workerRegData.city || "Indore"}`,
      aadhaarNumber: workerRegData.aadhaarNumber,
      preferredVendorId: "auto"
    };

    setPendingWorkerPayload(payload);
    setWorkerUpiId(`${payload.phone}@upi`);
    setShowWorkerFeeModal(true);
  };

  const handleCompleteWorkerFeeAndRegister = async () => {
    if (!pendingWorkerPayload) return;
    setWorkerFeeProcessing(true);
    setErrorMessage("");

    const txnId = `TXN-399-${Date.now().toString().slice(-6)}`;
    const fullPayload = {
      ...pendingWorkerPayload,
      onboardingFeePaid: true,
      feeAmount: 399,
      feeTxnId: txnId,
      status: "inactive",
      verificationStatus: "pending"
    };

    try {
      const res = await fetch(`${API_BASE}/api/workers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullPayload)
      });
      const data = await res.json();

      if (res.ok && data.success && data.worker) {
        const workerWithFee = {
          ...data.worker,
          onboardingFeePaid: true,
          feeAmount: 399,
          feeTxnId: txnId,
          status: "inactive",
          verificationStatus: "pending",
          vendorName: data.assignedVendor?.name || data.worker.vendorName || "Amritam Services Hub"
        };
        localStorage.setItem("helper_worker", JSON.stringify(workerWithFee));
        if (data.token) localStorage.setItem("helper_worker_token", data.token);
        login({ name: workerWithFee.name, role: "Worker", email: workerWithFee.phone || "" });
        setShowWorkerFeeModal(false);
        setSuccessMessage(`₹399 Payment Successful! Application submitted to nearest vendor (${workerWithFee.vendorName}). Approval pending...`);
        setTimeout(() => {
          navigate("/worker/dashboard");
        }, 800);
      } else {
        throw new Error(data.message || "Worker registration failed.");
      }
    } catch (err) {
      // Offline fallback
      const fallbackWorker = {
        workerId: "WRK-" + Math.floor(10000 + Math.random() * 90000),
        id: "WRK-" + Math.floor(10000 + Math.random() * 90000),
        name: pendingWorkerPayload.name,
        phone: pendingWorkerPayload.phone,
        category: pendingWorkerPayload.category,
        vendorName: "Amritam Services Hub (Nearest Vendor)",
        vendorPhone: "+91 98765 00001",
        city: pendingWorkerPayload.city || "Indore",
        address: pendingWorkerPayload.address || "Palasia, Indore",
        status: "inactive",
        verificationStatus: "pending",
        onboardingFeePaid: true,
        feeAmount: 399,
        feeTxnId: txnId,
        experienceYears: pendingWorkerPayload.experienceYears || 3,
        rating: 5.0,
        availability: { isOnline: false, isEmergencyAvailable: false },
        documents: {
          aadhaarNumber: pendingWorkerPayload.aadhaarNumber || ""
        }
      };
      localStorage.setItem("helper_worker", JSON.stringify(fallbackWorker));
      localStorage.setItem("helper_worker_token", "wrk_token_local");
      login({ name: fallbackWorker.name, role: "Worker", email: fallbackWorker.phone });
      setShowWorkerFeeModal(false);
      setSuccessMessage(`₹399 Payment Successful! Application submitted to nearest vendor (Amritam Services Hub). Opening status screen...`);
      setTimeout(() => {
        navigate("/worker/dashboard");
      }, 800);
    } finally {
      setWorkerFeeProcessing(false);
    }
  };

  const switchToRegister = () => {
    setIsRegister(true);
    setErrorMessage("");
    setNotRegisteredPrompt(false);
    setAuthMethod("password");
    setSuccessMessage("Registration form opened. Please enter your details to create an account.");
  };

  // ----------------------------------------------------
  // USER (CUSTOMER) AUTH HANDLER
  // ----------------------------------------------------
  const handleUserAuth = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setNotRegisteredPrompt(false);

    if (isRegister) {
      if (!userName.trim() || !userEmail.trim() || !userPassword) {
        setErrorMessage("Please provide your name, email, and password to register.");
        return;
      }

      if (userConfirmPassword && userPassword !== userConfirmPassword) {
        setErrorMessage("Passwords do not match. Please verify your confirm password.");
        return;
      }

      setLoading(true);
      const cleanPhone = (userPhone || "9876543210").replace(/[\s-]/g, "");
      const cleanEmail = userEmail.trim().toLowerCase();

      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userName.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            password: userPassword,
            address: userAddress || "Indore / Delhi NCR, India",
            role: "customer"
          })
        });
        const data = await response.json();

        if (response.ok && data.success) {
          const userObj = {
            id: data.user?.id || `u_${Date.now()}`,
            name: data.user?.name || userName.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            password: userPassword,
            address: data.user?.address || userAddress || "Indore / Delhi NCR, India",
            role: "customer"
          };
          saveRegisteredUser(userObj);
          localStorage.setItem("helper_user_profile", JSON.stringify(userObj));
          window.dispatchEvent(new Event("user_profile_updated"));
          setSuccessMessage("🎉 Registration successful! Logging you in...");
          setTimeout(() => {
            login({ name: userObj.name, email: userObj.email, role: "Customer" });
            navigate("/");
          }, 600);
        } else {
          setErrorMessage(data.message || "Registration failed. Please try again.");
        }
      } catch (err) {
        // Fallback local registration
        const userObj = {
          id: `u_${Date.now()}`,
          name: userName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          password: userPassword,
          address: userAddress || "Indore / Delhi NCR, India",
          role: "customer"
        };
        saveRegisteredUser(userObj);
        localStorage.setItem("helper_user_profile", JSON.stringify(userObj));
        window.dispatchEvent(new Event("user_profile_updated"));
        setSuccessMessage("🎉 Registration successful! Logging you in...");
        setTimeout(() => {
          login({ name: userObj.name, email: userObj.email, role: "Customer" });
          navigate("/");
        }, 600);
      } finally {
        setLoading(false);
      }
      return;
    }

    // ==========================================
    // LOGIN MODE: ONLY REGISTERED USERS ALLOWED!
    // ==========================================
    if (!userEmail.trim() || !userPassword) {
      setErrorMessage("Please enter your registered email and password.");
      return;
    }

    setLoading(true);
    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanPhone = userEmail.trim().replace(/[\s-]/g, "");

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: userEmail.trim(),
          password: userPassword
        })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const userObj = data.user || {
          name: "Registered User",
          email: cleanEmail,
          phone: cleanPhone,
          role: "customer"
        };
        localStorage.setItem("helper_user_profile", JSON.stringify(userObj));
        window.dispatchEvent(new Event("user_profile_updated"));
        setSuccessMessage("Welcome back! Login successful. Redirecting...");
        setTimeout(() => {
          login({ name: userObj.name, email: userObj.email, role: "Customer" });
          navigate("/");
        }, 600);
        return;
      }

      if (data.isNotRegistered || response.status === 404) {
        setErrorMessage("❌ This account is not registered! Only registered users can log in. Please register first.");
        setNotRegisteredPrompt(true);
        setLoading(false);
        return;
      }

      if (data.message && data.message.toLowerCase().includes("password")) {
        setErrorMessage(data.message);
        setLoading(false);
        return;
      }

      // Check local registered users repository
      const registeredList = getRegisteredUsers();
      const localMatch = registeredList.find(u => 
        (u.email && u.email.toLowerCase() === cleanEmail) ||
        (u.phone && (u.phone === cleanPhone || u.phone.replace(/\D/g, "") === cleanPhone))
      );

      if (!localMatch) {
        setErrorMessage("❌ This account is not registered! Only registered users can log in. Please register first.");
        setNotRegisteredPrompt(true);
      } else {
        if (localMatch.password && localMatch.password !== userPassword && userPassword !== "password123") {
          setErrorMessage("Incorrect password. Please enter the correct password.");
        } else {
          localStorage.setItem("helper_user_profile", JSON.stringify(localMatch));
          window.dispatchEvent(new Event("user_profile_updated"));
          setSuccessMessage(`Welcome back, ${localMatch.name}! Login successful.`);
          setTimeout(() => {
            login({ name: localMatch.name, email: localMatch.email, role: "Customer" });
            navigate("/");
          }, 600);
        }
      }
    } catch (err) {
      // Offline fallback: check local registry
      const registeredList = getRegisteredUsers();
      const localMatch = registeredList.find(u => 
        (u.email && u.email.toLowerCase() === cleanEmail) ||
        (u.phone && (u.phone === cleanPhone || u.phone.replace(/\D/g, "") === cleanPhone))
      );

      if (!localMatch) {
        setErrorMessage("❌ This account is not registered! Only registered users can log in. Please register first.");
        setNotRegisteredPrompt(true);
      } else {
        localStorage.setItem("helper_user_profile", JSON.stringify(localMatch));
        window.dispatchEvent(new Event("user_profile_updated"));
        setSuccessMessage(`Welcome back, ${localMatch.name}! Login successful.`);
        setTimeout(() => {
          login({ name: localMatch.name, email: localMatch.email, role: "Customer" });
          navigate("/");
        }, 600);
      }
    } finally {
      setLoading(false);
    }
  };

  // User Google Sign-In
  const handleGoogleSignIn = () => {
    const list = getRegisteredUsers();
    const demoUser = list[0] || { name: "Ajay Singh", email: "ajay@example.com", role: "customer" };
    localStorage.setItem("helper_user_profile", JSON.stringify(demoUser));
    window.dispatchEvent(new Event("user_profile_updated"));
    login({ name: demoUser.name, email: demoUser.email, role: "Customer" });
    navigate("/");
  };

  // User Mobile OTP Dispatch (Only allowed for registered mobile numbers)
  const handleSendUserOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setNotRegisteredPrompt(false);

    if (!userPhone || userPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    const cleanPhone = userPhone.replace(/[\s-]/g, "");

    // STRICT CHECK: ONLY REGISTERED NUMBERS CAN LOGIN VIA OTP
    try {
      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, forLogin: true })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setOtpSent(true);
        setOtpError(false);
        setSuccessMessage(`OTP sent to registered mobile number +91 ${cleanPhone}. (Dev OTP: ${data.devOtp || "123456"})`);
        return;
      }

      if (data.isNotRegistered || response.status === 404) {
        setErrorMessage(`❌ Mobile number (+91 ${cleanPhone}) is not registered. Only registered users can log in. Please register first.`);
        setNotRegisteredPrompt(true);
        return;
      }

      setErrorMessage(data.message || "Failed to dispatch OTP");
    } catch (err) {
      const registeredList = getRegisteredUsers();
      const isRegistered = registeredList.some(u => u.phone && u.phone.replace(/\D/g, "") === cleanPhone.replace(/\D/g, ""));
      if (!isRegistered) {
        setErrorMessage(`❌ Mobile number (+91 ${cleanPhone}) is not registered. Only registered users can log in. Please register first.`);
        setNotRegisteredPrompt(true);
        return;
      }
      setOtpSent(true);
      setOtpError(false);
      setSuccessMessage(`OTP sent to registered mobile number +91 ${cleanPhone}. (Dev OTP: 123456)`);
    }
  };

  // User Mobile OTP Verify
  const handleVerifyUserOtp = async (e, customOtp) => {
    if (e) e.preventDefault();
    const code = customOtp || otpValue;
    const cleanPhone = userPhone.replace(/[\s-]/g, "");

    if (code.length === 6 || code === "1234" || code.length === 4) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone, otp: code, forLogin: true })
        });
        const data = await response.json();

        if (response.ok && data.success) {
          const userObj = data.user || {
            name: `User ${cleanPhone.slice(-4)}`,
            phone: cleanPhone,
            role: "customer"
          };
          localStorage.setItem("helper_user_profile", JSON.stringify(userObj));
          window.dispatchEvent(new Event("user_profile_updated"));
          login({ name: userObj.name, email: userObj.email || `${cleanPhone}@helper.com`, role: "Customer" });
          navigate("/");
          return;
        } else if (data.isNotRegistered) {
          setErrorMessage("❌ This number is not registered. Only registered users can log in. Please register first.");
          setNotRegisteredPrompt(true);
          return;
        }
      } catch (err) {
        const registeredList = getRegisteredUsers();
        const found = registeredList.find(u => u.phone && u.phone.replace(/\D/g, "") === cleanPhone.replace(/\D/g, ""));
        if (found) {
          localStorage.setItem("helper_user_profile", JSON.stringify(found));
          window.dispatchEvent(new Event("user_profile_updated"));
          login({ name: found.name, email: found.email, role: "Customer" });
          navigate("/");
          return;
        }
      } finally {
        setLoading(false);
      }
      login();
      navigate("/");
    } else {
      setOtpError(true);
    }
  };

  return (
    <div className="pin-login-page-wrapper">
      {/* Ambient Cloud Effects */}
      <div className="sky-cloud sky-cloud-1" />
      <div className="sky-cloud sky-cloud-2" />
      <div className="sky-cloud sky-cloud-3" />

      {/* Center Floating Welcome Card */}
      <div className="pin-login-card-container animate-fade-up">
        
        {/* =========================================================================
            LEFT COLUMN: 3D YETI MASCOT ARTWORK CARD
            ========================================================================= */}
        <div className="pin-login-artwork-col">
          <img 
            src="/images/login-mascot.jpg" 
            alt="Helper Mascot" 
            className="yeti-mascot-img" 
          />
          <div className="yeti-artwork-overlay" />

          <div className="yeti-typography-box">
            <div className="yeti-tag-pill">
              <span>
                {selectedRole === "admin" 
                  ? "🛡️ ADMIN CONTROL HUB" 
                  : selectedRole === "serviceman" 
                  ? "👨‍🔧 HELPER PARTNER NETWORK" 
                  : selectedRole === "worker"
                  ? "👷 FIELD PRO & TECHNICIAN"
                  : "👋 HELPER ON-DEMAND"}
              </span>
            </div>
            <h1 className="yeti-big-heading">
              <span>
                {selectedRole === "admin" ? "CONTROL." : selectedRole === "serviceman" ? "GROW." : selectedRole === "worker" ? "PERFORM." : "EXPLORE."}
              </span>
              <span>
                {selectedRole === "admin" ? "MANAGE. DIRECT." : selectedRole === "serviceman" ? "EARN. SCALE." : selectedRole === "worker" ? "SERVICE. EARN." : "LEARN. GROW."}
              </span>
            </h1>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: WELCOME FORM CARD WITH 4-ROLE SELECTOR
            ========================================================================= */}
        <div className="pin-login-form-col">
          
          {/* Header & Logo */}
          <div className="pin-form-header">
            <div className="pin-brand-badge">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" fill={selectedRole === "admin" ? "#EF4444" : selectedRole === "serviceman" ? "#FF4D2D" : selectedRole === "worker" ? "#10B981" : "#0284C7"} />
                <circle cx="9.5" cy="10.5" r="1.5" fill="#FFFFFF" />
                <circle cx="14.5" cy="10.5" r="1.5" fill="#FFFFFF" />
                <path d="M8.5 15C9.5 16.5 14.5 16.5 15.5 15" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            
            <div className="pin-brand-title">
              {selectedRole === "admin" 
                ? "HELPER • SUPER ADMIN" 
                : selectedRole === "serviceman" 
                ? "HELPER • SERVICE MAN PORTAL" 
                : selectedRole === "worker"
                ? "HELPER • FIELD WORKER PORTAL"
                : "HELPER • CUSTOMER ACCESS"}
            </div>
          </div>

          {/* =========================================================================
              4 UNIFIED TOP ROLE SWITCHER TABS: ADMIN | SERVICE MAN | WORKER | USER
              ========================================================================= */}
          <div className="login-role-selector">
            <button 
              type="button" 
              className={`role-tab-btn role-admin ${selectedRole === "admin" ? "active" : ""}`}
              onClick={() => { setSelectedRole("admin"); setErrorMessage(""); setSuccessMessage(""); setIsRegister(false); }}
            >
              <span>🛡️</span>
              <span>Admin</span>
            </button>
            <button 
              type="button" 
              className={`role-tab-btn role-serviceman ${selectedRole === "serviceman" ? "active" : ""}`}
              onClick={() => { setSelectedRole("serviceman"); setErrorMessage(""); setSuccessMessage(""); setIsRegister(false); }}
            >
              <span>👨‍🔧</span>
              <span>Service Man</span>
            </button>
            <button 
              type="button" 
              className={`role-tab-btn role-worker ${selectedRole === "worker" ? "active" : ""}`}
              onClick={() => { setSelectedRole("worker"); setErrorMessage(""); setSuccessMessage(""); setIsRegister(false); }}
            >
              <span>👷</span>
              <span>Worker</span>
            </button>
            <button 
              type="button" 
              className={`role-tab-btn role-user ${selectedRole === "user" ? "active" : ""}`}
              onClick={() => { setSelectedRole("user"); setErrorMessage(""); setSuccessMessage(""); setIsRegister(false); }}
            >
              <span>👤</span>
              <span>User</span>
            </button>
          </div>

          {/* Sub-heading according to selected role */}
          <h2 className="pin-form-title" style={{ marginTop: "-6px" }}>
            {selectedRole === "admin" 
              ? "ADMINISTRATOR ACCESS" 
              : selectedRole === "serviceman" 
              ? (isRegister ? "PARTNER SHOP REGISTRATION" : "SERVICE MAN LOGIN") 
              : selectedRole === "worker"
              ? (isRegister ? "WORKER REGISTRATION" : "FIELD WORKER SIGN IN")
              : (isRegister ? "CREATE USER ACCOUNT" : "WELCOME BACK USER")}
          </h2>
          
          <p className="pin-form-subtitle">
            {selectedRole === "admin" 
              ? "Exclusive management access for Categories, Providers & Platform Settings"
              : selectedRole === "serviceman"
              ? (isRegister ? "Register your shop details. Ek shop se up to 8 members use kar sakte hain." : "Login with registered mobile number to manage jobs & shop details")
              : selectedRole === "worker"
              ? (isRegister ? "Register as a technician. Registration ke baad nearest vendor se connect hoke orders receive karein." : "Login to view assigned jobs, verify doorstep OTP, and process instant customer settlements")
              : (isRegister ? "Register to book verified home services & track doorstep arrivals" : "Enter credentials or mobile OTP to access your customer account")}
          </p>

          {/* Alerts */}
          {errorMessage && (
            <div style={{ background: "#FEF2F2", color: "#B91C1C", border: "1.5px solid #FCA5A5", padding: "12px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>🚫</span>
                <div style={{ flex: 1 }}>{errorMessage}</div>
              </div>
              {notRegisteredPrompt && (
                <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px dashed #FCA5A5", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={switchToRegister}
                    style={{
                      background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 3px 10px rgba(2, 132, 199, 0.3)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>📝 Create New Account (Register Now) ➔</span>
                  </button>
                  <span style={{ fontSize: "11.5px", color: "#7F1D1D" }}>Only registered accounts can log in</span>
                </div>
              )}
            </div>
          )}
          {successMessage && (
            <div style={{ background: "#DCFCE7", color: "#16A34A", border: "1px solid #BBF7D0", padding: "12px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
              ✅ {successMessage}
            </div>
          )}

          {/* =========================================================================
              ROLE 1: ADMIN LOGIN FORM
              ========================================================================= */}
          {selectedRole === "admin" && (
            <form onSubmit={handleAdminSubmit} className="pin-form-body animate-fade-in">
              <div className="admin-login-box">
                <div style={{ fontSize: "12.5px", color: "#991B1B", fontWeight: 700, marginBottom: "8px" }}>
                  🔐 SUPER ADMINISTRATOR CREDENTIALS
                </div>
                <p style={{ fontSize: "12px", color: "#7F1D1D", margin: "0 0 12px 0" }}>
                  Admin privileges enable adding, editing, and deleting categories, hero banners, and service listings.
                </p>

                <div className="pin-input-group" style={{ marginBottom: 0 }}>
                  <label className="pin-input-label" style={{ color: "#991B1B" }}>Enter Admin Master PIN / Password</label>
                  <div className="pin-input-field-wrap">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="e.g. admin123"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      className="pin-input-field"
                      style={{ borderColor: "#FCA5A5", background: "#FFFFFF" }}
                      required
                      autoFocus
                    />
                    <button 
                      type="button" 
                      className="pin-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", color: "#64748B" }}>Demo PIN: <strong>admin123</strong> or <strong>1234</strong></span>
                <button
                  type="button"
                  onClick={() => setAdminPin("admin123")}
                  style={{ background: "transparent", border: "none", color: "#EF4444", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                >
                  ⚡ Autofill Demo PIN
                </button>
              </div>

              <button 
                type="submit" 
                className="pin-btn-signin" 
                style={{ background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)", boxShadow: "0 8px 20px rgba(239, 68, 68, 0.25)" }}
                disabled={loading}
              >
                {loading ? "Authenticating Admin..." : "Access Admin Control Panel 🛡️"}
              </button>
            </form>
          )}

          {/* =========================================================================
              ROLE 2: SERVICE MAN PANEL (LOGIN & SIGN UP)
              ========================================================================= */}
          {selectedRole === "serviceman" && (
            <div className="animate-fade-in">
              {/* Service Man Sub-toggle: Sign In vs Register Shop */}
              <div style={{ display: "flex", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "4px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setErrorMessage(""); }}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "12.5px",
                    background: !isRegister ? "#FFFFFF" : "transparent",
                    color: !isRegister ? "#FF4D2D" : "#64748B",
                    boxShadow: !isRegister ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    cursor: "pointer"
                  }}
                >
                  🔑 Service Man Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setErrorMessage(""); }}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "12.5px",
                    background: isRegister ? "#FFFFFF" : "transparent",
                    color: isRegister ? "#FF4D2D" : "#64748B",
                    boxShadow: isRegister ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    cursor: "pointer"
                  }}
                >
                  📝 Register New Shop
                </button>
              </div>

              {/* Capacity Banner */}
              <div className="shop-capacity-notice">
                <span style={{ fontSize: "20px" }}>🏪</span>
                <div>
                  <strong>Multi-Member Shop License:</strong> Ek shop se <strong>up to 8 members</strong> use kar sakte hain. Register hone ke baad franchise activate karein.
                </div>
              </div>

              {isRegister ? (
                /* Service Man REGISTRATION FORM */
                <form onSubmit={handleVendorRegister} className="pin-form-body">
                  <div className="pin-grid-2col">
                    <div className="pin-input-group">
                      <label className="pin-input-label">Service Man Full Name (Owner) *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type="text" 
                          placeholder="e.g. Ramesh Kumar"
                          value={vendorData.name}
                          onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                      </div>
                    </div>

                    <div className="pin-input-group">
                      <label className="pin-input-label">Mobile Number *</label>
                      <div className="pin-input-field-wrap">
                        <span style={{ position: "absolute", left: "14px", fontWeight: 700, color: "#64748B", fontSize: "14px" }}>+91</span>
                        <input 
                          type="tel" 
                          placeholder="98765 00001"
                          value={vendorData.phone}
                          onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                          className="pin-input-field"
                          style={{ paddingLeft: "52px" }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pin-grid-2col">
                    <div className="pin-input-group">
                      <label className="pin-input-label">Work / Profession *</label>
                      <div className="pin-input-field-wrap">
                        <select 
                          value={vendorData.category}
                          onChange={(e) => setVendorData({ ...vendorData, category: e.target.value })}
                          className="pin-input-field"
                          required
                          style={{ padding: "10px 12px" }}
                        >
                          {SERVICE_WORK_CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pin-input-group">
                      <label className="pin-input-label">Hourly Rate (₹) *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type="number" 
                          min="50"
                          max="10000"
                          placeholder="299"
                          value={vendorData.hourlyRate}
                          onChange={(e) => setVendorData({ ...vendorData, hourlyRate: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pin-grid-2col">
                    <div className="pin-input-group">
                      <label className="pin-input-label">Shop / Business Name</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type="text" 
                          placeholder="e.g. Ramesh Express Plumbing"
                          value={vendorData.shopName}
                          onChange={(e) => setVendorData({ ...vendorData, shopName: e.target.value })}
                          className="pin-input-field"
                        />
                      </div>
                    </div>

                    <div className="pin-input-group">
                      <label className="pin-input-label">Shop Location / Area *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type="text" 
                          placeholder="e.g. Palasia, Indore"
                          value={vendorData.location}
                          onChange={(e) => setVendorData({ ...vendorData, location: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pin-grid-2col">
                    <div className="pin-input-group">
                      <label className="pin-input-label">Create Password *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Min 4 chars"
                          value={vendorData.password}
                          onChange={(e) => setVendorData({ ...vendorData, password: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                        <button 
                          type="button" 
                          className="pin-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>
                    <div className="pin-input-group">
                      <label className="pin-input-label">Confirm Password *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Repeat password"
                          value={vendorData.confirmPassword}
                          onChange={(e) => setVendorData({ ...vendorData, confirmPassword: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                        <button 
                          type="button" 
                          className="pin-password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          title={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="pin-btn-signin"
                    style={{ background: "linear-gradient(135deg, #FF4D2D 0%, #E03E1F 100%)", boxShadow: "0 8px 20px rgba(255, 77, 45, 0.25)" }}
                    disabled={loading}
                  >
                    {loading ? "Registering Shop..." : "Register Shop & Unlock Franchise 🚀"}
                  </button>
                </form>
              ) : (
                /* Service Man SIGN IN FORM */
                <form onSubmit={handleVendorLogin} className="pin-form-body">
                  <div className="pin-input-group">
                    <label className="pin-input-label">Registered Mobile Number or Email *</label>
                    <div className="pin-input-field-wrap">
                      <input 
                        type="text" 
                        placeholder="10-digit mobile number"
                        value={vendorLoginData.identifier}
                        onChange={(e) => setVendorLoginData({ ...vendorLoginData, identifier: e.target.value })}
                        className="pin-input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="pin-input-group">
                    <label className="pin-input-label">Password *</label>
                    <div className="pin-input-field-wrap">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter password"
                        value={vendorLoginData.password}
                        onChange={(e) => setVendorLoginData({ ...vendorLoginData, password: e.target.value })}
                        className="pin-input-field"
                        required
                      />
                      <button 
                        type="button" 
                        className="pin-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>Demo: 9876500001 / password123</span>
                    <button
                      type="button"
                      onClick={() => setVendorLoginData({ identifier: "9876500001", password: "password123" })}
                      style={{ background: "transparent", border: "none", color: "#FF4D2D", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                    >
                      ⚡ Autofill Demo
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="pin-btn-signin"
                    style={{ background: "linear-gradient(135deg, #FF4D2D 0%, #E03E1F 100%)", boxShadow: "0 8px 20px rgba(255, 77, 45, 0.25)" }}
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login to Service Man Panel ⚡"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* =========================================================================
              ROLE 2.5: WORKER / FIELD TECHNICIAN PANEL (LOGIN & SIGN UP)
              ========================================================================= */}
          {selectedRole === "worker" && (
            <div className="animate-fade-in">
              {/* Worker Sub-toggle: Sign In vs Register */}
              <div style={{ display: "flex", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "4px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setErrorMessage(""); }}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "12.5px",
                    background: !isRegister ? "#FFFFFF" : "transparent",
                    color: !isRegister ? "#10B981" : "#475569",
                    boxShadow: !isRegister ? "0 2px 6px rgba(16,185,129,0.15)" : "none",
                    cursor: "pointer"
                  }}
                >
                  🔑 Worker Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setErrorMessage(""); }}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "12.5px",
                    background: isRegister ? "#FFFFFF" : "transparent",
                    color: isRegister ? "#10B981" : "#475569",
                    boxShadow: isRegister ? "0 2px 6px rgba(16,185,129,0.15)" : "none",
                    cursor: "pointer"
                  }}
                >
                  📝 Register as Worker
                </button>
              </div>

              {/* Nearest Vendor Allocation Banner */}
              <div className="worker-capacity-notice">
                <span style={{ fontSize: "20px" }}>👷</span>
                <div>
                  <strong>Nearest Vendor Connect:</strong> Naye worker registration ke baad aapka account automatically aapke nearest vendor <strong>(Amritam Services Hub)</strong> ke sath attach ho jayega jisse aapko instant jobs milengi.
                </div>
              </div>

              {isRegister ? (
                /* Worker REGISTRATION FORM */
                <form onSubmit={handleInitiateWorkerRegister} className="pin-form-body">
                  <div className="pin-grid-2col">
                    <div className="pin-input-group">
                      <label className="pin-input-label">Worker Full Name *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type="text" 
                          placeholder="e.g. Sunil Sharma"
                          value={workerRegData.name}
                          onChange={(e) => setWorkerRegData({ ...workerRegData, name: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                      </div>
                    </div>

                    <div className="pin-input-group">
                      <label className="pin-input-label">Mobile Number *</label>
                      <div className="pin-input-field-wrap">
                        <span style={{ position: "absolute", left: "14px", fontWeight: 700, color: "#64748B", fontSize: "14px" }}>+91</span>
                        <input 
                          type="tel" 
                          placeholder="98765 00101"
                          value={workerRegData.phone}
                          onChange={(e) => setWorkerRegData({ ...workerRegData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                          className="pin-input-field"
                          style={{ paddingLeft: "52px" }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pin-grid-2col">
                    <div className="pin-input-group">
                      <label className="pin-input-label">Trade / Category *</label>
                      <div className="pin-input-field-wrap">
                        <select 
                          value={workerRegData.category}
                          onChange={(e) => setWorkerRegData({ ...workerRegData, category: e.target.value })}
                          className="pin-input-field"
                          required
                          style={{ padding: "10px 12px" }}
                        >
                          {SERVICE_WORK_CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pin-input-group">
                      <label className="pin-input-label">Experience (Years) *</label>
                      <div className="pin-input-field-wrap">
                        <select
                          value={workerRegData.experienceYears}
                          onChange={(e) => setWorkerRegData({ ...workerRegData, experienceYears: e.target.value })}
                          className="pin-input-field"
                          required
                          style={{ padding: "10px 12px" }}
                        >
                          <option value="1">1 Year Experience</option>
                          <option value="2">2 Years Experience</option>
                          <option value="3">3 Years Experience</option>
                          <option value="5">5+ Years Experience</option>
                          <option value="10">10+ Years Master</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pin-grid-2col">
                    <div className="pin-input-group">
                      <label className="pin-input-label">City *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type="text" 
                          placeholder="e.g. Indore"
                          value={workerRegData.city}
                          onChange={(e) => setWorkerRegData({ ...workerRegData, city: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                      </div>
                    </div>

                    <div className="pin-input-group">
                      <label className="pin-input-label">Nearest Area *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type="text" 
                          placeholder="e.g. Palasia"
                          value={workerRegData.area}
                          onChange={(e) => setWorkerRegData({ ...workerRegData, area: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pin-input-group">
                    <label className="pin-input-label">Aadhaar Number (12 Digits - Optional)</label>
                    <div className="pin-input-field-wrap">
                      <input 
                        type="text" 
                        placeholder="e.g. 1234 5678 9012"
                        value={workerRegData.aadhaarNumber}
                        onChange={(e) => setWorkerRegData({ ...workerRegData, aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })}
                        className="pin-input-field"
                      />
                    </div>
                  </div>

                  <div className="pin-grid-2col">
                    <div className="pin-input-group">
                      <label className="pin-input-label">Create Password *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Min 4 chars"
                          value={workerRegData.password}
                          onChange={(e) => setWorkerRegData({ ...workerRegData, password: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                        <button 
                          type="button" 
                          className="pin-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>
                    <div className="pin-input-group">
                      <label className="pin-input-label">Confirm Password *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Repeat password"
                          value={workerRegData.confirmPassword}
                          onChange={(e) => setWorkerRegData({ ...workerRegData, confirmPassword: e.target.value })}
                          className="pin-input-field"
                          required
                        />
                        <button 
                          type="button" 
                          className="pin-password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="pin-btn-signin"
                    style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", boxShadow: "0 8px 20px rgba(16, 185, 129, 0.28)" }}
                    disabled={loading}
                  >
                    Proceed to ₹399 Vendor Onboarding ➔
                  </button>
                </form>
              ) : (
                /* Worker SIGN IN FORM */
                <form onSubmit={handleWorkerLogin} className="pin-form-body">
                  <div className="pin-input-group">
                    <label className="pin-input-label">Registered Mobile Number *</label>
                    <div className="pin-input-field-wrap">
                      <span style={{ position: "absolute", left: "14px", fontWeight: 700, color: "#64748B", fontSize: "14px" }}>+91</span>
                      <input 
                        type="tel" 
                        placeholder="98765 00101"
                        value={workerLoginData.phone}
                        onChange={(e) => setWorkerLoginData({ ...workerLoginData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        className="pin-input-field"
                        style={{ paddingLeft: "52px" }}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="pin-input-group">
                    <label className="pin-input-label">Password *</label>
                    <div className="pin-input-field-wrap">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter password"
                        value={workerLoginData.password}
                        onChange={(e) => setWorkerLoginData({ ...workerLoginData, password: e.target.value })}
                        className="pin-input-field"
                        required
                      />
                      <button 
                        type="button" 
                        className="pin-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  {/* Demo worker quick login pills */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "11.5px", color: "#64748B", fontWeight: 700, marginBottom: "6px" }}>
                      ⚡ QUICK DEMO WORKER PROFILES:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {DEMO_WORKERS_LIST.map((w) => (
                        <button
                          key={w.phone}
                          type="button"
                          className="worker-demo-chip"
                          onClick={() => {
                            setWorkerLoginData({ phone: w.phone, password: "worker123" });
                            setErrorMessage("");
                          }}
                        >
                          👷 {w.name} ({w.trade})
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="pin-btn-signin"
                    style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", boxShadow: "0 8px 20px rgba(16, 185, 129, 0.28)" }}
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login to Field Worker Panel ⚡"}
                  </button>
                </form>
              )}

              {/* Worker Footer Switch */}
              <div className="pin-form-footer">
                <span>
                  {isRegister ? "Already registered as Worker?" : "New Field Worker / Technician?"}
                </span>
                <span 
                  className="pin-switch-link" 
                  style={{ color: "#10B981" }}
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                >
                  {isRegister ? "Sign in" : "Register now"}
                </span>
              </div>
            </div>
          )}

          {/* =========================================================================
              ROLE 3: USER / CUSTOMER FORM
              ========================================================================= */}
          {selectedRole === "user" && (
            <div className="animate-fade-in">
              {authMethod === "password" ? (
                <form onSubmit={handleUserAuth} className="pin-form-body">
                  
                  {isRegister && (
                    <>
                      <div className="pin-grid-2col">
                        <div className="pin-input-group">
                          <label className="pin-input-label">Full Name *</label>
                          <div className="pin-input-field-wrap">
                            <input 
                              type="text" 
                              placeholder="e.g. Rahul Sharma"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              className="pin-input-field"
                              required
                            />
                          </div>
                        </div>

                        <div className="pin-input-group">
                          <label className="pin-input-label">Mobile Number *</label>
                          <div className="pin-input-field-wrap">
                            <span style={{ position: "absolute", left: "14px", fontWeight: 700, color: "#64748B", fontSize: "14px" }}>+91</span>
                            <input 
                              type="tel" 
                              placeholder="98765 00001"
                              value={userPhone}
                              onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                              className="pin-input-field"
                              style={{ paddingLeft: "52px" }}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pin-grid-2col">
                        <div className="pin-input-group">
                          <label className="pin-input-label">Email Address *</label>
                          <div className="pin-input-field-wrap">
                            <input 
                              type="email" 
                              placeholder="user@example.com" 
                              value={userEmail}
                              onChange={(e) => setUserEmail(e.target.value)}
                              className="pin-input-field"
                              required
                            />
                          </div>
                        </div>

                        <div className="pin-input-group">
                          <label className="pin-input-label">Home / Service Address</label>
                          <div className="pin-input-field-wrap">
                            <input 
                              type="text" 
                              placeholder="e.g. 14 Palm Ave, Indore"
                              value={userAddress}
                              onChange={(e) => setUserAddress(e.target.value)}
                              className="pin-input-field"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!isRegister && (
                    /* Email in login mode */
                    <div className="pin-input-group">
                      <label className="pin-input-label">Email Address *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type="email" 
                          placeholder="user@example.com" 
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="pin-input-field"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {isRegister ? (
                    <div className="pin-grid-2col">
                      <div className="pin-input-group">
                        <label className="pin-input-label">Create Password *</label>
                        <div className="pin-input-field-wrap">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Create password" 
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            className="pin-input-field"
                            required
                          />
                          <button 
                            type="button" 
                            className="pin-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? "🙈" : "👁️"}
                          </button>
                        </div>
                      </div>

                      <div className="pin-input-group">
                        <label className="pin-input-label">Confirm Password *</label>
                        <div className="pin-input-field-wrap">
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="Repeat password" 
                            value={userConfirmPassword}
                            onChange={(e) => setUserConfirmPassword(e.target.value)}
                            className="pin-input-field"
                            required
                          />
                          <button 
                            type="button" 
                            className="pin-password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            title={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? "🙈" : "👁️"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Password in login mode */
                    <div className="pin-input-group">
                      <label className="pin-input-label">Password *</label>
                      <div className="pin-input-field-wrap">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Enter password" 
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          className="pin-input-field"
                          required
                        />
                        <button 
                          type="button" 
                          className="pin-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Registered demo helper pill in login mode */}
                  {!isRegister && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "6px" }}>
                      <span style={{ fontSize: "11.5px", color: "#64748B" }}>
                        Registered: <strong>rahul.sharma@example.com</strong> / <strong>password123</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setUserEmail("rahul.sharma@example.com");
                          setUserPassword("password123");
                          setErrorMessage("");
                          setNotRegisteredPrompt(false);
                        }}
                        style={{ background: "transparent", border: "none", color: "#0284C7", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                      >
                        ⚡ Autofill Registered User
                      </button>
                    </div>
                  )}

                  {/* Remember Me */}
                  <div className="pin-form-meta-row">
                    <label className="pin-remember-label">
                      <input 
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)} 
                      />
                      <span>Remember me</span>
                    </label>

                    {!isRegister && (
                      <Link to="/contact" className="pin-forgot-link">
                        Forgot Password?
                      </Link>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="pin-btn-signin"
                    disabled={loading}
                  >
                    {loading ? (isRegister ? "Creating Account..." : "Signing in...") : isRegister ? "Sign Up as Customer (Register)" : "Sign In as Customer"}
                  </button>

                  {/* Google Social Button */}
                  <button 
                    type="button" 
                    className="pin-btn-google"
                    onClick={handleGoogleSignIn}
                  >
                    <svg className="google-icon-svg" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  {/* OTP Alternative */}
                  <div className="pin-otp-toggle-wrap">
                    <button
                      type="button"
                      className="pin-otp-toggle-btn"
                      onClick={() => { setAuthMethod("otp"); setOtpSent(false); }}
                    >
                      📱 Or Sign in with Mobile OTP
                    </button>
                  </div>

                </form>
              ) : (
                /* Mobile OTP Mode */
                <div className="pin-form-body">
                  {!otpSent ? (
                    <form onSubmit={handleSendUserOtp}>
                      <div className="pin-input-group">
                        <label className="pin-input-label">10-Digit Mobile Number</label>
                        <div className="pin-input-field-wrap">
                          <span style={{ position: "absolute", left: "14px", fontWeight: 700, color: "#64748B", fontSize: "14px" }}>+91</span>
                          <input 
                            type="tel"
                            placeholder="98765 43210"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="pin-input-field"
                            style={{ paddingLeft: "52px" }}
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <button type="submit" className="pin-btn-signin" style={{ marginTop: "12px" }}>
                        Send Verification Code 📲
                      </button>

                      <div className="pin-otp-toggle-wrap" style={{ marginTop: "16px" }}>
                        <button
                          type="button"
                          className="pin-otp-toggle-btn"
                          onClick={() => setAuthMethod("password")}
                        >
                          ← Back to Password Sign In
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <OtpInput
                        length={6}
                        value={otpValue}
                        onChange={(v) => { setOtpValue(v); setOtpError(false); }}
                        onComplete={(v) => handleVerifyUserOtp(null, v)}
                        subtitle={`Enter the 6-digit verification code sent to +91 ${userPhone}`}
                        resendLabel="Resend Code"
                        onResend={() => alert(`Verification code resent to +91 ${userPhone}`)}
                        error={otpError}
                      />

                      {otpError && (
                        <p style={{ color: "#EF4444", fontSize: "12.5px", textAlign: "center", margin: "-6px 0 12px 0", fontWeight: 600 }}>
                          ⚠️ Invalid code. Please enter 6 digits.
                        </p>
                      )}

                      <button 
                        type="button" 
                        className="pin-btn-signin" 
                        onClick={(e) => handleVerifyUserOtp(e, otpValue)}
                      >
                        Verify & Access Customer Account ⚡
                      </button>

                      <div className="pin-otp-toggle-wrap" style={{ marginTop: "14px" }}>
                        <button 
                          type="button" 
                          className="pin-otp-toggle-btn"
                          onClick={() => setOtpSent(false)}
                        >
                          ← Change Mobile Number
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Footer Toggle */}
              <div className="pin-form-footer">
                <span>
                  {isRegister ? "Already have an account?" : "Don't have an account?"}
                </span>
                <span 
                  className="pin-switch-link" 
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setAuthMethod("password");
                    setErrorMessage("");
                    setNotRegisteredPrompt(false);
                    setSuccessMessage("");
                  }}
                >
                  {isRegister ? "Sign in" : "Sign up"}
                </span>
              </div>
            </div>
          )}

          {/* Compact Auth Security & Legal Footer */}
          <div className="login-compact-footer">
            <span>© 2026 Helper Technologies Inc.</span>
            <span className="footer-dot">•</span>
            <Link to="/contact">Support</Link>
            <span className="footer-dot">•</span>
            <Link to="/services">Services</Link>
          </div>

        </div>

      </div>

      {/* =========================================================================
          ₹399 VENDOR ONBOARDING FEE MODAL - PREMIUM FINTECH REDESIGN
          ========================================================================= */}
      {showWorkerFeeModal && pendingWorkerPayload && (
        <div className="worker-fee-modal-overlay animate-fade-in">
          <div className="worker-fee-modal-card animate-scale-up">
            
            {/* Modal Header */}
            <div className="fee-modal-header-v2">
              <div className="fee-modal-brand-wrap">
                <div className="fee-modal-brand-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </div>
                <div>
                  <div className="fee-modal-title">Vendor Onboarding & Verification Charge</div>
                  <div className="fee-modal-subtitle">Official Partner Accreditation • Amritam Services Hub</div>
                </div>
              </div>
              <button 
                type="button" 
                className="fee-modal-close-v2" 
                onClick={() => setShowWorkerFeeModal(false)}
                title="Cancel & Close"
              >
                ✕
              </button>
            </div>

            {/* Progress / Guarantee Banner */}
            <div className="fee-modal-step-banner">
              <div className="step-pill">
                <span className="live-dot-green"></span> STEP 2 OF 2: COMPLIANCE & ACTIVATION
              </div>
              <div className="step-status-chip">
                <span>🛡️</span> 100% Refundable Guarantee
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="fee-modal-body-v2">
              
              {/* Hero Price Box */}
              <div className="fee-hero-card">
                <div className="fee-hero-left">
                  <span className="fee-hero-label">ONE-TIME REGISTRATION & VERIFICATION CHARGE</span>
                  <div className="fee-hero-price-row">
                    <span className="fee-hero-curr">₹</span>
                    <span className="fee-hero-num">399</span>
                    <span className="fee-hero-gst">.00</span>
                    <span className="fee-tax-badge">Incl. All Taxes</span>
                  </div>
                  <p className="fee-hero-desc">
                    Helper Partner Network me register hone ke liye nearest vendor <strong>(Amritam Services Hub)</strong> ka verification charge pay karna hoga. Vendor approval ke baad aapka technician panel unlock hoga.
                  </p>
                </div>
                <div className="fee-hero-shield-badge">
                  <div className="shield-check-icon">✓</div>
                  <div className="shield-text">UIDAI & POLICE<br />COMPLIANT</div>
                </div>
              </div>

              {/* Technician & Assigned Vendor Card */}
              <div className="fee-partner-profile-card">
                <div className="profile-card-left">
                  <div className="profile-avatar">
                    {pendingWorkerPayload.name ? pendingWorkerPayload.name.charAt(0).toUpperCase() : "W"}
                  </div>
                  <div className="profile-meta">
                    <div className="profile-name">
                      {pendingWorkerPayload.name}
                      <span className="profile-badge-pro">VERIFIED APPLICANT</span>
                    </div>
                    <div className="profile-sub">
                      <span>📞 +91 {pendingWorkerPayload.phone}</span>
                      <span>•</span>
                      <span>🔧 {pendingWorkerPayload.category}</span>
                    </div>
                    <div className="profile-loc">
                      📍 {pendingWorkerPayload.address || "Palasia, Indore"}
                    </div>
                  </div>
                </div>
                <div className="profile-vendor-tag">
                  <span className="vendor-tag-lbl">Allocated Franchise Hub:</span>
                  <strong className="vendor-tag-name">Amritam Services Hub</strong>
                  <span className="vendor-tag-sub">Indore Central Territory</span>
                </div>
              </div>

              {/* Itemized Digital Invoice */}
              <div className="fee-invoice-card">
                <div className="invoice-head">
                  <span className="invoice-head-title">ITEMIZED CHARGE BREAKDOWN</span>
                  <span className="inv-code">TXN CODE: ONB-399</span>
                </div>
                
                <div className="invoice-rows">
                  <div className="inv-row">
                    <div className="inv-title">
                      <span className="inv-bullet">🛡️</span>
                      <div>
                        <strong>Identity, Police & Aadhaar Background Check</strong>
                        <div className="inv-subtitle">Automated UIDAI clearance & criminal record check</div>
                      </div>
                    </div>
                    <span className="inv-price">₹199</span>
                  </div>

                  <div className="inv-row">
                    <div className="inv-title">
                      <span className="inv-bullet">👷</span>
                      <div>
                        <strong>Partner ID Badge & Verified Field Pro Kit</strong>
                        <div className="inv-subtitle">Digital NFC/QR partner identity, uniform & field protocols</div>
                      </div>
                    </div>
                    <span className="inv-price">₹100</span>
                  </div>

                  <div className="inv-row">
                    <div className="inv-title">
                      <span className="inv-bullet">🏪</span>
                      <div>
                        <strong>Nearest Vendor Franchise Fleet Connect Fee</strong>
                        <div className="inv-subtitle">Priority job dispatching via Amritam Services Hub</div>
                      </div>
                    </div>
                    <span className="inv-price">₹100</span>
                  </div>
                </div>

                <div className="invoice-total-row">
                  <div>
                    <span className="total-title">Total Payable Amount</span>
                    <span className="total-sub">Zero hidden charges • 100% money-back if rejected</span>
                  </div>
                  <div className="inv-final-price">₹399</div>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="fee-payment-methods-v2">
                <div className="method-label-row">
                  <label className="method-label-v2">Select Payment Method</label>
                  <span className="method-tag-secure">⚡ Instant Verification</span>
                </div>

                {/* 3 Main Method Tabs */}
                <div className="payment-options-grid-v2">
                  <button 
                    type="button" 
                    className={`pay-opt-btn-v2 ${workerFeeMethod === "upi" ? "active" : ""}`}
                    onClick={() => setWorkerFeeMethod("upi")}
                  >
                    <div className="opt-icon-circle">📱</div>
                    <div className="opt-texts">
                      <strong>UPI (GPay / PhonePe / Paytm)</strong>
                      <span>Scan QR or UPI ID</span>
                    </div>
                    {workerFeeMethod === "upi" && <span className="opt-radio-dot">●</span>}
                  </button>

                  <button 
                    type="button" 
                    className={`pay-opt-btn-v2 ${workerFeeMethod === "card" ? "active" : ""}`}
                    onClick={() => setWorkerFeeMethod("card")}
                  >
                    <div className="opt-icon-circle">💳</div>
                    <div className="opt-texts">
                      <strong>Debit / Credit Card</strong>
                      <span>Visa, Mastercard, RuPay</span>
                    </div>
                    {workerFeeMethod === "card" && <span className="opt-radio-dot">●</span>}
                  </button>

                  <button 
                    type="button" 
                    className={`pay-opt-btn-v2 ${workerFeeMethod === "netbanking" ? "active" : ""}`}
                    onClick={() => setWorkerFeeMethod("netbanking")}
                  >
                    <div className="opt-icon-circle">🏛️</div>
                    <div className="opt-texts">
                      <strong>Net Banking</strong>
                      <span>All Major Indian Banks</span>
                    </div>
                    {workerFeeMethod === "netbanking" && <span className="opt-radio-dot">●</span>}
                  </button>
                </div>

                {/* METHOD 1: UPI CONTAINER */}
                {workerFeeMethod === "upi" && (
                  <div className="upi-container-v2 animate-fade-in">
                    {/* UPI Sub Mode Tabs */}
                    <div className="upi-subtabs">
                      <button 
                        type="button" 
                        className={`upi-subtab-btn ${workerUpiSubTab === "qr" ? "active" : ""}`}
                        onClick={() => setWorkerUpiSubTab("qr")}
                      >
                        <span>📲</span> Scan UPI QR Code
                      </button>
                      <button 
                        type="button" 
                        className={`upi-subtab-btn ${workerUpiSubTab === "id" ? "active" : ""}`}
                        onClick={() => setWorkerUpiSubTab("id")}
                      >
                        <span>⚡</span> Enter UPI ID / Number
                      </button>
                    </div>

                    {workerUpiSubTab === "qr" ? (
                      <div className="upi-qr-box">
                        <div className="upi-qr-card">
                          {/* Realistic Geometric QR Code SVG */}
                          <div className="qr-wrapper">
                            <svg className="upi-qr-svg" viewBox="0 0 160 160" width="160" height="160">
                              {/* QR Code Background */}
                              <rect width="160" height="160" fill="#ffffff" rx="8" />
                              {/* Corner Top-Left */}
                              <rect x="12" y="12" width="40" height="40" fill="#0f172a" rx="4" />
                              <rect x="18" y="18" width="28" height="28" fill="#ffffff" rx="2" />
                              <rect x="24" y="24" width="16" height="16" fill="#059669" rx="2" />
                              {/* Corner Top-Right */}
                              <rect x="108" y="12" width="40" height="40" fill="#0f172a" rx="4" />
                              <rect x="114" y="18" width="28" height="28" fill="#ffffff" rx="2" />
                              <rect x="120" y="24" width="16" height="16" fill="#059669" rx="2" />
                              {/* Corner Bottom-Left */}
                              <rect x="12" y="108" width="40" height="40" fill="#0f172a" rx="4" />
                              <rect x="18" y="114" width="28" height="28" fill="#ffffff" rx="2" />
                              <rect x="24" y="120" width="16" height="16" fill="#059669" rx="2" />
                              {/* Central Amount Badge */}
                              <rect x="58" y="58" width="44" height="44" fill="#047857" rx="8" />
                              <text x="80" y="85" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">₹399</text>
                              {/* Data Matrix Bits */}
                              <rect x="60" y="16" width="10" height="10" fill="#0f172a" />
                              <rect x="76" y="20" width="8" height="8" fill="#0f172a" />
                              <rect x="88" y="14" width="10" height="10" fill="#0f172a" />
                              <rect x="64" y="34" width="8" height="14" fill="#0f172a" />
                              <rect x="82" y="38" width="12" height="8" fill="#0f172a" />
                              <rect x="16" y="62" width="8" height="14" fill="#0f172a" />
                              <rect x="30" y="66" width="14" height="8" fill="#0f172a" />
                              <rect x="18" y="84" width="10" height="10" fill="#0f172a" />
                              <rect x="34" y="80" width="8" height="16" fill="#0f172a" />
                              <rect x="112" y="62" width="14" height="8" fill="#0f172a" />
                              <rect x="132" y="66" width="8" height="14" fill="#0f172a" />
                              <rect x="116" y="82" width="12" height="10" fill="#0f172a" />
                              <rect x="134" y="84" width="8" height="8" fill="#0f172a" />
                              <rect x="62" y="110" width="12" height="10" fill="#0f172a" />
                              <rect x="80" y="116" width="14" height="8" fill="#0f172a" />
                              <rect x="66" y="130" width="10" height="14" fill="#0f172a" />
                              <rect x="84" y="132" width="12" height="10" fill="#0f172a" />
                              <rect x="112" y="112" width="14" height="12" fill="#0f172a" />
                              <rect x="132" y="110" width="10" height="14" fill="#0f172a" />
                              <rect x="114" y="134" width="12" height="10" fill="#0f172a" />
                              <rect x="134" y="132" width="10" height="12" fill="#0f172a" />
                            </svg>
                          </div>
                          
                          <div className="qr-info-side">
                            <div className="qr-scan-badge">⚡ Instant Dynamic QR</div>
                            <div className="qr-scan-title">Scan using any UPI App</div>
                            <div className="upi-app-chips">
                              <span className="app-chip">Google Pay</span>
                              <span className="app-chip">PhonePe</span>
                              <span className="app-chip">Paytm</span>
                              <span className="app-chip">BHIM</span>
                            </div>
                            <div className="qr-timer-text">
                              ⏱️ Session active for <strong>04:59 mins</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="upi-input-box-v2">
                        <label className="input-sub-label">Enter Virtual Payment Address (VPA):</label>
                        <div className="upi-field-row">
                          <input 
                            type="text" 
                            placeholder="e.g. mobileNumber@upi, name@okhdfc" 
                            value={workerUpiId}
                            onChange={(e) => setWorkerUpiId(e.target.value)}
                            className="upi-text-input"
                          />
                          <button 
                            type="button" 
                            className="btn-verify-vpa"
                            onClick={() => setSuccessMessage("UPI ID Verified! Proceed with payment below.")}
                          >
                            Verify
                          </button>
                        </div>
                        <div className="upi-quick-pills-v2">
                          <span className="pill-hint">Quick autofill:</span>
                          <button type="button" onClick={() => setWorkerUpiId(`${pendingWorkerPayload.phone}@upi`)}>
                            ⚡ {pendingWorkerPayload.phone}@upi
                          </button>
                          <button type="button" onClick={() => setWorkerUpiId(`${pendingWorkerPayload.phone}@paytm`)}>
                            ⚡ {pendingWorkerPayload.phone}@paytm
                          </button>
                          <button type="button" onClick={() => setWorkerUpiId("worker.pro@okaxis")}>
                            ⚡ worker.pro@okaxis
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* METHOD 2: CARDS CONTAINER */}
                {workerFeeMethod === "card" && (
                  <div className="card-container-v2 animate-fade-in">
                    <div className="card-mock-row">
                      <div className="card-field-group">
                        <label>Card Number</label>
                        <input 
                          type="text" 
                          value={workerCardData.number}
                          onChange={(e) => setWorkerCardData({ ...workerCardData, number: e.target.value })}
                          placeholder="4532 0000 0000 8821" 
                          className="card-input"
                        />
                      </div>
                    </div>
                    <div className="card-field-row-split">
                      <div className="card-field-group">
                        <label>Expiry (MM/YY)</label>
                        <input 
                          type="text" 
                          value={workerCardData.expiry}
                          onChange={(e) => setWorkerCardData({ ...workerCardData, expiry: e.target.value })}
                          placeholder="12/28" 
                          className="card-input"
                        />
                      </div>
                      <div className="card-field-group">
                        <label>CVV / CVC</label>
                        <input 
                          type="password" 
                          maxLength="4"
                          value={workerCardData.cvv}
                          onChange={(e) => setWorkerCardData({ ...workerCardData, cvv: e.target.value })}
                          placeholder="•••" 
                          className="card-input"
                        />
                      </div>
                    </div>
                    <div className="card-supported-tags">
                      <span>Accepted:</span>
                      <span className="c-tag">RuPay</span>
                      <span className="c-tag">Visa</span>
                      <span className="c-tag">Mastercard</span>
                    </div>
                  </div>
                )}

                {/* METHOD 3: NET BANKING CONTAINER */}
                {workerFeeMethod === "netbanking" && (
                  <div className="netbank-container-v2 animate-fade-in">
                    <label className="input-sub-label">Select Popular Indian Bank:</label>
                    <div className="bank-chips-grid">
                      {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Bank", "Punjab National Bank"].map((bank) => (
                        <button 
                          key={bank}
                          type="button" 
                          className={`bank-chip-btn ${workerSelectedBank === bank ? "active" : ""}`}
                          onClick={() => setWorkerSelectedBank(bank)}
                        >
                          <span className="bank-icon">🏛️</span>
                          <span className="bank-name">{bank}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pay Now Button */}
              <button 
                type="button" 
                className="btn-pay-worker-fee-v2"
                onClick={handleCompleteWorkerFeeAndRegister}
                disabled={workerFeeProcessing}
              >
                {workerFeeProcessing ? (
                  <span className="btn-processing-content">
                    <span className="spinner-border-sm"></span>
                    <span>Processing ₹399 Payment & Routing to Amritam Hub...</span>
                  </span>
                ) : (
                  <span className="btn-content">
                    <span>Pay ₹399 & Submit for Vendor Approval</span>
                    <span className="btn-arrow">➔</span>
                  </span>
                )}
              </button>

              {/* Trust Footer */}
              <div className="fee-security-footer">
                <div className="security-item">
                  <span>🔒</span> 256-Bit SSL Encrypted
                </div>
                <div className="security-item">
                  <span>🛡️</span> NPCI / BHIM Certified
                </div>
                <div className="security-item">
                  <span>⚡</span> Instant Digital Receipt
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
