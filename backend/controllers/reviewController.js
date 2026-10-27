const Review = require("../models/reviewModel");

// Add a movie review
const addReview = async (req, res) => {
  try {
    const { movieId, rating, review } = req.body;
    const userEmail = req.user.email;
    const userName = req.user.username || userEmail.split("@")[0];

    if (!movieId || !rating || !review) {
      return res.status(400).json({ error: "movieId, rating, and review are required." });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: "Rating must be between 1 and 10." });
    }

    const newReview = new Review({
      movieId: movieId.trim(),
      userEmail,
      userName,
      rating: Number(rating),
      review: review.trim(),
    });

    await newReview.save();

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      review: newReview,
    });
  } catch (error) {
    console.error("Add review error:", error);
    return res.status(500).json({ error: "Server error submitting review." });
  }
};

// Get all reviews for a movie
const getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movieId: movieId.trim() }).sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return res.status(200).json({
      success: true,
      reviews,
      count: reviews.length,
      averageRating: avgRating,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({ error: "Server error retrieving reviews." });
  }
};

// Delete review (author or admin)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ error: "Review not found." });
    }

    if (req.user.role !== "admin" && review.userEmail !== req.user.email) {
      return res.status(403).json({ error: "Access denied. You can only delete your own reviews." });
    }

    await Review.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Review deleted successfully." });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({ error: "Server error deleting review." });
  }
};

module.exports = {
  addReview,
  getMovieReviews,
  deleteReview,
};
