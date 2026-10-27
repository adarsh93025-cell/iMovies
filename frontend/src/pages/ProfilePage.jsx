import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaUserCircle,
  FaEnvelope,
  FaShieldAlt,
  FaTicketAlt,
  FaHeart,
  FaSignOutAlt,
} from "react-icons/fa";

const ProfilePage = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container py-5" style={{ maxWidth: "600px" }}>
      <div className="glass-panel p-4 p-md-5 rounded-4 shadow">
        <div className="text-center mb-4">
          <FaUserCircle size={72} className="text-danger mb-2" />
          <h3 className="fw-bold text-light mb-0">{user?.username || "Cinema Fan"}</h3>
          <span className="badge bg-secondary mt-1">{user?.role?.toUpperCase()}</span>
        </div>

        <div className="list-group list-group-flush bg-transparent mb-4">
          <div className="list-group-item bg-dark bg-opacity-50 text-light border-secondary d-flex justify-content-between align-items-center py-3">
            <span className="text-secondary small d-flex align-items-center gap-2">
              <FaEnvelope /> Email Address
            </span>
            <span className="fw-semibold">{user?.email}</span>
          </div>

          <div className="list-group-item bg-dark bg-opacity-50 text-light border-secondary d-flex justify-content-between align-items-center py-3">
            <span className="text-secondary small d-flex align-items-center gap-2">
              <FaShieldAlt /> Account Status
            </span>
            <span className="badge bg-success">Verified & Active</span>
          </div>
        </div>

        <div className="row g-2 mb-4">
          <div className="col-6">
            <Link to="/bookings" className="btn btn-outline-light w-100 py-2 d-flex align-items-center justify-content-center gap-2">
              <FaTicketAlt className="text-success" /> My Bookings
            </Link>
          </div>
          <div className="col-6">
            <Link to="/favorites" className="btn btn-outline-light w-100 py-2 d-flex align-items-center justify-content-center gap-2">
              <FaHeart className="text-danger" /> Watchlist
            </Link>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-4">
            <Link to="/admin" className="btn btn-warning text-dark w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2">
              <FaShieldAlt /> Open Administrator Dashboard
            </Link>
          </div>
        )}

        <button
          className="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
