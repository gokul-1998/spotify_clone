const fs = require("fs");
const path = require("path");

const Song = require("../models/Song");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const getFilePath = (song) => {
  if (!song.audioFilePath) {
    return "";
  }

  if (path.isAbsolute(song.audioFilePath)) {
    return song.audioFilePath;
  }

  if (!env.audioBasePath) {
    return "";
  }

  return path.join(env.audioBasePath, song.audioFilePath);
};

exports.getSongs = asyncHandler(async (_req, res) => {
  const songs = await Song.find()
    .populate("artist", "name")
    .populate("album", "title coverImage")
    .limit(100);

  res.json({ songs });
});

exports.getSongById = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id)
    .populate("artist")
    .populate("album");

  if (!song) {
    throw new AppError("Song not found", 404);
  }

  res.json({ song });
});

exports.streamSong = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id);
  if (!song) {
    throw new AppError("Song not found", 404);
  }

  if (song.audioUrl) {
    return res.redirect(song.audioUrl);
  }

  const filePath = getFilePath(song);
  if (!filePath || !fs.existsSync(filePath)) {
    throw new AppError("Audio source not available", 404);
  }

  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "audio/mpeg"
    });

    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const [startText, endText] = range.replace(/bytes=/, "").split("-");
  const start = parseInt(startText, 10);
  const end = endText ? parseInt(endText, 10) : stat.size - 1;
  const chunkSize = end - start + 1;

  res.writeHead(206, {
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Range": `bytes ${start}-${end}/${stat.size}`,
    "Content-Type": "audio/mpeg"
  });

  fs.createReadStream(filePath, { start, end }).pipe(res);
});
