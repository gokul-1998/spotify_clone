const express = require("express");

const songController = require("../controllers/songController");

const router = express.Router();

router.get("/", songController.getSongs);
router.get("/:id", songController.getSongById);
router.get("/:id/stream", songController.streamSong);

module.exports = router;
