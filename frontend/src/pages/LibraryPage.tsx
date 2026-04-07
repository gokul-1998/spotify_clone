import { useEffect, useMemo, useState } from "react";

import { api } from "../api/client";
import type { LibrarySnapshot, Playlist, Track } from "../api/types";
import { TrackRow } from "../components/TrackRow";
import { useAuth } from "../contexts/AuthContext";

const emptyLibrary: LibrarySnapshot = {
  liked_tracks: [],
  saved_albums: [],
  saved_artists: [],
  recently_played: [],
};

export function LibraryPage() {
  const { token } = useAuth();
  const [library, setLibrary] = useState<LibrarySnapshot>(emptyLibrary);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const likedTrackIds = useMemo(() => new Set(library.liked_tracks.map((track) => track.id)), [library.liked_tracks]);

  const refresh = async () => {
    if (!token) return;
    setLoading(true);
    const [nextLibrary, nextPlaylists] = await Promise.all([api.getLibrary(token), api.listPlaylists(token)]);
    setLibrary(nextLibrary);
    setPlaylists(nextPlaylists);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, [token]);

  const toggleLike = async (track: Track) => {
    if (!token) return;
    if (likedTrackIds.has(track.id)) {
      await api.unlikeTrack(token, track.id);
    } else {
      await api.likeTrack(token, track.id);
    }
    await refresh();
  };

  const addToPlaylist = async (playlistId: number, track: Track) => {
    if (!token) return;
    await api.addTrackToPlaylist(token, playlistId, track.id);
  };

  if (loading) return <div className="screen-center">Loading your library…</div>;

  return (
    <div className="page-stack">
      <section className="hero-panel compact-panel">
        <div>
          <p className="eyebrow">Library</p>
          <h1>Your saved music and listening history</h1>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <strong>{library.liked_tracks.length}</strong>
            <span>Liked tracks</span>
          </div>
          <div className="stat-card">
            <strong>{library.saved_albums.length}</strong>
            <span>Saved albums</span>
          </div>
          <div className="stat-card">
            <strong>{library.saved_artists.length}</strong>
            <span>Followed artists</span>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Liked Tracks</h2>
        </div>
        <div className="track-list">
          {library.liked_tracks.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              queue={library.liked_tracks}
              liked
              onToggleLike={toggleLike}
              playlists={playlists}
              onAddToPlaylist={addToPlaylist}
            />
          ))}
        </div>
      </section>

      <section className="content-section dual-columns">
        <div className="content-card">
          <div className="section-header">
            <h2>Saved Albums</h2>
          </div>
          {library.saved_albums.map((album) => (
            <div key={album.id} className="simple-row">
              <span>{album.title}</span>
              <span>{album.artist.name}</span>
            </div>
          ))}
        </div>
        <div className="content-card">
          <div className="section-header">
            <h2>Recently Played</h2>
          </div>
          {library.recently_played.map((track) => (
            <div key={`${track.id}-${track.title}`} className="simple-row">
              <span>{track.title}</span>
              <span>{track.artist.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
