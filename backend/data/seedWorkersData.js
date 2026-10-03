const seedWorkers = [
  // 1. Plumber Worker
  {
    id: "wrk_101",
    workerId: "WRK-101",
    vendorId: "vdr_rahul_amritam",
    vendorName: "Amritam Services Hub",
    name: "Sunil Sharma",
    phone: "9876500101",
    email: "sunil.plumber@helper.in",
    password: "worker123",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300",
    address: "B-42, Shanti Nagar, Sector 18",
    category: "Plumber",
    skills: ["Pipe Leakage", "Tap Repair", "Basin Installation", "Tank Cleaning", "Drainage Unclog"],
    experienceYears: 6,
    status: "active",
    verificationStatus: "verified",
    documents: {
      aadhaarNumber: "XXXX-XXXX-4512",
      aadhaarDoc: "https://helper.in/docs/aadhaar_sunil.pdf",
      panNumber: "ABCPS1234F",
      panDoc: "https://helper.in/docs/pan_sunil.pdf",
      certificates: ["ITI Certified Plumbing", "Govt Skill India Certificate"],
      policeVerificationDoc: "https://helper.in/docs/police_verified.pdf"
    },
    availability: {
      isOnline: true,
      isEmergencyAvailable: true,
      workingHours: { start: "08:30", end: "20:00" },
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      leaves: []
    },
    currentLocation: {
      coordinates: [77.3653, 28.6280],
      address: "Near Metro Gate 2, Sector 18",
      lastUpdated: new Date()
    },
    performance: {
      completedJobs: 142,
      rating: 4.9,
      totalReviews: 86,
      attendanceRate: 98,
      jobCompletionRate: 99,
      onTimeRate: 96
    },
    earnings: {
      salaryType: "commission",
      commissionPercent: 90,
      fixedMonthlySalary: 0,
      hourlyRate: 249,
      totalEarned: 38450,
      pendingPayout: 3200,
      payoutHistory: [
        { id: "PAY-901", amount: 4500, upiId: "sunil@okhdfc", date: "2026-09-28", status: "Completed", txHash: "UPI7712498" },
        { id: "PAY-882", amount: 6200, upiId: "sunil@okhdfc", date: "2026-09-21", status: "Completed", txHash: "UPI6521992" }
      ]
    },
    attendance: [
      { id: "ATT-1", date: "2026-10-02", checkIn: "08:35 AM", checkOut: "07:45 PM", status: "present", hours: 11, location: "Sector 18 Hub" },
      { id: "ATT-2", date: "2026-10-01", checkIn: "08:40 AM", checkOut: "08:00 PM", status: "present", hours: 11.2, location: "Sector 18 Hub" }
    ]
  },

  // 2. Electrician Worker
  {
    id: "wrk_102",
    workerId: "WRK-102",
    vendorId: "vdr_rahul_amritam",
    vendorName: "Amritam Services Hub",
    name: "Amit Verma",
    phone: "9876500102",
    email: "amit.electrician@helper.in",
    password: "worker123",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    address: "C-12, Rajiv Gandhi Colony",
    category: "Electrician",
    skills: ["MCB Tripping Fix", "Switchboard Wiring", "Fan & Chandelier", "Short Circuit Detection", "Inverter Setup"],
    experienceYears: 5,
    status: "active",
    verificationStatus: "verified",
    documents: {
      aadhaarNumber: "XXXX-XXXX-8910",
      aadhaarDoc: "https://helper.in/docs/aadhaar_amit.pdf",
      panNumber: "XYZPA9988G",
      panDoc: "https://helper.in/docs/pan_amit.pdf",
      certificates: ["National Wireman License", "Safety Level 3"],
      policeVerificationDoc: "https://helper.in/docs/police_verified.pdf"
    },
    availability: {
      isOnline: true,
      isEmergencyAvailable: true,
      workingHours: { start: "09:00", end: "21:00" },
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      leaves: []
    },
    currentLocation: {
      coordinates: [77.3712, 28.6295],
      address: "Commercial Market, Block D",
      lastUpdated: new Date()
    },
    performance: {
      completedJobs: 98,
      rating: 4.85,
      totalReviews: 64,
      attendanceRate: 95,
      jobCompletionRate: 97,
      onTimeRate: 94
    },
    earnings: {
      salaryType: "commission",
      commissionPercent: 90,
      fixedMonthlySalary: 0,
      hourlyRate: 299,
      totalEarned: 29100,
      pendingPayout: 2450,
      payoutHistory: [
        { id: "PAY-904", amount: 5100, upiId: "amitverma@okaxis", date: "2026-09-28", status: "Completed", txHash: "UPI9120481" }
      ]
    },
    attendance: [
      { id: "ATT-3", date: "2026-10-02", checkIn: "08:55 AM", checkOut: "08:15 PM", status: "present", hours: 11.3, location: "Sector 18 Hub" }
    ]
  },

  // 3. Driver Worker
  {
    id: "wrk_103",
    workerId: "WRK-103",
    vendorId: "vdr_rahul_amritam",
    vendorName: "Amritam Services Hub",
    name: "Manoj Chauffeur",
    phone: "9876500103",
    email: "manoj.driver@helper.in",
    password: "worker123",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    address: "Block E, Transport Nagar",
    category: "Driver (Chauffeur)",
    skills: ["Luxury Automatic Cars", "Manual Transmission", "Outstation Driving", "Airport Transfers", "City Navigation"],
    experienceYears: 8,
    status: "active",
    verificationStatus: "verified",
    documents: {
      aadhaarNumber: "XXXX-XXXX-6721",
      aadhaarDoc: "https://helper.in/docs/aadhaar_manoj.pdf",
      panNumber: "KLMPD5544H",
      panDoc: "https://helper.in/docs/pan_manoj.pdf",
      certificates: ["Commercial Heavy & Light Driving License", "Defensive Driving Certificate"],
      policeVerificationDoc: "https://helper.in/docs/police_verified.pdf"
    },
    availability: {
      isOnline: true,
      isEmergencyAvailable: true,
      workingHours: { start: "07:00", end: "22:00" },
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Sunday"],
      leaves: []
    },
    currentLocation: {
      coordinates: [77.3620, 28.6320],
      address: "Near Golf Links Road",
      lastUpdated: new Date()
    },
    performance: {
      completedJobs: 176,
      rating: 4.95,
      totalReviews: 120,
      attendanceRate: 99,
      jobCompletionRate: 100,
      onTimeRate: 98
    },
    earnings: {
      salaryType: "commission",
      commissionPercent: 90,
      fixedMonthlySalary: 0,
      hourlyRate: 199,
      totalEarned: 46200,
      pendingPayout: 4100,
      payoutHistory: [
        { id: "PAY-905", amount: 7500, upiId: "manojdriver@paytm", date: "2026-09-29", status: "Completed", txHash: "UPI881239" }
      ]
    },
    attendance: [
      { id: "ATT-4", date: "2026-10-02", checkIn: "07:10 AM", checkOut: "09:00 PM", status: "present", hours: 13.8, location: "Sector 18 Hub" }
    ]
  },

  // 4. AC Repair Technician
  {
    id: "wrk_104",
    workerId: "WRK-104",
    vendorId: "vdr_rahul_amritam",
    vendorName: "Amritam Services Hub",
    name: "Imran Khan",
    phone: "9876500104",
    email: "imran.ac@helper.in",
    password: "worker123",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300",
    address: "G-19, Cool Tech Lane",
    category: "AC Repair & Refill",
    skills: ["Deep Foam Jet Wash", "Gas Leakage & Refill", "Compressor Replacement", "Cooling Coil Repair", "Thermostat Fix"],
    experienceYears: 7,
    status: "active",
    verificationStatus: "verified",
    documents: {
      aadhaarNumber: "XXXX-XXXX-3344",
      aadhaarDoc: "https://helper.in/docs/aadhaar_imran.pdf",
      panNumber: "IKLPA1234J",
      panDoc: "https://helper.in/docs/pan_imran.pdf",
      certificates: ["HVAC Specialist Diploma", "Refrigerant Handling Certified"],
      policeVerificationDoc: "https://helper.in/docs/police_verified.pdf"
    },
    availability: {
      isOnline: true,
      isEmergencyAvailable: true,
      workingHours: { start: "08:00", end: "20:00" },
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      leaves: []
    },
    currentLocation: {
      coordinates: [77.3680, 28.6250],
      address: "Industrial Complex Sector 62",
      lastUpdated: new Date()
    },
    performance: {
      completedJobs: 134,
      rating: 4.92,
      totalReviews: 88,
      attendanceRate: 97,
      jobCompletionRate: 98,
      onTimeRate: 96
    },
    earnings: {
      salaryType: "commission",
      commissionPercent: 90,
      fixedMonthlySalary: 0,
      hourlyRate: 349,
      totalEarned: 41800,
      pendingPayout: 3800,
      payoutHistory: [
        { id: "PAY-908", amount: 6800, upiId: "imranac@icici", date: "2026-09-28", status: "Completed", txHash: "UPI778811" }
      ]
    },
    attendance: [
      { id: "ATT-5", date: "2026-10-02", checkIn: "08:15 AM", checkOut: "07:30 PM", status: "present", hours: 11.2, location: "Sector 18 Hub" }
    ]
  },

  // 5. Carpenter Worker
  {
    id: "wrk_105",
    workerId: "WRK-105",
    vendorId: "vdr_rahul_amritam",
    vendorName: "Amritam Services Hub",
    name: "Sunil Mistry",
    phone: "9876500105",
    email: "sunil.carpenter@helper.in",
    password: "worker123",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300",
    address: "H-4, Wood Craft Market",
    category: "Carpenter",
    skills: ["Door Lock & Alignment", "Modular Furniture Assembly", "Cupboard Hinge Fix", "Bed Repair", "Custom Woodwork"],
    experienceYears: 9,
    status: "active",
    verificationStatus: "verified",
    documents: {
      aadhaarNumber: "XXXX-XXXX-9911",
      aadhaarDoc: "https://helper.in/docs/aadhaar_mistry.pdf",
      panNumber: "SMCAR8877K",
      panDoc: "https://helper.in/docs/pan_mistry.pdf",
      certificates: ["Master Craftsman Certificate"],
      policeVerificationDoc: "https://helper.in/docs/police_verified.pdf"
    },
    availability: {
      isOnline: true,
      isEmergencyAvailable: false,
      workingHours: { start: "09:00", end: "19:00" },
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      leaves: []
    },
    currentLocation: {
      coordinates: [77.3610, 28.6270],
      address: "Timber Market Road",
      lastUpdated: new Date()
    },
    performance: {
      completedJobs: 82,
      rating: 4.88,
      totalReviews: 54,
      attendanceRate: 94,
      jobCompletionRate: 96,
      onTimeRate: 95
    },
    earnings: {
      salaryType: "commission",
      commissionPercent: 90,
      fixedMonthlySalary: 0,
      hourlyRate: 299,
      totalEarned: 24500,
      pendingPayout: 1850,
      payoutHistory: []
    },
    attendance: [
      { id: "ATT-6", date: "2026-10-02", checkIn: "09:10 AM", checkOut: "06:50 PM", status: "present", hours: 9.6, location: "Sector 18 Hub" }
    ]
  },

  // 6. Home Cleaner Worker
  {
    id: "wrk_106",
    workerId: "WRK-106",
    vendorId: "vdr_rahul_amritam",
    vendorName: "Amritam Services Hub",
    name: "Priya Sharma",
    phone: "9876500106",
    email: "priya.cleaner@helper.in",
    password: "worker123",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    address: "K-12, Green Colony",
    category: "Home Cleaner",
    skills: ["Deep Bathroom Scrubbing", "Kitchen Degreasing", "Floor Buffing", "Balcony Wash", "Sofa Shampooing"],
    experienceYears: 4,
    status: "active",
    verificationStatus: "verified",
    documents: {
      aadhaarNumber: "XXXX-XXXX-1122",
      aadhaarDoc: "https://helper.in/docs/aadhaar_priya.pdf",
      panNumber: "PRCLN4433L",
      panDoc: "https://helper.in/docs/pan_priya.pdf",
      certificates: ["Sanitization & Hygiene Expert"],
      policeVerificationDoc: "https://helper.in/docs/police_verified.pdf"
    },
    availability: {
      isOnline: true,
      isEmergencyAvailable: true,
      workingHours: { start: "08:00", end: "18:00" },
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      leaves: []
    },
    currentLocation: {
      coordinates: [77.3750, 28.6310],
      address: "Green Valley Phase 2",
      lastUpdated: new Date()
    },
    performance: {
      completedJobs: 110,
      rating: 4.93,
      totalReviews: 76,
      attendanceRate: 98,
      jobCompletionRate: 99,
      onTimeRate: 97
    },
    earnings: {
      salaryType: "commission",
      commissionPercent: 90,
      fixedMonthlySalary: 0,
      hourlyRate: 199,
      totalEarned: 31200,
      pendingPayout: 2900,
      payoutHistory: []
    },
    attendance: [
      { id: "ATT-7", date: "2026-10-02", checkIn: "08:05 AM", checkOut: "06:10 PM", status: "present", hours: 10, location: "Sector 18 Hub" }
    ]
  },

  // 7. Chef Worker
  {
    id: "wrk_107",
    workerId: "WRK-107",
    vendorId: "vdr_rahul_amritam",
    vendorName: "Amritam Services Hub",
    name: "Chef Anand Joshi",
    phone: "9876500107",
    email: "chef.anand@helper.in",
    password: "worker123",
    avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=300",
    address: "L-88, Culinary Enclave",
    category: "Home Cook / Chef",
    skills: ["North Indian Feast", "South Indian Delicacies", "Diet & Healthy Meals", "Party Live Grilling", "Continental Platters"],
    experienceYears: 10,
    status: "active",
    verificationStatus: "verified",
    documents: {
      aadhaarNumber: "XXXX-XXXX-7788",
      aadhaarDoc: "https://helper.in/docs/aadhaar_anand.pdf",
      panNumber: "ANJOS9911M",
      panDoc: "https://helper.in/docs/pan_anand.pdf",
      certificates: ["Institute of Hotel Management (IHM) Diploma", "Food Safety Standard (FSSAI)"],
      policeVerificationDoc: "https://helper.in/docs/police_verified.pdf"
    },
    availability: {
      isOnline: true,
      isEmergencyAvailable: true,
      workingHours: { start: "07:00", end: "22:00" },
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      leaves: []
    },
    currentLocation: {
      coordinates: [77.3690, 28.6290],
      address: "Chef Center MG Road",
      lastUpdated: new Date()
    },
    performance: {
      completedJobs: 156,
      rating: 4.97,
      totalReviews: 104,
      attendanceRate: 99,
      jobCompletionRate: 100,
      onTimeRate: 98
    },
    earnings: {
      salaryType: "commission",
      commissionPercent: 90,
      fixedMonthlySalary: 0,
      hourlyRate: 399,
      totalEarned: 58900,
      pendingPayout: 5400,
      payoutHistory: []
    },
    attendance: [
      { id: "ATT-8", date: "2026-10-02", checkIn: "07:30 AM", checkOut: "09:30 PM", status: "present", hours: 14, location: "Sector 18 Hub" }
    ]
  },

  // 8. Doctor Worker
  {
    id: "wrk_108",
    workerId: "WRK-108",
    vendorId: "vdr_rahul_amritam",
    vendorName: "Amritam Services Hub",
    name: "Dr. R. K. Saxena",
    phone: "9876500108",
    email: "dr.saxena@helper.in",
    password: "worker123",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    address: "Medical Enclave, Central Sector",
    category: "Doctor",
    skills: ["General Health Checkup", "Senior Citizen Home Visit", "Blood Pressure & Diabetes Check", "Prescription & Medication", "Emergency First Aid"],
    experienceYears: 12,
    status: "active",
    verificationStatus: "verified",
    documents: {
      aadhaarNumber: "XXXX-XXXX-9900",
      aadhaarDoc: "https://helper.in/docs/aadhaar_saxena.pdf",
      panNumber: "RKSAX7766N",
      panDoc: "https://helper.in/docs/pan_saxena.pdf",
      certificates: ["MBBS, Medical Council of India", "Registered Medical Practitioner License"],
      policeVerificationDoc: "https://helper.in/docs/police_verified.pdf"
    },
    availability: {
      isOnline: true,
      isEmergencyAvailable: true,
      workingHours: { start: "08:00", end: "21:00" },
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      leaves: []
    },
    currentLocation: {
      coordinates: [77.3630, 28.6260],
      address: "City Hospital Annexe",
      lastUpdated: new Date()
    },
    performance: {
      completedJobs: 94,
      rating: 4.98,
      totalReviews: 72,
      attendanceRate: 99,
      jobCompletionRate: 100,
      onTimeRate: 99
    },
    earnings: {
      salaryType: "commission",
      commissionPercent: 90,
      fixedMonthlySalary: 0,
      hourlyRate: 599,
      totalEarned: 62400,
      pendingPayout: 6100,
      payoutHistory: []
    },
    attendance: [
      { id: "ATT-9", date: "2026-10-02", checkIn: "08:00 AM", checkOut: "08:00 PM", status: "present", hours: 12, location: "Sector 18 Hub" }
    ]
  }
];

module.exports = seedWorkers;
