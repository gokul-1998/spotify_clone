const normalizeRecentTracks = (tracks = [], limit = 20) => {
  const seen = new Set();
  const deduped = [];

  for (const entry of tracks) {
    const songId = String(entry.song);
    if (seen.has(songId)) {
      continue;
    }

    seen.add(songId);
    deduped.push(entry);

    if (deduped.length >= limit) {
      break;
    }
  }

  return deduped;
};

module.exports = normalizeRecentTracks;
