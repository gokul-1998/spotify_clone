const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true
    },
    coverImage: {
      type: String,
      default: ""
    },
    genres: [
      {
        type: String,
        trim: true
      }
    ],
    releaseDate: Date
  },
  { timestamps: true }
);

albumSchema.index({ title: "text", genres: "text" });

module.exports = mongoose.model("Album", albumSchema);
