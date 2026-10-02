const express = require("express");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// POST /api/enrollments
// Enroll the current user in a course. Enforces the one-active-course rule.
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // 1. Check for an existing active enrollment for THIS user
    const activeEnrollment = await Enrollment.findOne({
      userId: req.user.userId,
      status: "active",
    }).populate("courseId");

    // If they already have an active course that is NOT this one, reject.
    // If they already have an active enrollment for THIS course, we just return it.
    if (activeEnrollment) {
      if (activeEnrollment.courseId._id.toString() === courseId) {
        return res.status(200).json({
          message: "You are already actively enrolled in this course.",
          enrollment: activeEnrollment,
        });
      }
      
      return res.status(400).json({
        message: "You are already enrolled in a course.",
        courseId: activeEnrollment.courseId._id,
        courseTitle: activeEnrollment.courseId.title,
      });
    }

    // Check if they previously enrolled in this course but dropped it
    let enrollment = await Enrollment.findOne({
      userId: req.user.userId,
      courseId: course._id,
    });

    if (enrollment) {
      // Re-activate a dropped or completed course?
      // The business rule says "user can enroll in another course only after completing... or dropping"
      // Let's assume if they re-enroll, they just set status back to active (if not completed).
      if (enrollment.status === "completed") {
        return res.status(400).json({ message: "You have already completed this course." });
      }
      enrollment.status = "active";
      await enrollment.save();
    } else {
      // 2. Create the enrollment
      enrollment = await Enrollment.create({
        userId: req.user.userId,
        courseId: course._id,
        status: "active",
        progress: 0,
        completed: false,
        lastAccessedLesson: 1,
        completedLessons: [],
      });
    }

    res.status(201).json({
      message: "Successfully enrolled in the course.",
      enrollment,
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "You already have an active enrollment due to a database constraint." });
    }
    res.status(500).json({ message: "Unable to enroll in course." });
  }
});

// GET /api/enrollments/current
// Get the user's currently active course
router.get("/current", authMiddleware, async (req, res) => {
  try {
    const activeEnrollment = await Enrollment.findOne({
      userId: req.user.userId,
      status: "active",
    }).populate("courseId");

    if (!activeEnrollment) {
      return res.status(404).json({ message: "No active course found." });
    }

    res.json({ enrollment: activeEnrollment });
  } catch (error) {
    console.error("Get current enrollment error:", error);
    res.status(500).json({ message: "Unable to fetch current enrollment." });
  }
});

// GET /api/enrollments/history
// Get previously completed/dropped courses
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const history = await Enrollment.find({
      userId: req.user.userId,
      status: { $in: ["completed", "dropped"] },
    }).populate("courseId").sort({ updatedAt: -1 });

    res.json({ enrollments: history, count: history.length });
  } catch (error) {
    console.error("Get enrollment history error:", error);
    res.status(500).json({ message: "Unable to fetch enrollment history." });
  }
});

// PATCH /api/enrollments/:id/complete
// Marks an enrollment as completed (usually called when quiz/all lessons done)
router.patch("/:id/complete", authMiddleware, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    enrollment.status = "completed";
    enrollment.completed = true;
    enrollment.progress = 100;
    enrollment.completedAt = new Date();
    await enrollment.save();

    res.json({ message: "Course completed successfully!", enrollment });
  } catch (error) {
    console.error("Complete enrollment error:", error);
    res.status(500).json({ message: "Unable to complete course." });
  }
});

// PATCH /api/enrollments/:id/drop
// Allow the user to leave their current course
router.patch("/:id/drop", authMiddleware, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      status: "active"
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Active enrollment not found." });
    }

    enrollment.status = "dropped";
    await enrollment.save();

    res.json({ message: "Course dropped successfully.", enrollment });
  } catch (error) {
    console.error("Drop enrollment error:", error);
    res.status(500).json({ message: "Unable to drop course." });
  }
});

module.exports = router;
