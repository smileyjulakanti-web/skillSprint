import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sprintAPI } from "../services/api";

function SprintLesson() {
  const { sprintId, dayId } = useParams();
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState("learn");
  const [isCompleted, setIsCompleted] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [quizAnswers, setQuizAnswers] = useState({});

  // Mock lesson data (this would come from the backend)
  const lessonData = {
    title: `Day ${dayId} - Asynchronous JavaScript`,
    objective: "Understand how Promises and async/await work under the hood.",
    content: "Asynchronous programming allows you to perform long network requests without blocking the main thread. We use Promises to handle eventual completion or failure of an asynchronous operation.",
    examples: [
      "const data = await fetch('/api');",
      "promise.then(res => console.log(res)).catch(err => console.error(err));"
    ],
    practice: {
      prompt: "Write an async function called `fetchUser` that returns 'John Doe'.",
      solution: "async function fetchUser() { return 'John Doe'; }"
    },
    quiz: [
      { id: "q1", question: "What does await do?", options: ["Pauses execution", "Throws an error", "Loops forever"], answer: 0 },
      { id: "q2", question: "Which keyword is used to declare an asynchronous function?", options: ["sync", "async", "await"], answer: 1 }
    ],
    challenge: {
      prompt: "Build a function that fetches data from two APIs concurrently using Promise.all()."
    }
  };

  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      await sprintAPI.completeDay(sprintId, dayId);
      setIsCompleted(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Failed to complete day:", err);
      alert("Failed to save progress. Please try again.");
      setIsCompleting(false);
    }
  };

  return (
    <div className="sprint-lesson-page">
      <div className="lesson-sidebar glass-panel">
        <div className="sidebar-header">
          <h3>Sprint Navigation</h3>
        </div>
        <button 
          className={`sidebar-nav-btn ${activeSection === "learn" ? "active" : ""}`}
          onClick={() => setActiveSection("learn")}
        >
          <span className="icon">📖</span> 1. Learn
        </button>
        <button 
          className={`sidebar-nav-btn ${activeSection === "try" ? "active" : ""}`}
          onClick={() => setActiveSection("try")}
        >
          <span className="icon">💻</span> 2. Try It Out
        </button>
        <button 
          className={`sidebar-nav-btn ${activeSection === "check" ? "active" : ""}`}
          onClick={() => setActiveSection("check")}
        >
          <span className="icon">✓</span> 3. Quick Check
        </button>
        <button 
          className={`sidebar-nav-btn ${activeSection === "challenge" ? "active" : ""}`}
          onClick={() => setActiveSection("challenge")}
        >
          <span className="icon">🔥</span> 4. Sprint Challenge
        </button>
        
        <div className="sidebar-footer">
          <button 
            className="btn btn-primary btn-full" 
            onClick={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? "Saving..." : "Mark Day Complete"}
          </button>
        </div>
      </div>

      <div className="lesson-main glass-panel">
        {isCompleted ? (
          <div className="completion-success">
            <span className="huge-icon">🎉</span>
            <h2>Awesome job!</h2>
            <p>You completed Day {dayId} of your Sprint.</p>
            <p className="text-muted">Routing you back to dashboard...</p>
          </div>
        ) : (
          <>
            <div className="lesson-header">
              <span className="badge badge-emerald">Daily Goal</span>
              <h1>{lessonData.title}</h1>
              <p className="objective">{lessonData.objective}</p>
            </div>

            <div className="lesson-content-area">
              {activeSection === "learn" && (
                <div className="section-content animate-fade">
                  <h2>Theory & Concepts</h2>
                  <p>{lessonData.content}</p>
                  
                  <h3 style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>Code Examples:</h3>
                  <div className="code-examples">
                    {lessonData.examples.map((ex, i) => (
                      <pre key={i} className="code-block"><code>{ex}</code></pre>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "try" && (
                <div className="section-content animate-fade">
                  <h2>Interactive Practice</h2>
                  <p>{lessonData.practice.prompt}</p>
                  
                  <textarea 
                    className="code-editor" 
                    placeholder="// Write your code here..."
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                  ></textarea>
                  <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                    Run Code
                  </button>
                </div>
              )}

              {activeSection === "check" && (
                <div className="section-content animate-fade">
                  <h2>Knowledge Check</h2>
                  {lessonData.quiz.map((q, i) => (
                    <div key={q.id} className="quiz-question-box">
                      <p className="q-text">{i + 1}. {q.question}</p>
                      <div className="q-options">
                        {q.options.map((opt, optIndex) => (
                          <button 
                            key={optIndex}
                            className={`q-opt-btn ${quizAnswers[q.id] === optIndex ? 'selected' : ''}`}
                            onClick={() => setQuizAnswers({...quizAnswers, [q.id]: optIndex})}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === "challenge" && (
                <div className="section-content animate-fade">
                  <h2>Sprint Challenge</h2>
                  <div className="challenge-prompt">
                    <span className="challenge-icon">🚀</span>
                    <p>{lessonData.challenge.prompt}</p>
                  </div>
                  
                  <textarea 
                    className="code-editor large" 
                    placeholder="// Implement your challenge solution here..."
                  ></textarea>
                  <button className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
                    Submit Challenge
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .sprint-lesson-page {
          max-width: 1300px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
          min-height: calc(100vh - 70px);
        }

        .lesson-sidebar {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .sidebar-header {
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 1rem;
        }

        .sidebar-header h3 {
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .sidebar-nav-btn {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          text-align: left;
          cursor: pointer;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }

        .sidebar-nav-btn:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }

        .sidebar-nav-btn.active {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: var(--primary);
          font-weight: 600;
        }

        .sidebar-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .lesson-main {
          padding: 2.5rem 3rem;
          display: flex;
          flex-direction: column;
        }

        .lesson-header {
          margin-bottom: 2.5rem;
        }

        .lesson-header h1 {
          font-size: 2.2rem;
          margin: 1rem 0;
          color: var(--text-primary);
        }

        .objective {
          font-size: 1.15rem;
          color: var(--text-secondary);
          border-left: 4px solid var(--primary);
          padding-left: 1rem;
          background: rgba(0,0,0,0.1);
          padding: 1rem;
          border-radius: 0 8px 8px 0;
        }

        .lesson-content-area {
          flex: 1;
        }
        
        .section-content {
          color: var(--text-primary);
        }

        .section-content h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--primary-light);
        }

        .section-content p {
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .code-block {
          background: #0f172a;
          padding: 1rem 1.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          margin-bottom: 1rem;
          overflow-x: auto;
          color: #e2e8f0;
          font-family: monospace;
          font-size: 0.95rem;
        }

        .code-editor {
          width: 100%;
          min-height: 150px;
          background: #0f172a;
          color: #e2e8f0;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1rem;
          font-family: monospace;
          font-size: 1rem;
          resize: vertical;
          margin-top: 1rem;
        }
        
        .code-editor.large {
          min-height: 250px;
        }

        .code-editor:focus {
          outline: none;
          border-color: var(--primary);
        }

        .quiz-question-box {
          background: rgba(0,0,0,0.2);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }

        .q-text {
          font-size: 1.1rem !important;
          margin-bottom: 1rem !important;
          font-weight: 500;
          color: #fff !important;
        }

        .q-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .q-opt-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 12px 1rem;
          border-radius: 8px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .q-opt-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .q-opt-btn.selected {
          background: rgba(16, 185, 129, 0.2);
          border-color: var(--primary);
          color: #fff;
        }

        .challenge-prompt {
          display: flex;
          gap: 1rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px dashed rgba(245, 158, 11, 0.4);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }

        .challenge-icon {
          font-size: 2rem;
        }

        .completion-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          animation: fade-up 0.5s ease-out forwards;
        }

        .huge-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
        }

        .animate-fade {
          animation: fade-in 0.3s ease-out forwards;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .sprint-lesson-page {
            grid-template-columns: 1fr;
          }
          
          .lesson-sidebar {
            position: relative;
            top: 0;
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .sidebar-nav-btn {
            flex: 1;
            min-width: 140px;
            justify-content: center;
          }
          
          .sidebar-footer {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default SprintLesson;
