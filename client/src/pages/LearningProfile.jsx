import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { learningProfileAPI } from "../services/api";

function LearningProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentLevel: "",
    learningGoal: "",
    targetSkill: "",
    dailyTime: "",
    learningStyle: "",
    targetDuration: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelect = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(formData).some(val => !val)) {
      setErrorMsg("Please fill in all fields to build your profile.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");

    try {
      await learningProfileAPI.saveProfile(formData);
      // Update local storage user data to reflect hasProfile
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.hasProfile = true;
      localStorage.setItem("user", JSON.stringify(user));

      // After profile, user goes to diagnostic and we pass the skill they selected
      navigate(`/skill-diagnostic?skill=${encodeURIComponent(formData.targetSkill || "JavaScript")}`);
    } catch (error) {
      console.error("Save profile error:", error);
      setErrorMsg("Failed to save learning profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentLevelOptions = ["Beginner", "Intermediate", "Advanced"];
  const learningGoalOptions = [
    "Get placement ready",
    "Learn full-stack development",
    "Improve programming",
    "Prepare for interviews",
    "Build projects",
    "Learn AI/ML",
    "Improve problem solving",
  ];
  const dailyTimeOptions = ["15 minutes", "30 minutes", "45 minutes", "1 hour", "2+ hours"];
  const learningStyleOptions = [
    "Learn by doing",
    "Video + practice",
    "Reading + practice",
    "Projects",
    "Interview questions",
  ];
  const targetDurationOptions = ["7 days", "14 days", "30 days", "60 days"];

  return (
    <div className="learning-profile-page">
      <div className="profile-container glass-panel">
        <div className="profile-header">
          <h1>Build Your SkillSprint</h1>
          <p>Tell us where you are and where you want to go.</p>
        </div>

        {errorMsg && (
          <div className="alert-banner error">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <label className="section-title">What is your current level?</label>
            <div className="pill-group">
              {currentLevelOptions.map(opt => (
                <button
                  type="button"
                  key={opt}
                  className={`pill-btn ${formData.currentLevel === opt ? "active" : ""}`}
                  onClick={() => handleSelect("currentLevel", opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="section-title">What is your primary learning goal?</label>
            <div className="pill-group">
              {learningGoalOptions.map(opt => (
                <button
                  type="button"
                  key={opt}
                  className={`pill-btn ${formData.learningGoal === opt ? "active" : ""}`}
                  onClick={() => handleSelect("learningGoal", opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="section-title">What skill do you want to learn?</label>
            <input
              type="text"
              name="targetSkill"
              className="input-field"
              placeholder="e.g. JavaScript, React, Node.js"
              value={formData.targetSkill}
              onChange={handleChange}
            />
          </div>

          <div className="form-section row-split">
            <div className="split-item">
              <label className="section-title">Available time per day</label>
              <select 
                name="dailyTime" 
                className="input-field select-field" 
                value={formData.dailyTime} 
                onChange={handleChange}
              >
                <option value="" disabled>Select time...</option>
                {dailyTimeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            
            <div className="split-item">
              <label className="section-title">Target duration</label>
              <select 
                name="targetDuration" 
                className="input-field select-field" 
                value={formData.targetDuration} 
                onChange={handleChange}
              >
                <option value="" disabled>Select duration...</option>
                {targetDurationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="form-section">
            <label className="section-title">Preferred learning style</label>
            <div className="pill-group">
              {learningStyleOptions.map(opt => (
                <button
                  type="button"
                  key={opt}
                  className={`pill-btn ${formData.learningStyle === opt ? "active" : ""}`}
                  onClick={() => handleSelect("learningStyle", opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full submit-profile"
            disabled={isLoading}
          >
            {isLoading ? "Generating Profile..." : "Next: Skill Diagnostic"}
          </button>
        </form>
      </div>

      <style>{`
        .learning-profile-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          background: var(--bg-main);
        }
        
        .profile-container {
          width: 100%;
          max-width: 700px;
          padding: 3rem;
          border-radius: var(--radius-lg);
        }

        .profile-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .profile-header h1 {
          font-size: 2.2rem;
          margin-bottom: 0.5rem;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .profile-header p {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .section-title {
          display: block;
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .pill-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .pill-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 0.6rem 1.2rem;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
        }

        .pill-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .pill-btn.active {
          background: var(--primary-main);
          border-color: var(--primary-main);
          color: #fff;
          font-weight: 500;
        }

        .row-split {
          display: flex;
          gap: 1.5rem;
        }

        .split-item {
          flex: 1;
        }
        
        .select-field {
          background: rgba(255,255,255,0.05);
          color: white;
        }
        
        .select-field option {
          background: var(--bg-card);
          color: white;
        }

        .submit-profile {
          margin-top: 1rem;
          font-size: 1.1rem;
          padding: 1rem;
        }
        
        @media (max-width: 600px) {
          .row-split {
            flex-direction: column;
            gap: 2rem;
          }
          .profile-container {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default LearningProfile;
