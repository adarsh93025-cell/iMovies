import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { showService, movieService, theatreService } from "../services/api";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorMessage from "../components/ErrorMessage";
import { FaPlus, FaTrash, FaArrowLeft, FaCalendarAlt, FaClock, FaTicketAlt } from "react-icons/fa";

const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [movieId, setMovieId] = useState("");
  const [theatreName, setTheatreName] = useState("");
  const [showdate, setShowdate] = useState(new Date().toISOString().split("T")[0]);
  const [showtime, setShowtime] = useState("06:30 PM");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        showService.getAll(),
        movieService.getAll(),
        theatreService.getAll(),
      ]);

      if (showsRes.data?.shows) setShows(showsRes.data.shows);
      if (moviesRes.data?.movies) {
        setMovies(moviesRes.data.movies);
        if (moviesRes.data.movies.length > 0 && !movieId) {
          setMovieId(moviesRes.data.movies[0].movieId || moviesRes.data.movies[0]._id);
        }
      }
      if (theatresRes.data?.theatres) {
        setTheatres(theatresRes.data.theatres);
        if (theatresRes.data.theatres.length > 0 && !theatreName) {
          setTheatreName(theatresRes.data.theatres[0].theatreName);
        }
      }
    } catch (err) {
      console.error("Load data error:", err);
      setError("Failed to load shows data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateShow = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      await showService.create({
        movieId,
        theatreName,
        showdate,
        showtime,
      });

      setShowForm(false);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to schedule show.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm("Are you sure you want to cancel and delete this show?")) return;
    try {
      await showService.delete(id);
      setShows((prev) => prev.filter((s) => (s.showId || s._id) !== id));
    } catch (err) {
      alert("Failed to delete show.");
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 border-bottom border-secondary pb-3">
        <div className="d-flex align-items-center gap-3">
          <Link to="/admin" className="btn btn-outline-secondary btn-sm">
            <FaArrowLeft />
          </Link>
          <div>
            <h3 className="fw-bold text-light mb-0">Show Schedules Management</h3>
            <p className="text-secondary small mb-0">Schedule screenings, manage time slots, and prevent auditorium overlaps</p>
          </div>
        </div>
        <button
          className="btn btn-info text-dark btn-sm d-flex align-items-center gap-2 mt-2 mt-sm-0 fw-bold"
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus /> {showForm ? "Cancel" : "Schedule New Show"}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-4 rounded-4 mb-4 border-info border-opacity-50">
          <h5 className="fw-bold text-light mb-3">Schedule a New Show</h5>
          {formError && <div className="alert alert-danger py-2 small">{formError}</div>}
          <form onSubmit={handleCreateShow}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Select Movie</label>
                <select
                  required
                  className="form-select bg-dark text-light border-secondary"
                  value={movieId}
                  onChange={(e) => setMovieId(e.target.value)}
                >
                  {movies.map((m) => {
                    const id = m.movieId || m._id;
                    const name = m.movieName || m.title;
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Select Theatre Screen</label>
                <select
                  required
                  className="form-select bg-dark text-light border-secondary"
                  value={theatreName}
                  onChange={(e) => setTheatreName(e.target.value)}
                >
                  {theatres.map((t) => (
                    <option key={t.theatreId} value={t.theatreName}>
                      {t.theatreName} ({t.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Show Date</label>
                <input
                  type="date"
                  required
                  className="form-control bg-dark text-light border-secondary"
                  value={showdate}
                  onChange={(e) => setShowdate(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Show Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 07:15 PM"
                  className="form-control bg-dark text-light border-secondary"
                  value={showtime}
                  onChange={(e) => setShowtime(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3 text-end">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-info text-dark btn-sm px-4 fw-bold"
              >
                {saving ? "Scheduling..." : "Confirm Show Schedule"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingIndicator message="Loading scheduled shows..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <div className="glass-panel p-3 rounded-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="text-secondary small">
                  <th>Show ID</th>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((s) => {
                  const movie = movies.find((m) => m.movieId === s.movieId || m._id === s.movieId);
                  const name = movie ? movie.movieName || movie.title : s.movieId;

                  return (
                    <tr key={s.showId}>
                      <td className="small font-monospace text-muted">{s.showId}</td>
                      <td className="fw-semibold text-light">{name}</td>
                      <td className="small text-secondary">{s.theatreName}</td>
                      <td className="small text-light">
                        <FaCalendarAlt className="me-1 text-danger" /> {s.showdate}
                      </td>
                      <td>
                        <span className="badge bg-dark border border-secondary text-warning">
                          <FaClock className="me-1" /> {s.showtime}
                        </span>
                      </td>
                      <td className="text-end">
                        <Link
                          to={`/shows/${s.showId}/seats`}
                          className="btn btn-outline-secondary btn-sm me-2"
                          title="View Seats"
                        >
                          <FaTicketAlt size={12} />
                        </Link>
                        <button
                          className="btn btn-outline-danger btn-sm p-1"
                          onClick={() => handleDeleteShow(s.showId || s._id)}
                          title="Delete Show"
                        >
                          <FaTrash size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowsPage;
