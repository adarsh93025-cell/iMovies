const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModel");
const { fetchUser } = require("../middlewares/fetchUser");

// @route GET /api/notifications
// Generates live notifications from user's bookings and activity
router.get("/", fetchUser, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const bookings = await Booking.find({ userEmail }).sort({ createdAt: -1 }).limit(10);

    const notifications = bookings.map((b) => {
      if (b.bookingStatus === "confirmed") {
        return {
          id: b._id,
          title: "Booking Confirmed 🎉",
          message: `Your booking for ${b.movieName || "Movie"} on ${b.showdate} (${b.showtime}) is confirmed!`,
          type: "success",
          date: b.createdAt,
          bookingId: b.bookingId,
        };
      } else {
        return {
          id: b._id,
          title: "Booking Cancelled",
          message: `Booking ${b.bookingId} for ${b.movieName || "Movie"} has been cancelled.`,
          type: "warning",
          date: b.updatedAt,
          bookingId: b.bookingId,
        };
      }
    });

    return res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error("Get notifications error:", err);
    return res.status(500).json({ error: "Server error retrieving notifications." });
  }
});

module.exports = router;
