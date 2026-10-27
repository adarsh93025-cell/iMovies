import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaLock, FaFilm, FaShieldAlt } from "react-icons/fa";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAdminTab, setIsAdminTab] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password, isAdminTab);
    setLoading(false);

    if (result.success) {
      if (isAdminTab) {
        navigate("/admin");
      } else {
        const from = location.state?.from?.pathname || "/";
        navigate(from);
      }
    } else {
      setError(result.error);
    }
  };

  const fillDemo = (type) => {
    if (type === "admin") {
      setIsAdminTab(true);
      setEmail("admin@imovies.com");
      setPassword("Admin@12345");
    } else {
      setIsAdminTab(false);
      setEmail("user@imovies.com");
      setPassword("User@12345");
    }
  };

  return (
    <div className="container py-5 my-auto" style={{ maxWidth: "480px" }}>
      <div className="glass-panel p-4 p-md-5 rounded-4 shadow-lg border border-secondary border-opacity-25">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="brand-logo justify-content-center mb-2">
            <FaFilm className="text-danger" />
            <span>i</span>Movies
          </div>
          <p className="text-secondary small mb-0">Sign in to book tickets and manage your movies</p>
        </div>

        {/* Tab switch */}
        <div className="btn-group w-100 mb-4 bg-dark p-1 rounded-3">
          <button
            type="button"
            className={`btn btn-sm ${!isAdminTab ? "btn-danger fw-bold shadow-sm" : "text-secondary"}`}
            onClick={() => {
              setIsAdminTab(false);
              setError(null);
            }}
          >
            User Login
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isAdminTab ? "btn-warning text-dark fw-bold shadow-sm" : "text-secondary"}`}
            onClick={() => {
              setIsAdminTab(true);
              setError(null);
            }}
          >
            <FaShieldAlt className="me-1" /> Admin Login
          </button>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-3 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <FaUser size={14} />
              </span>
              <input
                type="email"
                required
                className="form-control bg-dark text-light border-secondary"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary small">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <FaLock size={14} />
              </span>
              <input
                type="password"
                required
                className="form-control bg-dark text-light border-secondary"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn w-100 py-2 fw-bold mb-3 ${isAdminTab ? "btn-warning text-dark" : "btn-imovies"}`}
          >
            {loading ? "Signing In..." : isAdminTab ? "Sign In as Admin" : "Sign In to iMovies"}
          </button>
        </form>

        {/* Quick Demo Autofill */}
        <div className="p-3 rounded bg-dark border border-secondary border-opacity-50 text-center mb-3">
          <div className="small text-muted mb-2">⚡ Quick Fill Demo Credentials:</div>
          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => fillDemo("user")}
            >
              Demo User
            </button>
            <button
              type="button"
              className="btn btn-outline-warning btn-sm"
              onClick={() => fillDemo("admin")}
            >
              Demo Admin
            </button>
          </div>
        </div>

        <div className="text-center text-secondary small">
          Don't have an account?{" "}
          <Link to="/register" className="text-danger fw-semibold text-decoration-none">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
