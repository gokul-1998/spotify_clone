const Playlist = require("../models/Playlist");
const Song = require("../models/Song");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, coverImage, isPublic } = req.body;

  if (!name) {
    throw new AppError("Playlist name is required", 400);
  }

  const playlist = await Playlist.create({
    name,
    description,
    coverImage,
    isPublic,
    owner: req.user._id
  });

  res.status(201).json({ playlist });
});

exports.getPlaylists = asyncHandler(async (req, res) => {
  const query = req.query.mine === "true"
    ? { owner: req.user._id }
    : { $or: [{ isPublic: true }, { owner: req.user._id }] };

  const playlists = await Playlist.find(query)
    .populate("owner", "name avatar")
    .populate({
      path: "songs",
      populate: [
        { path: "artist", select: "name" },
        { path: "album", select: "title coverImage" }
      ]
    })
    .sort({ updatedAt: -1 });

  res.json({ playlists });
});

exports.getPlaylistById = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id)
    .populate("owner", "name avatar")
    .populate({
      path: "songs",
      populate: [
        { path: "artist", select: "name" },
        { path: "album", select: "title coverImage" }
      ]
    });

  if (!playlist) {
    throw new AppError("Playlist not found", 404);
  }

  if (!playlist.isPublic && String(playlist.owner._id) !== String(req.user._id)) {
    throw new AppError("Playlist is private", 403);
  }

  res.json({ playlist });
});

exports.updatePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    throw new AppError("Playlist not found", 404);
  }
  if (String(playlist.owner) !== String(req.user._id)) {
    throw new AppError("Not allowed to update this playlist", 403);
  }

  ["name", "description", "coverImage", "isPublic"].forEach((field) => {
    if (req.body[field] !== undefined) {
      playlist[field] = req.body[field];
    }
  });

  await playlist.save();
  res.json({ playlist });
});

exports.deletePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    throw new AppError("Playlist not found", 404);
  }
  if (String(playlist.owner) !== String(req.user._id)) {
    throw new AppError("Not allowed to delete this playlist", 403);
  }

  await playlist.deleteOne();
  res.json({ message: "Playlist deleted" });
});

exports.addSongToPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    throw new AppError("Playlist not found", 404);
  }
  if (String(playlist.owner) !== String(req.user._id)) {
    throw new AppError("Not allowed to edit this playlist", 403);
  }

  const { songId } = req.body;
  if (!songId) {
    throw new AppError("songId is required", 400);
  }

  const song = await Song.findById(songId);
  if (!song) {
    throw new AppError("Song not found", 404);
  }

  const exists = playlist.songs.some((id) => String(id) === String(songId));
  if (!exists) {
    playlist.songs.push(songId);
    await playlist.save();
  }

  res.json({ playlist });
});

exports.removeSongFromPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    throw new AppError("Playlist not found", 404);
  }
  if (String(playlist.owner) !== String(req.user._id)) {
    throw new AppError("Not allowed to edit this playlist", 403);
  }

  playlist.songs = playlist.songs.filter(
    (songId) => String(songId) !== req.params.songId
  );
  await playlist.save();

  res.json({ playlist });
});
