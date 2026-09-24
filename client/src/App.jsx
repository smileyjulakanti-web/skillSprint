import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import BackendModal from "./components/BackendModal";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar onOpenBackendModal={() => setIsBackendModalOpen(true)} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  onOpenBackendModal={() => setIsBackendModalOpen(true)}
                />
              }
            />
            {/* Catch-all redirect to dashboard/login */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>
            SkillSprint &bull; Continuous Full-Stack Engineering Platform &bull;{" "}
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => setIsBackendModalOpen(true)}
            >
              Server Status & Diagnostics
            </button>
          </p>
        </footer>

        <BackendModal
          isOpen={isBackendModalOpen}
          onClose={() => setIsBackendModalOpen(false)}
        />
      </div>

      <style>{`
        .app-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1 0 auto;
        }

        .app-footer {
          flex-shrink: 0;
          padding: 1.5rem;
          border-top: 1px solid var(--border-subtle);
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
          background: rgba(7, 9, 14, 0.7);
        }

        .footer-link-btn {
          background: transparent;
          border: none;
          color: var(--primary-light);
          cursor: pointer;
          font-size: inherit;
          text-decoration: underline;
        }

        .footer-link-btn:hover {
          color: #fff;
        }
      `}</style>
    </BrowserRouter>
  );
}

export default App;
