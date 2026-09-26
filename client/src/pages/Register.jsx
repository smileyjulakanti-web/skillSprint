import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, getApiBaseUrl } from "../services/api";
import SylvaScene from "../components/SylvaScene";

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
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMsg) setErrorMsg("");
    if (successMsg) setSuccessMsg("");
  };

  const getPasswordStrength = () => {
    const pwd = formData.password;

    if (!pwd) {
      return {
        score: 0,
        label: "Empty",
        color: "#64748b",
      };
    }

    if (pwd.length < 6) {
      return {
        score: 1,
        label: "Too short (min 6)",
        color: "#ef4444",
      };
    }

    if (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[0-9]/.test(pwd)
    ) {
      return {
        score: 3,
        label: "Strong",
        color: "#10b981",
      };
    }

    return {
      score: 2,
      label: "Medium",
      color: "#f59e0b",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    // Validation
    if (!name || !email || !password) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      console.log("Registering user:", email);

      const data = await authAPI.register(
        name,
        email,
        password
      );

      console.log("Registration response:", data);

      setSuccessMsg(
        data?.message ||
        "Registration successful! Redirecting to login..."
      );

      // Redirect after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response) {
        // Backend returned an error
        setErrorMsg(
          error.response.data?.message ||
          `Registration failed (${error.response.status}).`
        );
      } else if (error.request) {
        // Request was sent but server didn't respond
        setErrorMsg(
          `Cannot connect to backend. Please make sure the server is running at ${getApiBaseUrl()}.`
        );
      } else {
        // Something else went wrong
        setErrorMsg(
          error.message || "Registration failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-page-container">
      <SylvaScene />
      <div className="auth-card glass-panel" style={{ position: "relative", zIndex: 1 }}>
        <div className="auth-header">
          <div className="auth-badge badge badge-cyan">
            <span>🚀</span>
            <span>Join SkillSprint</span>
          </div>

          <h1>Create Your Account</h1>

          <p>
            Start mastering production full-stack engineering today.
          </p>
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

        <form
          onSubmit={handleSubmit}
          className="auth-form"
          noValidate
        >
          {/* NAME */}
          <div className="form-group">
            <label
              className="form-label"
              htmlFor="reg-name"
            >
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
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label
              className="form-label"
              htmlFor="reg-email"
            >
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
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label
              className="form-label"
              htmlFor="reg-pwd"
            >
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
                disabled={isLoading}
                required
              />

              <button
                type="button"
                className="pwd-toggle"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={isLoading}
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
                          strength.score >= step
                            ? strength.color
                            : "rgba(255, 255, 255, 0.1)",
                      }}
                    />
                  ))}
                </div>

                <span
                  className="pwd-label"
                  style={{ color: strength.color }}
                >
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* SUBMIT */}
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
            <Link
              to="/login"
              className="auth-switch-link"
            >
              Sign In →
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page-container {
          position: relative;
          min-height: calc(100vh - 68px);
          height: calc(100vh - 68px);
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
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(
            90deg,
            #10b981,
            #34d399,
            #14b8a6
          );
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

        .pwd-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.4;
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
