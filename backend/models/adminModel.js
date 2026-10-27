const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    role: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
