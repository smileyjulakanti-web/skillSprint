const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  lessonNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  videoUrl: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    default: "",
  },
  duration: {
    type: String,
    default: "20 mins",
  },
  resources: [
    {
      title: { type: String, default: "" },
      url: { type: String, default: "" },
    },
  ],
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    instructor: {
      type: String,
      default: "SkillSprint Team",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "30 hours",
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    lessons: [lessonSchema],
  },
  {
    timestamps: true,
  }
);

// Auto-calculate totalLessons before saving if not explicitly provided
courseSchema.pre("save", function () {
  if (this.lessons && Array.isArray(this.lessons)) {
    this.totalLessons = this.lessons.length;
  }
});

module.exports = mongoose.model("Course", courseSchema);
