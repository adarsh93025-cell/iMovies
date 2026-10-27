const express = require("express");
const router = express.Router();
const {
  addFavorite,
  getUserFavorites,
  removeFavorite,
} = require("../controllers/favoriteController");
const { fetchUser } = require("../middlewares/fetchUser");

// @route POST /api/favorite
router.post("/", fetchUser, addFavorite);

// @route GET /api/favorite
router.get("/", fetchUser, getUserFavorites);

// @route DELETE /api/favorite/:movieId
router.delete("/:movieId", fetchUser, removeFavorite);

module.exports = router;
