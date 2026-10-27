const mongoose = require("mongoose");

const theatreSchema = new mongoose.Schema(
  {
    theatreName: {
      type: String,
      required: true,
      trim: true,
    },
    theatreId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    adminName: {
      type: String,
      default: "Admin",
    },
    balconySeatPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    middleSeatPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    lowerSeatPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    balconySeats: {
      type: Object,
      required: true,
    },
    middleSeats: {
      type: Object,
      required: true,
    },
    lowerSeats: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Theatre", theatreSchema);
