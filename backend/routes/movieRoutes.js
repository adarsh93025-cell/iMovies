const express = require("express");
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");
const { requireAdmin } = require("../middlewares/fetchUser");

// @route GET /api/movie
router.get("/", getAllMovies);

// @route GET /api/movie/:id
router.get("/:id", getMovieById);

// @route POST /api/movie (Admin only)
router.post("/", requireAdmin, createMovie);

// @route PUT /api/movie/:id (Admin only)
router.put("/:id", requireAdmin, updateMovie);

// @route DELETE /api/movie/:id (Admin only)
router.delete("/:id", requireAdmin, deleteMovie);

module.exports = router;
