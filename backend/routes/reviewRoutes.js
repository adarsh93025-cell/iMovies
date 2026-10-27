const express = require("express");
const router = express.Router();
const { addReview, getMovieReviews, deleteReview } = require("../controllers/reviewController");
const { fetchUser } = require("../middlewares/fetchUser");

// @route POST /api/review
router.post("/", fetchUser, addReview);

// @route GET /api/review/:movieId
router.get("/:movieId", getMovieReviews);

// @route DELETE /api/review/:id
router.delete("/:id", fetchUser, deleteReview);

module.exports = router;
