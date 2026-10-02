const express = require("express");
const authMiddleware = require("../middleware/auth");
const LearningProfile = require("../models/learningProfile");

const router = express.Router();

// GET current user's learning profile
router.get("/", authMiddleware, async (req, res) => {
  try {
    const profile = await LearningProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      return res.status(404).json({ message: "Learning profile not found", hasProfile: false });
    }
    res.json({ profile, hasProfile: true });
  } catch (error) {
    console.error("Get learning profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST to create or update learning profile
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { currentLevel, learningGoal, targetSkill, dailyTime, learningStyle, targetDuration } = req.body;
    
    let profile = await LearningProfile.findOne({ userId: req.user.userId });
    
    if (profile) {
      // Update existing
      profile.currentLevel = currentLevel || profile.currentLevel;
      profile.learningGoal = learningGoal || profile.learningGoal;
      profile.targetSkill = targetSkill || profile.targetSkill;
      profile.dailyTime = dailyTime || profile.dailyTime;
      profile.learningStyle = learningStyle || profile.learningStyle;
      profile.targetDuration = targetDuration || profile.targetDuration;
      await profile.save();
    } else {
      // Create new
      profile = await LearningProfile.create({
        userId: req.user.userId,
        currentLevel,
        learningGoal,
        targetSkill,
        dailyTime,
        learningStyle,
        targetDuration,
      });
    }
    
    res.status(200).json({ message: "Learning profile saved successfully", profile });
  } catch (error) {
    console.error("Save learning profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
