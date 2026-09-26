const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const carRentalProviders = [
  {
    id: "prv-car-1",
    name: "Sunil Rathore (Fleet Manager)",
    shopName: "ZoomDrive Self-Drive & Luxury Car Rental",
    category: "Car Rental",
    serviceCategories: ["Car Rental", "Taxi Services", "Travel & Transport"],
    phone: "+91 98765 22110",
    distance: "1.2 km",
    distanceKm: 1.2,
    experience: "8+ Years Exp",
    experienceYears: 8,
    rating: 4.9,
    totalReviewsCount: 312,
    hourlyRate: "₹899/day onwards",
    location: "Scheme 54, Vijay Nagar, Indore",
    address: "Scheme 54, Vijay Nagar, Near Orbit Mall, Indore",
    facilities: ["Self Drive Available", "Zero Security Deposit", "Clean & Sanitized Cars", "24/7 Roadside Assistance", "All India Permit"],
    avatar: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600",
    verified: true,
    status: "Active"
  },
  {
    id: "prv-car-2",
    name: "Gurpreet Singh (Operations Head)",
    shopName: "Royal City Cab & Luxury Car Rental",
    category: "Car Rental",
    serviceCategories: ["Car Rental", "Taxi Services", "Luxury Travel"],
    phone: "+91 98765 33440",
    distance: "2.4 km",
    distanceKm: 2.4,
    experience: "10+ Years Exp",
    experienceYears: 10,
    rating: 4.8,
    totalReviewsCount: 245,
    hourlyRate: "₹1,199/day onwards",
    location: "Airport Road, Commercial Hub, Indore",
    address: "Airport Road, Near Devi Ahilya Airport, Indore",
    facilities: ["Chauffeur Driven & Self Drive", "Sedans & Luxury SUVs", "GPS Live Tracking", "Transparent Billing", "Instant Confirmation"],
    avatar: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600",
    verified: true,
    status: "Active"
  },
  {
    id: "prv-car-3",
    name: "Pradeep Joshi (Fleet Coordinator)",
    shopName: "Indore Wheels 24/7 Car Hire & Rentals",
    category: "Car Rental",
    serviceCategories: ["Car Rental", "Travel & Transport"],
    phone: "+91 98765 77889",
    distance: "3.1 km",
    distanceKm: 3.1,
    experience: "7+ Years Exp",
    experienceYears: 7,
    rating: 4.7,
    totalReviewsCount: 189,
    hourlyRate: "₹799/day onwards",
    location: "Palasia Square, AB Road, Indore",
    address: "Palasia Square, AB Road, Central Zone, Indore",
    facilities: ["Doorstep Delivery", "Hatchbacks & Sedans", "Unlimited KM Options", "Full Insurance Cover", "Fast FASTag Enabled"],
    avatar: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600",
    verified: true,
    status: "Active"
  },
  // Bike on rent
  {
    id: "prv-bike-1",
    name: "Vikrant Chauhan",
    shopName: "Indore SuperBikes & Scooty Rental Hub",
    category: "Bike On Rent",
    serviceCategories: ["Bike On Rent", "Two Wheeler Hire", "Travel & Transport"],
    phone: "+91 98765 66771",
    distance: "1.5 km",
    distanceKm: 1.5,
    experience: "6+ Years Exp",
    experienceYears: 6,
    rating: 4.8,
    totalReviewsCount: 176,
    hourlyRate: "₹299/day onwards",
    location: "Bhawarkua Square, Student Hub, Indore",
    address: "Bhawarkua Square, Near Tower Square, Indore",
    facilities: ["Scooties & Geared Bikes", "Helmets Included", "Instant Verification", "Hourly & Daily Plans"],
    avatar: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
    verified: true,
    status: "Active"
  },
  // Car Repair & Services
  {
    id: "prv-crp-1",
    name: "Rameshwar Patel",
    shopName: "SpeedyWheels Multi-Brand Car Care & Repair Workshop",
    category: "Car Repair & Services",
    serviceCategories: ["Car Repair & Services", "Auto Mechanics", "Periodic Maintenance"],
    phone: "+91 98765 55432",
    distance: "2.0 km",
    distanceKm: 2.0,
    experience: "12+ Years Exp",
    experienceYears: 12,
    rating: 4.9,
    totalReviewsCount: 340,
    hourlyRate: "₹499 inspection fee",
    location: "LIG Square, Ring Road, Indore",
    address: "LIG Square, Ring Road, Automobile Zone, Indore",
    facilities: ["Automated Diagnostic Tools", "Genuine OEM Spare Parts", "Dent & Paint Booth", "Pick & Drop Available", "6 Months Warranty"],
    avatar: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=600",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=600",
    verified: true,
    status: "Active"
  }
];

async function seedMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/helper_db');
    const col = mongoose.connection.collection('providers');

    // 1. Fix undefined shopName and categories for existing p1, p2, p3, p4
    await col.updateOne({ id: 'p1' }, { $set: { shopName: 'Sharma Quick Flow Plumbing Works', serviceCategories: ['Plumbing', 'Plumbers'] } });
    await col.updateOne({ id: 'p2' }, { $set: { shopName: 'Verma PowerTech Electrical Solutions', serviceCategories: ['Electrical', 'Electricians'] } });
    await col.updateOne({ id: 'p3' }, { $set: { shopName: 'Sunil ProClean Sanitization Services', serviceCategories: ['Cleaning'] } });
    await col.updateOne({ id: 'p4' }, { $set: { shopName: 'Manoj WoodCraft & Modular Carpentry', category: 'Carpenters', serviceCategories: ['Carpenters', 'Carpentry', 'Woodwork'] } });

    // 2. Upsert car rental, bike on rent, and car repair providers
    for (const p of carRentalProviders) {
      await col.updateOne({ id: p.id }, { $set: p }, { upsert: true });
    }

    console.log('Successfully seeded MongoDB with Car Rental, Bike On Rent, Car Repair providers and fixed legacy providers!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Mongo seed error:', err.message);
  }
}

seedMongo();
