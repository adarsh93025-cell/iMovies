const Booking = require("../models/bookingModel");

const cleanupOldBookings = async () => {
  try {
    const expiredCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    // Cancel or clean pending bookings older than cutoff
    const result = await Booking.updateMany(
      {
        paymentStatus: "pending",
        bookingStatus: "confirmed",
        createdAt: { $lt: expiredCutoff },
      },
      {
        $set: {
          bookingStatus: "cancelled",
          paymentStatus: "failed",
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`🧹 Cleaned up ${result.modifiedCount} expired pending bookings.`);
    }
  } catch (err) {
    console.error("Cleanup service error:", err.message);
  }
};

module.exports = { cleanupOldBookings };
