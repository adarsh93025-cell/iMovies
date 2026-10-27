const express = require("express");
const router = express.Router();
const {
  adminLogin,
  adminRegister,
  getAdminStats,
  getAllBookings,
  getAllUsers,
} = require("../controllers/adminController");
const { requireAdmin } = require("../middlewares/fetchUser");

// @route POST /api/auth/admin/login
router.post("/login", adminLogin);

// @route POST /api/auth/admin/register
router.post("/register", adminRegister);

// @route GET /api/auth/admin/stats
router.get("/stats", requireAdmin, getAdminStats);

// @route GET /api/auth/admin/bookings
router.get("/bookings", requireAdmin, getAllBookings);

// @route GET /api/auth/admin/users
router.get("/users", requireAdmin, getAllUsers);

module.exports = router;
