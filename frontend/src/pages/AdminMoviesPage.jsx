import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { movieService } from "../services/api";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorMessage from "../components/ErrorMessage";
import { FaPlus, FaTrash, FaEdit, FaArrowLeft, FaFilm, FaStar } from "react-icons/fa";

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal state
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [movieName, setMovieName] = useState("");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState("Sci-Fi, Action");
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [runtime, setRuntime] = useState("135 min");
  const [certification, setCertification] = useState("U/A");
  const [media, setMedia] = useState("");
  const [rating, setRating] = useState(8.5);
  const [language, setLanguage] = useState("English");

  const loadMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await movieService.getAll();
      if (res.data?.movies) setMovies(res.data.movies);
    } catch (err) {
      console.error("Load movies error:", err);
      setError("Failed to load movies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      await movieService.create({
        movieName,
        description,
        genres: genres.split(",").map((g) => g.trim()),
        releaseDate,
        runtime,
        certification,
        media: media || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60",
        rating: Number(rating),
        language,
      });

      setShowForm(false);
      setMovieName("");
      setDescription("");
      setMedia("");
      loadMovies();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create movie.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    try {
      await movieService.delete(id);
      setMovies((prev) => prev.filter((m) => (m.movieId || m._id) !== id));
    } catch (err) {
      alert("Failed to delete movie.");
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
            <h3 className="fw-bold text-light mb-0">Movie Catalog Management</h3>
            <p className="text-secondary small mb-0">Add, edit, or remove movies from circulation</p>
          </div>
        </div>
        <button
          className="btn btn-danger btn-sm d-flex align-items-center gap-2 mt-2 mt-sm-0"
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus /> {showForm ? "Cancel" : "Add New Movie"}
        </button>
      </div>

      {/* Add Movie Form */}
      {showForm && (
        <div className="glass-panel p-4 rounded-4 mb-4 border-danger border-opacity-50">
          <h5 className="fw-bold text-light mb-3">Add New Movie</h5>
          {formError && <div className="alert alert-danger py-2 small">{formError}</div>}
          <form onSubmit={handleCreateMovie}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Movie Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gladiator II"
                  className="form-control bg-dark text-light border-secondary"
                  value={movieName}
                  onChange={(e) => setMovieName(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Genres (comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="Action, Drama, Adventure"
                  className="form-control bg-dark text-light border-secondary"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-secondary small">Release Date</label>
                <input
                  type="date"
                  required
                  className="form-control bg-dark text-light border-secondary"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-secondary small">Runtime</label>
                <input
                  type="text"
                  required
                  placeholder="148 min"
                  className="form-control bg-dark text-light border-secondary"
                  value={runtime}
                  onChange={(e) => setRuntime(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-secondary small">Rating (1 - 10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  required
                  className="form-control bg-dark text-light border-secondary"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label text-secondary small">Poster Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/poster.jpg"
                  className="form-control bg-dark text-light border-secondary"
                  value={media}
                  onChange={(e) => setMedia(e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label text-secondary small">Synopsis / Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Full plot summary..."
                  className="form-control bg-dark text-light border-secondary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3 text-end">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-imovies btn-sm px-4"
              >
                {saving ? "Saving..." : "Save Movie"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingIndicator message="Loading catalog..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadMovies} />
      ) : (
        <div className="glass-panel p-3 rounded-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="text-secondary small">
                  <th>Poster</th>
                  <th>Movie Title</th>
                  <th>Genres</th>
                  <th>Release Date</th>
                  <th>Rating</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => {
                  const mId = m.movieId || m._id;
                  const name = m.movieName || m.title;
                  const poster = m.media || m.image;
                  const gList = Array.isArray(m.genres) ? m.genres : [m.genre || "Drama"];

                  return (
                    <tr key={mId}>
                      <td style={{ width: "60px" }}>
                        <img
                          src={poster}
                          alt={name}
                          className="rounded"
                          style={{ width: "45px", height: "60px", objectFit: "cover" }}
                        />
                      </td>
                      <td>
                        <div className="fw-semibold text-light">{name}</div>
                        <small className="text-muted">{m.runtime || "120 min"}</small>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {gList.map((g, i) => (
                            <span key={i} className="badge bg-secondary small" style={{ fontSize: "10px" }}>
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="small text-secondary">
                        {m.releaseDate ? new Date(m.releaseDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark fw-bold">
                          <FaStar size={10} className="me-1" /> {m.rating || 8.5}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-danger btn-sm p-2"
                          onClick={() => handleDeleteMovie(mId)}
                          title="Delete Movie"
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

export default AdminMoviesPage;
