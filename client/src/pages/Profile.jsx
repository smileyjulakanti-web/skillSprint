import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profileAPI } from "../services/api";

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileAPI.getProfile();
      setProfileData(data);
      setFormData({
        name: data.user.name,
        education: data.user.education || "",
        about: data.user.about || "",
        learningGoal: data.learningProfile?.learningGoal || "",
        learningStyle: data.learningProfile?.learningStyle || "",
        dailyTime: data.learningProfile?.dailyTime || "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      
      const status = error.response?.status || "Unknown";
      let message = error.response?.data?.message || error.message || "Failed to load profile";
      
      if (status === 404) {
        message = "Profile endpoint not found (Did you restart the backend server?)";
      } else if (status === 401) {
        message = "Token missing or invalid";
        navigate("/login");
      }
      
      setErrorDetails({ status, message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileAPI.updateProfile(formData);
      await fetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderSkillBar = (skillName, score) => {
    let color = "var(--status-error)";
    if (score >= 80) color = "var(--status-success)";
    else if (score >= 60) color = "var(--accent)";
    else if (score >= 40) color = "var(--status-warning)";

    return (
      <div className="skill-row" key={skillName}>
        <div className="skill-name">{skillName}</div>
        <div className="skill-bar-container">
          <div className="skill-bar-fill" style={{ width: `${score}%`, backgroundColor: color }}></div>
        </div>
        <div className="skill-score">{score}%</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="page-wrapper">
        <div className="error-container" style={{ textAlign: "center", padding: "2rem" }}>
          <h2 style={{ color: "var(--status-error)", marginBottom: "1rem" }}>Unable to load profile.</h2>
          {errorDetails && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "1.5rem", borderRadius: "8px", display: "inline-block", textAlign: "left" }}>
              <p><strong>Status:</strong> {errorDetails.status}</p>
              <p><strong>Message:</strong> {errorDetails.message}</p>
            </div>
          )}
          <p style={{ marginTop: "2rem" }}>Please try again or check your backend connection.</p>
        </div>
      </div>
    );
  }

  const { user, learningProfile } = profileData;
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  
  // Provide mock skills if backend map is empty, for display purposes
  const defaultSkills = { "JavaScript": 80, "React": 60, "Node.js": 70, "MongoDB": 60, "Problem Solving": 72 };
  const skillsToDisplay = learningProfile?.skillMap && Object.keys(learningProfile.skillMap).length > 0
    ? learningProfile.skillMap
    : defaultSkills;

  return (
    <div className="page-wrapper">
      <main className="profile-container">
        {/* Profile Header */}
        <section className="profile-header-card glass-panel">
          <div className="profile-header-content">
            <div className="profile-avatar-large">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="profile-info">
              <h1>{user.name}</h1>
              <p className="profile-subtitle">{user.education || "Learner"}</p>
              <div className="profile-meta">
                <span>📧 {user.email}</span>
                <span>📅 Joined {joinedDate}</span>
              </div>
            </div>
            <button className="btn btn-secondary edit-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        </section>

        <div className="profile-grid">
          {/* Left Column */}
          <div className="profile-col-left">
            
            {/* About Me */}
            <section className="profile-section glass-panel">
              <h2>About Me</h2>
              {user.about ? (
                <p className="about-text">{user.about}</p>
              ) : (
                <div className="empty-state">
                  <p>Tell us a little about yourself.</p>
                  <button className="btn btn-subtle btn-sm" onClick={() => setIsEditing(true)}>Add About</button>
                </div>
              )}
            </section>

            {/* Learning Statistics */}
            <section className="profile-section glass-panel">
              <h2>Learning Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-value">{learningProfile?.currentStreak || 0}</div>
                  <div className="stat-label">Day Streak</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-value">{learningProfile?.lessonsCompleted || 0}</div>
                  <div className="stat-label">Lessons</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-value">{learningProfile?.challengesCompleted || 0}</div>
                  <div className="stat-label">Challenges</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-value">0</div>
                  <div className="stat-label">Achievements</div>
                </div>
              </div>
            </section>

            {/* Skill Summary */}
            <section className="profile-section glass-panel">
              <h2>My Skills</h2>
              <div className="skills-list">
                {Object.entries(skillsToDisplay).map(([skill, score]) => renderSkillBar(skill, score))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="profile-col-right">
            
            {/* Current Sprint */}
            <section className="profile-section glass-panel current-sprint-section">
              <h2>Current Sprint</h2>
              {learningProfile?.currentSprint ? (
                <div className="active-sprint-info">
                  <h3 className="sprint-title">{learningProfile.targetSkill} Sprint</h3>
                  <p className="sprint-day">Day {learningProfile.currentSprint.currentDay} of 14</p>
                  
                  <div className="sprint-progress-bar">
                    <div 
                      className="sprint-progress-fill" 
                      style={{ width: `${Math.round((learningProfile.currentSprint.currentDay / 14) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <button className="btn btn-primary btn-full mt-4" onClick={() => navigate('/dashboard')}>
                    Continue Sprint →
                  </button>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No active sprint</p>
                  <span className="empty-subtitle">Choose a skill and start your next learning sprint.</span>
                  <button className="btn btn-primary mt-3" onClick={() => navigate('/skill-diagnostic')}>Start a Sprint</button>
                </div>
              )}
            </section>

            {/* Learning Profile */}
            <section className="profile-section glass-panel">
              <h2>My Learning Profile</h2>
              {learningProfile ? (
                <div className="learning-profile-details">
                  <div className="detail-row">
                    <span className="detail-icon">🎯</span>
                    <div>
                      <div className="detail-label">Learning Goal</div>
                      <div className="detail-value">{learningProfile.learningGoal || "Not set"}</div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">💻</span>
                    <div>
                      <div className="detail-label">Target Skill</div>
                      <div className="detail-value">{learningProfile.targetSkill || "Not set"}</div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📈</span>
                    <div>
                      <div className="detail-label">Current Level</div>
                      <div className="detail-value">{learningProfile.currentLevel || "Not set"}</div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">⏱</span>
                    <div>
                      <div className="detail-label">Daily Learning Time</div>
                      <div className="detail-value">{learningProfile.dailyTime || "Not set"}</div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📚</span>
                    <div>
                      <div className="detail-label">Learning Style</div>
                      <div className="detail-value">{learningProfile.learningStyle || "Not set"}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't set up your learning profile yet.</p>
                  <button className="btn btn-primary mt-3" onClick={() => navigate('/learning-profile')}>Set Up Profile</button>
                </div>
              )}
            </section>

          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="input-field no-icon" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Education / Role</label>
                <input 
                  type="text" 
                  className="input-field no-icon" 
                  value={formData.education} 
                  onChange={(e) => setFormData({...formData, education: e.target.value})} 
                  placeholder="e.g. B.Tech Student"
                />
              </div>
              <div className="form-group">
                <label className="form-label">About Me</label>
                <textarea 
                  className="input-field no-icon" 
                  value={formData.about} 
                  onChange={(e) => setFormData({...formData, about: e.target.value})} 
                  rows="3"
                ></textarea>
              </div>
              
              <h3 className="modal-subtitle mt-4">Learning Preferences</h3>
              <div className="form-group">
                <label className="form-label">Learning Goal</label>
                <input 
                  type="text" 
                  className="input-field no-icon" 
                  value={formData.learningGoal} 
                  onChange={(e) => setFormData({...formData, learningGoal: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Daily Learning Time</label>
                <select 
                  className="input-field no-icon"
                  value={formData.dailyTime}
                  onChange={(e) => setFormData({...formData, dailyTime: e.target.value})}
                >
                  <option value="">Select time</option>
                  <option value="15-30 mins">15-30 mins</option>
                  <option value="30-60 mins">30-60 mins</option>
                  <option value="1-2 hours">1-2 hours</option>
                  <option value="2+ hours">2+ hours</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .page-wrapper {
          min-height: 100vh;
        }

        .profile-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          color: var(--text-secondary);
        }

        /* Header */
        .profile-header-card {
          margin-bottom: 2rem;
          padding: 2rem;
        }

        .profile-header-content {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .profile-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--primary);
          color: #fff;
          font-size: 3rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .profile-info {
          flex: 1;
        }

        .profile-info h1 {
          font-size: 2rem;
          margin-bottom: 0.25rem;
        }

        .profile-subtitle {
          color: var(--accent);
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .profile-meta {
          display: flex;
          gap: 1.5rem;
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        /* Grid */
        .profile-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .profile-section {
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .profile-section h2 {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.75rem;
        }

        .about-text {
          color: var(--text-secondary);
          line-height: 1.7;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .stat-card {
          background: var(--bg-secondary);
          padding: 1.25rem;
          border-radius: var(--radius-md);
          text-align: center;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .stat-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0.25rem;
        }

        /* Skills List */
        .skills-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .skill-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .skill-name {
          width: 120px;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .skill-bar-container {
          flex: 1;
          height: 8px;
          background: rgba(0,0,0,0.3);
          border-radius: 4px;
          overflow: hidden;
        }

        .skill-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease-in-out;
        }

        .skill-score {
          width: 40px;
          text-align: right;
          font-size: 0.9rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
        }

        /* Learning Profile Details */
        .learning-profile-details {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .detail-row {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .detail-icon {
          font-size: 1.25rem;
          margin-top: 0.25rem;
        }

        .detail-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .detail-value {
          color: var(--text-primary);
          font-weight: 500;
        }

        /* Sprint Section */
        .sprint-title {
          font-size: 1.2rem;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .sprint-day {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .sprint-progress-bar {
          height: 10px;
          background: rgba(0,0,0,0.3);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .sprint-progress-fill {
          height: 100%;
          background: var(--gradient-primary);
        }

        .empty-state {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--text-secondary);
        }

        .empty-subtitle {
          display: block;
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          padding: 2rem;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-subtitle {
          font-size: 1.1rem;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .mt-3 { margin-top: 1rem; }
        .mt-4 { margin-top: 1.5rem; }

        @media (max-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
          
          .profile-header-content {
            flex-direction: column;
            text-align: center;
          }
          
          .profile-meta {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;
