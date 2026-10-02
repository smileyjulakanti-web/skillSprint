const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  title: { type: String, required: true },
  learningObjective: { type: String, required: true },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  practice: { type: String }, // Details about the practice task
  challenge: { type: String }, // Details about the mini challenge
  estimatedTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["locked", "active", "completed"], 
    default: "locked" 
  },
  score: { type: Number, default: 0 }
});

const sprintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetSkill: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // e.g. 7, 14, 30 days
      required: true,
    },
    currentDay: {
      type: Number,
      default: 1,
    },
    days: [daySchema],
    overallProgress: {
      type: Number,
      default: 0, // 0 to 100
    },
    status: {
      type: String,
      enum: ["active", "completed", "dropped"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sprint", sprintSchema);
