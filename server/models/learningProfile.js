const mongoose = require("mongoose");

const learningProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentLevel: {
      type: String,
      default: "",
    },
    learningGoal: {
      type: String,
      default: "",
    },
    targetSkill: {
      type: String,
      default: "",
    },
    dailyTime: {
      type: String,
      default: "",
    },
    learningStyle: {
      type: String,
      default: "",
    },
    targetDuration: {
      type: String,
      default: "",
    },
    diagnosticCompleted: {
      type: Boolean,
      default: false,
    },
    overallSkillScore: {
      type: Number,
      default: 0,
    },
    skillMap: {
      type: Map,
      of: Number, // e.g., { "Variables": 90, "Functions": 80 }
      default: {},
    },
    currentSprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LearningProfile", learningProfileSchema);
