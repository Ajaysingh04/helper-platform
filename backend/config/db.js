const mongoose = require("mongoose");
const seedMongo = require("../utils/seedMongo");

let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/helper_platform";

  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });

    isMongoConnected = true;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Auto seed default data if collection is empty
    await seedMongo();
  } catch (error) {
    isMongoConnected = false;
    console.warn(`⚠️ MongoDB connection warning: ${error.message}`);
    console.warn(`💡 Note: If you are using MongoDB Atlas, add your connection string in backend/.env as MONGO_URI.`);
    console.warn(`💡 If local MongoDB is running, ensure mongod service is active on port 27017.`);
  }
};

const getStatus = () => isMongoConnected || (mongoose.connection && mongoose.connection.readyState === 1);

module.exports = { connectDB, getStatus };
