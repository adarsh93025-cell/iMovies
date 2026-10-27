import React from "react";
import { Link } from "react-router-dom";
import { FaFilm, FaHeart, FaGithub, FaShieldAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="mt-auto py-5 border-top border-secondary border-opacity-25" style={{ background: "#080a10" }}>
      <div className="container">
        <div className="row g-4 justify-content-between">
          <div className="col-12 col-md-5">
            <div className="brand-logo mb-3">
              <FaFilm className="text-danger" />
              <span>i</span>Movies
            </div>
            <p className="text-secondary small pe-md-4">
              Premium movie ticket booking platform built with the MERN stack (MongoDB, Express, React, Node.js).
              Discover upcoming cinema releases, browse multi-tier theatre layouts, book tickets in real time, and manage reservations seamlessly.
            </p>
            <div className="small text-muted">
              © {new Date().getFullYear()} iMovies Movie Ticket Booking System. All rights reserved.
            </div>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="fw-bold text-light mb-3">Navigation</h6>
            <ul className="list-unstyled small text-secondary">
              <li className="mb-2"><Link to="/" className="text-decoration-none text-secondary">Browse Movies</Link></li>
              <li className="mb-2"><Link to="/shows" className="text-decoration-none text-secondary">Show Schedules</Link></li>
              <li className="mb-2"><Link to="/bookings" className="text-decoration-none text-secondary">My Bookings</Link></li>
              <li className="mb-2"><Link to="/favorites" className="text-decoration-none text-secondary">Watchlist</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="fw-bold text-light mb-3">Portals & Admin</h6>
            <ul className="list-unstyled small text-secondary">
              <li className="mb-2"><Link to="/admin" className="text-decoration-none text-warning"><FaShieldAlt className="me-1" /> Admin Dashboard</Link></li>
              <li className="mb-2"><Link to="/login" className="text-decoration-none text-secondary">User Sign In</Link></li>
              <li className="mb-2"><Link to="/register" className="text-decoration-none text-secondary">Create Account</Link></li>
              <li className="mb-2"><span className="badge bg-secondary">MERN 2026 Edition</span></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
