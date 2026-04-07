import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";

import { api } from "../api/client";
import type { Playlist, Track } from "../api/types";
import { TrackRow } from "../components/TrackRow";
import { useAuth } from "../contexts/AuthContext";

interface LayoutContext {
  refreshPlaylists: () => Promise<void>;
}

export function PlaylistPage() {
  const { playlistId } = useParams();
  const { token } = useAuth();
  const { refreshPlaylists } = useOutletContext<LayoutContext>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [catalog, setCatalog] = useState<Track[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const numericId = Number(playlistId);

  const load = async () => {
    if (!token || !numericId) return;
    const [nextPlaylist, nextCatalog] = await Promise.all([api.getPlaylist(token, numericId), api.listTracks()]);
    setPlaylist(nextPlaylist);
    setCatalog(nextCatalog);
  };

  useEffect(() => {
    void load();
  }, [token, numericId]);

  const handleSaveDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !playlist) return;
    const formData = new FormData(event.currentTarget);
    const nextPlaylist = await api.updatePlaylist(token, playlist.id, {
      title: String(formData.get("title") ?? playlist.title),
      description: String(formData.get("description") ?? ""),
      is_public: formData.get("is_public") === "on",
    });
    setPlaylist(nextPlaylist);
    await refreshPlaylists();
    setStatus("Playlist updated");
  };

  const handleDelete = async () => {
    if (!token || !playlist) return;
    const confirmed = window.confirm(`Delete "${playlist.title}"?`);
    if (!confirmed) return;
    await api.deletePlaylist(token, playlist.id);
    await refreshPlaylists();
    window.location.href = "/";
  };

  const addToPlaylist = async (playlistTargetId: number, track: Track) => {
    if (!token || !playlist) return;
    const nextPlaylist = await api.addTrackToPlaylist(token, playlistTargetId, track.id);
    if (playlistTargetId === playlist.id) {
      setPlaylist(nextPlaylist);
    }
    await refreshPlaylists();
    setStatus(`Added ${track.title}`);
  };

  const removeTrack = async (playlistTrackId: number) => {
    if (!token || !playlist) return;
    const nextPlaylist = await api.removeTrackFromPlaylist(token, playlist.id, playlistTrackId);
    setPlaylist(nextPlaylist);
    await refreshPlaylists();
    setStatus("Track removed");
  };

  if (!playlist) return <div className="screen-center">Loading playlist…</div>;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <form className="playlist-editor" onSubmit={handleSaveDetails}>
          <div>
            <p className="eyebrow">Playlist</p>
            <h1>{playlist.title}</h1>
            <p className="muted">{playlist.tracks.length} tracks</p>
          </div>
          <label>
            Title
            <input name="title" defaultValue={playlist.title} />
          </label>
          <label>
            Description
            <textarea name="description" defaultValue={playlist.description ?? ""} rows={3} />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" name="is_public" defaultChecked={playlist.is_public} />
            Public playlist
          </label>
          <div className="hero-actions">
            <button className="pill-button" type="submit">
              Save details
            </button>
            <button className="ghost-button" type="button" onClick={handleDelete}>
              Delete playlist
            </button>
          </div>
          {status ? <p className="muted">{status}</p> : null}
        </form>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Playlist Tracks</h2>
        </div>
        <div className="track-list">
          {playlist.tracks.map((playlistTrack) => (
            <TrackRow
              key={playlistTrack.id}
              track={playlistTrack.track}
              queue={playlist.tracks.map((item) => item.track)}
              removable
              onRemove={() => removeTrack(playlistTrack.id)}
            />
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Add More Tracks</h2>
        </div>
        <div className="track-list">
          {catalog.map((track) => (
            <TrackRow key={track.id} track={track} playlists={[playlist]} onAddToPlaylist={addToPlaylist} />
          ))}
        </div>
      </section>
    </div>
  );
}
