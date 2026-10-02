const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/user");
const LearningProfile = require("../models/learningProfile");
const Sprint = require("../models/sprint");

// GET /api/profile
// Get aggregated user profile (User data + Learning Profile + Stats)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await LearningProfile.findOne({ userId: req.user.userId })
      .populate("currentSprint");

    res.json({
      user,
      learningProfile: profile || null,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// PUT /api/profile
// Update user profile and learning profile
router.put("/", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      profileImage,
      education,
      about,
      learningGoal,
      learningStyle,
      dailyTime
    } = req.body;

    // Update User
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (education !== undefined) user.education = education;
    if (about !== undefined) user.about = about;
    
    await user.save();

    // Update Learning Profile
    let profile = await LearningProfile.findOne({ userId: req.user.userId });
    if (profile) {
      if (learningGoal !== undefined) profile.learningGoal = learningGoal;
      if (learningStyle !== undefined) profile.learningStyle = learningStyle;
      if (dailyTime !== undefined) profile.dailyTime = dailyTime;
      await profile.save();
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        education: user.education,
        about: user.about,
        createdAt: user.createdAt
      },
      learningProfile: profile
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

module.exports = router;
