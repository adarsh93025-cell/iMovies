const mongoose = require("mongoose");

const bookingModel = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    showId: {
      type: String,
      required: true,
      trim: true,
    },
    ticketsData: {
      type: Object,
      required: true,
    },
    movieName: {
      type: String,
      default: "",
    },
    theatreName: {
      type: String,
      default: "",
    },
    showdate: {
      type: String,
      default: "",
    },
    showtime: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    paymentId: {
      type: String,
      default: () => "PAY_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingModel);
