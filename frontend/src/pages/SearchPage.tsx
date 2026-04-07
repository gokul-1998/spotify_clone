import { useEffect, useState } from "react";

import { api } from "../api/client";
import type { Playlist, SearchResponse, Track } from "../api/types";
import { TrackRow } from "../components/TrackRow";
import { useAuth } from "../contexts/AuthContext";

export function SearchPage() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResponse>({ tracks: [], artists: [], albums: [] });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [status, setStatus] = useState("Type something to search");

  useEffect(() => {
    if (!token) return;
    void api.listPlaylists(token).then(setPlaylists).catch(() => undefined);
  }, [token]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setResults({ tracks: [], artists: [], albums: [] });
      setStatus("Type something to search");
      return;
    }

    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          const [nextSuggestions, nextResults] = await Promise.all([api.suggestions(query), api.search(query)]);
          setSuggestions(nextSuggestions.suggestions);
          setResults(nextResults);
          setStatus(
            nextResults.tracks.length || nextResults.albums.length || nextResults.artists.length
              ? "Results loaded"
              : "No matches found",
          );
        } catch (caughtError) {
          setStatus(caughtError instanceof Error ? caughtError.message : "Search failed");
        }
      })();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const addToPlaylist = async (playlistId: number, track: Track) => {
    if (!token) return;
    await api.addTrackToPlaylist(token, playlistId, track.id);
    setStatus(`Added ${track.title} to playlist`);
  };

  return (
    <div className="page-stack">
      <section className="hero-panel compact-panel">
        <div>
          <p className="eyebrow">Search</p>
          <h1>Find tracks, artists, and albums</h1>
        </div>
        <input
          className="search-input"
          placeholder="Search by track, artist, or album"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {suggestions.length ? (
          <div className="suggestion-row">
            {suggestions.map((suggestion) => (
              <button key={suggestion} className="chip" onClick={() => setQuery(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
        <p className="muted">{status}</p>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Tracks</h2>
        </div>
        <div className="track-list">
          {results.tracks.map((track) => (
            <TrackRow key={track.id} track={track} queue={results.tracks} playlists={playlists} onAddToPlaylist={addToPlaylist} />
          ))}
        </div>
      </section>

      <section className="content-section dual-columns">
        <div className="content-card">
          <div className="section-header">
            <h2>Artists</h2>
          </div>
          {results.artists.map((artist) => (
            <div key={artist.id} className="simple-row">
              <span>{artist.name}</span>
              <span>{artist.genre ?? "Artist"}</span>
            </div>
          ))}
        </div>
        <div className="content-card">
          <div className="section-header">
            <h2>Albums</h2>
          </div>
          {results.albums.map((album) => (
            <div key={album.id} className="simple-row">
              <span>{album.title}</span>
              <span>{album.artist.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
