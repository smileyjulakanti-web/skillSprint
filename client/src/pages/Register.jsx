import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, getApiBaseUrl } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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

  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: "Empty", color: "#64748b" };
    if (pwd.length < 6) return { score: 1, label: "Too short (min 6)", color: "#ef4444" };
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { score: 3, label: "Strong", color: "#10b981" };
    }
    return { score: 2, label: "Medium", color: "#f59e0b" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const data = await authAPI.register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );

      setSuccessMsg(data.message || "Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      const serverMessage =
        error.response?.data?.message ||
        (error.message === "Network Error"
          ? `Network error: Backend at ${getApiBaseUrl()} is unreachable. (If hosted on Render, please allow 30s for cold-start wake up).`
          : "Registration failed. Please try again.");
      setErrorMsg(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-badge badge badge-cyan">
            <span>🚀</span>
            <span>Join SkillSprint</span>
          </div>
          <h1>Create Your Account</h1>
          <p>Start mastering production full-stack engineering today.</p>
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
            <label className="form-label" htmlFor="reg-name">
              Full Name
            </label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="reg-name"
                type="text"
                name="name"
                autoComplete="name"
                className="input-field"
                placeholder="e.g. Alex Chen"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email Address
            </label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="reg-email"
                type="email"
                name="email"
                autoComplete="email"
                className="input-field"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-pwd">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="reg-pwd"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                className="input-field"
                placeholder="Minimum 6 characters"
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

            {formData.password && (
              <div className="pwd-meter">
                <div className="pwd-bars">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className="pwd-step"
                      style={{
                        backgroundColor:
                          strength.score >= step ? strength.color : "rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>
                <span className="pwd-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account & Start Learning ⚡</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-switch-link">
              Sign In &rarr;
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
          max-width: 480px;
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
          background: linear-gradient(90deg, #06b6d4, #6366f1, #10b981);
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

        .pwd-meter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 6px;
        }

        .pwd-bars {
          display: flex;
          gap: 4px;
          flex-grow: 1;
          max-width: 160px;
        }

        .pwd-step {
          height: 4px;
          flex-grow: 1;
          border-radius: 2px;
          transition: background-color 0.2s;
        }

        .pwd-label {
          font-size: 0.75rem;
          font-weight: 600;
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

export default Register;
