const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    review: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
