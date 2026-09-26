import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { courseAPI } from "../services/api";

const CATEGORIES = [
  "All",
  "Web Development",
  "Programming",
  "DSA",
  "Cloud & DevOps",
  "Frontend",
];

function CourseList() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const data = await courseAPI.getCourses();
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Failed to load courses:", err);
      setErrorMsg("Unable to load courses. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLearning = async (course) => {
    if (!token) {
      navigate("/login", { state: { from: { pathname: `/courses/${course._id}` } } });
      return;
    }

    if (course.isEnrolled) {
      navigate(`/courses/${course._id}/learn`);
      return;
    }

    // If logged in but not enrolled: Enroll first, then open learning room
    try {
      setActionLoadingId(course._id);
      await courseAPI.enrollCourse(course._id);
      navigate(`/courses/${course._id}/learn`);
    } catch (err) {
      console.error("Enrollment failed:", err);
      alert("Unable to enroll in course. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.instructor &&
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="courses-page-container">
      {/* Header Banner */}
      <section className="courses-hero glass-panel">
        <div className="hero-content">
          <div className="hero-badge badge badge-cyan">
            <span>🚀</span>
            <span>SkillSprint Curriculum</span>
          </div>
          <h1>Explore Production Courses</h1>
          <p>
            Master full-stack engineering, algorithms, Python, and cloud infrastructure through practical, lesson-by-lesson sprints.
          </p>
        </div>

        <div className="search-filter-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search courses, skills, technologies..."
              className="input-field search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="state-box glass-panel">
          <div className="spinner large" />
          <p>Loading courses...</p>
        </div>
      )}

      {errorMsg && !isLoading && (
        <div className="state-box glass-panel error">
          <span>⚠️</span>
          <p>{errorMsg}</p>
          <button className="btn btn-secondary btn-sm" onClick={fetchCourses}>
            Retry Loading
          </button>
        </div>
      )}

      {/* Course Grid */}
      {!isLoading && !errorMsg && (
        <>
          {filteredCourses.length === 0 ? (
            <div className="state-box glass-panel">
              <span style={{ fontSize: "2rem" }}>🔍</span>
              <h3>No courses found</h3>
              <p>Try adjusting your search criteria or selecting another category.</p>
              <button
                className="btn btn-subtle btn-sm"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course) => (
                <div key={course._id} className="course-card glass-panel">
                  {/* Thumbnail / Visual Header */}
                  <div className="course-thumb-wrap">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="course-thumb-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="course-thumb-fallback">
                        <span>⚡</span>
                      </div>
                    )}
                    <span className="course-category-tag badge badge-cyan">
                      {course.category}
                    </span>
                    {course.isEnrolled && (
                      <span className="course-enrolled-tag badge badge-emerald">
                        ✓ Enrolled
                      </span>
                    )}
                  </div>

                  <div className="course-card-body">
                    <div className="course-meta-row">
                      <span className="course-level badge badge-indigo">
                        {course.level}
                      </span>
                      <span className="course-duration">
                        ⏱️ {course.duration}
                      </span>
                      <span className="course-lessons-count">
                        📚 {course.totalLessons || course.lessons?.length || 10} Lessons
                      </span>
                    </div>

                    <h2 className="course-title">
                      <Link to={`/courses/${course._id}`}>
                        {course.title}
                      </Link>
                    </h2>

                    <p className="course-desc">
                      {course.description}
                    </p>

                    <div className="course-instructor">
                      <span className="instructor-icon">👨‍🏫</span>
                      <span>{course.instructor || "SkillSprint Team"}</span>
                    </div>

                    {/* Progress Bar if enrolled */}
                    {course.isEnrolled && (
                      <div className="course-progress-wrap">
                        <div className="progress-info-row">
                          <span>Sprint Progress</span>
                          <span className="progress-pct">
                            {course.completed ? "🎉 100% (Completed)" : `${course.progress || 0}%`}
                          </span>
                        </div>
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="course-card-actions">
                      <button
                        type="button"
                        className={`btn ${course.isEnrolled ? "btn-secondary" : "btn-primary"
                          } btn-full`}
                        disabled={actionLoadingId === course._id}
                        onClick={() => handleStartLearning(course)}
                      >
                        {actionLoadingId === course._id ? (
                          <>
                            <span className="spinner" />
                            <span>Enrolling...</span>
                          </>
                        ) : course.isEnrolled ? (
                          <span>Continue Learning &rarr;</span>
                        ) : (
                          <span>Start Learning ⚡</span>
                        )}
                      </button>

                      <Link
                        to={`/courses/${course._id}`}
                        className="btn btn-subtle btn-sm view-details-link"
                      >
                        View Syllabus
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <style>{`
        .courses-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        .courses-hero {
          padding: 2.5rem 2rem;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }

        .courses-hero::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #10b981, #14b8a6, #34d399);
        }

        .hero-badge {
          margin-bottom: 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .courses-hero h1 {
          font-size: clamp(1.8rem, 3.5vw, 2.5rem);
          margin-bottom: 0.5rem;
        }

        .courses-hero p {
          max-width: 720px;
          font-size: 1rem;
          margin-bottom: 1.5rem;
          color: var(--text-secondary);
        }

        .search-filter-bar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-wrap {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.9rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          padding-left: 40px;
          padding-right: 36px;
          width: 100%;
        }

        .clear-search-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.85rem;
        }

        .clear-search-btn:hover {
          color: var(--text-primary);
        }

        .category-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .category-pill {
          padding: 6px 14px;
          border-radius: 20px;
          background: rgba(218, 238, 216, 0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .category-pill:hover {
          border-color: rgba(186, 210, 180, 0.2);
          color: var(--text-primary);
          background: rgba(157, 200, 151, 0.08);
        }

        .category-pill.active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary-light);
          box-shadow: 0 0 12px rgba(198, 198, 211, 0.4);
        }

        .state-box {
          padding: 3rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: var(--text-secondary);
        }

        .state-box.error {
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .course-card {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .course-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.15);
        }

        .course-thumb-wrap {
          position: relative;
          height: 180px;
          width: 100%;
          background: rgba(15, 23, 42, 0.8);
          overflow: hidden;
        }

        .course-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .course-card:hover .course-thumb-img {
          transform: scale(1.04);
        }

        .course-thumb-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(20, 184, 166, 0.2));
        }

        .course-category-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          backdrop-filter: blur(8px);
        }

        .course-enrolled-tag {
          position: absolute;
          top: 12px;
          right: 12px;
          backdrop-filter: blur(8px);
        }

        .course-card-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .course-meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .course-title {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.35;
        }

        .course-title a {
          color: var(--text-primary);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .course-title a:hover {
          color: var(--primary-light);
        }

        .course-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .course-instructor {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
        }

        .course-progress-wrap {
          margin-bottom: 1.25rem;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .progress-info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .progress-pct {
          font-weight: 600;
          color: var(--accent-emerald);
        }

        .progress-bar-bg {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #14b8a6);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .course-card-actions {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .view-details-link {
          text-align: center;
          text-decoration: none;
          padding: 6px;
        }

        @media (max-width: 768px) {
          .courses-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default CourseList;
