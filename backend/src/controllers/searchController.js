const Artist = require("../models/Artist");
const Album = require("../models/Album");
const Song = require("../models/Song");
const asyncHandler = require("../utils/asyncHandler");

exports.searchAll = asyncHandler(async (req, res) => {
  const { q = "", artist, album, genre, type = "all" } = req.query;
  const regex = new RegExp(q, "i");

  const songFilter = {};
  const albumFilter = {};
  const artistFilter = {};

  if (q) {
    songFilter.title = regex;
    albumFilter.title = regex;
    artistFilter.name = regex;
  }

  if (genre) {
    songFilter.genre = new RegExp(genre, "i");
    albumFilter.genres = new RegExp(genre, "i");
    artistFilter.genres = new RegExp(genre, "i");
  }

  if (artist) {
    const matchingArtists = await Artist.find({ name: new RegExp(artist, "i") }).select("_id");
    const artistIds = matchingArtists.map((item) => item._id);
    songFilter.artist = { $in: artistIds };
    albumFilter.artist = { $in: artistIds };
  }

  if (album) {
    const matchingAlbums = await Album.find({ title: new RegExp(album, "i") }).select("_id");
    const albumIds = matchingAlbums.map((item) => item._id);
    songFilter.album = { $in: albumIds };
  }

  const response = {};

  if (type === "all" || type === "songs") {
    response.songs = await Song.find(songFilter)
      .populate("artist", "name")
      .populate("album", "title coverImage")
      .limit(20);
  }

  if (type === "all" || type === "artists") {
    response.artists = await Artist.find(artistFilter).limit(20);
  }

  if (type === "all" || type === "albums") {
    response.albums = await Album.find(albumFilter)
      .populate("artist", "name")
      .limit(20);
  }

  res.json(response);
});

exports.getSuggestions = asyncHandler(async (req, res) => {
  const { q = "" } = req.query;
  const regex = new RegExp(`^${q}`, "i");

  const [songs, artists, albums] = await Promise.all([
    Song.find({ title: regex }).select("title").limit(5),
    Artist.find({ name: regex }).select("name").limit(5),
    Album.find({ title: regex }).select("title").limit(5)
  ]);

  const suggestions = [
    ...songs.map((song) => ({ type: "song", value: song.title })),
    ...artists.map((artist) => ({ type: "artist", value: artist.name })),
    ...albums.map((album) => ({ type: "album", value: album.title }))
  ];

  res.json({ suggestions });
});
