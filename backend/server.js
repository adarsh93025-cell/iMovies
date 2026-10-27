const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
const path = require("path");

// Load environment variables before reading them
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Prefer IPv4 results to avoid ::1 (IPv6) connections when providers expect IPv4
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const authRoutes = require("./routes/authRoutes");
const showRoutes = require("./routes/showRoutes");
const theatreRoutes = require("./routes/theatreRoutes");
const movieRoutes = require("./routes/movieRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const { verifyTransport } = require("./utils/mailer");
const cron = require("node-cron");
const { sendReminderEmails } = require("./utils/reminderService");
const { cleanupOldBookings } = require("./utils/cleanupService");

const app = express();
const PORT = process.env.PORT || 3000;

// Security and CORS middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "auth-token", "x-auth-token"],
  })
);

app.use(express.json());

// Root health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString(), message: "iMovies API is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/theatre", theatreRoutes);
app.use("/api/movie", movieRoutes);
app.use("/api/favorite", favoriteRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth/admin", adminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "An internal server error occurred." });
});

const mongoUri = process.env.MONGODB_CONNECTION_LINK || "mongodb://127.0.0.1:27017/Imovies";

let cronInitialized = false;

// Connect to MongoDB and start server only after connection succeeds
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB successfully");

    // Initialize background cron jobs once
    if (!cronInitialized) {
      cronInitialized = true;
      verifyTransport();

      // Send reminder emails every day at 8:00 AM
      cron.schedule("0 8 * * *", () => {
        console.log("⏰ Running scheduled show reminders job...");
        sendReminderEmails();
      });

      // Cleanup stale bookings every 6 hours
      cron.schedule("0 */6 * * *", () => {
        console.log("🧹 Running scheduled booking cleanup job...");
        cleanupOldBookings();
      });
    }

    // Start listening on port
    if (!app.listening) {
      app.listening = true;
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on ${PORT} port`);
      });
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Exit process with failure if initial database connection fails
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected. Attempting to reconnect...");
  setTimeout(connectToMongo, 5000);
});

connectToMongo();

module.exports = app;
