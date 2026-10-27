import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaLock, FaFilm } from "react-icons/fa";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (username.length < 3 || username.length > 20) {
      setError("Username must be between 3 and 20 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="container py-5 my-auto" style={{ maxWidth: "480px" }}>
      <div className="glass-panel p-4 p-md-5 rounded-4 shadow-lg border border-secondary border-opacity-25">
        <div className="text-center mb-4">
          <div className="brand-logo justify-content-center mb-2">
            <FaFilm className="text-danger" />
            <span>i</span>Movies
          </div>
          <p className="text-secondary small mb-0">Create your account to unlock ticket booking and reviews</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-3 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <FaUser size={14} />
              </span>
              <input
                type="text"
                required
                className="form-control bg-dark text-light border-secondary"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <FaEnvelope size={14} />
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

          <div className="mb-3">
            <label className="form-label text-secondary small">Password (Min 8 characters)</label>
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

          <div className="mb-4">
            <label className="form-label text-secondary small">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <FaLock size={14} />
              </span>
              <input
                type="password"
                required
                className="form-control bg-dark text-light border-secondary"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-imovies w-100 py-2 fw-bold mb-3"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center text-secondary small">
          Already have an account?{" "}
          <Link to="/login" className="text-danger fw-semibold text-decoration-none">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
