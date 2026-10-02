import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sprintAPI } from "../services/api";

function SkillGap() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  // In a real app, this data would come from the backend based on the diagnostic results
  const targetSkill = "JavaScript";
  
  const skillScores = [
    { name: "Variables", score: 90 },
    { name: "Functions", score: 80 },
    { name: "Arrays", score: 70 },
    { name: "Objects", score: 60 },
    { name: "Promises", score: 40 },
    { name: "APIs", score: 30 },
  ];

  const strongSkills = skillScores.filter(s => s.score >= 70);
  const growthAreas = skillScores.filter(s => s.score < 70 && s.score >= 40);
  const recommendedSkills = skillScores.filter(s => s.score < 40);

  const handleGenerateSprint = async () => {
    setIsGenerating(true);
    try {
      await sprintAPI.generateSprint(targetSkill, 14);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to generate sprint:", error);
      if (error.response?.data?.message === "You already have an active SkillSprint.") {
         alert("You already have an active SkillSprint. Please finish it before generating a new one.");
         navigate("/dashboard");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const renderProgressBar = (score) => {
    return (
      <div className="skill-bar-wrapper">
        <div className="skill-bar-bg">
          <div 
            className={`skill-bar-fill ${score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="skill-score">{score}%</span>
      </div>
    );
  };

  return (
    <div className="skill-gap-page">
      <div className="skill-gap-container glass-panel">
        <div className="gap-header">
          <h1>Your Skill Map</h1>
          <p>Here is your current proficiency in <span className="highlight">{targetSkill}</span>.</p>
        </div>

        <div className="skill-chart-section">
          {skillScores.map(skill => (
            <div className="skill-row" key={skill.name}>
              <span className="skill-name">{skill.name}</span>
              {renderProgressBar(skill.score)}
            </div>
          ))}
        </div>

        <div className="analysis-grid">
          <div className="analysis-card strong">
            <h3>💪 Strong Skills</h3>
            <p className="card-desc">Topics you already understand well.</p>
            <ul>
              {strongSkills.map(s => <li key={s.name}>{s.name}</li>)}
            </ul>
          </div>
          
          <div className="analysis-card growth">
            <h3>🌱 Growth Areas</h3>
            <p className="card-desc">Topics requiring improvement.</p>
            <ul>
              {growthAreas.map(s => <li key={s.name}>{s.name}</li>)}
            </ul>
          </div>

          <div className="analysis-card recommended">
            <h3>🎯 Recommended Next</h3>
            <p className="card-desc">Topics we'll focus on first.</p>
            <ul>
              {recommendedSkills.map(s => <li key={s.name}>{s.name}</li>)}
            </ul>
          </div>
        </div>

        <div className="gap-footer">
          <p className="action-hint">Ready to level up your {targetSkill} skills?</p>
          <button 
            className="btn btn-primary btn-full generate-btn" 
            onClick={handleGenerateSprint}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="pulsing-text">Generating Your 14-Day SkillSprint...</span>
            ) : (
              "Generate My Personalized Sprint 🚀"
            )}
          </button>
        </div>
      </div>

      <style>{`
        .skill-gap-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          background: var(--bg-main);
        }

        .skill-gap-container {
          width: 100%;
          max-width: 800px;
          padding: 3rem;
          border-radius: var(--radius-lg);
        }

        .gap-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .gap-header h1 {
          font-size: 2.2rem;
          margin-bottom: 0.5rem;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .highlight {
          color: var(--primary);
          font-weight: 700;
        }

        .skill-chart-section {
          background: rgba(0, 0, 0, 0.2);
          border-radius: var(--radius-md);
          padding: 1.5rem 2rem;
          margin-bottom: 2.5rem;
        }

        .skill-row {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .skill-row:last-child {
          margin-bottom: 0;
        }

        .skill-name {
          flex: 0 0 120px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .skill-bar-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .skill-bar-bg {
          flex: 1;
          height: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          overflow: hidden;
        }

        .skill-bar-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 1s ease-out;
        }

        .skill-bar-fill.high { background: var(--status-success); }
        .skill-bar-fill.medium { background: var(--accent); }
        .skill-bar-fill.low { background: var(--status-error); }

        .skill-score {
          font-family: var(--font-display);
          font-weight: 600;
          width: 45px;
          text-align: right;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .analysis-card {
          padding: 1.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          background: rgba(255, 255, 255, 0.02);
        }

        .analysis-card.strong { border-top: 3px solid var(--status-success); }
        .analysis-card.growth { border-top: 3px solid var(--status-warning); }
        .analysis-card.recommended { border-top: 3px solid var(--status-error); }

        .analysis-card h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .card-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .analysis-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .analysis-card li {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          padding-left: 1rem;
          position: relative;
        }

        .analysis-card li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--primary-main);
        }

        .gap-footer {
          text-align: center;
        }

        .action-hint {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .generate-btn {
          padding: 1.2rem;
          font-size: 1.1rem;
          border-radius: 12px;
          background: var(--primary);
        }
        
        .pulsing-text {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        @media (max-width: 640px) {
          .skill-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .skill-bar-wrapper {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default SkillGap;
