import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/api";
import {
  FaFilm,
  FaTicketAlt,
  FaHeart,
  FaBell,
  FaUserCircle,
  FaShieldAlt,
  FaSignOutAlt,
  FaCalendarAlt,
} from "react-icons/fa";

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService
        .getAll()
        .then((res) => {
          if (res.data?.notifications) {
            setNotifications(res.data.notifications);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar-imovies">
      <div className="container d-flex align-items-center justify-content-between">
        {/* Logo */}
        <Link to="/" className="brand-logo">
          <FaFilm className="text-danger" />
          <span>i</span>Movies
        </Link>

        {/* Navigation Links */}
        <nav className="d-none d-md-flex align-items-center gap-2">
          <Link
            to="/"
            className={`nav-link-custom ${location.pathname === "/" ? "active" : ""}`}
          >
            Movies
          </Link>
          <Link
            to="/shows"
            className={`nav-link-custom ${location.pathname.startsWith("/shows") ? "active" : ""}`}
          >
            <FaCalendarAlt className="me-1 mb-1" /> Shows
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/bookings"
                className={`nav-link-custom ${location.pathname === "/bookings" ? "active" : ""}`}
              >
                <FaTicketAlt className="me-1 mb-1" /> My Bookings
              </Link>
              <Link
                to="/favorites"
                className={`nav-link-custom ${location.pathname === "/favorites" ? "active" : ""}`}
              >
                <FaHeart className="me-1 mb-1 text-danger" /> Watchlist
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link-custom text-warning ${
                location.pathname.startsWith("/admin") ? "active" : ""
              }`}
            >
              <FaShieldAlt className="me-1 mb-1" /> Admin Panel
            </Link>
          )}
        </nav>

        {/* User / Auth Actions */}
        <div className="d-flex align-items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="position-relative">
                <button
                  className="btn btn-dark btn-sm rounded-circle p-2 border-secondary"
                  onClick={() => setShowNotifs(!showNotifs)}
                  title="Notifications"
                >
                  <FaBell className="text-secondary" />
                  {notifications.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div
                    className="position-absolute end-0 mt-2 p-3 glass-panel rounded-3 shadow-lg"
                    style={{ width: "320px", zIndex: 1100 }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary">
                      <h6 className="mb-0 fw-bold">Notifications</h6>
                      <small className="text-muted">{notifications.length} new</small>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-muted small mb-0">No notifications yet.</p>
                    ) : (
                      <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                        {notifications.map((n, i) => (
                          <div
                            key={i}
                            className="p-2 mb-2 rounded bg-dark border border-secondary"
                          >
                            <div className="fw-semibold small text-danger">{n.title}</div>
                            <div className="small text-light">{n.message}</div>
                            <small className="text-muted" style={{ fontSize: "10px" }}>
                              {new Date(n.date).toLocaleDateString()}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Dropdown / Profile */}
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  id="userMenuBtn"
                >
                  <FaUserCircle className="text-danger" size={18} />
                  <span className="d-none d-sm-inline">{user?.username || "Account"}</span>
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow"
                  aria-labelledby="userMenuBtn"
                >
                  <li className="dropdown-header text-muted">
                    Signed in as <strong className="text-light">{user?.email}</strong>
                  </li>
                  <li>
                    <Link className="dropdown-menu-item dropdown-item" to="/profile">
                      <FaUserCircle className="me-2 text-info" /> Profile & Account
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-menu-item dropdown-item" to="/bookings">
                      <FaTicketAlt className="me-2 text-success" /> Booking History
                    </Link>
                  </li>
                  {isAdmin && (
                    <>
                      <li><hr className="dropdown-divider border-secondary" /></li>
                      <li>
                        <Link className="dropdown-menu-item dropdown-item text-warning" to="/admin">
                          <FaShieldAlt className="me-2" /> Admin Dashboard
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider border-secondary" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <FaSignOutAlt className="me-2" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn btn-imovies-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-imovies btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
