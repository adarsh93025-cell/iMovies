import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingService } from "../services/api";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorMessage from "../components/ErrorMessage";
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaBan,
  FaEye,
  FaCheckCircle,
} from "react-icons/fa";

const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.getMyBookings();
      if (res.data?.bookings) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error("Bookings error:", err);
      setError("Failed to load booking history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? Reserved seats will be released.")) {
      return;
    }
    setCancellingId(bookingId);
    try {
      const res = await bookingService.cancel(bookingId);
      if (res.data?.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.bookingId === bookingId ? { ...b, bookingStatus: "cancelled", paymentStatus: "cancelled" } : b
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold text-light mb-1">My Booking History</h2>
        <p className="text-secondary small">View past reservations, print digital e-tickets, or manage bookings</p>
      </div>

      {loading ? (
        <LoadingIndicator message="Loading your tickets..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchBookings} />
      ) : bookings.length === 0 ? (
        <div className="glass-panel text-center py-5 rounded-4">
          <FaTicketAlt size={48} className="text-secondary mb-3" />
          <h5 className="text-light">No bookings found yet.</h5>
          <p className="text-secondary small mb-4">You haven't reserved any cinema tickets yet.</p>
          <Link to="/" className="btn btn-imovies">
            Browse Movies Now
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {bookings.map((b) => {
            const seats = Object.keys(b.ticketsData || {});
            const isCancelled = b.bookingStatus === "cancelled";

            return (
              <div
                key={b._id}
                className={`imovies-card p-4 rounded-4 ${
                  isCancelled ? "opacity-75 border-secondary" : ""
                }`}
              >
                <div className="row align-items-center g-3">
                  <div className="col-12 col-md-4">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span
                        className={`badge ${
                          isCancelled ? "bg-secondary" : "bg-success"
                        }`}
                      >
                        {b.bookingStatus?.toUpperCase()}
                      </span>
                      <span className="text-muted small font-monospace">
                        {b.bookingId}
                      </span>
                    </div>
                    <h5 className="fw-bold text-light mb-1">{b.movieName || "Movie"}</h5>
                    <div className="text-secondary small d-flex align-items-center gap-1">
                      <FaMapMarkerAlt className="text-danger" size={12} /> {b.theatreName}
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="text-secondary small mb-1">Show Schedule</div>
                    <div className="fw-semibold text-light small d-flex align-items-center gap-1 mb-1">
                      <FaCalendarAlt size={12} /> {b.showdate}
                    </div>
                    <div className="text-warning small d-flex align-items-center gap-1">
                      <FaClock size={12} /> {b.showtime}
                    </div>
                  </div>

                  <div className="col-6 col-md-2">
                    <div className="text-secondary small mb-1">Seats ({seats.length})</div>
                    <div className="d-flex flex-wrap gap-1">
                      {seats.map((s) => (
                        <span key={s} className="badge bg-dark border border-secondary text-light">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="text-light fw-bold mt-1">₹{b.amount}</div>
                  </div>

                  <div className="col-12 col-md-3 text-md-end d-flex flex-wrap gap-2 justify-content-md-end">
                    <Link
                      to={`/bookings/${b.bookingId}`}
                      className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                    >
                      <FaEye size={12} /> E-Ticket
                    </Link>
                    {!isCancelled && (
                      <button
                        className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                        disabled={cancellingId === b.bookingId}
                        onClick={() => handleCancelBooking(b.bookingId)}
                      >
                        <FaBan size={12} /> {cancellingId === b.bookingId ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
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

export default BookingHistoryPage;
