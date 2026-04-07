import type { Track } from "../api/types";

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatClock(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  return formatDuration(safeSeconds);
}

export function getTrackSubtitle(track: Track): string {
  return `${track.artist.name} • ${track.album.title}`;
}

export function imageFallback(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/400`;
}
