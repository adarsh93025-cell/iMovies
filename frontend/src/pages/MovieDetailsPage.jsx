import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { movieService, showService, reviewService, favoriteService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorMessage from "../components/ErrorMessage";
import {
  FaStar,
  FaCalendarAlt,
  FaClock,
  FaHeart,
  FaTicketAlt,
  FaCommentDots,
  FaTrash,
  FaFilm,
} from "react-icons/fa";

const MovieDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form state
  const [ratingInput, setRatingInput] = useState(9);
  const [reviewInput, setReviewInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Watchlist state
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchMovieDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [movieRes, showsRes, reviewRes] = await Promise.all([
        movieService.getById(id),
        showService.getAll({ movieId: id }),
        reviewService.getByMovieId(id),
      ]);

      if (movieRes.data?.movie) {
        setMovie(movieRes.data.movie);
      }
      if (showsRes.data?.shows) {
        setShows(showsRes.data.shows);
      }
      if (reviewRes.data?.reviews) {
        setReviews(reviewRes.data.reviews);
        setAvgRating(reviewRes.data.averageRating);
      }
    } catch (err) {
      console.error("Movie details error:", err);
      setError("Failed to load movie details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated) {
      favoriteService.getAll().then((res) => {
        if (res.data?.favorites) {
          const hasFav = res.data.favorites.some((f) => f.movieId === id);
          setIsFavorite(hasFav);
        }
      });
    }
  }, [isAuthenticated, id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      if (isFavorite) {
        await favoriteService.remove(id);
        setIsFavorite(false);
      } else {
        await favoriteService.add(id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Watchlist error:", err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!reviewInput.trim()) return;

    setSubmittingReview(true);
    setReviewError(null);
    try {
      await reviewService.add({
        movieId: id,
        rating: ratingInput,
        review: reviewInput,
      });
      setReviewInput("");
      // Refresh reviews
      const reviewRes = await reviewService.getByMovieId(id);
      setReviews(reviewRes.data.reviews);
      setAvgRating(reviewRes.data.averageRating);
    } catch (err) {
      setReviewError(err.response?.data?.error || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await reviewService.delete(reviewId);
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  if (loading) return <LoadingIndicator message="Loading movie details and shows..." />;
  if (error || !movie) return <div className="container py-5"><ErrorMessage message={error || "Movie not found"} onRetry={fetchMovieDetails} /></div>;

  const movieName = movie.movieName || movie.title;
  const poster = movie.media || movie.image;
  const backdrop = movie.backdrop || poster;
  const genres = Array.isArray(movie.genres) ? movie.genres : movie.genre ? [movie.genre] : ["Drama"];

  // Group shows by Date
  const showsByDate = shows.reduce((acc, show) => {
    const d = show.showdate;
    if (!acc[d]) acc[d] = [];
    acc[d].push(show);
    return acc;
  }, {});

  return (
    <div className="movie-details-page pb-5">
      {/* Backdrop Header */}
      <div
        className="position-relative py-5"
        style={{
          backgroundImage: `linear-gradient(to top, #0a0c13 15%, rgba(10, 12, 19, 0.8) 60%, rgba(10, 12, 19, 0.95) 100%), url(${backdrop})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "420px",
        }}
      >
        <div className="container py-4">
          <div className="row g-4 align-items-center">
            {/* Poster */}
            <div className="col-12 col-md-4 col-lg-3 text-center text-md-start">
              <img
                src={poster}
                alt={movieName}
                className="img-fluid rounded-4 shadow-lg border border-secondary"
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            </div>

            {/* Movie Info */}
            <div className="col-12 col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-warning text-dark fw-bold d-flex align-items-center gap-1">
                  <FaStar /> {avgRating || movie.rating || 8.5} / 10
                </span>
                <span className="badge bg-dark border border-secondary text-light">
                  {movie.certification || "U/A"}
                </span>
                <span className="badge bg-dark border border-secondary text-secondary">
                  {movie.language || "English"}
                </span>
              </div>

              <h1 className="display-5 fw-bold text-light mb-2">{movieName}</h1>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {genres.map((g, idx) => (
                  <span key={idx} className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25">
                    {g}
                  </span>
                ))}
                {movie.runtime && (
                  <span className="text-secondary small ms-2 d-flex align-items-center gap-1">
                    <FaClock /> {movie.runtime}
                  </span>
                )}
                {movie.releaseDate && (
                  <span className="text-secondary small ms-2 d-flex align-items-center gap-1">
                    <FaCalendarAlt /> Released: {new Date(movie.releaseDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <p className="lead text-light text-opacity-80 fs-6 mb-4" style={{ maxWidth: "750px" }}>
                {movie.description}
              </p>

              <div className="d-flex align-items-center gap-3">
                <a href="#shows-section" className="btn btn-imovies d-flex align-items-center gap-2">
                  <FaTicketAlt /> View Showtime Schedules
                </a>
                <button
                  onClick={handleToggleFavorite}
                  className={`btn ${isFavorite ? "btn-danger" : "btn-imovies-outline"} d-flex align-items-center gap-2`}
                >
                  <FaHeart /> {isFavorite ? "In Watchlist" : "Add to Watchlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-5" id="shows-section">
        {/* Shows Section */}
        <div className="glass-panel p-4 rounded-4 mb-5 shadow">
          <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary pb-3">
            <h4 className="fw-bold mb-0 text-light d-flex align-items-center gap-2">
              <FaTicketAlt className="text-danger" /> Available Shows & Theatres
            </h4>
            <span className="badge bg-secondary">{shows.length} Shows Found</span>
          </div>

          {shows.length === 0 ? (
            <div className="text-center py-4 text-secondary">
              <p>No active shows currently scheduled for this movie.</p>
              <Link to="/shows" className="btn btn-outline-danger btn-sm">
                Browse All Cinema Shows
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {Object.keys(showsByDate).map((date) => (
                <div key={date} className="p-3 bg-dark rounded-3 border border-secondary border-opacity-50">
                  <div className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
                    <FaCalendarAlt /> Show Date: {date}
                  </div>
                  <div className="row g-3">
                    {showsByDate[date].map((s) => (
                      <div key={s.showId} className="col-12 col-md-6 col-lg-4">
                        <div className="p-3 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="fw-semibold text-light">{s.theatreName}</div>
                            <div className="text-muted small mb-2">Show ID: {s.showId}</div>
                          </div>
                          <Link
                            to={`/shows/${s.showId}/seats`}
                            className="btn btn-imovies btn-sm w-100 d-flex align-items-center justify-content-center gap-2 mt-2"
                          >
                            <FaClock size={12} /> {s.showtime} — Book Seats
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="glass-panel p-4 rounded-4 shadow">
          <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary pb-3">
            <h4 className="fw-bold mb-0 text-light d-flex align-items-center gap-2">
              <FaCommentDots className="text-warning" /> Customer Reviews & Ratings
            </h4>
            <span className="badge bg-warning text-dark fw-bold">
              ★ {avgRating ? `${avgRating} / 10` : "No ratings yet"}
            </span>
          </div>

          {/* Review submission form */}
          <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-50 mb-4">
            <h6 className="fw-bold text-light mb-3">Write a Movie Review</h6>
            {reviewError && <div className="alert alert-danger py-2 small">{reviewError}</div>}
            <form onSubmit={handleReviewSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                  <label className="form-label text-secondary small">
                    Your Rating: <strong className="text-warning">{ratingInput} / 10</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    className="form-range"
                    value={ratingInput}
                    onChange={(e) => setRatingInput(Number(e.target.value))}
                  />
                </div>
                <div className="col-12 col-md-8">
                  <label className="form-label text-secondary small">Your Review</label>
                  <textarea
                    rows="2"
                    required
                    placeholder="Share your thoughts about the story, performances, and cinematography..."
                    className="form-control bg-dark text-light border-secondary"
                    value={reviewInput}
                    onChange={(e) => setReviewInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="text-end">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-imovies btn-sm px-4"
                >
                  {submittingReview ? "Submitting..." : "Post Review"}
                </button>
              </div>
            </form>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-secondary text-center py-3">No reviews submitted yet. Be the first to review this movie!</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {reviews.map((r) => (
                <div key={r._id} className="p-3 rounded bg-dark border border-secondary border-opacity-25">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-semibold text-light">{r.userName || r.userEmail}</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-warning text-dark fw-bold">
                        ★ {r.rating} / 10
                      </span>
                      {(user?.email === r.userEmail || user?.role === "admin") && (
                        <button
                          className="btn btn-outline-danger btn-sm p-1 border-0"
                          onClick={() => handleDeleteReview(r._id)}
                          title="Delete Review"
                        >
                          <FaTrash size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-secondary small mb-1">{r.review}</p>
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
