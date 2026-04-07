import { useMemo } from "react";

import { usePlayback } from "../contexts/PlaybackContext";
import { formatClock, formatDuration, getTrackSubtitle, imageFallback } from "../lib/utils";

export function BottomPlayerBar() {
  const { playback, togglePlayPause, nextTrack, previousTrack, seekTo, setVolume, toggleShuffle, cycleRepeat } =
    usePlayback();

  const duration = playback.current_track?.duration_seconds ?? 0;
  const progress = useMemo(() => Math.min(playback.position_seconds, duration || 0), [playback.position_seconds, duration]);

  return (
    <footer className="player-bar">
      <div className="player-track">
        {playback.current_track ? (
          <>
            <img
              src={playback.current_track.album.cover_image ?? imageFallback(playback.current_track.album.title)}
              alt={playback.current_track.album.title}
            />
            <div>
              <strong>{playback.current_track.title}</strong>
              <span>{getTrackSubtitle(playback.current_track)}</span>
            </div>
          </>
        ) : (
          <div>
            <strong>No track selected</strong>
            <span>Choose something from Home, Search, or a playlist.</span>
          </div>
        )}
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button className={playback.shuffle_enabled ? "active-control" : ""} onClick={() => void toggleShuffle()}>
            Shuffle
          </button>
          <button onClick={() => void previousTrack()}>Prev</button>
          <button className="primary-control" onClick={() => void togglePlayPause()} disabled={!playback.current_track}>
            {playback.is_playing ? "Pause" : "Play"}
          </button>
          <button onClick={() => void nextTrack()}>Next</button>
          <button className={playback.repeat_mode !== "off" ? "active-control" : ""} onClick={() => void cycleRepeat()}>
            Repeat: {playback.repeat_mode}
          </button>
        </div>
        <div className="progress-row">
          <span>{formatClock(progress)}</span>
          <input
            type="range"
            min={0}
            max={Math.max(duration, 1)}
            value={progress}
            onChange={(event) => void seekTo(Number(event.target.value))}
            disabled={!playback.current_track}
          />
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      <div className="player-volume">
        <span>Volume</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={playback.volume}
          onChange={(event) => void setVolume(Number(event.target.value))}
        />
      </div>
    </footer>
  );
}
