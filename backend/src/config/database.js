const mongoose = require("mongoose");

/**
 * Connect to MongoDB Atlas (or any Mongo URI in MONGO_URI).
 * Call once before accepting HTTP traffic.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set in environment");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });

  const { host } = mongoose.connection;
  console.log(`[db] MongoDB connected — host: ${host}`);
}

module.exports = { connectDB };
