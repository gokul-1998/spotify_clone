const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    bio: {
      type: String,
      default: ""
    },
    image: {
      type: String,
      default: ""
    },
    genres: [
      {
        type: String,
        trim: true
      }
    ],
    verified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

artistSchema.index({ name: "text", genres: "text" });

module.exports = mongoose.model("Artist", artistSchema);
