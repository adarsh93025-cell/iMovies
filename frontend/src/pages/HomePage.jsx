import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { movieService, favoriteService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import MovieCard from "../components/MovieCard";
import SearchAndFilter from "../components/SearchAndFilter";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorMessage from "../components/ErrorMessage";
import { FaPlay, FaInfoCircle, FaStar, FaTicketAlt } from "react-icons/fa";

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await movieService.getAll({
        search: searchTerm || undefined,
        genre: selectedGenre !== "All" ? selectedGenre : undefined,
      });
      if (res.data?.movies) {
        setMovies(res.data.movies);
      }
    } catch (err) {
      console.error("Fetch movies error:", err);
      setError("Failed to load movies. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [searchTerm, selectedGenre]);

  useEffect(() => {
    if (isAuthenticated) {
      favoriteService
        .getAll()
        .then((res) => {
          if (res.data?.favorites) {
            setFavorites(res.data.favorites.map((f) => f.movieId));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const featuredMovie = movies.length > 0 ? movies[0] : null;

  return (
    <div className="home-page pb-5">
      {/* Hero Banner */}
      {featuredMovie && (
        <section
          className="position-relative py-5 mb-5"
          style={{
            backgroundImage: `linear-gradient(to top, #0a0c13 10%, rgba(10, 12, 19, 0.7) 60%, rgba(10, 12, 19, 0.9) 100%), url(${featuredMovie.backdrop || featuredMovie.media})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "480px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div className="container py-4">
            <div className="row">
              <div className="col-12 col-md-8 col-lg-6">
                <span className="badge bg-danger mb-2 px-3 py-2 fw-semibold">NOW STREAMING & IN CINEMAS</span>
                <h1 className="display-4 fw-black text-light mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  {featuredMovie.movieName || featuredMovie.title}
                </h1>
                <div className="d-flex align-items-center gap-3 mb-3 text-secondary">
                  <span className="badge bg-warning text-dark fw-bold d-flex align-items-center gap-1">
                    <FaStar size={12} /> {featuredMovie.rating || 8.8} / 10
                  </span>
                  <span>{featuredMovie.runtime || "148 min"}</span>
                  <span>•</span>
                  <span>{featuredMovie.certification || "U/A"}</span>
                  <span>•</span>
                  <span>{(featuredMovie.genres || []).join(", ")}</span>
                </div>
                <p className="lead text-light text-opacity-75 fs-6 mb-4 line-clamp-3">
                  {featuredMovie.description}
                </p>
                <div className="d-flex align-items-center gap-3">
                  <Link
                    to={`/movies/${featuredMovie.movieId || featuredMovie._id}`}
                    className="btn btn-imovies d-flex align-items-center gap-2"
                  >
                    <FaTicketAlt /> Book Tickets
                  </Link>
                  <Link
                    to={`/movies/${featuredMovie.movieId || featuredMovie._id}`}
                    className="btn btn-imovies-outline d-flex align-items-center gap-2"
                  >
                    <FaInfoCircle /> View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Movies Catalog */}
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 className="fw-bold text-light mb-1">Explore Movies</h3>
            <p className="text-secondary small mb-0">Browse current releases and book your favorite seats</p>
          </div>
          <Link to="/shows" className="btn btn-outline-secondary btn-sm text-light">
            View All Shows →
          </Link>
        </div>

        {/* Filter and Search */}
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
        />

        {/* Content */}
        {loading ? (
          <LoadingIndicator message="Fetching latest movies from cinema database..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchMovies} />
        ) : movies.length === 0 ? (
          <div className="text-center py-5 glass-panel rounded-4">
            <h5 className="text-secondary">No movies found matching your filters.</h5>
            <button
              className="btn btn-outline-danger btn-sm mt-3"
              onClick={() => {
                setSearchTerm("");
                setSelectedGenre("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="movie-grid">
            {movies.map((m) => {
              const mId = m.movieId || m._id;
              return (
                <MovieCard
                  key={mId}
                  movie={m}
                  isFavoriteInitial={favorites.includes(mId)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
