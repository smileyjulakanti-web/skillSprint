import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiBaseUrl, authAPI, courseAPI } from "../services/api";

const INITIAL_SPRINTS = [
  {
    id: "fs-auth",
    title: "Full-Stack Auth & Production Security",
    category: "Full-Stack",
    difficulty: "Intermediate",
    timeEstimate: "3.5 hrs",
    xp: 350,
    progress: 75,
    description: "Build robust JWT authentication with encrypted passwords, refresh tokens, and protected routes in React and Express.",
    milestones: [
      { id: "m1", text: "Create Express API & MongoDB User Schema", done: true },
      { id: "m2", text: "Hash passwords with bcrypt & issue JWTs", done: true },
      { id: "m3", text: "Build React Login & Register pages with state", done: true },
      { id: "m4", text: "Deploy client to Vercel & backend to Render", done: false },
    ],
  },
  {
    id: "fe-vite",
    title: "Vite + React 19 Modern UI Architecture",
    category: "Frontend",
    difficulty: "Beginner",
    timeEstimate: "2.0 hrs",
    xp: 200,
    progress: 100,
    description: "Master lightning-fast bundling, React 19 hooks, client-side routing, and responsive glassmorphic design systems.",
    milestones: [
      { id: "m5", text: "Initialize Vite project with fast HMR", done: true },
      { id: "m6", text: "Implement React Router 7 single-page routing", done: true },
      { id: "m7", text: "Build accessible dark mode & animations", done: true },
    ],
  },
  {
    id: "be-express-mongo",
    title: "Scalable REST APIs with Express & Mongoose",
    category: "Backend",
    difficulty: "Intermediate",
    timeEstimate: "4.0 hrs",
    xp: 400,
    progress: 40,
    description: "Architect clean controllers, middleware validation, connection pooling, and health check endpoints.",
    milestones: [
      { id: "m8", text: "Configure Express app & CORS middleware", done: true },
      { id: "m9", text: "Design MongoDB schemas with indexes", done: true },
      { id: "m10", text: "Implement rate limiting and error handling", done: false },
      { id: "m11", text: "Add automated health-check endpoints", done: false },
    ],
  },
  {
    id: "devops-cicd",
    title: "Zero-Downtime CI/CD on Vercel & Render",
    category: "Cloud & DevOps",
    difficulty: "Advanced",
    timeEstimate: "2.5 hrs",
    xp: 300,
    progress: 20,
    description: "Setup continuous deployment from GitHub to Vercel for frontend and Render for Node.js microservices.",
    milestones: [
      { id: "m12", text: "Configure root vercel.json SPA rewrites", done: true },
      { id: "m13", text: "Setup Render web service environment variables", done: false },
      { id: "m14", text: "Verify automated GitHub push webhooks", done: false },
    ],
  },
  {
    id: "ai-copilot",
    title: "AI-Powered Code Analysis & Synthesis",
    category: "AI & Agents",
    difficulty: "Advanced",
    timeEstimate: "3.0 hrs",
    xp: 450,
    progress: 0,
    description: "Integrate LLM API endpoints to provide real-time code explanations, lint fixes, and smart suggestions.",
    milestones: [
      { id: "m15", text: "Connect Gemini / OpenAI streaming API", done: false },
      { id: "m16", text: "Build syntax-highlighted code viewer", done: false },
      { id: "m17", text: "Implement smart refactoring prompts", done: false },
    ],
  },
];

const CATEGORIES = ["All", "Full-Stack", "Frontend", "Backend", "Cloud & DevOps", "AI & Agents"];

function Dashboard({ onOpenBackendModal }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : { name: "Sprint Learner", email: "" };
    } catch {
      return { name: "Sprint Learner", email: "" };
    }
  });

  const [sprints, setSprints] = useState(() => {
    try {
      const saved = localStorage.getItem("skillsprint_items");
      return saved ? JSON.parse(saved) : INITIAL_SPRINTS;
    } catch {
      return INITIAL_SPRINTS;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSprintId, setActiveSprintId] = useState("fs-auth");

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const vantaRef = useRef(null);

  useEffect(() => {
    let vantaEffect = null;
    if (window.VANTA && vantaRef.current) {
      vantaEffect = window.VANTA.CELLS({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        color1: 0x10b981,
        color2: 0x14b8a6,
      });
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token && !storedUser) {
      navigate("/login");
      return;
    }

    // Attempt to verify with /api/auth/me
    authAPI
      .getMe()
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Silently continue if backend is sleeping or offline
      });

    // Fetch user enrollments and recommended courses
    const loadCoursesData = async () => {
      try {
        setLoadingCourses(true);
        const [enrolledRes, allCoursesRes] = await Promise.all([
          courseAPI.getEnrolledCourses().catch(() => ({ enrollments: [] })),
          courseAPI.getCourses().catch(() => ({ courses: [] })),
        ]);

        const enrollments = enrolledRes.enrollments || [];
        setEnrolledCourses(enrollments);

        const enrolledIds = new Set(
          enrollments.map((e) =>
            e.course?._id ? e.course._id.toString() : e.course?.toString()
          )
        );

        const all = allCoursesRes.courses || [];
        const recommended = all.filter(
          (c) => !enrolledIds.has(c._id.toString()) && !c.isEnrolled
        );
        setRecommendedCourses(recommended);
      } catch (err) {
        console.error("Failed to load dashboard courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCoursesData();
  }, [navigate]);

  // Persist sprints updates
  const updateMilestone = (sprintId, milestoneId) => {
    setSprints((prev) => {
      const updated = prev.map((sprint) => {
        if (sprint.id !== sprintId) return sprint;
        const newMilestones = sprint.milestones.map((m) =>
          m.id === milestoneId ? { ...m, done: !m.done } : m
        );
        const completedCount = newMilestones.filter((m) => m.done).length;
        const newProgress = Math.round((completedCount / newMilestones.length) * 100);
        return {
          ...sprint,
          milestones: newMilestones,
          progress: newProgress,
        };
      });
      try {
        localStorage.setItem("skillsprint_items", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const filteredSprints = sprints.filter((sprint) => {
    const matchesCategory =
      selectedCategory === "All" || sprint.category === selectedCategory;
    const matchesSearch =
      sprint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sprint.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeSprint = sprints.find((s) => s.id === activeSprintId) || sprints[0];

  // Calculated Stats
  const totalCompleted = sprints.filter((s) => s.progress === 100).length;
  const totalXP = sprints.reduce(
    (sum, s) => sum + Math.round((s.progress / 100) * s.xp),
    450
  );

  return (
    <div className="dashboard-container">
      {/* Hero Welcome Banner */}
      <section className="dashboard-hero glass-panel" ref={vantaRef}>
        <div className="hero-content">
          <div className="hero-badge badge badge-emerald">
            <span>🔥</span>
            <span>5-Day Streak Active</span>
          </div>
          <h1>
            Welcome back, <span className="highlight-text">{user.name}</span> 🚀
          </h1>
          <p>
            Your production learning track is ready. Keep sprinting to level up your engineering skills.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                const el = document.getElementById("active-tracker");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Continue Active Sprint &darr;
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenBackendModal}
            >
              ⚙️ Server Settings ({getApiBaseUrl()})
            </button>
          </div>
        </div>

        <div className="hero-stats-grid">
          <div className="stat-card">
            <span className="stat-icon">⚡</span>
            <div className="stat-val">{totalXP} XP</div>
            <div className="stat-lbl">Sprint Score</div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🎯</span>
            <div className="stat-val">{totalCompleted} / {sprints.length}</div>
            <div className="stat-lbl">Completed Sprints</div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏱️</span>
            <div className="stat-val">15.2 hrs</div>
            <div className="stat-lbl">Code Time</div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏆</span>
            <div className="stat-val">Top 5%</div>
            <div className="stat-lbl">Sprint Rank</div>
          </div>
        </div>
      </section>

      {/* MY LEARNING SECTION */}
      <section className="dashboard-section my-learning-section">
        <div className="section-title-row">
          <div>
            <h2>📚 My Learning</h2>
            <p>Courses you are currently enrolled in and mastering.</p>
          </div>
          <Link to="/courses" className="btn btn-subtle btn-sm">
            Explore All Courses &rarr;
          </Link>
        </div>

        {loadingCourses ? (
          <div className="loading-card glass-panel">
            <span className="spinner" />
            <span>Loading your courses...</span>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="empty-learning-card glass-panel">
            <div className="empty-learning-left">
              <span className="empty-icon">🎓</span>
              <div>
                <h3>No enrolled courses yet</h3>
                <p>
                  Choose a full curriculum course to start tracking your lesson progress and earning certificates.
                </p>
              </div>
            </div>
            <Link to="/courses" className="btn btn-primary btn-sm">
              Explore Courses ⚡
            </Link>
          </div>
        ) : (
          <div className="learning-cards-grid">
            {enrolledCourses.map((item) => {
              const c = item.course;
              if (!c) return null;
              return (
                <div
                  key={item.enrollmentId || c._id}
                  className="learning-card glass-panel"
                >
                  <div className="learning-card-top">
                    <span className="badge badge-cyan">
                      {c.category || "Course"}
                    </span>
                    <span className="badge badge-indigo">
                      {c.level || "Beginner"}
                    </span>
                    {item.completed && (
                      <span className="badge badge-emerald">🎉 Completed</span>
                    )}
                  </div>

                  <h3>{c.title}</h3>
                  <p className="learning-desc">{c.description}</p>

                  <div className="learning-progress-wrap">
                    <div className="progress-info-row">
                      <span>Progress</span>
                      <span className="pct-val">{item.progress || 0}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${item.progress || 0}%` }}
                      />
                    </div>
                    <span className="completed-lessons-lbl">
                      {item.completedLessons?.length || 0} of{" "}
                      {c.totalLessons || c.lessons?.length || 10} lessons completed
                    </span>
                  </div>

                  <Link
                    to={`/courses/${c._id}/learn`}
                    className="btn btn-primary btn-sm btn-full"
                  >
                    Continue Learning &rarr;
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Active Sprint Milestone Checklist */}
      {activeSprint && (
        <section id="active-tracker" className="active-sprint-section glass-panel">
          <div className="active-sprint-header">
            <div>
              <div className="active-sprint-meta">

                <span className="active-category">{activeSprint.category}</span>
                <span className="active-diff">Level: {activeSprint.difficulty}</span>
              </div>
              <h2>{activeSprint.title}</h2>
              <p>{activeSprint.description}</p>
            </div>
            <div className="active-sprint-progress-circle">
              <div className="progress-number">{activeSprint.progress}%</div>
              <div className="progress-label">Finished</div>
            </div>
          </div>

          <div className="milestones-list">
            <div className="milestone-title">Interactive Sprint Milestones (Click to complete):</div>
            <div className="milestone-grid">
              {activeSprint.milestones.map((m) => (
                <div
                  key={m.id}
                  className={`milestone-item ${m.done ? "done" : ""}`}
                  onClick={() => {
                    updateMilestone(activeSprint.id, m.id);
                    // Navigate to the active sprint's associated course
                    navigate(`/courses/${activeSprint.id}/learn`);
                  }}
                >
                  <div className="milestone-checkbox">
                    {m.done ? "✓" : ""}
                  </div>
                  <span className="milestone-text">{m.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RECOMMENDED COURSES SECTION */}
      {recommendedCourses.length > 0 && (
        <section className="dashboard-section recommended-section">
          <div className="section-title-row">
            <div>
              <h2>✨ Recommended Courses</h2>
              <p>Top tracks recommended for your engineering journey.</p>
            </div>
            <Link to="/courses" className="btn btn-subtle btn-sm">
              Explore Courses &rarr;
            </Link>
          </div>

          <div className="recommended-grid">
            {recommendedCourses.slice(0, 3).map((course) => (
              <div key={course._id} className="recommended-card glass-panel">
                <div className="rec-card-top">
                  <span className="badge badge-cyan">{course.category}</span>
                  <span className="badge badge-indigo">{course.level}</span>
                </div>
                <h3>{course.title}</h3>
                <p className="rec-desc">{course.description}</p>
                <div className="rec-meta">
                  <span>⏱️ {course.duration}</span>
                  <span>
                    📚 {course.totalLessons || course.lessons?.length || 10} Lessons
                  </span>
                </div>
                <div className="rec-actions">
                  <Link
                    to={`/courses/${course._id}`}
                    className="btn btn-primary btn-sm btn-full"
                  >
                    Start Learning ⚡
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sprint Catalog Section */}
      <section className="catalog-section">
        <div className="catalog-header">
          <div>
            <h2>Explore Skill Sprints</h2>
            <p>Accelerate your growth across the modern technology stack.</p>
          </div>

          <div className="search-wrap">
            <input
              type="text"
              placeholder="Search sprints..."
              className="input-field no-icon search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sprints Grid */}
        <div className="sprints-grid">
          {filteredSprints.map((sprint) => (
            <div
              key={sprint.id}
              className={`sprint-card glass-panel ${activeSprintId === sprint.id ? "is-active-sprint" : ""
                }`}
            >
              <div className="sprint-card-top">
                <span className="badge badge-cyan">{sprint.category}</span>
                <span className="sprint-xp">+{sprint.xp} XP</span>
              </div>

              <h3>{sprint.title}</h3>
              <p className="sprint-desc">{sprint.description}</p>

              <div className="sprint-info-row">
                <span>⏱️ {sprint.timeEstimate}</span>
                <span>📊 {sprint.difficulty}</span>
              </div>

              <div className="sprint-progress-wrap">
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${sprint.progress}%` }}
                  />
                </div>
                <div className="progress-labels">
                  <span>Progress</span>
                  <span>{sprint.progress}%</span>
                </div>
              </div>

              <div className="sprint-actions">
                <button
                  className={`btn btn-sm ${activeSprintId === sprint.id ? "btn-primary" : "btn-secondary"
                    } btn-full`}
                  onClick={() => {
                    setActiveSprintId(sprint.id);
                    const el = document.getElementById("active-tracker");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {activeSprintId === sprint.id ? "Current Focus ⚡" : "Select Sprint"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          width: 100%;
        }

        .dashboard-hero {
          padding: 2.5rem;
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 2rem;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .dashboard-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #3fa583ff, #358463ff, #59b269ff);
        }

        .hero-content {
          text-align: left;
        }

        .hero-badge {
          margin-bottom: 0.75rem;
        }

        .highlight-text {
          background: linear-gradient(135deg, #05130fff 0%, #0e251cff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .hero-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .stat-card {
          background: rgba(41, 176, 91, 0.65);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 16px;
          text-align: center;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(70, 156, 113, 0.4);
        }

        .stat-icon {
          font-size: 1.4rem;
          display: block;
          margin-bottom: 4px;
        }

        .stat-val {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Active Sprint Tracker */
        .active-sprint-section {
          padding: 2rem 2.5rem;
          text-align: left;
          border-left: 4px solid var(--primary);
        }

        .active-sprint-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 1.5rem;
        }

        .active-sprint-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .active-sprint-progress-circle {
          min-width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 3px solid var(--primary);
          background: rgba(244, 244, 250, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(237, 237, 246, 0.2);
        }

        .progress-number {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .progress-label {
          font-size: 0.7rem;
          color: var(--primary-light);
          text-transform: uppercase;
        }

        .milestone-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .milestone-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 10px;
        }

        .milestone-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .milestone-item:hover {
          background: rgba(226, 230, 239, 0.75);
          border-color: rgba(235, 235, 243, 0.3);
        }

        .milestone-item.done {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(232, 241, 238, 0.3);
        }

        .milestone-checkbox {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 1.5px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 800;
          color: #10b981;
          flex-shrink: 0;
          background: rgba(235, 246, 236, 1);
        }

        .milestone-item.done .milestone-checkbox {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.2);
        }

        .milestone-text {
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .milestone-item.done .milestone-text {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        /* Catalog Section */
        .catalog-section {
          text-align: left;
        }

        .catalog-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .search-input {
          min-width: 260px;
          padding: 8px 14px;
        }

        .category-pills {
          display: flex;
          gap: 8px;
          margin-bottom: 1.5rem;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .category-pill {
          padding: 6px 14px;
          border-radius: 20px;
          background: rgba(230, 239, 232, 0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .category-pill:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.1);
        }

        .category-pill.active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary-light);
          box-shadow: 0 0 12px rgba(10, 98, 29, 0.4);
        }

        /* Sprints Grid */
        .sprints-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .sprint-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
          position: relative;
        }

        .sprint-card.is-active-sprint {
          border-color: var(--primary);
          box-shadow: 0 0 25px rgba(139, 213, 69, 0.25);
        }

        .sprint-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sprint-xp {
          font-size: 0.8rem;
          font-weight: 700;
          color: #fcd34d;
        }

        .sprint-card h3 {
          font-size: 1.15rem;
          margin-top: 2px;
        }

        .sprint-desc {
          font-size: 0.85rem;
          line-height: 1.5;
          flex-grow: 1;
        }

        .sprint-info-row {
          display: flex;
          gap: 16px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .sprint-progress-wrap {
          margin-top: 4px;
        }

        .progress-bar-bg {
          width: 100%;
          height: 6px;
          background: rgba(21, 93, 18, 0.08);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .sprint-actions {
          margin-top: 8px;
        }

        /* My Learning & Recommended Courses Styles */
        .dashboard-section {
          margin-bottom: 2.5rem;
        }

        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1.25rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .section-title-row h2 {
          font-size: 1.5rem;
          margin-bottom: 4px;
        }

        .section-title-row p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .loading-card {
          padding: 2rem;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-secondary);
        }

        .empty-learning-card {
          padding: 1.75rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .empty-learning-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .empty-icon {
          font-size: 2.2rem;
        }

        .empty-learning-left h3 {
          font-size: 1.1rem;
          margin-bottom: 2px;
        }

        .empty-learning-left p {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .learning-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .learning-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .learning-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(221, 227, 222, 0.4);
        }

        .learning-card-top {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .learning-card h3 {
          font-size: 1.15rem;
          line-height: 1.35;
        }

        .learning-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .learning-progress-wrap {
          margin-top: auto;
          padding: 10px 12px;
          background: rgba(63, 165, 138, 0.03);
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

        .pct-val {
          font-weight: 700;
          color: var(--accent-emerald);
        }

        .completed-lessons-lbl {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 6px;
        }

        .recommended-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .recommended-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: transform 0.2s ease;
        }

        .recommended-card:hover {
          transform: translateY(-2px);
        }

        .rec-card-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .recommended-card h3 {
          font-size: 1.15rem;
        }

        .rec-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rec-meta {
          display: flex;
          gap: 16px;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: auto;
          padding-top: 6px;
        }

        .rec-actions {
          margin-top: 8px;
        }

        @media (max-width: 900px) {
          .dashboard-hero {
            grid-template-columns: 1fr;
            padding: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
