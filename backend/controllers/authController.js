const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "imovies_super_secret_jwt_key_2026_secure!";

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Please provide username, email, and password." });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: "Username must be between 3 and 20 characters." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: username.trim() }],
    });

    if (existingUser) {
      return res.status(400).json({ error: "User with this email or username already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username: username.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: "user",
    });

    await user.save();

    const payload = {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      authtoken,
      token: authtoken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Server error during registration." });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials. Please check your email and password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials. Please check your email and password." });
    }

    const payload = {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role || "user",
      },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      authtoken,
      token: authtoken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error during login." });
  }
};

// Get logged-in user profile
const getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ error: "Server error retrieving profile." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getLoggedInUser,
};
