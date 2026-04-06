const express = require("express");

const auth = require("../middleware/auth");
const playlistController = require("../controllers/playlistController");

const router = express.Router();

router.use(auth);
router.route("/")
  .get(playlistController.getPlaylists)
  .post(playlistController.createPlaylist);

router.route("/:id")
  .get(playlistController.getPlaylistById)
  .patch(playlistController.updatePlaylist)
  .delete(playlistController.deletePlaylist);

router.post("/:id/songs", playlistController.addSongToPlaylist);
router.delete("/:id/songs/:songId", playlistController.removeSongFromPlaylist);

module.exports = router;
