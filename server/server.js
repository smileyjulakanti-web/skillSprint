const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillSprint";

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint for Render / monitoring
app.get("/api/health", (req, res) => {
  const mongoStatus =
    ["disconnected", "connected", "connecting", "disconnecting"][
      mongoose.connection.readyState
    ] || "unknown";

  res.json({
    status: "ok",
    service: "SkillSprint API",
    uptime: Math.floor(process.uptime()),
    mongodb: mongoStatus,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "SkillSprint Server is Running ⚡",
    healthCheck: "/api/health",
    authEndpoints: {
      login: "POST /api/auth/login",
      register: "POST /api/auth/register",
      me: "GET /api/auth/me",
    },
  });
});

// Start server immediately so cloud host (Render) health-checks pass
app.listen(PORT, () => {
  console.log(`🚀 SkillSprint server running on port ${PORT}`);
});

// Connect to MongoDB asynchronously
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("⚠️ MongoDB connection error:", error.message);
  });
