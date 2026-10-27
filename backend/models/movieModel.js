const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      default: function () {
        return this._id ? this._id.toString() : new mongoose.Types.ObjectId().toString();
      },
      index: true,
    },
    // Supports both MySkillWallet movieName and legacy title
    movieName: {
      type: String,
      trim: true,
      default: function () {
        return this.title || "Untitled";
      },
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      default: "Movie synopsis and details.",
    },
    // Supports both genres array and single genre string
    genres: {
      type: [String],
      default: function () {
        return this.genre ? [this.genre] : ["Drama"];
      },
    },
    genre: {
      type: String,
    },
    releaseDate: {
      type: Date,
      default: () => new Date(),
    },
    runtime: {
      type: String,
      default: "120 min",
    },
    certification: {
      type: String,
      default: "U/A",
    },
    // Supports both media and image
    media: {
      type: String,
      default: function () {
        return this.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
      },
    },
    image: {
      type: String,
    },
    backdrop: {
      type: String,
      default: function () {
        return this.image || this.media || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80";
      },
    },
    rating: {
      type: Number,
      default: 8.5,
    },
    language: {
      type: String,
      default: "English",
    },
    shows: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

// Virtuals / pre-save hook to keep movieName <-> title and genres <-> genre synchronized
movieSchema.pre("save", function (next) {
  if (this.title && !this.movieName) {
    this.movieName = this.title;
  } else if (this.movieName && !this.title) {
    this.title = this.movieName;
  }

  if (this.genre && (!this.genres || this.genres.length === 0)) {
    this.genres = [this.genre];
  } else if (this.genres && this.genres.length > 0 && !this.genre) {
    this.genre = this.genres[0];
  }

  if (this.image && !this.media) {
    this.media = this.image;
  } else if (this.media && !this.image) {
    this.image = this.media;
  }

  next();
});

module.exports = mongoose.model("Movie", movieSchema);
