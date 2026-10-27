const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getLoggedInUser } = require("../controllers/authController");
const { fetchUser } = require("../middlewares/fetchUser");

// @route POST /api/auth/register
router.post("/register", registerUser);

// @route POST /api/auth/signup (alias)
router.post("/signup", registerUser);

// @route POST /api/auth/login
router.post("/login", loginUser);

// @route POST /api/auth/getuser
router.post("/getuser", fetchUser, getLoggedInUser);

// @route GET /api/auth/me
router.get("/me", fetchUser, getLoggedInUser);

module.exports = router;
