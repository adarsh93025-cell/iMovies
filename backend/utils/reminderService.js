const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");
const { sendEmail } = require("./mailer");

const sendReminderEmails = async () => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Find shows scheduled for today
    const upcomingShows = await Show.find({ showdate: todayStr });
    if (!upcomingShows || upcomingShows.length === 0) {
      return;
    }

    const showIds = upcomingShows.map((s) => s.showId);
    const bookings = await Booking.find({
      showId: { $in: showIds },
      bookingStatus: "confirmed",
    });

    for (const booking of bookings) {
      const show = upcomingShows.find((s) => s.showId === booking.showId);
      if (show) {
        await sendEmail({
          to: booking.userEmail,
          subject: `iMovies Reminder: Your show "${show.movieId}" starts today at ${show.showtime}!`,
          html: `
            <div style="font-family: Arial, sans-serif; background: #121212; color: #fff; padding: 20px; border-radius: 8px;">
              <h2 style="color: #e50914;">iMovies Show Reminder</h2>
              <p>Hello Movie Fan,</p>
              <p>Your movie show is today at <strong>${show.showtime}</strong> at <strong>${show.theatreName}</strong>.</p>
              <p><strong>Booking Reference:</strong> ${booking.bookingId}</p>
              <p>Please arrive 15 minutes before showtime.</p>
              <p>Enjoy the show!</p>
            </div>
          `,
        });
      }
    }
  } catch (err) {
    console.error("Reminder service error:", err.message);
  }
};

module.exports = { sendReminderEmails };
