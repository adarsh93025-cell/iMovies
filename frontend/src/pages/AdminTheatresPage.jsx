import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { theatreService } from "../services/api";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorMessage from "../components/ErrorMessage";
import { FaPlus, FaTrash, FaArrowLeft, FaMapMarkerAlt, FaTheaterMasks } from "react-icons/fa";

const AdminTheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [theatreName, setTheatreName] = useState("");
  const [theatreId, setTheatreId] = useState("");
  const [location, setLocation] = useState("");
  const [balconySeatPrice, setBalconySeatPrice] = useState(350);
  const [middleSeatPrice, setMiddleSeatPrice] = useState(250);
  const [lowerSeatPrice, setLowerSeatPrice] = useState(150);

  const loadTheatres = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await theatreService.getAll();
      if (res.data?.theatres) setTheatres(res.data.theatres);
    } catch (err) {
      console.error("Load theatres error:", err);
      setError("Failed to load theatres.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheatres();
  }, []);

  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      await theatreService.create({
        theatreName,
        theatreId: theatreId || `TH_${Date.now().toString(36).toUpperCase()}`,
        location,
        balconySeatPrice: Number(balconySeatPrice),
        middleSeatPrice: Number(middleSeatPrice),
        lowerSeatPrice: Number(lowerSeatPrice),
      });

      setShowForm(false);
      setTheatreName("");
      setTheatreId("");
      setLocation("");
      loadTheatres();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create theatre.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm("Are you sure you want to delete this theatre?")) return;
    try {
      await theatreService.delete(id);
      setTheatres((prev) => prev.filter((t) => (t.theatreId || t._id) !== id));
    } catch (err) {
      alert("Failed to delete theatre.");
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
            <h3 className="fw-bold text-light mb-0">Theatre Screens Management</h3>
            <p className="text-secondary small mb-0">Configure multiplexes, auditoriums, and pricing tiers</p>
          </div>
        </div>
        <button
          className="btn btn-warning text-dark btn-sm d-flex align-items-center gap-2 mt-2 mt-sm-0"
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus /> {showForm ? "Cancel" : "Add New Theatre"}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-4 rounded-4 mb-4 border-warning border-opacity-50">
          <h5 className="fw-bold text-light mb-3">Add New Theatre</h5>
          {formError && <div className="alert alert-danger py-2 small">{formError}</div>}
          <form onSubmit={handleCreateTheatre}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Theatre / Cinema Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PVR Director's Cut"
                  className="form-control bg-dark text-light border-secondary"
                  value={theatreName}
                  onChange={(e) => setTheatreName(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Theatre ID / Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. THEATRE_PVR_01"
                  className="form-control bg-dark text-light border-secondary"
                  value={theatreId}
                  onChange={(e) => setTheatreId(e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label text-secondary small">Location / Address</label>
                <input
                  type="text"
                  required
                  placeholder="City, Mall name, Street..."
                  className="form-control bg-dark text-light border-secondary"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-secondary small">Balcony Seat Price (₹)</label>
                <input
                  type="number"
                  required
                  className="form-control bg-dark text-light border-secondary"
                  value={balconySeatPrice}
                  onChange={(e) => setBalconySeatPrice(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-secondary small">Middle Seat Price (₹)</label>
                <input
                  type="number"
                  required
                  className="form-control bg-dark text-light border-secondary"
                  value={middleSeatPrice}
                  onChange={(e) => setMiddleSeatPrice(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-secondary small">Lower Seat Price (₹)</label>
                <input
                  type="number"
                  required
                  className="form-control bg-dark text-light border-secondary"
                  value={lowerSeatPrice}
                  onChange={(e) => setLowerSeatPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3 text-end">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-warning text-dark btn-sm px-4 fw-bold"
              >
                {saving ? "Saving..." : "Create Theatre"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingIndicator message="Loading theatres..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadTheatres} />
      ) : (
        <div className="row g-3">
          {theatres.map((t) => (
            <div key={t.theatreId} className="col-12 col-md-6 col-lg-4">
              <div className="glass-panel p-4 rounded-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-warning text-dark fw-bold font-monospace">
                      {t.theatreId}
                    </span>
                    <button
                      className="btn btn-outline-danger btn-sm p-1 border-0"
                      onClick={() => handleDeleteTheatre(t.theatreId || t._id)}
                      title="Delete Theatre"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                  <h5 className="fw-bold text-light mb-1">{t.theatreName}</h5>
                  <div className="text-secondary small d-flex align-items-center gap-1 mb-3">
                    <FaMapMarkerAlt className="text-danger" size={12} /> {t.location}
                  </div>
                </div>

                <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-50">
                  <div className="text-secondary small mb-1">Pricing Structure:</div>
                  <div className="d-flex justify-content-between small text-light mb-1">
                    <span>Balcony:</span> <strong className="text-warning">₹{t.balconySeatPrice}</strong>
                  </div>
                  <div className="d-flex justify-content-between small text-light mb-1">
                    <span>Middle:</span> <strong className="text-info">₹{t.middleSeatPrice}</strong>
                  </div>
                  <div className="d-flex justify-content-between small text-light">
                    <span>Lower:</span> <strong className="text-success">₹{t.lowerSeatPrice}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTheatresPage;
