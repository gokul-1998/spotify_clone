import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "../api/client";
import type { Album, Artist, Track } from "../api/types";
import { TrackRow } from "../components/TrackRow";
import { useAuth } from "../contexts/AuthContext";

export function ArtistPage() {
  const { artistId } = useParams();
  const { token } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [saved, setSaved] = useState(false);

  const numericArtistId = Number(artistId);

  useEffect(() => {
    void (async () => {
      const [nextArtists, nextAlbums, nextTracks] = await Promise.all([api.listArtists(), api.listAlbums(), api.listTracks()]);
      setArtist(nextArtists.find((item) => item.id === numericArtistId) ?? null);
      setAlbums(nextAlbums);
      setTracks(nextTracks);
      if (token) {
        const library = await api.getLibrary(token);
        setSaved(library.saved_artists.some((item) => item.id === numericArtistId));
      }
    })();
  }, [numericArtistId, token]);

  const artistAlbums = useMemo(() => albums.filter((album) => album.artist.id === numericArtistId), [albums, numericArtistId]);
  const artistTracks = useMemo(() => tracks.filter((track) => track.artist.id === numericArtistId), [tracks, numericArtistId]);

  const toggleSave = async () => {
    if (!token || !artist) return;
    if (saved) {
      await api.unsaveArtist(token, artist.id);
      setSaved(false);
    } else {
      await api.saveArtist(token, artist.id);
      setSaved(true);
    }
  };

  if (!artist) return <div className="screen-center">Loading artist…</div>;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Artist</p>
          <h1>{artist.name}</h1>
          <p className="muted">{artist.bio ?? artist.genre ?? "Fresh from your FastAPI catalog"}</p>
          <button className={saved ? "active-control" : "pill-button"} onClick={() => void toggleSave()}>
            {saved ? "Saved" : "Save artist"}
          </button>
        </div>
      </section>

      <section className="content-section dual-columns">
        <div className="content-card">
          <div className="section-header">
            <h2>Albums</h2>
          </div>
          {artistAlbums.map((album) => (
            <div key={album.id} className="simple-row">
              <span>{album.title}</span>
              <span>{album.release_year ?? "Unknown year"}</span>
            </div>
          ))}
        </div>
        <div className="content-card">
          <div className="section-header">
            <h2>Top Tracks</h2>
          </div>
          <div className="track-list">
            {artistTracks.map((track) => (
              <TrackRow key={track.id} track={track} queue={artistTracks} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
