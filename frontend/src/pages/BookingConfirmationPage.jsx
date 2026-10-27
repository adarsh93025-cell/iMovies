import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { bookingService } from "../services/api";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorMessage from "../components/ErrorMessage";
import {
  FaCheckCircle,
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPrint,
  FaBarcode,
  FaArrowLeft,
} from "react-icons/fa";

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!booking) {
      bookingService
        .getById(id)
        .then((res) => {
          if (res.data?.booking) setBooking(res.data.booking);
        })
        .catch((err) => {
          console.error("Booking load error:", err);
          setError("Failed to load booking details.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, booking]);

  if (loading) return <LoadingIndicator message="Retrieving your digital ticket..." />;
  if (error || !booking) return <div className="container py-5"><ErrorMessage message={error || "Booking not found"} /></div>;

  const seats = Object.keys(booking.ticketsData || {});

  return (
    <div className="container py-5" style={{ maxWidth: "680px" }}>
      {/* Top Banner */}
      <div className="text-center mb-4">
        <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-2">
          <FaCheckCircle size={48} />
        </div>
        <h2 className="fw-bold text-light mb-1">Booking Confirmed!</h2>
        <p className="text-secondary small">
          An email confirmation has been dispatched to <strong>{booking.userEmail}</strong>
        </p>
      </div>

      {/* Ticket Stub Card */}
      <div className="ticket-stub shadow-lg mb-4 text-light">
        <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-3">
          <div>
            <span className="badge bg-danger mb-1">OFFICIAL E-TICKET</span>
            <h4 className="fw-bold mb-0 text-light">{booking.movieName || "Movie"}</h4>
          </div>
          <div className="text-end">
            <div className="text-muted small">REF ID:</div>
            <div className="fw-mono text-warning fw-bold">{booking.bookingId}</div>
          </div>
        </div>

        <div className="row g-3 py-2 border-bottom border-secondary mb-3">
          <div className="col-6">
            <div className="text-secondary small d-flex align-items-center gap-1 mb-1">
              <FaMapMarkerAlt className="text-danger" /> Theatre
            </div>
            <div className="fw-semibold">{booking.theatreName}</div>
          </div>
          <div className="col-6">
            <div className="text-secondary small d-flex align-items-center gap-1 mb-1">
              <FaCalendarAlt /> Date & Time
            </div>
            <div className="fw-semibold">
              {booking.showdate} • <span className="text-warning">{booking.showtime}</span>
            </div>
          </div>
        </div>

        <div className="row g-3 py-2 border-bottom border-secondary mb-3">
          <div className="col-6">
            <div className="text-secondary small mb-1">Seats Reserved ({seats.length})</div>
            <div className="d-flex flex-wrap gap-1">
              {seats.map((s) => (
                <span key={s} className="badge bg-success text-dark fw-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="col-6">
            <div className="text-secondary small mb-1">Payment Status</div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success">{booking.paymentStatus?.toUpperCase()}</span>
              <span className="text-light fw-bold fs-6">₹{booking.amount}</span>
            </div>
            <small className="text-muted" style={{ fontSize: "10px" }}>
              Txn: {booking.paymentId}
            </small>
          </div>
        </div>

        {/* Barcode representation */}
        <div className="text-center py-2 text-secondary">
          <FaBarcode size={56} className="text-light text-opacity-50" />
          <div className="small font-monospace" style={{ letterSpacing: "5px" }}>
            {booking.bookingId}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <button
          className="btn btn-imovies-outline d-flex align-items-center justify-content-center gap-2"
          onClick={() => window.print()}
        >
          <FaPrint /> Print / Save Ticket
        </button>
        <Link
          to="/bookings"
          className="btn btn-imovies d-flex align-items-center justify-content-center gap-2"
        >
          <FaTicketAlt /> View All My Bookings
        </Link>
        <Link
          to="/"
          className="btn btn-dark border-secondary d-flex align-items-center justify-content-center gap-2"
        >
          <FaArrowLeft /> Home
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
