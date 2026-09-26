import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { courseAPI } from "../services/api";

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const data = await courseAPI.getCourseById(id);
      setCourse(data.course);
      setIsEnrolled(data.isEnrolled);
      setProgress(data.progress || 0);
      setCompleted(data.completed || false);
    } catch (err) {
      console.error("Failed to load course details:", err);
      setErrorMsg(
        err.response?.status === 404
          ? "Course not found."
          : "Unable to load course. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollOrLearn = async () => {
    if (!token) {
      navigate("/login", { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    if (isEnrolled) {
      navigate(`/courses/${id}/learn`);
      return;
    }

    setIsEnrolling(true);
    try {
      await courseAPI.enrollCourse(id);
      setIsEnrolled(true);
      navigate(`/courses/${id}/learn`);
    } catch (err) {
      console.error("Enrollment failed:", err);
      alert("Unable to enroll in course. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="course-details-page">
        <div className="state-box glass-panel">
          <div className="spinner large" />
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !course) {
    return (
      <div className="course-details-page">
        <div className="state-box glass-panel error">
          <span>⚠️</span>
          <h2>{errorMsg || "Course not found"}</h2>
          <Link to="/courses" className="btn btn-primary btn-sm">
            &larr; Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="course-details-page">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav">
        <Link to="/courses" className="breadcrumb-link">
          Courses
        </Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{course.title}</span>
      </nav>

      {/* Main Course Hero Card */}
      <section className="course-hero-card glass-panel">
        <div className="hero-grid">
          <div className="hero-text-col">
            <div className="hero-tags">
              <span className="badge badge-cyan">{course.category}</span>
              <span className="badge badge-indigo">{course.level}</span>
              {isEnrolled && (
                <span className="badge badge-emerald">
                  {completed ? "🎉 Completed" : `⚡ In Progress (${progress}%)`}
                </span>
              )}
            </div>

            <h1 className="course-hero-title">{course.title}</h1>
            <p className="course-hero-desc">{course.description}</p>

            <div className="course-spec-grid">
              <div className="spec-item">
                <span className="spec-label">Instructor</span>
                <span className="spec-value">👨‍🏫 {course.instructor || "SkillSprint Team"}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Total Duration</span>
                <span className="spec-value">⏱️ {course.duration}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Lessons</span>
                <span className="spec-value">📚 {course.lessons?.length || 10} Units</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Access</span>
                <span className="spec-value">🔓 Lifetime Access</span>
              </div>
            </div>

            {/* Progress Section if Enrolled */}
            {isEnrolled && (
              <div className="enrolled-progress-box">
                <div className="progress-header">
                  <span>Your Current Progress</span>
                  <span className="progress-value">{progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="hero-cta-row">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                disabled={isEnrolling}
                onClick={handleEnrollOrLearn}
              >
                {isEnrolling ? (
                  <>
                    <span className="spinner" />
                    <span>Enrolling...</span>
                  </>
                ) : isEnrolled ? (
                  <span>Continue Learning &rarr;</span>
                ) : (
                  <span>Enroll in Course ⚡</span>
                )}
              </button>

              <Link to="/courses" className="btn btn-secondary btn-lg">
                Explore More Courses
              </Link>
            </div>
          </div>

          <div className="hero-preview-col">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="course-hero-img"
              />
            ) : (
              <div className="course-hero-fallback">
                <span>⚡</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Curriculum / Lessons Breakdown */}
      <section className="curriculum-section">
        <div className="section-header">
          <div>
            <h2>Course Syllabus & Curriculum</h2>
            <p>
              {course.lessons?.length || 0} interactive lessons designed for production-level mastery.
            </p>
          </div>
        </div>

        <div className="lessons-timeline glass-panel">
          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map((lesson, idx) => (
              <div key={lesson._id || idx} className="lesson-item-row">
                <div className="lesson-index-badge">
                  {lesson.lessonNumber || idx + 1}
                </div>
                <div className="lesson-info">
                  <div className="lesson-header-line">
                    <h3 className="lesson-title">{lesson.title}</h3>
                    <span className="lesson-duration">⏱️ {lesson.duration || "25 mins"}</span>
                  </div>
                  {lesson.description && (
                    <p className="lesson-description">{lesson.description}</p>
                  )}
                  {lesson.resources && lesson.resources.length > 0 && (
                    <div className="lesson-resources-peek">
                      <span>🔗 {lesson.resources.length} Reference Materials</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-lessons-note">No lessons added yet.</p>
          )}
        </div>
      </section>

      <style>{`
        .course-details-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 5rem;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .breadcrumb-link {
          color: var(--primary-light);
          text-decoration: none;
        }

        .breadcrumb-link:hover {
          color: var(--text-primary);
        }

        .breadcrumb-sep {
          opacity: 0.5;
        }

        .breadcrumb-current {
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 400px;
        }

        .course-hero-card {
          padding: 2.5rem 2rem;
          margin-bottom: 2.5rem;
          position: relative;
          overflow: hidden;
        }

        .course-hero-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #10b981, #14b8a6, #34d399);
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.3fr 0.9fr;
          gap: 2.5rem;
          align-items: center;
        }

        .hero-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 1rem;
        }

        .course-hero-title {
          font-size: clamp(2rem, 3.5vw, 2.75rem);
          margin-bottom: 1rem;
          line-height: 1.25;
        }

        .course-hero-desc {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.75rem;
        }

        .course-spec-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.75rem;
          padding: 1.25rem;
          background: rgba(58, 163, 20, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .spec-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .spec-value {
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .enrolled-progress-box {
          margin-bottom: 1.75rem;
          padding: 12px 16px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: var(--radius-md);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--accent-emerald);
          margin-bottom: 8px;
        }

        .progress-bar-bg {
          width: 100%;
          height: 8px;
          background: rgba(16, 147, 92, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #14b8a6);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .hero-cta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-lg {
          padding: 14px 28px;
          font-size: 1.05rem;
        }

        .hero-preview-col {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(47, 170, 139, 0.6);
          border: 1px solid var(--border-subtle);
          background: rgba(13, 157, 76, 0.8);
          aspect-ratio: 16 / 10;
        }

        .course-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .course-hero-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5rem;
          background: linear-gradient(135deg, rgba(218, 233, 228, 0.25), rgba(213, 240, 237, 0.25));
        }

        .curriculum-section {
          margin-top: 3rem;
        }

        .section-header {
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .lessons-timeline {
          padding: 1rem 1.5rem;
        }

        .lesson-item-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 1.25rem 0;
          border-bottom: 1px solid var(--border-subtle);
        }

        .lesson-item-row:last-child {
          border-bottom: none;
        }

        .lesson-index-badge {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 10px;
          background: rgba(223, 238, 233, 0.15);
          border: 1px solid rgba(227, 240, 232, 0.3);
          color: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .lesson-info {
          flex-grow: 1;
        }

        .lesson-header-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .lesson-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .lesson-duration {
          font-size: 0.8rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .lesson-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .lesson-resources-peek {
          margin-top: 6px;
          font-size: 0.78rem;
          color: var(--primary-light);
        }

        .state-box {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .state-box.error {
          border-color: rgba(9, 161, 113, 0.3);
          color: #1db14eff;
        }

        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }
          .hero-preview-col {
            order: -1;
            max-height: 260px;
          }
        }
      `}</style>
    </div>
  );
}

export default CourseDetails;
