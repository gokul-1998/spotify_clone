import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import type { Album, Artist, Track } from "../api/types";
import { usePlayback } from "../contexts/PlaybackContext";
import { formatDuration, imageFallback } from "../lib/utils";

export function HomePage() {
  const { queueTracks } = usePlayback();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const [nextTracks, nextAlbums, nextArtists] = await Promise.all([
          api.listTracks(),
          api.listAlbums(),
          api.listArtists(),
        ]);
        setTracks(nextTracks);
        setAlbums(nextAlbums);
        setArtists(nextArtists);
        setError(null);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load the catalog");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="screen-center">Loading your catalog…</div>;
  if (error) return <div className="banner error-banner">{error}</div>;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Daily mix</p>
          <h1>Everything your backend already knows how to stream.</h1>
          <p className="muted">
            This React frontend is wired to auth, catalog, playlists, library, and playback endpoints from your FastAPI API.
          </p>
          <div className="hero-actions">
            <button className="pill-button" onClick={() => void queueTracks(tracks, tracks[0])}>
              Play all tracks
            </button>
            <Link to="/search" className="ghost-button">
              Search the catalog
            </Link>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Trending Tracks</h2>
        </div>
        <div className="card-grid">
          {tracks.slice(0, 8).map((track) => (
            <article key={track.id} className="media-card">
              <img src={track.album.cover_image ?? imageFallback(track.album.title)} alt={track.album.title} />
              <div>
                <h3>{track.title}</h3>
                <p>{track.artist.name}</p>
              </div>
              <div className="inline-meta">
                <span>{formatDuration(track.duration_seconds)}</span>
                <button onClick={() => void queueTracks(tracks, track)}>Play</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Albums</h2>
        </div>
        <div className="card-grid">
          {albums.slice(0, 6).map((album) => (
            <Link key={album.id} to={`/albums/${album.id}`} className="media-card">
              <img src={album.cover_image ?? imageFallback(album.title)} alt={album.title} />
              <div>
                <h3>{album.title}</h3>
                <p>{album.artist.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Artists</h2>
        </div>
        <div className="card-grid artist-grid">
          {artists.slice(0, 6).map((artist) => (
            <Link key={artist.id} to={`/artists/${artist.id}`} className="media-card">
              <img src={artist.image_url ?? imageFallback(artist.name)} alt={artist.name} className="artist-image" />
              <div>
                <h3>{artist.name}</h3>
                <p>{artist.genre ?? "Artist"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
