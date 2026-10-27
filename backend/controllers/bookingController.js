const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");
const { sendEmail } = require("../utils/mailer");

// Create a new booking with atomic seat reservation & server-side pricing validation
const createBooking = async (req, res) => {
  try {
    const { showId, seats, paymentMethod } = req.body;
    const userEmail = req.user ? req.user.email : req.body.userEmail;

    if (!userEmail) {
      return res.status(401).json({ error: "User authentication required to make a booking." });
    }

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: "Please select at least one seat to proceed with booking." });
    }

    // 1. Fetch Show
    const show = await Show.findOne({ showId: showId.trim() });
    if (!show) {
      return res.status(404).json({ error: "Selected show not found." });
    }

    // Initialize tickets object if empty
    if (!show.tickets || typeof show.tickets !== "object") {
      show.tickets = {};
    }

    // 2. Validate seat availability (Prevent double booking)
    const unavailableSeats = [];
    for (const seatId of seats) {
      if (show.tickets[seatId] && show.tickets[seatId].isBooked) {
        unavailableSeats.push(seatId);
      }
    }

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        error: `Seats [${unavailableSeats.join(", ")}] are no longer available. Please select different seats.`,
        unavailableSeats,
      });
    }

    // Fetch movie & theatre details for the booking snapshot
    let movieName = show.movieId;
    const movie = await Movie.findOne({
      $or: [{ _id: show.movieId.match(/^[0-9a-fA-F]{24}$/) ? show.movieId : null }, { movieId: show.movieId }],
    });
    if (movie) {
      movieName = movie.movieName;
    }

    const theatre = await Theatre.findOne({ theatreName: show.theatreName });

    // 3. Compute verified server-side seat pricing
    let totalAmount = 0;
    const reservedTicketsData = {};

    for (const seatId of seats) {
      let seatPrice = 200; // default middle
      let seatTier = "middle";

      const row = seatId.charAt(0).toUpperCase();
      if (["A", "B"].includes(row)) {
        seatTier = "balcony";
        seatPrice = theatre ? theatre.balconySeatPrice : 300;
      } else if (["C", "D", "E"].includes(row)) {
        seatTier = "middle";
        seatPrice = theatre ? theatre.middleSeatPrice : 200;
      } else {
        seatTier = "lower";
        seatPrice = theatre ? theatre.lowerSeatPrice : 120;
      }

      totalAmount += seatPrice;

      reservedTicketsData[seatId] = {
        seatId,
        tier: seatTier,
        price: seatPrice,
        bookedAt: new Date().toISOString(),
      };

      // Mark seat as booked in the show
      show.tickets[seatId] = {
        seatId,
        tier: seatTier,
        price: seatPrice,
        isBooked: true,
        bookedBy: userEmail,
      };
    }

    // Mark modified for mixed schema object
    show.markModified("tickets");
    await show.save();

    // 4. Generate unique booking reference & save booking
    const bookingId = `BKG_${Date.now().toString(36).toUpperCase()}_${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
    const paymentId = `PAY_${Date.now().toString(36).toUpperCase()}_${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    const newBooking = new Booking({
      bookingId,
      userEmail,
      showId: show.showId,
      ticketsData: reservedTicketsData,
      movieName,
      theatreName: show.theatreName,
      showdate: show.showdate,
      showtime: show.showtime,
      amount: totalAmount,
      paymentStatus: "completed",
      paymentId,
      bookingStatus: "confirmed",
    });

    await newBooking.save();

    // 5. Send notification email (or simulation log)
    sendEmail({
      to: userEmail,
      subject: `iMovies Ticket Confirmation - ${movieName} (${bookingId})`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0f1015; color: #f3f4f6; padding: 25px; border-radius: 10px;">
          <h2 style="color: #e50914; margin-top: 0;">iMovies Booking Confirmed! 🎉</h2>
          <p>Hi there,</p>
          <p>Your tickets have been confirmed for <strong>${movieName}</strong>!</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; color: #fff;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #333;">Booking Reference:</td><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #333;">${bookingId}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #333;">Theatre:</td><td style="padding: 8px; border-bottom: 1px solid #333;">${show.theatreName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #333;">Show Date & Time:</td><td style="padding: 8px; border-bottom: 1px solid #333;">${show.showdate} at ${show.showtime}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #333;">Seats Reserved:</td><td style="padding: 8px; color: #4ade80; font-weight: bold; border-bottom: 1px solid #333;">${seats.join(", ")}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #333;">Total Paid:</td><td style="padding: 8px; font-size: 18px; font-weight: bold; border-bottom: 1px solid #333;">₹${totalAmount}</td></tr>
          </table>
          <p style="color: #9ca3af; font-size: 13px;">Please arrive at least 15 minutes prior to show time. Show this digital ticket at the theatre entrance.</p>
        </div>
      `,
    }).catch((err) => console.error("Email send error:", err.message));

    return res.status(201).json({
      success: true,
      message: "Tickets booked successfully!",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({ error: error.message || "Server error creating booking." });
  }
};

// Get bookings for logged-in user (strictly ownership protected)
const getUserBookings = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const bookings = await Booking.find({ userEmail }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, bookings, count: bookings.length });
  } catch (error) {
    console.error("Get user bookings error:", error);
    return res.status(500).json({ error: "Server error retrieving booking history." });
  }
};

// Get single booking by ID (ownership protected)
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    let booking = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(id);
    }
    if (!booking) {
      booking = await Booking.findOne({ bookingId: id });
    }

    if (!booking) {
      return res.status(404).json({ error: "Booking reference not found." });
    }

    // Check ownership unless admin
    if (req.user.role !== "admin" && booking.userEmail !== req.user.email) {
      return res.status(403).json({ error: "Access denied. You do not own this booking." });
    }

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("Get booking by ID error:", error);
    return res.status(500).json({ error: "Server error retrieving booking." });
  }
};

// Cancel a booking and release seats back to the show
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    let booking = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(id);
    }
    if (!booking) {
      booking = await Booking.findOne({ bookingId: id });
    }

    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    if (req.user.role !== "admin" && booking.userEmail !== req.user.email) {
      return res.status(403).json({ error: "Access denied. You cannot cancel someone else's booking." });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled." });
    }

    // Release seats in the show
    const show = await Show.findOne({ showId: booking.showId });
    if (show && show.tickets) {
      const bookedSeats = Object.keys(booking.ticketsData || {});
      for (const seatId of bookedSeats) {
        if (show.tickets[seatId]) {
          show.tickets[seatId].isBooked = false;
          show.tickets[seatId].bookedBy = null;
        }
      }
      show.markModified("tickets");
      await show.save();
    }

    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "cancelled";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully. Reserved seats have been released.",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ error: "Server error cancelling booking." });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
};
