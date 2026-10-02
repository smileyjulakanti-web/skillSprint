import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiBaseUrl, authAPI, sprintAPI, learningProfileAPI } from "../services/api";

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

  const [sprint, setSprint] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!token) {
      navigate("/login");
      return;
    }

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // Load User
        const meRes = await authAPI.getMe().catch(() => null);
        if (meRes?.user) {
          setUser(meRes.user);
          localStorage.setItem("user", JSON.stringify(meRes.user));
        }

        // Load Learning Profile
        const profileRes = await learningProfileAPI.getProfile().catch(() => null);
        if (profileRes?.profile) {
          setProfile(profileRes.profile);
        }

        // Load Current Sprint
        const sprintRes = await sprintAPI.getCurrentSprint().catch(() => null);
        if (sprintRes?.sprint) {
          setSprint(sprintRes.sprint);
        }

      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="dashboard-container loading-container">
        <span className="spinner large"></span>
        <p>Loading your SkillSprint Workspace...</p>
      </div>
    );
  }

  // Fallbacks if data is not available
  const currentDay = sprint?.days?.find(d => d.dayNumber === sprint.currentDay) || null;
  
  // Dummy Skill Map if missing
  const defaultSkillMap = [
    { name: "Frontend", score: 85 },
    { name: sprint?.targetSkill || "JavaScript", score: 70 },
    { name: "React", score: 55 },
    { name: "Backend", score: 30 },
    { name: "Problem Solving", score: 65 },
  ];
  
  const renderSkillBar = (score) => {
    return (
      <div className="skill-radar-bar">
        <div className="radar-fill" style={{ width: `${score}%`, backgroundColor: score >= 70 ? '#22C55E' : score >= 40 ? '#06B6D4' : '#EF4444' }}></div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* TODAY'S SPRINT */}
      <section className="dashboard-hero glass-panel" ref={vantaRef}>
        <div className="hero-content">
          <div className="hero-badge badge badge-emerald">
            <span>🔥</span>
            <span>TODAY'S SPRINT</span>
          </div>
          
          {sprint ? (
            <>
              <h1>Day {sprint.currentDay} of your {sprint.targetSkill} Sprint</h1>
              <div className="goal-box">
                <span className="goal-label">Today's goal:</span>
                <p className="goal-text">"{currentDay?.learningObjective || 'Master core fundamentals'}"</p>
              </div>
              
              <div className="sprint-meta-grid">
                <div className="sprint-meta-item">
                  <span className="meta-icon">⏱️</span>
                  <div>
                    <div className="meta-val">{currentDay?.estimatedTime || '45 mins'}</div>
                    <div className="meta-lbl">Time required</div>
                  </div>
                </div>
                <div className="sprint-meta-item">
                  <span className="meta-icon">📈</span>
                  <div>
                    <div className="meta-val">{sprint.overallProgress}%</div>
                    <div className="meta-lbl">Sprint Progress</div>
                  </div>
                </div>
              </div>

              <div className="hero-actions" style={{ marginTop: '2rem' }}>
                <Link to={`/learn/${sprint._id}/day/${sprint.currentDay}`} className="btn btn-primary btn-lg pulse-btn">
                  START SPRINT 🚀
                </Link>
                <button className="btn btn-secondary btn-lg" onClick={onOpenBackendModal}>
                  ⚙️ Server
                </button>
              </div>
            </>
          ) : (
            <>
              <h1>Welcome to SkillSprint, <span className="highlight-text">{user.name}</span>!</h1>
              <p>You don't have an active sprint right now.</p>
              <div className="hero-actions" style={{ marginTop: '2rem' }}>
                <Link to="/learning-profile" className="btn btn-primary btn-lg pulse-btn">
                  Generate a SkillSprint ⚡
                </Link>
              </div>
            </>
          )}
        </div>

        {/* STREAK & MOMENTUM (Right Side of Hero) */}
        <div className="hero-stats-panel glass-panel inner">
          <div className="stat-section streak-section">
            <h3>🔥 Streak</h3>
            <div className="streak-grid">
              <div className="streak-box active">
                <span className="streak-num">{profile?.currentStreak || 5}</span>
                <span className="streak-lbl">Current Streak</span>
              </div>
              <div className="streak-box">
                <span className="streak-num">{profile?.longestStreak || 8}</span>
                <span className="streak-lbl">Longest Streak</span>
              </div>
            </div>
          </div>

          <div className="stat-section momentum-section">
            <h3>⚡ Learning Momentum</h3>
            <ul className="momentum-list">
              <li>
                <span className="mom-icon">📚</span>
                <span className="mom-text">Lessons completed</span>
                <span className="mom-val">12</span>
              </li>
              <li>
                <span className="mom-icon">🎯</span>
                <span className="mom-text">Challenges solved</span>
                <span className="mom-val">8</span>
              </li>
              <li>
                <span className="mom-icon">📈</span>
                <span className="mom-text">Average score</span>
                <span className="mom-val">85%</span>
              </li>
              <li>
                <span className="mom-icon">⏱️</span>
                <span className="mom-text">Time spent</span>
                <span className="mom-val">6 hrs</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SKILL RADAR / SKILL MAP */}
      <section className="dashboard-section radar-section glass-panel">
        <div className="section-title-row">
          <div>
            <h2>📊 Skill Radar</h2>
            <p>Your current engineering abilities and active development areas.</p>
          </div>
        </div>
        
        <div className="skill-radar-grid">
          {defaultSkillMap.map((skill, i) => (
            <div className="radar-item" key={i}>
              <div className="radar-label-row">
                <span className="radar-name">{skill.name}</span>
                <span className="radar-score">{skill.score}%</span>
              </div>
              {renderSkillBar(skill.score)}
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

        .loading-container {
          justify-content: center;
          align-items: center;
          min-height: 50vh;
        }
        
        .spinner.large {
          width: 40px;
          height: 40px;
          border-width: 4px;
        }

        .dashboard-hero {
          padding: 2.5rem;
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 3rem;
          align-items: stretch;
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
          background: var(--gradient-primary);
        }

        .hero-content {
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hero-badge {
          align-self: flex-start;
          margin-bottom: 1rem;
        }

        .highlight-text {
          background: linear-gradient(135deg, #05130fff 0%, #0e251cff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .goal-box {
          background: rgba(0, 0, 0, 0.15);
          border-left: 4px solid var(--primary);
          padding: 1.25rem;
          border-radius: 0 8px 8px 0;
          margin: 1.5rem 0;
        }
        
        .goal-label {
          font-size: 0.85rem;
          color: var(--primary-light);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 0.25rem;
        }

        .goal-text {
          font-size: 1.3rem;
          color: var(--text-primary);
          font-style: italic;
          margin: 0;
        }

        .sprint-meta-grid {
          display: flex;
          gap: 2rem;
          margin-top: 0.5rem;
        }

        .sprint-meta-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .meta-icon {
          font-size: 1.8rem;
          background: rgba(255,255,255,0.05);
          padding: 10px;
          border-radius: 12px;
        }
        
        .meta-val {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .meta-lbl {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .btn-lg {
          padding: 14px 24px;
          font-size: 1.05rem;
        }
        
        .pulse-btn {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse-primary 2s infinite;
        }

        @keyframes pulse-primary {
          0% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          50% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        /* Hero Right Side (Stats Panel) */
        .hero-stats-panel {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: var(--radius-lg);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .stat-section h3 {
          font-size: 1.1rem;
          margin-bottom: 1.25rem;
          color: var(--text-primary);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 0.5rem;
        }
        
        .streak-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .streak-box {
          background: rgba(255,255,255,0.03);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .streak-box.active {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
        }
        
        .streak-num {
          display: block;
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        
        .streak-box.active .streak-num {
          color: #f59e0b;
        }

        .streak-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-top: 4px;
          display: block;
        }

        .momentum-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .momentum-list li {
          display: flex;
          align-items: center;
          padding: 0.5rem 0;
        }

        .mom-icon {
          font-size: 1.2rem;
          margin-right: 12px;
          width: 24px;
          text-align: center;
        }

        .mom-text {
          flex: 1;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .mom-val {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 1.05rem;
        }

        /* Radar Section */
        .radar-section {
          padding: 2.5rem;
        }
        
        .skill-radar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .radar-item {
          background: rgba(0, 0, 0, 0.2);
          padding: 1.25rem;
          border-radius: var(--radius-md);
        }

        .radar-label-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .radar-name {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .radar-score {
          font-family: var(--font-display);
          font-weight: 700;
        }

        .skill-radar-bar {
          height: 10px;
          background: rgba(255,255,255,0.08);
          border-radius: 5px;
          overflow: hidden;
        }

        .radar-fill {
          height: 100%;
          border-radius: 5px;
          transition: width 1s ease;
        }

        @media (max-width: 900px) {
          .dashboard-hero {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
