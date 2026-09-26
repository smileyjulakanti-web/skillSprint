import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { courseAPI } from "../services/api";

function LearnCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [celebrationMsg, setCelebrationMsg] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: { pathname: `/courses/${id}/learn` } } });
      return;
    }
    fetchLearnRoom();
  }, [id, token, navigate]);

  const fetchLearnRoom = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const data = await courseAPI.getCourseLearn(id);
      setCourse(data.course);
      setEnrollment(data.enrollment);

      // Determine initial lesson to display: last accessed lesson or first incomplete
      const lessons = data.course?.lessons || [];
      const completedNums = data.enrollment?.completedLessons || [];
      const lastAccessed = data.enrollment?.lastAccessedLesson || 1;

      const lastIdx = lessons.findIndex((l) => l.lessonNumber === lastAccessed);
      if (lastIdx !== -1) {
        setCurrentLessonIndex(lastIdx);
      } else {
        // Find first incomplete lesson
        const firstIncompleteIdx = lessons.findIndex(
          (l) => !completedNums.includes(l.lessonNumber)
        );
        setCurrentLessonIndex(firstIncompleteIdx !== -1 ? firstIncompleteIdx : 0);
      }
    } catch (err) {
      console.error("Failed to load learning room:", err);
      if (err.response?.status === 403) {
        setErrorMsg("You are not enrolled in this course yet.");
      } else if (err.response?.status === 401) {
        navigate("/login", { state: { from: { pathname: `/courses/${id}/learn` } } });
      } else {
        setErrorMsg("Unable to load course learning room. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollNow = async () => {
    setIsLoading(true);
    try {
      await courseAPI.enrollCourse(id);
      await fetchLearnRoom();
    } catch (err) {
      console.error("Enrollment failed:", err);
      setErrorMsg("Unable to enroll in course. Please try again.");
      setIsLoading(false);
    }
  };

  const lessons = course?.lessons || [];
  const currentLesson = lessons[currentLessonIndex] || lessons[0];
  const completedLessons = enrollment?.completedLessons || [];
  const isCurrentLessonCompleted = currentLesson
    ? completedLessons.includes(currentLesson.lessonNumber)
    : false;

  const totalLessons = course?.totalLessons || lessons.length || 1;
  const progressPercent = enrollment?.progress ?? 0;
  const isCourseFullyCompleted = enrollment?.completed || progressPercent >= 100;

  const handleMarkComplete = async () => {
    if (!currentLesson || isCompleting) return;

    setIsCompleting(true);
    try {
      const data = await courseAPI.completeLesson(
        course._id,
        currentLesson.lessonNumber
      );

      setEnrollment(data.enrollment);

      if (data.isCompleted) {
        setCelebrationMsg("🎉 Congratulations! You have completed all lessons in this course!");
      }

      // Automatically advance to the next incomplete lesson if available
      if (currentLessonIndex < lessons.length - 1) {
        setCurrentLessonIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error marking lesson complete:", err);
      alert("Unable to save lesson progress. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  // Helper to format YouTube URLs into embeddable URLs
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("/embed/")) return url;
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  if (isLoading) {
    return (
      <div className="learn-page-container">
        <div className="state-box glass-panel">
          <div className="spinner large" />
          <p>Loading course learning room...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="learn-page-container">
        <div className="state-box glass-panel error">
          <span>⚠️</span>
          <h2>{errorMsg}</h2>
          {errorMsg.includes("not enrolled") ? (
            <div style={{ display: "flex", gap: "12px", marginTop: "1rem" }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleEnrollNow}
              >
                Enroll in Course Now ⚡
              </button>
              <Link to={`/courses/${id}`} className="btn btn-secondary btn-sm">
                View Course Details
              </Link>
            </div>
          ) : (
            <Link to="/courses" className="btn btn-primary btn-sm">
              &larr; Back to Courses
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="learn-page-container">
        <div className="state-box glass-panel">
          <p>No lessons found for this course.</p>
          <Link to="/courses" className="btn btn-primary btn-sm">
            &larr; Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="learn-page-container">
      {/* Top Learning Navigation Bar */}
      <header className="learn-top-bar glass-panel">
        <div className="top-bar-left">
          <Link to={`/courses/${course._id}`} className="back-link">
            &larr; Course Overview
          </Link>
          <h1 className="course-name-heading">{course.title}</h1>
        </div>

        <div className="top-bar-right">
          <div className="progress-summary">
            <div className="progress-text-row">
              <span>Overall Progress</span>
              <span className="pct-val">{progressPercent}%</span>
            </div>
            <div className="progress-mini-bar">
              <div
                className="progress-mini-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Celebration Banner */}
      {(isCourseFullyCompleted || celebrationMsg) && (
        <div className="completion-banner glass-panel">
          <div className="banner-content">
            <span className="trophy-icon">🏆</span>
            <div>
              <h3>🎉 Course Completed!</h3>
              <p>
                Awesome job! You have completed all {totalLessons} lessons in{" "}
                <strong>{course.title}</strong>.
              </p>
            </div>
          </div>
          <Link to="/dashboard" className="btn btn-primary btn-sm">
            View in Dashboard &rarr;
          </Link>
        </div>
      )}

      {/* Dual Pane Layout */}
      <div className="learn-workspace">
        {/* LEFT SIDE: Course Lessons Sidebar */}
        <aside className="lessons-sidebar glass-panel">
          <div className="sidebar-header">
            <h3>Course Lessons</h3>
            <span className="lessons-count-badge">
              {completedLessons.length} / {totalLessons} Done
            </span>
          </div>

          <div className="lessons-list-scroll">
            {lessons.map((lesson, idx) => {
              const isCompleted = completedLessons.includes(lesson.lessonNumber);
              const isActive = idx === currentLessonIndex;

              return (
                <button
                  key={lesson._id || idx}
                  type="button"
                  className={`lesson-nav-btn ${isActive ? "active" : ""} ${
                    isCompleted ? "completed" : ""
                  }`}
                  onClick={() => setCurrentLessonIndex(idx)}
                >
                  <div className="lesson-nav-status">
                    {isCompleted ? (
                      <span className="status-icon completed">✓</span>
                    ) : isActive ? (
                      <span className="status-icon active">▶</span>
                    ) : (
                      <span className="status-icon pending">○</span>
                    )}
                  </div>

                  <div className="lesson-nav-info">
                    <span className="lesson-nav-title">
                      {lesson.lessonNumber}. {lesson.title}
                    </span>
                    <span className="lesson-nav-duration">
                      ⏱️ {lesson.duration || "20 mins"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT SIDE: Current Lesson Content */}
        <main className="lesson-main-content glass-panel">
          {currentLesson ? (
            <>
              <div className="lesson-content-header">
                <div className="lesson-meta-line">
                  <span className="badge badge-cyan">
                    Unit {currentLesson.lessonNumber} of {totalLessons}
                  </span>
                  <span className="lesson-duration-badge">
                    ⏱️ {currentLesson.duration || "25 mins"}
                  </span>
                  {isCurrentLessonCompleted && (
                    <span className="badge badge-emerald">✓ Completed</span>
                  )}
                </div>

                <h2 className="current-lesson-title">{currentLesson.title}</h2>

                {currentLesson.description && (
                  <p className="current-lesson-desc">
                    {currentLesson.description}
                  </p>
                )}
              </div>

              {/* Video Player */}
              {currentLesson.videoUrl && (
                <div className="video-player-wrapper">
                  <iframe
                    src={getEmbedUrl(currentLesson.videoUrl)}
                    title={currentLesson.title}
                    className="video-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Learning Content Body */}
              <div className="lesson-body-section">
                <h3>📖 Lesson Guide & Code</h3>
                <div className="lesson-formatted-content">
                  {currentLesson.content ? (
                    <div className="content-text-block">
                      {currentLesson.content.split("\n\n").map((para, i) => {
                        if (para.startsWith("```")) {
                          const cleanCode = para.replace(/```[a-z]*\n?/g, "");
                          return (
                            <pre key={i} className="code-block">
                              <code>{cleanCode}</code>
                            </pre>
                          );
                        }
                        if (para.startsWith("### ")) {
                          return (
                            <h4 key={i} className="content-subhead">
                              {para.replace("### ", "")}
                            </h4>
                          );
                        }
                        return <p key={i}>{para}</p>;
                      })}
                    </div>
                  ) : (
                    <p className="placeholder-text">
                      Follow along with the video instruction and code examples above.
                    </p>
                  )}
                </div>
              </div>

              {/* Resources Section */}
              {currentLesson.resources && currentLesson.resources.length > 0 && (
                <div className="lesson-resources-section">
                  <h3>🔗 Reference Materials & Resources</h3>
                  <div className="resources-grid">
                    {currentLesson.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-card"
                      >
                        <span className="resource-icon">🌐</span>
                        <div className="resource-text">
                          <span className="resource-title">{res.title}</span>
                          <span className="resource-url">{res.url}</span>
                        </div>
                        <span className="resource-arrow">&nearr;</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Footer Bar */}
              <div className="lesson-action-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentLessonIndex === 0}
                  onClick={() => setCurrentLessonIndex((prev) => prev - 1)}
                >
                  &larr; Previous Lesson
                </button>

                <button
                  type="button"
                  className={`btn ${
                    isCurrentLessonCompleted ? "btn-secondary" : "btn-primary"
                  }`}
                  disabled={isCompleting}
                  onClick={handleMarkComplete}
                >
                  {isCompleting ? (
                    <>
                      <span className="spinner" />
                      <span>Saving progress...</span>
                    </>
                  ) : isCurrentLessonCompleted ? (
                    <span>✓ Completed (Mark Again)</span>
                  ) : (
                    <span>Mark as Complete & Next &rarr;</span>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentLessonIndex === lessons.length - 1}
                  onClick={() => setCurrentLessonIndex((prev) => prev + 1)}
                >
                  Next Lesson &rarr;
                </button>
              </div>
            </>
          ) : (
            <p>No lesson selected.</p>
          )}
        </main>
      </div>

      <style>{`
        .learn-page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 5rem;
        }

        .learn-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
          border-radius: var(--radius-md);
          gap: 1rem;
          flex-wrap: wrap;
        }

        .top-bar-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .back-link {
          font-size: 0.82rem;
          color: var(--primary-light);
          text-decoration: none;
        }

        .back-link:hover {
          color: var(--primary);
        }

        .course-name-heading {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .top-bar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .progress-summary {
          min-width: 180px;
        }

        .progress-text-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .pct-val {
          font-weight: 700;
          color: var(--accent-emerald);
        }

        .progress-mini-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-mini-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #14b8a6);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .completion-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.35);
          gap: 1rem;
          flex-wrap: wrap;
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .trophy-icon {
          font-size: 2.2rem;
        }

        .banner-content h3 {
          font-size: 1.15rem;
          color: #10b981;
          margin-bottom: 2px;
        }

        .banner-content p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .learn-workspace {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        /* Sidebar Styles */
        .lessons-sidebar {
          padding: 1.25rem 1rem;
          border-radius: var(--radius-lg);
          max-height: calc(100vh - 160px);
          position: sticky;
          top: 85px;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 0.5rem 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 0.75rem;
        }

        .sidebar-header h3 {
          font-size: 1rem;
          font-weight: 700;
        }

        .lessons-count-badge {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.06);
          padding: 3px 8px;
          border-radius: 12px;
          color: var(--text-secondary);
        }

        .lessons-list-scroll {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-right: 4px;
        }

        .lesson-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: all 0.15s ease;
          color: var(--text-secondary);
        }

        .lesson-nav-btn:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
        }

        .lesson-nav-btn.active {
          background: rgba(99, 102, 241, 0.12);
          border-color: rgba(99, 102, 241, 0.35);
          color: var(--text-primary);
        }

        .lesson-nav-btn.completed .lesson-nav-title {
          color: var(--text-muted);
        }

        .lesson-nav-btn.active .lesson-nav-title {
          color: var(--primary-light);
          font-weight: 600;
        }

        .lesson-nav-status {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
        }

        .status-icon.completed {
          color: var(--accent-emerald);
          font-weight: 700;
        }

        .status-icon.active {
          color: var(--primary-light);
          font-size: 0.75rem;
        }

        .status-icon.pending {
          color: var(--text-muted);
          font-size: 0.7rem;
        }

        .lesson-nav-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .lesson-nav-title {
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lesson-nav-duration {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        /* Right Main Content */
        .lesson-main-content {
          padding: 2rem;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .lesson-content-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .lesson-meta-line {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .lesson-duration-badge {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .current-lesson-title {
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          line-height: 1.3;
        }

        .current-lesson-desc {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .video-player-wrapper {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 Aspect Ratio */
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #000;
          border: 1px solid var(--border-subtle);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .video-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .lesson-body-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .lesson-body-section h3,
        .lesson-resources-section h3 {
          font-size: 1.15rem;
          color: var(--text-primary);
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .content-text-block {
          display: flex;
          flex-direction: column;
          gap: 14px;
          line-height: 1.7;
          color: var(--text-secondary);
        }

        .content-subhead {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-top: 6px;
        }

        .code-block {
          background: rgba(10, 15, 25, 0.95);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
          overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 0.88rem;
          color: #a5b4fc;
          line-height: 1.5;
        }

        .lesson-resources-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .resource-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .resource-card:hover {
          border-color: var(--primary-light);
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-2px);
        }

        .resource-icon {
          font-size: 1.2rem;
        }

        .resource-text {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .resource-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .resource-url {
          font-size: 0.72rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .resource-arrow {
          font-size: 1rem;
          color: var(--primary-light);
        }

        .lesson-action-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
          gap: 12px;
          flex-wrap: wrap;
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
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        @media (max-width: 960px) {
          .learn-workspace {
            grid-template-columns: 1fr;
          }
          .lessons-sidebar {
            position: static;
            max-height: 300px;
          }
        }
      `}</style>
    </div>
  );
}

export default LearnCourse;
