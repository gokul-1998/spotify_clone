const User = require("../models/User");
const Song = require("../models/Song");
const Album = require("../models/Album");
const Artist = require("../models/Artist");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const normalizeRecentTracks = require("../utils/normalizeRecentTracks");

const ensureExists = async (model, itemId, label) => {
  const item = await model.findById(itemId);
  if (!item) {
    throw new AppError(`${label} not found`, 404);
  }
};

exports.likeSong = asyncHandler(async (req, res) => {
  const { songId } = req.params;
  await ensureExists(Song, songId, "Song");

  const exists = req.user.library.likedSongs.some((id) => String(id) === songId);
  if (!exists) {
    req.user.library.likedSongs.push(songId);
    await req.user.save();
  }

  res.json({ message: "Song liked" });
});

exports.unlikeSong = asyncHandler(async (req, res) => {
  req.user.library.likedSongs = req.user.library.likedSongs.filter(
    (id) => String(id) !== req.params.songId
  );
  await req.user.save();

  res.json({ message: "Song unliked" });
});

exports.saveAlbum = asyncHandler(async (req, res) => {
  const { albumId } = req.params;
  await ensureExists(Album, albumId, "Album");

  const exists = req.user.library.savedAlbums.some((id) => String(id) === albumId);
  if (!exists) {
    req.user.library.savedAlbums.push(albumId);
    await req.user.save();
  }

  res.json({ message: "Album saved" });
});

exports.unsaveAlbum = asyncHandler(async (req, res) => {
  req.user.library.savedAlbums = req.user.library.savedAlbums.filter(
    (id) => String(id) !== req.params.albumId
  );
  await req.user.save();

  res.json({ message: "Album removed from library" });
});

exports.saveArtist = asyncHandler(async (req, res) => {
  const { artistId } = req.params;
  await ensureExists(Artist, artistId, "Artist");

  const exists = req.user.library.savedArtists.some((id) => String(id) === artistId);
  if (!exists) {
    req.user.library.savedArtists.push(artistId);
    await req.user.save();
  }

  res.json({ message: "Artist saved" });
});

exports.unsaveArtist = asyncHandler(async (req, res) => {
  req.user.library.savedArtists = req.user.library.savedArtists.filter(
    (id) => String(id) !== req.params.artistId
  );
  await req.user.save();

  res.json({ message: "Artist removed from library" });
});

exports.addRecentlyPlayed = asyncHandler(async (req, res) => {
  const { songId } = req.params;
  await ensureExists(Song, songId, "Song");

  req.user.library.recentlyPlayed.unshift({ song: songId, playedAt: new Date() });
  req.user.library.recentlyPlayed = normalizeRecentTracks(
    req.user.library.recentlyPlayed,
    20
  );

  await req.user.save();
  res.json({ message: "Recently played updated" });
});

exports.getLibrary = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("library.likedSongs")
    .populate("library.savedAlbums")
    .populate("library.savedArtists")
    .populate("library.recentlyPlayed.song");

  res.json({ library: user.library });
});
