const express = require("express");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const authMiddleware = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

// GET /api/courses - List all courses (with optional enrollment status if user logged in)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { category, level, search } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (level && level !== "All") {
      filter.level = level;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });

    // If user is authenticated, enrich courses with their enrollment status
    let enrolledMap = new Map();
    if (req.user?.userId) {
      const userEnrollments = await Enrollment.find({
        userId: req.user.userId,
      }).select("courseId progress completed lastAccessedLesson");

      userEnrollments.forEach((e) => {
        enrolledMap.set(e.courseId.toString(), {
          isEnrolled: true,
          progress: e.progress,
          completed: e.completed,
          lastAccessedLesson: e.lastAccessedLesson,
        });
      });
    }

    const coursesWithStatus = courses.map((course) => {
      const status = enrolledMap.get(course._id.toString()) || {
        isEnrolled: false,
        progress: 0,
        completed: false,
        lastAccessedLesson: 1,
      };

      return {
        ...course.toObject(),
        isEnrolled: status.isEnrolled,
        progress: status.progress,
        completed: status.completed,
        lastAccessedLesson: status.lastAccessedLesson,
      };
    });

    res.json({
      courses: coursesWithStatus,
      count: coursesWithStatus.length,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({ message: "Unable to load courses." });
  }
});

// GET /api/courses/enrolled - Get courses enrolled by the currently logged-in user
// (MUST be registered before `/:id` so Express doesn't treat 'enrolled' as an ID)
router.get("/enrolled", authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.userId })
      .populate("courseId")
      .sort({ updatedAt: -1 });

    // Filter out any enrollments whose course may have been deleted
    const validEnrollments = enrollments.filter((e) => e.courseId != null);

    const formatted = validEnrollments.map((e) => ({
      enrollmentId: e._id,
      course: e.courseId,
      enrolledAt: e.enrolledAt,
      progress: e.progress,
      completed: e.completed,
      completedLessons: e.completedLessons,
      lastAccessedLesson: e.lastAccessedLesson,
    }));

    res.json({
      enrollments: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    res.status(500).json({ message: "Unable to load enrolled courses." });
  }
});

// GET /api/courses/:id - Get a single course with its lessons and enrollment state
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    let enrollment = null;
    let isEnrolled = false;

    if (req.user?.userId) {
      enrollment = await Enrollment.findOne({
        userId: req.user.userId,
        courseId: course._id,
      });
      isEnrolled = !!enrollment;
    }

    res.json({
      course,
      isEnrolled,
      progress: enrollment ? enrollment.progress : 0,
      completed: enrollment ? enrollment.completed : false,
      enrollment: enrollment || null,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({ message: "Unable to load course." });
  }
});

// POST /api/courses/:id/enroll - Enroll currently logged-in user in a course
router.post("/:id/enroll", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    let enrollment = await Enrollment.findOne({
      userId: req.user.userId,
      courseId: course._id,
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        userId: req.user.userId,
        courseId: course._id,
        progress: 0,
        completed: false,
        lastAccessedLesson: 1,
        completedLessons: [],
      });
    }

    res.status(200).json({
      message: "Enrolled in course successfully!",
      enrollment,
      course,
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({ message: "Unable to enroll in course." });
  }
});

// GET /api/courses/:id/learn - Get course with learning data for enrolled user
router.get("/:id/learn", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const enrollment = await Enrollment.findOne({
      userId: req.user.userId,
      courseId: course._id,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You must enroll in this course first to access the learning room.",
      });
    }

    res.json({
      course,
      enrollment,
    });
  } catch (error) {
    console.error("Get learn room error:", error);
    res.status(500).json({ message: "Unable to load course learning room." });
  }
});

// POST /api/courses/:id/lessons/:lessonId/complete - Mark lesson as complete & update progress
router.post(
  "/:id/lessons/:lessonId/complete",
  authMiddleware,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }

      let enrollment = await Enrollment.findOne({
        userId: req.user.userId,
        courseId: course._id,
      });

      if (!enrollment) {
        return res.status(403).json({
          message: "You are not enrolled in this course.",
        });
      }

      // Identify lesson number by parameter (can be numeric or matched by lesson._id)
      const paramVal = req.params.lessonId;
      let lessonNumber = parseInt(paramVal, 10);

      if (isNaN(lessonNumber)) {
        const found = course.lessons.find(
          (l) => l._id.toString() === paramVal
        );
        if (found) lessonNumber = found.lessonNumber;
      }

      if (!lessonNumber) {
        return res.status(400).json({ message: "Invalid lesson identifier." });
      }

      // Add lesson to completedLessons if not already completed
      if (!enrollment.completedLessons.includes(lessonNumber)) {
        enrollment.completedLessons.push(lessonNumber);
      }

      enrollment.lastAccessedLesson = lessonNumber;

      const totalLessons = course.totalLessons || course.lessons.length || 1;
      enrollment.progress = Math.min(
        100,
        Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      );

      if (enrollment.progress >= 100) {
        enrollment.completed = true;
      }

      await enrollment.save();

      res.json({
        message: "Lesson marked as complete!",
        enrollment,
        completedLessons: enrollment.completedLessons,
        progress: enrollment.progress,
        isCompleted: enrollment.completed,
      });
    } catch (error) {
      console.error("Complete lesson error:", error);
      res.status(500).json({ message: "Unable to save lesson progress." });
    }
  }
);

// POST /api/courses - Create course (protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      instructor,
      thumbnail,
      duration,
      lessons,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description, and category are required.",
      });
    }

    const course = await Course.create({
      title: title.trim(),
      description,
      category,
      level: level || "Beginner",
      instructor: instructor || "SkillSprint Team",
      thumbnail: thumbnail || "",
      duration: duration || "30 hours",
      totalLessons: lessons?.length || 0,
      lessons: lessons || [],
    });

    res.status(201).json({
      message: "Course created successfully!",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({ message: "Failed to create course." });
  }
});

module.exports = router;
