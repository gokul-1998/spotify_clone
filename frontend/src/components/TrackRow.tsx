import { Link } from "react-router-dom";

import type { Playlist, Track } from "../api/types";
import { usePlayback } from "../contexts/PlaybackContext";
import { formatDuration, imageFallback } from "../lib/utils";

interface TrackRowProps {
  track: Track;
  queue?: Track[];
  liked?: boolean;
  onToggleLike?: (track: Track) => void | Promise<void>;
  removable?: boolean;
  onRemove?: () => void | Promise<void>;
  playlists?: Playlist[];
  onAddToPlaylist?: (playlistId: number, track: Track) => void | Promise<void>;
}

export function TrackRow({
  track,
  queue,
  liked = false,
  onToggleLike,
  removable = false,
  onRemove,
  playlists = [],
  onAddToPlaylist,
}: TrackRowProps) {
  const { playTrack } = usePlayback();

  return (
    <div className="track-row">
      <button className="icon-tile" onClick={() => void playTrack(track, queue?.map((item) => item.id))}>
        Play
      </button>
      <img src={track.album.cover_image ?? imageFallback(track.album.title)} alt={track.album.title} className="cover-thumb" />
      <div className="track-meta">
        <strong>{track.title}</strong>
        <span>
          <Link to={`/artists/${track.artist.id}`}>{track.artist.name}</Link> •{" "}
          <Link to={`/albums/${track.album.id}`}>{track.album.title}</Link>
        </span>
      </div>
      <span className="track-pill">{track.genre ?? "Genreless"}</span>
      <span className="track-pill">{formatDuration(track.duration_seconds)}</span>
      {onToggleLike ? (
        <button className={liked ? "active-control" : ""} onClick={() => void onToggleLike(track)}>
          {liked ? "Liked" : "Like"}
        </button>
      ) : null}
      {playlists.length > 0 && onAddToPlaylist ? (
        <select
          className="playlist-select"
          defaultValue=""
          onChange={(event) => {
            const playlistId = Number(event.target.value);
            if (!playlistId) return;
            void onAddToPlaylist(playlistId, track);
            event.currentTarget.value = "";
          }}
        >
          <option value="">Add to playlist</option>
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.title}
            </option>
          ))}
        </select>
      ) : null}
      {removable ? <button onClick={() => void onRemove?.()}>Remove</button> : null}
    </div>
  );
}
