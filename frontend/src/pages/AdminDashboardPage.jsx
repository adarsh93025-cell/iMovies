import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../services/api";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorMessage from "../components/ErrorMessage";
import {
  FaShieldAlt,
  FaFilm,
  FaTheaterMasks,
  FaCalendarAlt,
  FaTicketAlt,
  FaRupeeSign,
  FaUsers,
  FaPlusCircle,
} from "react-icons/fa";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getStats();
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Admin stats error:", err);
      setError("Failed to load administrator metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingIndicator message="Loading admin analytics..." />;
  if (error) return <div className="container py-5"><ErrorMessage message={error} onRetry={fetchStats} /></div>;

  return (
    <div className="container py-5">
      {/* Top Welcome */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 border-bottom border-secondary pb-3">
        <div>
          <span className="badge bg-warning text-dark fw-bold mb-1">
            <FaShieldAlt className="me-1" /> SYSTEM ADMINISTRATOR PORTAL
          </span>
          <h2 className="fw-bold text-light mb-0">Management Overview & Analytics</h2>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <Link to="/admin/movies" className="btn btn-danger btn-sm d-flex align-items-center gap-1">
            <FaPlusCircle /> Add Movie
          </Link>
          <Link to="/admin/shows" className="btn btn-warning text-dark btn-sm d-flex align-items-center gap-1">
            <FaPlusCircle /> Schedule Show
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-lg-3">
          <div className="glass-panel p-3 rounded-4 border-start border-4 border-danger">
            <div className="text-secondary small d-flex align-items-center gap-2 mb-1">
              <FaFilm className="text-danger" /> Movies in Catalog
            </div>
            <h3 className="fw-bold text-light mb-0">{stats?.totalMovies || 0}</h3>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="glass-panel p-3 rounded-4 border-start border-4 border-warning">
            <div className="text-secondary small d-flex align-items-center gap-2 mb-1">
              <FaTheaterMasks className="text-warning" /> Theatres & Screens
            </div>
            <h3 className="fw-bold text-light mb-0">{stats?.totalTheatres || 0}</h3>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="glass-panel p-3 rounded-4 border-start border-4 border-info">
            <div className="text-secondary small d-flex align-items-center gap-2 mb-1">
              <FaCalendarAlt className="text-info" /> Active Shows
            </div>
            <h3 className="fw-bold text-light mb-0">{stats?.totalShows || 0}</h3>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="glass-panel p-3 rounded-4 border-start border-4 border-success">
            <div className="text-secondary small d-flex align-items-center gap-2 mb-1">
              <FaRupeeSign className="text-success" /> Verified Revenue
            </div>
            <h3 className="fw-bold text-success mb-0">₹{stats?.totalRevenue || 0}</h3>
          </div>
        </div>
      </div>

      {/* Admin Modules Navigation Cards */}
      <h4 className="fw-bold text-light mb-3">Management Modules</h4>
      <div className="row g-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="imovies-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <FaFilm size={28} className="text-danger" />
                <span className="badge bg-dark border border-secondary">{stats?.totalMovies} Movies</span>
              </div>
              <h5 className="fw-bold text-light mb-2">Movie Catalog</h5>
              <p className="text-secondary small mb-3">
                Add new releases, update synopsis, genres, posters, and manage cinema catalog.
              </p>
            </div>
            <Link to="/admin/movies" className="btn btn-outline-danger btn-sm w-100">
              Manage Movies →
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="imovies-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <FaTheaterMasks size={28} className="text-warning" />
                <span className="badge bg-dark border border-secondary">{stats?.totalTheatres} Theatres</span>
              </div>
              <h5 className="fw-bold text-light mb-2">Theatre Screens</h5>
              <p className="text-secondary small mb-3">
                Configure multiplex locations, balcony, middle, and lower seat tier pricing layouts.
              </p>
            </div>
            <Link to="/admin/theatres" className="btn btn-outline-warning btn-sm w-100">
              Manage Theatres →
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="imovies-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <FaCalendarAlt size={28} className="text-info" />
                <span className="badge bg-dark border border-secondary">{stats?.totalShows} Shows</span>
              </div>
              <h5 className="fw-bold text-light mb-2">Show Schedules</h5>
              <p className="text-secondary small mb-3">
                Schedule date and time slots, conflict detection, and monitor seating availability.
              </p>
            </div>
            <Link to="/admin/shows" className="btn btn-outline-info btn-sm w-100">
              Manage Shows →
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="imovies-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <FaTicketAlt size={28} className="text-success" />
                <span className="badge bg-dark border border-secondary">{stats?.totalBookings} Bookings</span>
              </div>
              <h5 className="fw-bold text-light mb-2">All Bookings & Audits</h5>
              <p className="text-secondary small mb-3">
                Inspect customer reservations, payment verifications, and cancellations.
              </p>
            </div>
            <Link to="/admin/bookings" className="btn btn-outline-success btn-sm w-100">
              Manage Bookings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
