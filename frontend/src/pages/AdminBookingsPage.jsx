import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService, bookingService } from "../services/api";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorMessage from "../components/ErrorMessage";
import { FaArrowLeft, FaSearch, FaBan, FaCheckCircle, FaTicketAlt } from "react-icons/fa";

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAllBookings();
      if (res.data?.bookings) setBookings(res.data.bookings);
    } catch (err) {
      console.error("Load bookings error:", err);
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${bookingId}? Reserved seats will be freed.`)) {
      return;
    }
    try {
      await bookingService.cancel(bookingId);
      loadBookings();
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  const filtered = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      b.bookingId?.toLowerCase().includes(term) ||
      b.userEmail?.toLowerCase().includes(term) ||
      b.movieName?.toLowerCase().includes(term);

    const matchStatus = statusFilter === "all" || b.bookingStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered
    .filter((b) => b.bookingStatus === "confirmed")
    .reduce((acc, b) => acc + (b.amount || 0), 0);

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 border-bottom border-secondary pb-3">
        <div className="d-flex align-items-center gap-3">
          <Link to="/admin" className="btn btn-outline-secondary btn-sm">
            <FaArrowLeft />
          </Link>
          <div>
            <h3 className="fw-bold text-light mb-0">Bookings & Revenue Audit</h3>
            <p className="text-secondary small mb-0">Inspect real-time ticket transactions and cancellations</p>
          </div>
        </div>
        <div className="text-end">
          <span className="text-secondary small">Total Verified Filtered Revenue:</span>
          <div className="h4 fw-bold text-success mb-0">₹{totalRevenue}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-3 rounded-4 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-7">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Search by Booking ID, User Email, or Movie..."
                className="form-control bg-dark text-light border-secondary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-5 d-flex gap-2 justify-content-md-end">
            {["all", "confirmed", "cancelled"].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${
                  statusFilter === st ? "btn-light fw-bold" : "btn-dark text-secondary border-secondary"
                }`}
                onClick={() => setStatusFilter(st)}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingIndicator message="Loading bookings audit..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadBookings} />
      ) : filtered.length === 0 ? (
        <div className="glass-panel text-center py-5 rounded-4">
          <p className="text-secondary">No booking records found matching your filters.</p>
        </div>
      ) : (
        <div className="glass-panel p-3 rounded-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="text-secondary small">
                  <th>Reference</th>
                  <th>Customer Email</th>
                  <th>Movie & Theatre</th>
                  <th>Showtime</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const seats = Object.keys(b.ticketsData || {});
                  const isConfirmed = b.bookingStatus === "confirmed";

                  return (
                    <tr key={b._id}>
                      <td className="font-monospace small text-warning fw-bold">{b.bookingId}</td>
                      <td className="small text-light">{b.userEmail}</td>
                      <td>
                        <div className="fw-semibold text-light">{b.movieName || "Movie"}</div>
                        <small className="text-muted">{b.theatreName}</small>
                      </td>
                      <td className="small text-secondary">
                        {b.showdate} <br />
                        <span className="text-light">{b.showtime}</span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {seats.map((s) => (
                            <span key={s} className="badge bg-secondary" style={{ fontSize: "10px" }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="fw-bold text-light">₹{b.amount}</td>
                      <td>
                        <span className={`badge ${isConfirmed ? "bg-success" : "bg-danger"}`}>
                          {b.bookingStatus?.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-end">
                        {isConfirmed && (
                          <button
                            className="btn btn-outline-danger btn-sm p-1"
                            onClick={() => handleCancelBooking(b.bookingId)}
                            title="Cancel Booking"
                          >
                            <FaBan size={12} />
                          </button>
                        )}
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

export default AdminBookingsPage;
