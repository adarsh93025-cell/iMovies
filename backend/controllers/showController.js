const Show = require("../models/showModel");
const Theatre = require("../models/theatreModel");
const Movie = require("../models/movieModel");

// Helper to generate initial seat ticket status object from theatre
const generateInitialTickets = (theatre) => {
  const tickets = {};
  if (!theatre) return tickets;

  const tiers = [
    { name: "balcony", config: theatre.balconySeats, price: theatre.balconySeatPrice },
    { name: "middle", config: theatre.middleSeats, price: theatre.middleSeatPrice },
    { name: "lower", config: theatre.lowerSeats, price: theatre.lowerSeatPrice },
  ];

  for (const tier of tiers) {
    if (tier.config && Array.isArray(tier.config.rows)) {
      const seatsCount = tier.config.seatsPerRow || 10;
      for (const row of tier.config.rows) {
        for (let i = 1; i <= seatsCount; i++) {
          const seatId = `${row}${i}`;
          tickets[seatId] = {
            seatId,
            row,
            number: i,
            tier: tier.name,
            price: tier.price,
            isBooked: false,
            bookedBy: null,
          };
        }
      }
    }
  }

  return tickets;
};

// Get all shows with optional filtering
const getAllShows = async (req, res) => {
  try {
    const { movieId, theatreName, showdate } = req.query;
    let filter = {};

    if (movieId) {
      filter.movieId = movieId;
    }
    if (theatreName) {
      filter.theatreName = { $regex: theatreName, $options: "i" };
    }
    if (showdate) {
      filter.showdate = showdate;
    }

    const shows = await Show.find(filter).sort({ showdate: 1, showtime: 1 });
    return res.status(200).json({ success: true, shows, count: shows.length });
  } catch (error) {
    console.error("Get shows error:", error);
    return res.status(500).json({ error: "Server error retrieving shows." });
  }
};

// Get single show by ID (or showId)
const getShowById = async (req, res) => {
  try {
    const { id } = req.params;
    let show = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      show = await Show.findById(id);
    }
    if (!show) {
      show = await Show.findOne({ showId: id });
    }

    if (!show) {
      return res.status(404).json({ error: "Show not found." });
    }

    // Attach theatre seating info if available
    const theatre = await Theatre.findOne({ theatreName: show.theatreName });

    return res.status(200).json({
      success: true,
      show,
      theatre,
    });
  } catch (error) {
    console.error("Get show by ID error:", error);
    return res.status(500).json({ error: "Server error retrieving show." });
  }
};

// Create a new show (Admin)
const createShow = async (req, res) => {
  try {
    const { movieId, theatreName, showdate, showtime, showId } = req.body;

    if (!movieId || !theatreName || !showdate || !showtime) {
      return res.status(400).json({ error: "movieId, theatreName, showdate, and showtime are required." });
    }

    // Check for scheduling conflict in same theatre at same date and time
    const conflict = await Show.findOne({
      theatreName: theatreName.trim(),
      showdate: showdate.trim(),
      showtime: showtime.trim(),
    });

    if (conflict) {
      return res.status(400).json({
        error: `Scheduling conflict! A show is already scheduled at ${theatreName} on ${showdate} at ${showtime}.`,
      });
    }

    // Get theatre to generate seating layout
    const theatre = await Theatre.findOne({ theatreName: theatreName.trim() });
    const initialTickets = generateInitialTickets(theatre);

    const generatedShowId =
      showId ||
      `SHOW_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newShow = new Show({
      adminEmail: req.user ? req.user.email : "admin@imovies.com",
      showId: generatedShowId,
      movieId: movieId.trim(),
      theatreName: theatreName.trim(),
      showdate: showdate.trim(),
      showtime: showtime.trim(),
      tickets: initialTickets,
    });

    await newShow.save();

    // Optionally append showId to movie shows array
    await Movie.findOneAndUpdate(
      { $or: [{ _id: movieId.match(/^[0-9a-fA-F]{24}$/) ? movieId : null }, { movieId }] },
      { $addToSet: { shows: generatedShowId } }
    );

    return res.status(201).json({ success: true, message: "Show created successfully", show: newShow });
  } catch (error) {
    console.error("Create show error:", error);
    return res.status(400).json({ error: error.message || "Failed to create show." });
  }
};

// Update show (Admin)
const updateShow = async (req, res) => {
  try {
    const { id } = req.params;
    let query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { showId: id };

    const updated = await Show.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Show not found." });
    }

    return res.status(200).json({ success: true, message: "Show updated successfully", show: updated });
  } catch (error) {
    console.error("Update show error:", error);
    return res.status(400).json({ error: error.message || "Failed to update show." });
  }
};

// Delete show (Admin)
const deleteShow = async (req, res) => {
  try {
    const { id } = req.params;
    let query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { showId: id };

    const deleted = await Show.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: "Show not found." });
    }

    return res.status(200).json({ success: true, message: "Show deleted successfully" });
  } catch (error) {
    console.error("Delete show error:", error);
    return res.status(500).json({ error: "Server error deleting show." });
  }
};

module.exports = {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
};
