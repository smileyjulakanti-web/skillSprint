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
  const [backendStatus, setBackendStatus] = useState("checking");
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    if (backendStatus === "live") return "var(--status-success)";
    if (backendStatus === "checking") return "var(--status-warning)";
    return "var(--status-error)";
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
            {user && (
              <Link
                to="/my-course"
                className={`nav-link ${location.pathname === "/my-course" ? "active" : ""}`}
              >
                My Course
              </Link>
            )}
            {user && (
              <Link
                to="/courses"
                className={`nav-link ${location.pathname.startsWith("/courses") ? "active" : ""}`}
              >
                Courses
              </Link>
            )}
          </nav>
        </div>

        <div className="navbar-right">
          {/* Backend Status Indicator Removed */}

          {user ? (
            <div className="user-nav-actions" style={{ position: 'relative' }}>
              <div 
                className="user-profile-badge" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="user-info-text">
                  <span className="user-name">{user.name || "Sprint Learner"}</span>
                  <span className="dropdown-arrow" style={{ fontSize: '10px', marginLeft: '4px' }}>▼</span>
                </div>
              </div>

              {dropdownOpen && (
                <>
                  <div 
                    className="dropdown-overlay" 
                    onClick={() => setDropdownOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
                  ></div>
                  <div className="profile-dropdown" style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)', padding: '0.5rem',
                    minWidth: '220px', zIndex: 100, boxShadow: 'var(--shadow-md)'
                  }}>
                    <div className="dropdown-header" style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>🟢 {user.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                    </div>
                    
                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      👤 My Profile
                    </Link>
                    <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      📊 My Progress
                    </Link>
                    
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.5rem 0' }}></div>
                    
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item" 
                      style={{ width: '100%', textAlign: 'left', color: 'var(--status-error)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              )}
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
          background: var(--bg-main);
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
          background: var(--gradient-primary);
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
          background: var(--gradient-primary);
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
          background: var(--gradient-primary);
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
          background: var(--gradient-primary);
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

        .dropdown-item {
          display: block;
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          text-decoration: none;
          font-size: 0.95rem;
          border-radius: var(--radius-sm);
          transition: background 0.2s ease;
        }

        .dropdown-item:hover {
          background: rgba(16, 185, 129, 0.12);
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
