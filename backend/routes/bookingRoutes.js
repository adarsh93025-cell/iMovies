const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");
const { fetchUser } = require("../middlewares/fetchUser");

// @route POST /api/bookings
router.post("/", fetchUser, createBooking);

// @route GET /api/bookings
router.get("/", fetchUser, getUserBookings);

// @route GET /api/bookings/:id
router.get("/:id", fetchUser, getBookingById);

// @route PUT /api/bookings/:id/cancel
router.put("/:id/cancel", fetchUser, cancelBooking);

module.exports = router;
