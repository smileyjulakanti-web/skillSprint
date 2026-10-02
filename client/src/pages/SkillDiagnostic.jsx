import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function SkillDiagnostic() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetSkill = queryParams.get("skill") || "JavaScript";

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock questions for the diagnostic (in a real app, fetch these from the backend based on targetSkill)
  const questions = [
    {
      id: "q1",
      topic: "Fundamentals",
      question: `Which of the following is true about ${targetSkill}?`,
      options: [
        "It is only used for styling.",
        "It is a core technology for modern applications.",
        "It is obsolete.",
        "It cannot handle async operations."
      ],
      correct: 1
    },
    {
      id: "q2",
      topic: "Advanced",
      question: `What is the primary use case of ${targetSkill}?`,
      options: [
        "Database administration",
        "Building scalable applications",
        "Writing operating systems",
        "Graphic design"
      ],
      correct: 1
    },
    {
      id: "q3",
      topic: "Async",
      question: "How do you handle asynchronous operations?",
      options: [
        "Callbacks and Promises",
        "Synchronous loops",
        "Thread blocking",
        "It doesn't support async operations"
      ],
      correct: 0
    }
  ];

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call to save diagnostic results
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Update local storage user data to reflect diagnosticCompleted
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.diagnosticCompleted = true;
      localStorage.setItem("user", JSON.stringify(user));
    }, 1500);
  };

  const handleContinue = () => {
    // Proceed to Skill Gap Analysis or Dashboard
    navigate("/skill-gap");
  };

  if (isSubmitted) {
    return (
      <div className="diagnostic-page">
        <div className="diagnostic-container glass-panel result-view">
          <div className="result-header">
            <span className="badge badge-emerald">Diagnostic Complete</span>
            <h2>{targetSkill} Skill Level: 66%</h2>
            <p>We've analyzed your responses and prepared your Skill Map.</p>
          </div>

          <div className="result-stats">
            <div className="stat-row">
              <span className="stat-label">Strong Topics:</span>
              <span className="stat-value text-success">Fundamentals</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Needs Improvement:</span>
              <span className="stat-value text-warning">Async Operations</span>
            </div>
          </div>

          <button onClick={handleContinue} className="btn btn-primary btn-full">
            View Skill Gap Analysis &rarr;
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const selectedOption = answers[q.id];

  return (
    <div className="diagnostic-page">
      <div className="diagnostic-container glass-panel">
        <div className="diagnostic-header">
          <div className="progress-indicator">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <h1>{targetSkill} Diagnostic</h1>
          <p className="topic-badge">{q.topic}</p>
        </div>

        <div className="question-body">
          <h3 className="question-text">{q.question}</h3>
          <div className="options-list">
            {q.options.map((opt, index) => (
              <button
                key={index}
                className={`option-btn ${selectedOption === index ? "selected" : ""}`}
                onClick={() => handleSelectOption(q.id, index)}
              >
                <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                <div className="option-text">{opt}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="diagnostic-footer">
          <button 
            className="btn btn-primary btn-full" 
            onClick={handleNext}
            disabled={selectedOption === undefined || isSubmitting}
          >
            {isSubmitting ? "Analyzing..." : (currentQuestion === questions.length - 1 ? "Submit Diagnostic" : "Next Question")}
          </button>
        </div>
      </div>

      <style>{`
        .diagnostic-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          background: var(--bg-main);
        }

        .diagnostic-container {
          width: 100%;
          max-width: 650px;
          padding: 3rem;
          border-radius: var(--radius-lg);
        }

        .diagnostic-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .progress-indicator {
          font-size: 0.85rem;
          color: var(--primary-light);
          font-weight: 600;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .diagnostic-header h1 {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }

        .topic-badge {
          display: inline-block;
          background: rgba(16, 185, 129, 0.1);
          color: var(--primary);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .question-text {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 2rem;
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .option-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .option-btn.selected {
          background: rgba(16, 185, 129, 0.1);
          border-color: var(--primary);
        }

        .option-letter {
          width: 30px;
          height: 30px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .option-btn.selected .option-letter {
          background: var(--primary);
          color: #fff;
        }

        .option-text {
          font-size: 1.05rem;
          color: var(--text-primary);
        }

        /* Result View */
        .result-view {
          text-align: center;
        }

        .result-header {
          margin-bottom: 2.5rem;
        }

        .result-header h2 {
          font-size: 2.2rem;
          margin: 1rem 0 0.5rem;
          color: var(--text-primary);
        }

        .result-stats {
          background: rgba(0, 0, 0, 0.2);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          margin-bottom: 2.5rem;
          text-align: left;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-subtle);
        }
        
        .stat-row:last-child {
          border-bottom: none;
        }

        .stat-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .stat-value {
          font-weight: 600;
        }

        .text-success { color: var(--status-success); }
        .text-warning { color: var(--status-warning); }
      `}</style>
    </div>
  );
}

export default SkillDiagnostic;
