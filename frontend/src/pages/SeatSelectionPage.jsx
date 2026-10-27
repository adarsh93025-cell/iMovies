import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { showService, bookingService, movieService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorMessage from "../components/ErrorMessage";
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaCreditCard,
  FaShieldAlt,
} from "react-icons/fa";

const SeatSelectionPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [movie, setMovie] = useState(null);
  const [theatre, setTheatre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingStep, setBookingStep] = useState("select"); // "select" | "review" | "payment"
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const fetchShowData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await showService.getById(id);
      if (res.data?.show) {
        setShow(res.data.show);
        setTheatre(res.data.theatre);

        // Fetch movie info
        const movieRes = await movieService.getById(res.data.show.movieId);
        if (movieRes.data?.movie) {
          setMovie(movieRes.data.movie);
        }
      }
    } catch (err) {
      console.error("Fetch show error:", err);
      setError("Failed to load show and seat layout.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowData();
  }, [id]);

  if (loading) return <LoadingIndicator message="Loading real-time seat availability..." />;
  if (error || !show) return <div className="container py-5"><ErrorMessage message={error || "Show not found"} onRetry={fetchShowData} /></div>;

  const tickets = show.tickets || {};
  const balconyPrice = theatre?.balconySeatPrice || 350;
  const middlePrice = theatre?.middleSeatPrice || 250;
  const lowerPrice = theatre?.lowerSeatPrice || 150;

  // Determine seat tier and price
  const getSeatInfo = (seatId) => {
    const row = seatId.charAt(0).toUpperCase();
    if (["A", "B"].includes(row)) return { tier: "Balcony", price: balconyPrice };
    if (["C", "D", "E"].includes(row)) return { tier: "Middle", price: middlePrice };
    return { tier: "Lower", price: lowerPrice };
  };

  const handleSeatClick = (seatId) => {
    const seat = tickets[seatId];
    if (seat && seat.isBooked) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 10) {
        alert("You can select up to 10 seats per booking.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Compute pricing
  const subtotal = selectedSeats.reduce((acc, seatId) => acc + getSeatInfo(seatId).price, 0);
  const convenienceFee = selectedSeats.length > 0 ? Math.round(subtotal * 0.05) : 0;
  const totalAmount = subtotal + convenienceFee;

  const handleProceedToReview = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/shows/${id}/seats` } } });
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }
    setBookingStep("review");
  };

  const handleConfirmAndPay = async () => {
    setSubmitting(true);
    setBookingError(null);

    try {
      const res = await bookingService.create({
        showId: show.showId,
        seats: selectedSeats,
        userEmail: user?.email,
      });

      if (res.data?.success && res.data.booking) {
        navigate(`/bookings/${res.data.booking.bookingId}`, {
          state: { newlyBooked: true, booking: res.data.booking },
        });
      }
    } catch (err) {
      console.error("Booking error:", err);
      const msg = err.response?.data?.error || "Booking failed. Please try again.";
      setBookingError(msg);
      // Refresh seat layout if double-booking occurred
      if (err.response?.status === 409) {
        fetchShowData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render rows of seats
  const renderRow = (rowLetter, seatCount) => {
    const seats = [];
    for (let num = 1; num <= seatCount; num++) {
      const seatId = `${rowLetter}${num}`;
      const isBooked = tickets[seatId]?.isBooked;
      const isSelected = selectedSeats.includes(seatId);

      let statusClass = "seat-available";
      if (isBooked) statusClass = "seat-booked";
      else if (isSelected) statusClass = "seat-selected";

      seats.push(
        <button
          key={seatId}
          type="button"
          disabled={isBooked}
          className={`seat-btn ${statusClass}`}
          onClick={() => handleSeatClick(seatId)}
          title={`${seatId} (${getSeatInfo(seatId).tier} - ₹${getSeatInfo(seatId).price})`}
        >
          {num}
        </button>
      );
    }
    return (
      <div key={rowLetter} className="d-flex align-items-center justify-content-center gap-2 mb-2">
        <span className="text-secondary small fw-bold" style={{ width: "20px" }}>
          {rowLetter}
        </span>
        <div className="d-flex gap-2">{seats}</div>
      </div>
    );
  };

  return (
    <div className="container py-5">
      {/* Header Info */}
      <div className="glass-panel p-4 rounded-4 mb-4">
        <div className="row align-items-center g-3">
          <div className="col-12 col-md-8">
            <span className="badge bg-danger mb-2">SEAT RESERVATION</span>
            <h2 className="fw-bold text-light mb-1">
              {movie?.movieName || movie?.title || show.movieId}
            </h2>
            <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
              <span className="d-flex align-items-center gap-1">
                <FaMapMarkerAlt className="text-danger" /> {show.theatreName}
              </span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1">
                <FaCalendarAlt /> {show.showdate}
              </span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1 text-warning fw-bold">
                <FaClock /> {show.showtime}
              </span>
            </div>
          </div>
          <div className="col-12 col-md-4 text-md-end">
            <span className="badge bg-secondary p-2">Show ID: {show.showId}</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Seat Grid Layout Column */}
        <div className="col-12 col-lg-8">
          <div className="glass-panel p-4 rounded-4 text-center">
            {/* Cinema Screen Curve */}
            <div className="cinema-screen"></div>
            <p className="text-muted small mb-4" style={{ letterSpacing: "3px" }}>
              ALL EYES THIS WAY — CINEMA SCREEN
            </p>

            {/* Seat Legend */}
            <div className="d-flex justify-content-center gap-4 mb-4 small text-secondary">
              <div className="d-flex align-items-center gap-2">
                <span className="seat-btn seat-available" style={{ width: "20px", height: "20px" }}></span>
                <span>Available</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="seat-btn seat-selected" style={{ width: "20px", height: "20px" }}></span>
                <span>Selected</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="seat-btn seat-booked" style={{ width: "20px", height: "20px" }}></span>
                <span>Booked</span>
              </div>
            </div>

            {/* Balcony Tier */}
            <div className="mb-4">
              <div className="badge bg-dark border border-secondary text-light px-3 py-1 mb-3">
                Balcony (Executive Class) — ₹{balconyPrice}
              </div>
              {renderRow("A", 10)}
              {renderRow("B", 10)}
            </div>

            {/* Middle Tier */}
            <div className="mb-4">
              <div className="badge bg-dark border border-secondary text-light px-3 py-1 mb-3">
                Middle (Prime Class) — ₹{middlePrice}
              </div>
              {renderRow("C", 12)}
              {renderRow("D", 12)}
              {renderRow("E", 12)}
            </div>

            {/* Lower Tier */}
            <div className="mb-3">
              <div className="badge bg-dark border border-secondary text-light px-3 py-1 mb-3">
                Lower (Classic Tier) — ₹{lowerPrice}
              </div>
              {renderRow("F", 14)}
              {renderRow("G", 14)}
            </div>
          </div>
        </div>

        {/* Booking Summary Sidebar Column */}
        <div className="col-12 col-lg-4">
          <div className="glass-panel p-4 rounded-4 sticky-top" style={{ top: "90px" }}>
            <h5 className="fw-bold text-light mb-3 border-bottom border-secondary pb-2 d-flex align-items-center gap-2">
              <FaTicketAlt className="text-danger" /> Booking Summary
            </h5>

            {bookingError && (
              <div className="alert alert-danger py-2 small mb-3">
                {bookingError}
              </div>
            )}

            <div className="mb-3">
              <div className="text-secondary small">Selected Seats:</div>
              {selectedSeats.length === 0 ? (
                <div className="text-muted small fst-italic">No seats selected yet. Click any seat on the grid to choose.</div>
              ) : (
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {selectedSeats.map((seatId) => (
                    <span key={seatId} className="badge bg-success text-dark fw-bold px-2 py-1">
                      {seatId} (₹{getSeatInfo(seatId).price})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-top border-secondary border-opacity-50 pt-3 mb-3">
              <div className="d-flex justify-content-between text-secondary small mb-1">
                <span>Tickets ({selectedSeats.length}):</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary small mb-2">
                <span>Convenience & GST (5%):</span>
                <span>₹{convenienceFee}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold text-light fs-5 border-top border-secondary border-opacity-25 pt-2">
                <span>Total Amount:</span>
                <span className="text-danger">₹{totalAmount}</span>
              </div>
            </div>

            {/* Step Switcher */}
            {bookingStep === "select" ? (
              <button
                type="button"
                disabled={selectedSeats.length === 0}
                className="btn btn-imovies w-100 py-2 fw-bold"
                onClick={handleProceedToReview}
              >
                Proceed to Checkout ({selectedSeats.length} Seats)
              </button>
            ) : (
              <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-50">
                <div className="small fw-semibold text-warning mb-2 d-flex align-items-center gap-1">
                  <FaShieldAlt /> Test Payment Mode Active
                </div>
                <p className="text-muted small mb-3" style={{ fontSize: "11px" }}>
                  Card/UPI simulation sandbox active. Real-time atomic verification will book your tickets instantly upon clicking confirm.
                </p>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm flex-grow-1"
                    onClick={() => setBookingStep("select")}
                    disabled={submitting}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1"
                    onClick={handleConfirmAndPay}
                    disabled={submitting}
                  >
                    <FaCheckCircle /> {submitting ? "Processing..." : `Pay ₹${totalAmount}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
