const PlaybackState = require("../models/PlaybackState");
const Song = require("../models/Song");
const normalizeRecentTracks = require("../utils/normalizeRecentTracks");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const getState = async (userId) =>
  PlaybackState.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { new: true, upsert: true }
  );

const recordRecentlyPlayed = async (user, songId) => {
  user.library.recentlyPlayed.unshift({ song: songId, playedAt: new Date() });
  user.library.recentlyPlayed = normalizeRecentTracks(user.library.recentlyPlayed, 20);
  await user.save();
};

exports.getPlaybackState = asyncHandler(async (req, res) => {
  const state = await getState(req.user._id);
  await state.populate("currentSong queue history");

  res.json({ playback: state });
});

exports.setPlaybackState = asyncHandler(async (req, res) => {
  const state = await getState(req.user._id);
  [
    "currentSong",
    "queue",
    "history",
    "isPlaying",
    "position",
    "volume",
    "shuffle",
    "repeatMode"
  ].forEach((field) => {
    if (req.body[field] !== undefined) {
      state[field] = req.body[field];
    }
  });

  await state.save();
  res.json({ playback: state });
});

exports.playSong = asyncHandler(async (req, res) => {
  const { songId, queue } = req.body;
  if (!songId) {
    throw new AppError("songId is required", 400);
  }

  const song = await Song.findById(songId);
  if (!song) {
    throw new AppError("Song not found", 404);
  }

  const state = await getState(req.user._id);
  if (state.currentSong) {
    state.history.unshift(state.currentSong);
  }

  state.currentSong = songId;
  state.isPlaying = true;
  state.position = 0;
  if (Array.isArray(queue)) {
    state.queue = queue;
  }

  song.playCount += 1;
  await Promise.all([state.save(), song.save(), recordRecentlyPlayed(req.user, songId)]);

  res.json({ playback: state });
});

exports.pausePlayback = asyncHandler(async (req, res) => {
  const state = await getState(req.user._id);
  state.isPlaying = false;
  await state.save();

  res.json({ playback: state });
});

exports.seekPlayback = asyncHandler(async (req, res) => {
  const state = await getState(req.user._id);
  state.position = Number(req.body.position || 0);
  await state.save();

  res.json({ playback: state });
});

exports.updateVolume = asyncHandler(async (req, res) => {
  const state = await getState(req.user._id);
  state.volume = Number(req.body.volume);
  await state.save();

  res.json({ playback: state });
});

exports.updateModes = asyncHandler(async (req, res) => {
  const state = await getState(req.user._id);
  if (req.body.shuffle !== undefined) {
    state.shuffle = Boolean(req.body.shuffle);
  }
  if (req.body.repeatMode !== undefined) {
    state.repeatMode = req.body.repeatMode;
  }

  await state.save();
  res.json({ playback: state });
});

exports.nextTrack = asyncHandler(async (req, res) => {
  const state = await getState(req.user._id);
  if (!state.currentSong && state.queue.length === 0) {
    throw new AppError("Playback queue is empty", 400);
  }

  if (state.repeatMode === "one" && state.currentSong) {
    state.position = 0;
    state.isPlaying = true;
  } else {
    const upcomingQueue = [...state.queue];
    let nextSongId;

    if (state.shuffle && upcomingQueue.length > 1) {
      const randomIndex = Math.floor(Math.random() * upcomingQueue.length);
      nextSongId = upcomingQueue.splice(randomIndex, 1)[0];
    } else {
      nextSongId = upcomingQueue.shift();
    }

    if (!nextSongId && state.repeatMode === "all" && state.history.length > 0) {
      nextSongId = state.history[state.history.length - 1];
    }

    if (!nextSongId) {
      state.isPlaying = false;
      await state.save();
      return res.json({ playback: state });
    }

    if (state.currentSong) {
      state.history.unshift(state.currentSong);
    }
    state.currentSong = nextSongId;
    state.queue = upcomingQueue;
    state.position = 0;
    state.isPlaying = true;
    await recordRecentlyPlayed(req.user, nextSongId);
  }

  await state.save();
  res.json({ playback: state });
});

exports.previousTrack = asyncHandler(async (req, res) => {
  const state = await getState(req.user._id);
  if (state.history.length === 0) {
    throw new AppError("No previous track available", 400);
  }

  if (state.currentSong) {
    state.queue.unshift(state.currentSong);
  }

  state.currentSong = state.history.shift();
  state.position = 0;
  state.isPlaying = true;

  await Promise.all([state.save(), recordRecentlyPlayed(req.user, state.currentSong)]);

  res.json({ playback: state });
});
