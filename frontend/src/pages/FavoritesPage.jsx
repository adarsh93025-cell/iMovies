import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { favoriteService } from "../services/api";
import MovieCard from "../components/MovieCard";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorMessage from "../components/ErrorMessage";
import { FaHeart } from "react-icons/fa";

const FavoritesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await favoriteService.getAll();
      if (res.data?.movies) {
        setMovies(res.data.movies);
      }
    } catch (err) {
      console.error("Favorites error:", err);
      setError("Failed to load your watchlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (movieId, isFav) => {
    if (!isFav) {
      setMovies((prev) => prev.filter((m) => (m.movieId || m._id) !== movieId));
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
          <FaHeart className="text-danger" /> My Watchlist
        </h2>
        <p className="text-secondary small">Movies you have bookmarked for future watching</p>
      </div>

      {loading ? (
        <LoadingIndicator message="Loading your watchlist..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchFavorites} />
      ) : movies.length === 0 ? (
        <div className="glass-panel text-center py-5 rounded-4">
          <FaHeart size={48} className="text-secondary mb-3 opacity-50" />
          <h5 className="text-light">Your watchlist is empty.</h5>
          <p className="text-secondary small mb-4">Click the heart icon on any movie card to bookmark it.</p>
          <Link to="/" className="btn btn-imovies">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="movie-grid">
          {movies.map((m) => {
            const mId = m.movieId || m._id;
            return (
              <MovieCard
                key={mId}
                movie={m}
                isFavoriteInitial={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
