const mongoose = require("mongoose");

const playbackStateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    currentSong: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      default: null
    },
    queue: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
      }
    ],
    history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
      }
    ],
    isPlaying: {
      type: Boolean,
      default: false
    },
    position: {
      type: Number,
      default: 0
    },
    volume: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    shuffle: {
      type: Boolean,
      default: false
    },
    repeatMode: {
      type: String,
      enum: ["off", "one", "all"],
      default: "off"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlaybackState", playbackStateSchema);
