const express = require("express");
const router = express.Router();
const {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
} = require("../controllers/showController");
const { requireAdmin } = require("../middlewares/fetchUser");

// @route GET /api/shows
router.get("/", getAllShows);

// @route GET /api/shows/:id
router.get("/:id", getShowById);

// @route POST /api/shows (Admin)
router.post("/", requireAdmin, createShow);

// @route PUT /api/shows/:id (Admin)
router.put("/:id", requireAdmin, updateShow);

// @route DELETE /api/shows/:id (Admin)
router.delete("/:id", requireAdmin, deleteShow);

module.exports = router;
