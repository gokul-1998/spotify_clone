import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "../api/client";
import type { Album, Track } from "../api/types";
import { TrackRow } from "../components/TrackRow";
import { useAuth } from "../contexts/AuthContext";

export function AlbumPage() {
  const { albumId } = useParams();
  const { token } = useAuth();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [saved, setSaved] = useState(false);

  const numericAlbumId = Number(albumId);

  useEffect(() => {
    void (async () => {
      const [albums, nextTracks] = await Promise.all([api.listAlbums(), api.listTracks()]);
      const foundAlbum = albums.find((item) => item.id === numericAlbumId) ?? null;
      setAlbum(foundAlbum);
      setTracks(nextTracks);
      if (token) {
        const library = await api.getLibrary(token);
        setSaved(library.saved_albums.some((item) => item.id === numericAlbumId));
      }
    })();
  }, [numericAlbumId, token]);

  const albumTracks = useMemo(() => tracks.filter((track) => track.album.id === numericAlbumId), [tracks, numericAlbumId]);

  const toggleSave = async () => {
    if (!token || !album) return;
    if (saved) {
      await api.unsaveAlbum(token, album.id);
      setSaved(false);
    } else {
      await api.saveAlbum(token, album.id);
      setSaved(true);
    }
  };

  if (!album) return <div className="screen-center">Loading album…</div>;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Album</p>
          <h1>{album.title}</h1>
          <p className="muted">
            {album.artist.name} • {album.release_year ?? "Unknown year"} • {album.genre ?? "Unknown genre"}
          </p>
          <button className={saved ? "active-control" : "pill-button"} onClick={() => void toggleSave()}>
            {saved ? "Saved" : "Save album"}
          </button>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Tracks</h2>
        </div>
        <div className="track-list">
          {albumTracks.map((track) => (
            <TrackRow key={track.id} track={track} queue={albumTracks} />
          ))}
        </div>
      </section>
    </div>
  );
}
