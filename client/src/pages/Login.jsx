import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, getApiBaseUrl } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const data = await authAPI.login(formData.email, formData.password);

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setSuccessMsg("Login successful! Redirecting to Dashboard...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 600);
    } catch (error) {
      console.error("Login failed:", error);
      const serverMessage =
        error.response?.data?.message ||
        (error.message === "Network Error"
          ? `Network error: Backend at ${getApiBaseUrl()} is unreachable. (If hosted on Render, please allow 30s for cold-start wake up).`
          : "Login failed. Please check your credentials.");
      setErrorMsg(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to pre-fill test credentials
  const handleQuickDemo = () => {
    setFormData({
      email: "learner@skillsprint.dev",
      password: "password123",
    });
    setErrorMsg("");
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-badge badge badge-indigo">
            <span>⚡</span>
            <span>Developer Learning Portal</span>
          </div>
          <h1>Welcome to SkillSprint</h1>
          <p>Accelerate your engineering journey with focused sprints.</p>
        </div>

        {errorMsg && (
          <div className="alert-banner error" role="alert">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-banner success" role="status">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Work or Personal Email
            </label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="email-input"
                type="email"
                name="email"
                autoComplete="email"
                className="input-field"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="password-input">
                Password
              </label>
            </div>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                className="input-field"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to SkillSprint 🚀</span>
            )}
          </button>
        </form>

        <div className="demo-hint-box">
          <div className="demo-hint-header">
            <span>💡 Quick Test Helper</span>
            <button
              type="button"
              className="btn btn-subtle btn-sm"
              onClick={handleQuickDemo}
            >
              Autofill Sample
            </button>
          </div>
          <p className="demo-hint-desc">
            Testing production? Use "Autofill Sample" or register a new account below.
          </p>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-switch-link">
              Create an account &rarr;
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page-container {
          min-height: calc(100vh - 68px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
        }

        .auth-card {
          width: 100%;
          max-width: 460px;
          padding: 2.5rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .auth-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #06b6d4, #ec4899);
        }

        .auth-header {
          margin-bottom: 1.75rem;
        }

        .auth-badge {
          margin-bottom: 0.75rem;
        }

        .auth-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          font-size: 0.95rem;
        }

        .auth-form {
          margin-bottom: 1.5rem;
        }

        .form-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pwd-toggle {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .pwd-toggle:hover {
          opacity: 1;
        }

        .demo-hint-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .demo-hint-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .demo-hint-desc {
          font-size: 0.8rem;
          margin-top: 4px;
          color: var(--text-muted);
        }

        .auth-footer {
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.25rem;
          font-size: 0.9rem;
        }

        .auth-switch-link {
          font-weight: 600;
          color: var(--primary-light);
        }
      `}</style>
    </div>
  );
}

export default Login;
