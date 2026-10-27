const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");
const Show = require("../models/showModel");
const Booking = require("../models/bookingModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "imovies_super_secret_jwt_key_2026_secure!";

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check in Admin model first, then fallback to User model with role=admin
    let adminUser = await Admin.findOne({ email: cleanEmail });
    let isSeparateAdminModel = true;

    if (!adminUser) {
      adminUser = await User.findOne({ email: cleanEmail, role: "admin" });
      isSeparateAdminModel = false;
    }

    if (!adminUser) {
      return res.status(401).json({ error: "Invalid admin credentials or not authorized as admin." });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid admin credentials." });
    }

    const payload = {
      user: {
        id: adminUser._id,
        email: adminUser.email,
        username: adminUser.username,
        role: "admin",
      },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      authtoken,
      token: authtoken,
      admin: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ error: "Server error during admin login." });
  }
};

// Admin Register (protected or seeded)
const adminRegister = async (req, res) => {
  try {
    const { username, email, password, adminSecret } = req.body;

    // Optional admin secret verification to prevent unauthorized public registration
    const expectedSecret = process.env.ADMIN_SECRET || "imovies_admin_secret_key_2026";
    if (adminSecret && adminSecret !== expectedSecret) {
      return res.status(403).json({ error: "Invalid administrator registration key." });
    }

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Please provide username, email, and password." });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingAdmin = await Admin.findOne({
      $or: [{ email: cleanEmail }, { username: username.trim() }],
    });

    if (existingAdmin) {
      return res.status(400).json({ error: "Admin with this email or username already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      username: username.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();

    // Also mirror into User collection with role: 'admin' for seamless auth compatibility
    await User.findOneAndUpdate(
      { email: cleanEmail },
      { username: username.trim(), email: cleanEmail, password: hashedPassword, role: "admin" },
      { upsert: true, new: true }
    );

    const payload = {
      user: {
        id: newAdmin._id,
        email: newAdmin.email,
        username: newAdmin.username,
        role: "admin",
      },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      success: true,
      message: "Admin account registered successfully",
      authtoken,
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin register error:", error);
    return res.status(500).json({ error: "Server error during admin registration." });
  }
};

// Admin Dashboard Analytics
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalMovies, totalTheatres, totalShows, totalBookings] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments(),
      Booking.find(),
    ]);

    const confirmedBookings = totalBookings.filter((b) => b.bookingStatus === "confirmed");
    const cancelledBookings = totalBookings.filter((b) => b.bookingStatus === "cancelled");

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalMovies,
        totalTheatres,
        totalShows,
        totalBookings: totalBookings.length,
        confirmedBookings: confirmedBookings.length,
        cancelledBookings: cancelledBookings.length,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return res.status(500).json({ error: "Server error retrieving admin statistics." });
  }
};

// List all bookings for admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Get all bookings error:", error);
    return res.status(500).json({ error: "Server error retrieving bookings." });
  }
};

// List all users for admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ error: "Server error retrieving users." });
  }
};

module.exports = {
  adminLogin,
  adminRegister,
  getAdminStats,
  getAllBookings,
  getAllUsers,
};
