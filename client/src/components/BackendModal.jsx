import { useState } from "react";
import { getApiBaseUrl, setApiBaseUrl, authAPI } from "../services/api";

function BackendModal({ isOpen, onClose }) {
  const [apiUrl, setApiUrl] = useState(() => getApiBaseUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const data = await authAPI.checkHealth();
      const latency = Math.round(performance.now() - start);
      setTestResult({
        success: true,
        message: `Connected! Response time: ${latency}ms. MongoDB: ${data.mongodb || "connected"}`,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message:
          err.message ||
          "Could not reach API. If using Render free tier, the service may take 30-50s to wake up from idle sleep.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setApiBaseUrl(apiUrl.trim());
    window.location.reload();
  };

  const handleReset = () => {
    localStorage.removeItem("skillsprint_custom_api_url");
    const defaultUrl =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.PROD ? "https://skillsprint.onrender.com" : "http://localhost:5000");
    setApiUrl(defaultUrl);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">⚙️</span>
            <h3>Backend API Configuration</h3>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            SkillSprint connects to an Express + MongoDB backend. In production, this typically runs on Render.
          </p>

          <div className="form-group">
            <label className="form-label">Active Backend API URL</label>
            <input
              type="text"
              className="input-field no-icon"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g. https://skillsprint.onrender.com or http://localhost:5000"
            />
          </div>

          <div className="modal-quick-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? <span className="spinner" /> : "⚡ Test Ping / Health"}
            </button>
            <button
              type="button"
              className="btn btn-subtle btn-sm"
              onClick={handleReset}
            >
              Reset to Default
            </button>
          </div>

          {testResult && (
            <div
              className={`alert-banner ${
                testResult.success ? "success" : "error"
              }`}
              style={{ marginTop: 14 }}
            >
              <span>{testResult.success ? "✅" : "⚠️"}</span>
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="render-tip-box">
            <span className="tip-icon">💡</span>
            <div className="tip-text">
              <strong>Render Free Tier Note:</strong> If the backend has been idle for 15+ minutes, Render spins down the instance. The first request may take ~30-50 seconds to spin up.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save & Reload
          </button>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          width: 100%;
          max-width: 520px;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 14px;
        }

        .modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-icon {
          font-size: 1.2rem;
        }

        .btn-close {
          background: transparent;
          border: none;
          font-size: 1.8rem;
          color: var(--text-muted);
          cursor: pointer;
          line-height: 1;
        }

        .btn-close:hover {
          color: var(--text-primary);
        }

        .modal-desc {
          font-size: 0.9rem;
          margin-bottom: 16px;
        }

        .modal-quick-actions {
          display: flex;
          gap: 10px;
          margin-top: 6px;
        }

        .render-tip-box {
          display: flex;
          gap: 10px;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          margin-top: 14px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .tip-icon {
          font-size: 1.1rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          border-top: 1px solid var(--border-subtle);
          padding-top: 14px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default BackendModal;
