const Favorite = require("../models/favoriteModel");
const Movie = require("../models/movieModel");

// Add a movie to favorites
const addFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userEmail = req.user.email;

    if (!movieId) {
      return res.status(400).json({ error: "Movie ID is required." });
    }

    const cleanMovieId = movieId.trim();

    // Check if already in favorites
    const existing = await Favorite.findOne({ userEmail, movieId: cleanMovieId });
    if (existing) {
      return res.status(200).json({ success: true, message: "Movie already in favorites", favorite: existing });
    }

    const favorite = new Favorite({
      userEmail,
      movieId: cleanMovieId,
    });

    await favorite.save();
    return res.status(201).json({ success: true, message: "Added to favorites", favorite });
  } catch (error) {
    console.error("Add favorite error:", error);
    return res.status(500).json({ error: "Server error adding favorite." });
  }
};

// Get all favorites for logged-in user
const getUserFavorites = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const favorites = await Favorite.find({ userEmail }).sort({ createdAt: -1 });

    const movieIds = favorites.map((f) => f.movieId);

    // Fetch movie details
    const movies = await Movie.find({
      $or: [
        { _id: { $in: movieIds.filter((id) => id.match(/^[0-9a-fA-F]{24}$/)) } },
        { movieId: { $in: movieIds } },
      ],
    });

    return res.status(200).json({
      success: true,
      favorites,
      movies,
      count: favorites.length,
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    return res.status(500).json({ error: "Server error retrieving favorites." });
  }
};

// Remove from favorites
const removeFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userEmail = req.user.email;

    const deleted = await Favorite.findOneAndDelete({
      userEmail,
      movieId: movieId.trim(),
    });

    if (!deleted) {
      return res.status(404).json({ error: "Favorite not found." });
    }

    return res.status(200).json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return res.status(500).json({ error: "Server error removing favorite." });
  }
};

module.exports = {
  addFavorite,
  getUserFavorites,
  removeFavorite,
};
