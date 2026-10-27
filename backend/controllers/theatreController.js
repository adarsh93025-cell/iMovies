const Theatre = require("../models/theatreModel");

// Get all theatres
const getAllTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, theatres, count: theatres.length });
  } catch (error) {
    console.error("Get theatres error:", error);
    return res.status(500).json({ error: "Server error retrieving theatres." });
  }
};

// Get single theatre by id or theatreId
const getTheatreById = async (req, res) => {
  try {
    const { id } = req.params;
    let theatre = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      theatre = await Theatre.findById(id);
    }
    if (!theatre) {
      theatre = await Theatre.findOne({ theatreId: id });
    }
    if (!theatre) {
      return res.status(404).json({ error: "Theatre not found." });
    }
    return res.status(200).json({ success: true, theatre });
  } catch (error) {
    console.error("Get theatre by ID error:", error);
    return res.status(500).json({ error: "Server error retrieving theatre." });
  }
};

// Create a theatre (Admin)
const createTheatre = async (req, res) => {
  try {
    const {
      theatreName,
      theatreId,
      location,
      adminName,
      balconySeatPrice,
      middleSeatPrice,
      lowerSeatPrice,
      balconySeats,
      middleSeats,
      lowerSeats,
    } = req.body;

    if (!theatreName || !theatreId || !location) {
      return res.status(400).json({ error: "theatreName, theatreId, and location are required." });
    }

    // Default seat structures if not provided
    const defaultBalcony = balconySeats || {
      rows: ["A", "B"],
      seatsPerRow: 10,
    };
    const defaultMiddle = middleSeats || {
      rows: ["C", "D", "E"],
      seatsPerRow: 12,
    };
    const defaultLower = lowerSeats || {
      rows: ["F", "G"],
      seatsPerRow: 14,
    };

    const existing = await Theatre.findOne({ theatreId: theatreId.trim() });
    if (existing) {
      return res.status(400).json({ error: `Theatre with ID '${theatreId}' already exists.` });
    }

    const theatre = new Theatre({
      theatreName: theatreName.trim(),
      theatreId: theatreId.trim(),
      location: location.trim(),
      adminName: adminName || (req.user ? req.user.username : "Admin"),
      balconySeatPrice: Number(balconySeatPrice) || 300,
      middleSeatPrice: Number(middleSeatPrice) || 200,
      lowerSeatPrice: Number(lowerSeatPrice) || 120,
      balconySeats: defaultBalcony,
      middleSeats: defaultMiddle,
      lowerSeats: defaultLower,
    });

    await theatre.save();
    return res.status(201).json({ success: true, message: "Theatre created successfully", theatre });
  } catch (error) {
    console.error("Create theatre error:", error);
    return res.status(400).json({ error: error.message || "Failed to create theatre." });
  }
};

// Update theatre (Admin)
const updateTheatre = async (req, res) => {
  try {
    const { id } = req.params;
    let query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { theatreId: id };

    const updated = await Theatre.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Theatre not found." });
    }

    return res.status(200).json({ success: true, message: "Theatre updated successfully", theatre: updated });
  } catch (error) {
    console.error("Update theatre error:", error);
    return res.status(400).json({ error: error.message || "Failed to update theatre." });
  }
};

// Delete theatre (Admin)
const deleteTheatre = async (req, res) => {
  try {
    const { id } = req.params;
    let query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { theatreId: id };

    const deleted = await Theatre.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: "Theatre not found." });
    }

    return res.status(200).json({ success: true, message: "Theatre deleted successfully" });
  } catch (error) {
    console.error("Delete theatre error:", error);
    return res.status(500).json({ error: "Server error deleting theatre." });
  }
};

module.exports = {
  getAllTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
};
