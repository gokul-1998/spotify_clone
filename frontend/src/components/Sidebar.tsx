import { Link, NavLink } from "react-router-dom";

import type { Playlist } from "../api/types";

interface SidebarProps {
  playlists: Playlist[];
  loading: boolean;
  currentUser: string;
  onCreatePlaylist: () => void | Promise<void>;
}

export function Sidebar({ playlists, loading, currentUser, onCreatePlaylist }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-badge">SC</div>
        <div>
          <p className="eyebrow">Spotify Clone</p>
          <h1>Welcome, {currentUser}</h1>
        </div>
      </div>

      <nav className="nav-stack">
        <NavLink to="/" end className="nav-link">
          Home
        </NavLink>
        <NavLink to="/search" className="nav-link">
          Search
        </NavLink>
        <NavLink to="/library" className="nav-link">
          Your Library
        </NavLink>
      </nav>

      <section className="playlist-rail">
        <div className="section-header">
          <h2>Playlists</h2>
          <button className="ghost-button" onClick={() => void onCreatePlaylist()}>
            New
          </button>
        </div>
        {loading ? <p className="muted">Loading playlists…</p> : null}
        <div className="playlist-links">
          {playlists.map((playlist) => (
            <Link key={playlist.id} to={`/playlists/${playlist.id}`} className="playlist-link">
              <strong>{playlist.title}</strong>
              <span>{playlist.tracks.length} tracks</span>
            </Link>
          ))}
          {!loading && playlists.length === 0 ? <p className="muted">Create your first mix.</p> : null}
        </div>
      </section>
    </aside>
  );
}
