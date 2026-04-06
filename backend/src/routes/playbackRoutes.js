const express = require("express");

const auth = require("../middleware/auth");
const playbackController = require("../controllers/playbackController");

const router = express.Router();

router.use(auth);
router.get("/state", playbackController.getPlaybackState);
router.put("/state", playbackController.setPlaybackState);
router.post("/play", playbackController.playSong);
router.post("/pause", playbackController.pausePlayback);
router.post("/seek", playbackController.seekPlayback);
router.post("/next", playbackController.nextTrack);
router.post("/previous", playbackController.previousTrack);
router.post("/volume", playbackController.updateVolume);
router.post("/modes", playbackController.updateModes);

module.exports = router;
