const Movie = require("../models/movieModel");

// Get all movies with optional filters
const getAllMovies = async (req, res) => {
  try {
    const { search, genre, language } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { movieName: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (genre && genre !== "All") {
      filter.$or = [
        { genres: { $in: [new RegExp(genre, "i")] } },
        { genre: { $regex: genre, $options: "i" } },
      ];
    }

    if (language && language !== "All") {
      filter.language = { $regex: language, $options: "i" };
    }

    const rawMovies = await Movie.find(filter).sort({ createdAt: -1 });

    // Normalize movies so both frontend formats (title/movieName, image/media) work
    const movies = rawMovies.map((m) => {
      const doc = m.toObject();
      return {
        ...doc,
        movieName: doc.movieName || doc.title || "Untitled",
        title: doc.title || doc.movieName || "Untitled",
        media: doc.media || doc.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60",
        image: doc.image || doc.media || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60",
        genres: doc.genres && doc.genres.length > 0 ? doc.genres : (doc.genre ? [doc.genre] : ["Drama"]),
        rating: doc.rating || 8.5,
      };
    });

    return res.status(200).json({ success: true, movies, count: movies.length });
  } catch (error) {
    console.error("Get movies error:", error);
    return res.status(500).json({ error: "Server error retrieving movies." });
  }
};

// Get single movie by ID
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    let movie = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(id);
    }
    if (!movie) {
      movie = await Movie.findOne({ movieId: id });
    }

    if (!movie) {
      return res.status(404).json({ error: "Movie not found." });
    }

    const doc = movie.toObject();
    const normalized = {
      ...doc,
      movieName: doc.movieName || doc.title || "Untitled",
      title: doc.title || doc.movieName || "Untitled",
      media: doc.media || doc.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60",
      image: doc.image || doc.media || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60",
      genres: doc.genres && doc.genres.length > 0 ? doc.genres : (doc.genre ? [doc.genre] : ["Drama"]),
      rating: doc.rating || 8.5,
    };

    return res.status(200).json({ success: true, movie: normalized });
  } catch (error) {
    console.error("Get movie by ID error:", error);
    return res.status(500).json({ error: "Server error retrieving movie." });
  }
};

// Create movie (Admin)
const createMovie = async (req, res) => {
  try {
    const {
      movieName,
      title,
      description,
      genres,
      genre,
      releaseDate,
      runtime,
      certification,
      media,
      image,
      backdrop,
      rating,
      language,
    } = req.body;

    const name = (movieName || title || "").trim();
    if (!name) {
      return res.status(400).json({ error: "Movie name is required." });
    }

    const formattedGenres = Array.isArray(genres)
      ? genres
      : typeof genres === "string"
      ? genres.split(",").map((g) => g.trim())
      : genre
      ? [genre]
      : ["Action"];

    const movie = new Movie({
      movieName: name,
      title: name,
      description: (description || "").trim() || "No synopsis available.",
      genres: formattedGenres,
      genre: formattedGenres[0],
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      runtime: runtime || "120 min",
      certification: certification || "U/A",
      media: media || image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60",
      image: image || media || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60",
      backdrop: backdrop || media || image || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80",
      rating: rating ? Number(rating) : 8.5,
      language: language || "English",
    });

    await movie.save();
    return res.status(201).json({ success: true, message: "Movie added successfully", movie });
  } catch (error) {
    console.error("Create movie error:", error);
    return res.status(400).json({ error: error.message || "Failed to create movie." });
  }
};

// Update movie (Admin)
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    let query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { movieId: id };

    const updated = await Movie.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Movie not found." });
    }

    return res.status(200).json({ success: true, message: "Movie updated successfully", movie: updated });
  } catch (error) {
    console.error("Update movie error:", error);
    return res.status(400).json({ error: error.message || "Failed to update movie." });
  }
};

// Delete movie (Admin)
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    let query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { movieId: id };

    const deleted = await Movie.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: "Movie not found." });
    }

    return res.status(200).json({ success: true, message: "Movie deleted successfully" });
  } catch (error) {
    console.error("Delete movie error:", error);
    return res.status(500).json({ error: "Server error deleting movie." });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
