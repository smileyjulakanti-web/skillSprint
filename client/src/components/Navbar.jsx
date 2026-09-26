import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI, getApiBaseUrl } from "../services/api";

function Navbar({ onOpenBackendModal }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive user directly from localStorage during render (ensures sync without effect warnings)
  const getUserFromStorage = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const user = getUserFromStorage();
  const [backendStatus, setBackendStatus] = useState("checking"); // checking, live, offline

  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      try {
        await authAPI.checkHealth();
        if (isMounted) setBackendStatus("live");
      } catch {
        if (isMounted) setBackendStatus("offline");
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getStatusColor = () => {
    if (backendStatus === "live") return "#10b981";
    if (backendStatus === "checking") return "#f59e0b";
    return "#168672ff";
  };

  const getStatusText = () => {
    if (backendStatus === "live") return "API Live";
    if (backendStatus === "checking") return "Checking API...";
    return "API Offline";
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to={user ? "/dashboard" : "/login"} className="brand-logo">
            <div className="logo-icon-wrap">
              <span className="logo-bolt">⚡</span>
            </div>
            <span className="logo-title">
              Skill<span>Sprint</span>
            </span>
            <span className="logo-version">v1.0</span>
          </Link>

          <nav className="navbar-nav-links">
            {user && (
              <Link
                to="/dashboard"
                className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""
                  }`}
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/courses"
              className={`nav-link ${location.pathname.startsWith("/courses") ? "active" : ""
                }`}
            >
              Courses
            </Link>
          </nav>
        </div>

        <div className="navbar-right">
          {/* Backend Status Indicator Removed */}

          {user ? (
            <div className="user-nav-actions">
              <div className="user-profile-badge">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="user-info-text">
                  <span className="user-name">{user.name || "Sprint Learner"}</span>
                  <span className="user-role">Developer</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Sign out of SkillSprint"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="auth-nav-links">
              {location.pathname !== "/login" && (
                <Link to="/login" className="btn btn-subtle btn-sm">
                  Log In
                </Link>
              )}
              {location.pathname !== "/register" && (
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up Free
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(15, 139, 98, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
          padding: 0 1.5rem;
        }

        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .navbar-nav-links {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .nav-link {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s ease;
          position: relative;
          padding: 6px 2px;
        }

        .nav-link:hover {
          color: var(--text-primary);
        }

        .nav-link.active {
          color: var(--text-primary);
        }

        .nav-link.active::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #10b981, #14b8a6);
          border-radius: 2px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-icon-wrap {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #10b981, #14b8a6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(17, 164, 108, 0.4);
        }

        .logo-bolt {
          font-size: 1.2rem;
        }

        .logo-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .logo-title span {
          background: linear-gradient(135deg, #34d399 0%, #14b8a6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-version {
          font-size: 0.65rem;
          background: rgba(23, 147, 50, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--text-muted);
          font-weight: 600;
          margin-left: 2px;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .navbar-container .btn {
          background: lightgreen !important;
          color: black !important;
          border: none;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          box-shadow: 0 0 8px currentColor;
        }

        .user-nav-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 10px 4px 4px;
          border-radius: 30px;
          background: rgba(13, 171, 65, 0.04);
          border: 1px solid var(--border-subtle);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #34d399);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: #fff;
        }

        .user-info-text {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .user-role {
          font-size: 0.7rem;
          color: var(--primary-light);
          line-height: 1.2;
        }

        .auth-nav-links {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        @media (max-width: 640px) {
          .user-info-text {
            display: none;
          }
          .status-label {
            display: none;
          }
          .logo-version {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}

export default Navbar;
