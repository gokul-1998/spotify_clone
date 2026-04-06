const express = require("express");

const auth = require("../middleware/auth");
const libraryController = require("../controllers/libraryController");

const router = express.Router();

router.use(auth);
router.get("/", libraryController.getLibrary);
router.post("/songs/:songId/like", libraryController.likeSong);
router.delete("/songs/:songId/like", libraryController.unlikeSong);
router.post("/albums/:albumId/save", libraryController.saveAlbum);
router.delete("/albums/:albumId/save", libraryController.unsaveAlbum);
router.post("/artists/:artistId/save", libraryController.saveArtist);
router.delete("/artists/:artistId/save", libraryController.unsaveArtist);
router.post("/recent/:songId", libraryController.addRecentlyPlayed);

module.exports = router;
