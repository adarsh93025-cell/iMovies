const express = require("express");
const router = express.Router();
const {
  getAllTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
} = require("../controllers/theatreController");
const { requireAdmin } = require("../middlewares/fetchUser");

// @route GET /api/theatre
router.get("/", getAllTheatres);

// @route GET /api/theatre/:id
router.get("/:id", getTheatreById);

// @route POST /api/theatre (Admin)
router.post("/", requireAdmin, createTheatre);

// @route PUT /api/theatre/:id (Admin)
router.put("/:id", requireAdmin, updateTheatre);

// @route DELETE /api/theatre/:id (Admin)
router.delete("/:id", requireAdmin, deleteTheatre);

module.exports = router;
