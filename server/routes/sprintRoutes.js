const express = require("express");
const authMiddleware = require("../middleware/auth");
const Sprint = require("../models/sprint");
const LearningProfile = require("../models/learningProfile");

const router = express.Router();

// GET current active sprint
router.get("/current", authMiddleware, async (req, res) => {
  try {
    const sprint = await Sprint.findOne({ userId: req.user.userId, status: "active" });
    if (!sprint) {
      return res.status(404).json({ message: "No active sprint found." });
    }
    res.json({ sprint });
  } catch (error) {
    console.error("Get current sprint error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST to generate a new sprint
router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const { targetSkill, duration } = req.body;
    
    // Rule: User can only have one active sprint at a time
    const existingSprint = await Sprint.findOne({ userId: req.user.userId, status: "active" });
    if (existingSprint) {
      return res.status(400).json({ 
        message: "You already have an active SkillSprint.",
        activeSprint: existingSprint
      });
    }

    // Determine how many days to generate
    const numDays = duration || 14; 
    const daysArray = [];

    // Simple mock generator logic based on the user's plan
    for (let i = 1; i <= numDays; i++) {
      daysArray.push({
        dayNumber: i,
        title: `Day ${i} of ${targetSkill || "your Sprint"}`,
        learningObjective: i === 1 ? `Fundamentals of ${targetSkill}` : `Advanced topic for ${targetSkill} Day ${i}`,
        estimatedTime: "45 minutes",
        status: i === 1 ? "active" : "locked",
        practice: "Build a small code snippet",
        challenge: "Complete the mini challenge to unlock tomorrow",
      });
    }

    const newSprint = await Sprint.create({
      userId: req.user.userId,
      targetSkill: targetSkill || "General",
      duration: numDays,
      days: daysArray,
    });

    // Update learning profile to attach current sprint
    await LearningProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { currentSprint: newSprint._id }
    );

    res.status(201).json({ message: "Sprint generated successfully", sprint: newSprint });
  } catch (error) {
    console.error("Generate sprint error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST to complete a sprint day
router.post("/:sprintId/complete-day/:dayId", authMiddleware, async (req, res) => {
  try {
    const { sprintId, dayId } = req.params;
    
    const sprint = await Sprint.findOne({ _id: sprintId, userId: req.user.userId });
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    const dayIndex = sprint.days.findIndex(d => d.dayNumber === parseInt(dayId));
    if (dayIndex === -1) {
      return res.status(404).json({ message: "Day not found in sprint" });
    }

    // Mark current day completed
    sprint.days[dayIndex].status = "completed";
    
    // Unlock next day if available
    if (dayIndex + 1 < sprint.days.length) {
      sprint.days[dayIndex + 1].status = "active";
      sprint.currentDay = sprint.days[dayIndex + 1].dayNumber;
    } else {
      sprint.status = "completed";
    }

    // Calculate overall progress
    const completedDays = sprint.days.filter(d => d.status === "completed").length;
    sprint.overallProgress = Math.round((completedDays / sprint.days.length) * 100);

    await sprint.save();

    // Update User Learning Profile Streak
    const profile = await LearningProfile.findOne({ userId: req.user.userId });
    if (profile) {
      // Simple streak logic for demo purposes
      profile.currentStreak = (profile.currentStreak || 0) + 1;
      if (profile.currentStreak > (profile.longestStreak || 0)) {
        profile.longestStreak = profile.currentStreak;
      }
      await profile.save();
    }

    res.json({ message: "Day completed successfully", sprint });
  } catch (error) {
    console.error("Complete day error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
