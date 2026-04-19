const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token");

const log = (...args) => {
  if (process.env.AUTH_DEBUG === "false") return;
  console.log("[auth-api]", ...args);
};

function verifyRefreshTokenAsync(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      }
    );
  });
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password"
    );

    if (!user) {
      log("login: 401 user not found", email);
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      log("login: 401 bad password", email);
      return res.status(401).json({ message: "Invalid password" });
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await User.updateOne(
      { _id: user._id },
      { $push: { refreshTokens: refreshToken } }
    );

    log("login: 200 OK", user.email);
    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error("[auth-api] login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      log("refresh: 401 missing refreshToken in body");
      return res.sendStatus(401);
    }

    const user = await User.findOne({ refreshTokens: refreshToken });

    if (!user) {
      log("refresh: 403 refresh token not registered for any user");
      return res.sendStatus(403);
    }

    let decoded;
    try {
      decoded = await verifyRefreshTokenAsync(refreshToken);
    } catch (err) {
      log("refresh: 403 jwt.verify failed", err.message);
      await User.updateOne(
        { _id: user._id },
        { $pull: { refreshTokens: refreshToken } }
      );
      return res.sendStatus(403);
    }

    if (decoded.id !== user._id.toString()) {
      log("refresh: 403 token subject mismatch");
      return res.sendStatus(403);
    }

    const newAccessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
    });

    log("refresh: 200 OK new access token for", user.email);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("[auth-api] refresh error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    const result = await User.updateMany(
      { refreshTokens: refreshToken },
      { $pull: { refreshTokens: refreshToken } }
    );

    log(
      "logout: pulled refresh token from",
      result.modifiedCount,
      "user document(s)"
    );
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error("[auth-api] logout error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
