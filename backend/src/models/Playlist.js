const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
      }
    ],
    coverImage: {
      type: String,
      default: ""
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

playlistSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Playlist", playlistSchema);
