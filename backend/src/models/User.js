const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const recentTrackSchema = new mongoose.Schema(
  {
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true
    },
    playedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    avatar: {
      type: String,
      default: ""
    },
    bio: {
      type: String,
      default: ""
    },
    followingUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    library: {
      likedSongs: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Song"
        }
      ],
      savedAlbums: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Album"
        }
      ],
      savedArtists: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Artist"
        }
      ],
      recentlyPlayed: [recentTrackSchema]
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
