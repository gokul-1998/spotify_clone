const express = require("express");

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const libraryRoutes = require("./libraryRoutes");
const playlistRoutes = require("./playlistRoutes");
const playbackRoutes = require("./playbackRoutes");
const searchRoutes = require("./searchRoutes");
const songRoutes = require("./songRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/library", libraryRoutes);
router.use("/playlists", playlistRoutes);
router.use("/playback", playbackRoutes);
router.use("/search", searchRoutes);
router.use("/songs", songRoutes);

module.exports = router;
