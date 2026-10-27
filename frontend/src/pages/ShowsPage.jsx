import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { showService, movieService, theatreService } from "../services/api";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorMessage from "../components/ErrorMessage";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTicketAlt, FaFilm } from "react-icons/fa";

const ShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMovie, setSelectedMovie] = useState("All");
  const [selectedTheatre, setSelectedTheatre] = useState("All");

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
      if (moviesRes.data?.movies) setMovies(moviesRes.data.movies);
      if (theatresRes.data?.theatres) setTheatres(theatresRes.data.theatres);
    } catch (err) {
      console.error("Shows error:", err);
      setError("Failed to load show schedules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredShows = shows.filter((s) => {
    const movieMatch = selectedMovie === "All" || s.movieId === selectedMovie;
    const theatreMatch = selectedTheatre === "All" || s.theatreName === selectedTheatre;
    return movieMatch && theatreMatch;
  });

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold text-light mb-1">Cinema Show Schedules</h2>
        <p className="text-secondary small">Choose your preferred movie, theatre, and showtime</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-3 rounded-4 mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label text-secondary small">Filter by Movie</label>
            <select
              className="form-select bg-dark text-light border-secondary"
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
            >
              <option value="All">All Movies</option>
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
            <label className="form-label text-secondary small">Filter by Theatre</label>
            <select
              className="form-select bg-dark text-light border-secondary"
              value={selectedTheatre}
              onChange={(e) => setSelectedTheatre(e.target.value)}
            >
              <option value="All">All Theatres</option>
              {theatres.map((t) => (
                <option key={t.theatreId} value={t.theatreName}>
                  {t.theatreName} ({t.location})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingIndicator message="Fetching schedules..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : filteredShows.length === 0 ? (
        <div className="glass-panel text-center py-5 rounded-4">
          <p className="text-secondary">No shows found matching the selected filters.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredShows.map((s) => {
            const movie = movies.find(
              (m) => m.movieId === s.movieId || m._id === s.movieId
            );
            const movieName = movie ? movie.movieName || movie.title : s.movieId;
            const poster = movie ? movie.media || movie.image : "";

            return (
              <div key={s.showId} className="col-12 col-md-6 col-lg-4">
                <div className="imovies-card p-3 h-100 d-flex flex-column justify-content-between">
                  <div className="d-flex gap-3 mb-3">
                    {poster && (
                      <img
                        src={poster}
                        alt={movieName}
                        className="rounded-3"
                        style={{ width: "70px", height: "95px", objectFit: "cover" }}
                      />
                    )}
                    <div>
                      <h6 className="fw-bold text-light mb-1">{movieName}</h6>
                      <div className="text-secondary small d-flex align-items-center gap-1 mb-1">
                        <FaMapMarkerAlt className="text-danger" size={12} /> {s.theatreName}
                      </div>
                      <div className="text-muted small d-flex align-items-center gap-1">
                        <FaCalendarAlt size={12} /> {s.showdate}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-25">
                    <span className="badge bg-dark border border-secondary text-light px-3 py-2 fs-6">
                      <FaClock className="me-1 text-danger" /> {s.showtime}
                    </span>
                    <Link
                      to={`/shows/${s.showId}/seats`}
                      className="btn btn-imovies btn-sm d-flex align-items-center gap-1"
                    >
                      <FaTicketAlt size={12} /> Select Seats
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShowsPage;
