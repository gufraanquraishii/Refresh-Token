const path = require("path");
const fs = require("fs");

// Always load backend/.env (default dotenv uses process.cwd(), which breaks when you start from monorepo root).
const envPath = path.join(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
  console.warn(`[auth-api] Missing ${envPath} — env vars may be wrong.`);
}
require("dotenv").config({ path: envPath });

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// Central error handler (after routes)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[auth-api] unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`[auth-api] Loaded env from ${envPath}`);
      console.log(
        `[auth-api] ACCESS_TOKEN_EXPIRY=${process.env.ACCESS_TOKEN_EXPIRY ?? "(unset)"} REFRESH_TOKEN_EXPIRY=${process.env.REFRESH_TOKEN_EXPIRY ?? "(unset)"}`
      );
    });
  })
  .catch((err) => {
    console.error("[db] Failed to connect:", err.message);
    process.exit(1);
  });
