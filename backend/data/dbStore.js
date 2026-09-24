const fs = require("fs");
const path = require("path");
const seedData = require("./seedData");

const DB_FILE = path.join(__dirname, "database.json");

class DBStore {
  constructor() {
    this.data = {
      categories: seedData.initialCategories,
      services: seedData.initialServices,
      providers: seedData.initialProviders,
      bookings: seedData.initialBookings,
      slides: seedData.initialSlides,
      users: seedData.initialUsers,
      tickets: seedData.initialTickets,
      settings: seedData.initialSettings
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };

        // Automatically sync category images into stored categories if missing
        if (Array.isArray(this.data.categories) && Array.isArray(seedData.initialCategories)) {
          let updatedAny = false;
          this.data.categories = this.data.categories.map((c) => {
            const seedCat = seedData.initialCategories.find((sc) => sc.id === c.id || sc.name === c.name);
            if (seedCat && seedCat.image && (!c.image || c.image === "")) {
              updatedAny = true;
              return { ...c, image: seedCat.image };
            }
            return c;
          });
          if (updatedAny) {
            this.save();
          }
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.warn("Could not load database.json, using seedData:", err.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving database.json:", err.message);
    }
  }

  // Getters
  getAll(collection) {
    return this.data[collection] || [];
  }

  getById(collection, id) {
    return (this.data[collection] || []).find((item) => String(item.id) === String(id) || String(item._id) === String(id));
  }

  // Setters / CRUD
  insert(collection, item) {
    if (!this.data[collection]) this.data[collection] = [];
    this.data[collection].unshift(item);
    this.save();
    return item;
  }

  update(collection, id, updates) {
    if (!this.data[collection]) return null;
    const index = this.data[collection].findIndex((item) => String(item.id) === String(id) || String(item._id) === String(id));
    if (index !== -1) {
      this.data[collection][index] = { ...this.data[collection][index], ...updates };
      this.save();
      return this.data[collection][index];
    }
    return null;
  }

  delete(collection, id) {
    if (!this.data[collection]) return false;
    const initialLength = this.data[collection].length;
    this.data[collection] = this.data[collection].filter((item) => String(item.id) !== String(id) && String(item._id) !== String(id));
    if (this.data[collection].length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  // Settings
  getSettings() {
    return this.data.settings || seedData.initialSettings;
  }

  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  resetAll() {
    this.data = {
      categories: seedData.initialCategories,
      services: seedData.initialServices,
      providers: seedData.initialProviders,
      bookings: seedData.initialBookings,
      slides: seedData.initialSlides,
      users: seedData.initialUsers,
      tickets: seedData.initialTickets,
      settings: seedData.initialSettings
    };
    this.save();
    return this.data;
  }
}

module.exports = new DBStore();
