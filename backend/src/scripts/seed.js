/**
 * One-off: create test user test@test.com / password123 (if missing).
 * Run: pnpm --filter backend run seed
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("[seed] connected");

  const email = "test@test.com";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("[seed] user already exists:", email);
    await mongoose.disconnect();
    process.exit(0);
  }

  const password = await bcrypt.hash("password123", 10);
  await User.create({
    email,
    password,
    refreshTokens: [],
  });

  console.log("[seed] created", email, "/ password123");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((e) => {
  console.error("[seed] failed:", e);
  process.exit(1);
});
