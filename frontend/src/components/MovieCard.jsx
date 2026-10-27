import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaHeart, FaTicketAlt, FaClock } from "react-icons/fa";
import { favoriteService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const MovieCard = ({ movie, isFavoriteInitial = false, onFavoriteToggle }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [loadingFav, setLoadingFav] = useState(false);

  const movieId = movie.movieId || movie._id;
  const movieName = movie.movieName || movie.title || "Movie";
  const poster = movie.media || movie.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
  const genres = Array.isArray(movie.genres) ? movie.genres : movie.genre ? [movie.genre] : ["Drama"];
  const rating = movie.rating || 8.5;

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert("Please login to add to your watchlist!");
      return;
    }

    setLoadingFav(true);
    try {
      if (isFavorite) {
        await favoriteService.remove(movieId);
        setIsFavorite(false);
        if (onFavoriteToggle) onFavoriteToggle(movieId, false);
      } else {
        await favoriteService.add(movieId);
        setIsFavorite(true);
        if (onFavoriteToggle) onFavoriteToggle(movieId, true);
      }
    } catch (err) {
      console.error("Favorite error:", err);
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <div className="imovies-card h-100 d-flex flex-column position-relative">
      {/* Poster */}
      <Link to={`/movies/${movieId}`} className="text-decoration-none">
        <div className="poster-wrapper position-relative">
          <img src={poster} alt={movieName} className="poster-img" loading="lazy" />
          <div className="poster-overlay">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="badge bg-warning text-dark fw-bold d-flex align-items-center gap-1">
                <FaStar size={12} /> {rating}
              </span>
              <span className="badge bg-dark bg-opacity-75 text-light border border-secondary">
                {movie.certification || "U/A"}
              </span>
            </div>
          </div>

          {/* Watchlist Toggle */}
          <button
            onClick={handleFavoriteClick}
            disabled={loadingFav}
            className="btn btn-dark btn-sm rounded-circle position-absolute top-0 end-0 m-2 border-0 bg-dark bg-opacity-75 p-2"
            title={isFavorite ? "Remove from watchlist" : "Add to watchlist"}
            style={{ zIndex: 10 }}
          >
            <FaHeart className={isFavorite ? "text-danger" : "text-secondary"} size={16} />
          </button>
        </div>
      </Link>

      {/* Info Body */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        <Link to={`/movies/${movieId}`} className="text-decoration-none text-light">
          <h6 className="fw-bold mb-1 text-truncate" title={movieName}>
            {movieName}
          </h6>
        </Link>

        <div className="d-flex flex-wrap gap-1 mb-2">
          {genres.slice(0, 2).map((g, idx) => (
            <span key={idx} className="badge bg-secondary bg-opacity-50 text-light small" style={{ fontSize: "10px" }}>
              {g}
            </span>
          ))}
          {movie.runtime && (
            <span className="text-muted small ms-auto d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
              <FaClock size={10} /> {movie.runtime}
            </span>
          )}
        </div>

        <p className="text-secondary small text-truncate-2 mb-3 flex-grow-1" style={{ fontSize: "12px", minHeight: "36px" }}>
          {movie.description}
        </p>

        {/* Action Button */}
        <Link to={`/movies/${movieId}`} className="btn btn-imovies w-100 btn-sm d-flex align-items-center justify-content-center gap-2 mt-auto">
          <FaTicketAlt size={12} /> Book Tickets
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;
