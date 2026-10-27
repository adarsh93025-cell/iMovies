const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
  {
    // show created by admin
    adminEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    showId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    movieId: {
      type: String,
      required: true,
      trim: true,
    },
    theatreName: {
      type: String,
      required: true,
      trim: true,
    },
    showdate: {
      type: String,
      required: true,
      trim: true,
    },
    showtime: {
      type: String,
      required: true,
      trim: true,
    },
    tickets: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("show", showSchema);
