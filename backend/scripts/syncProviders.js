const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const fs = require("fs");
const { connectDB } = require("../config/db");
const Provider = require("../models/Provider");
const seedProviders = require("../data/seedProvidersData");

async function sync() {
  await connectDB();
  console.log("Syncing seed providers to MongoDB & database.json...");

  // 1. Update database.json
  const dbJsonPath = path.join(__dirname, "..", "data", "database.json");
  let dbData = {};
  if (fs.existsSync(dbJsonPath)) {
    try {
      dbData = JSON.parse(fs.readFileSync(dbJsonPath, "utf8"));
    } catch (e) {}
  }
  dbData.providers = seedProviders;
  fs.writeFileSync(dbJsonPath, JSON.stringify(dbData, null, 2), "utf8");
  console.log("✅ database.json providers synced. Total:", seedProviders.length);

  // 2. Sync to MongoDB
  for (const item of seedProviders) {
    await Provider.findOneAndUpdate(
      { id: item.id },
      item,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const count = await Provider.countDocuments();
  console.log("✅ MongoDB providers collection updated. Total count in DB:", count);
  process.exit(0);
}

sync().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
