const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
require("dotenv").config();

// Ensure SRV records for cloud MongoDB (Atlas) resolve reliably on Windows
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Ignore in environments where setting DNS servers is restricted
}

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillsprint";

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
app.use("/api/courses", courseRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "SkillSprint Server is Running ⚡",
    healthCheck: "/api/health",
    authEndpoints: {
      login: "POST /api/auth/login",
      register: "POST /api/auth/register",
      me: "GET /api/auth/me",
    },
    courseEndpoints: {
      list: "GET /api/courses",
      enrolled: "GET /api/courses/enrolled",
      details: "GET /api/courses/:id",
      enroll: "POST /api/courses/:id/enroll",
      learn: "GET /api/courses/:id/learn",
      complete: "POST /api/courses/:id/lessons/:lessonId/complete",
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
    console.log(
      "✅ MongoDB connected successfully to",
      MONGO_URI.includes("@") ? "MongoDB Atlas" : "local MongoDB"
    );
  })
  .catch((error) => {
    console.error("⚠️ MongoDB connection error:", error.message);
  });
