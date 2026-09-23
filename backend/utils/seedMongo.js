const Category = require("../models/Category");
const Service = require("../models/Service");
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Slide = require("../models/Slide");
const Ticket = require("../models/Ticket");
const Setting = require("../models/Setting");
const seedData = require("../data/seedData");

async function seedMongo() {
  try {
    // 1. Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0 && seedData.initialCategories?.length) {
      await Category.insertMany(seedData.initialCategories);
      console.log(`✅ Seeded ${seedData.initialCategories.length} Categories into MongoDB`);
    }

    // 2. Services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0 && seedData.initialServices?.length) {
      await Service.insertMany(seedData.initialServices);
      console.log(`✅ Seeded ${seedData.initialServices.length} Services into MongoDB`);
    }

    // 3. Providers
    const providerCount = await Provider.countDocuments();
    if (providerCount === 0 && seedData.initialProviders?.length) {
      await Provider.insertMany(seedData.initialProviders);
      console.log(`✅ Seeded ${seedData.initialProviders.length} Providers into MongoDB`);
    }

    // 4. Bookings
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0 && seedData.initialBookings?.length) {
      await Booking.insertMany(seedData.initialBookings);
      console.log(`✅ Seeded ${seedData.initialBookings.length} Bookings into MongoDB`);
    }

    // 5. Slides
    const slideCount = await Slide.countDocuments();
    if (slideCount === 0 && seedData.initialSlides?.length) {
      await Slide.insertMany(seedData.initialSlides);
      console.log(`✅ Seeded ${seedData.initialSlides.length} Promo Slides into MongoDB`);
    }

    // 6. Users
    const userCount = await User.countDocuments();
    if (userCount === 0 && seedData.initialUsers?.length) {
      await User.insertMany(seedData.initialUsers);
      console.log(`✅ Seeded ${seedData.initialUsers.length} Users into MongoDB`);
    }

    // 7. Tickets
    const ticketCount = await Ticket.countDocuments();
    if (ticketCount === 0 && seedData.initialTickets?.length) {
      await Ticket.insertMany(seedData.initialTickets);
      console.log(`✅ Seeded ${seedData.initialTickets.length} Tickets into MongoDB`);
    }

    // 8. Settings
    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      await Setting.create({ key: "global_settings", ...seedData.initialSettings });
      console.log(`✅ Seeded Global Settings into MongoDB`);
    }
  } catch (error) {
    console.warn("⚠️ MongoDB auto-seed warning:", error.message);
  }
}

module.exports = seedMongo;
