const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
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
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album"
    },
    duration: {
      type: Number,
      default: 0
    },
    audioUrl: {
      type: String,
      default: ""
    },
    audioFilePath: {
      type: String,
      default: ""
    },
    coverImage: {
      type: String,
      default: ""
    },
    genre: {
      type: String,
      default: ""
    },
    playCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

songSchema.index({ title: "text", genre: "text" });

module.exports = mongoose.model("Song", songSchema);
