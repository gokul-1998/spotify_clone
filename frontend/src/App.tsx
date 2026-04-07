import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { api } from "./api/client";
import type { Playlist } from "./api/types";
import { BottomPlayerBar } from "./components/BottomPlayerBar";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { useAuth } from "./contexts/AuthContext";
import { AlbumPage } from "./pages/AlbumPage";
import { ArtistPage } from "./pages/ArtistPage";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { PlaylistPage } from "./pages/PlaylistPage";
import { SearchPage } from "./pages/SearchPage";
import { useEffect, useState } from "react";

function AppLayout() {
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPlaylists = async () => {
    if (!token) {
      setPlaylists([]);
      return;
    }
    try {
      setPlaylistsLoading(true);
      const nextPlaylists = await api.listPlaylists(token);
      setPlaylists(nextPlaylists);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load playlists");
    } finally {
      setPlaylistsLoading(false);
    }
  };

  useEffect(() => {
    void refreshPlaylists();
  }, [token, location.pathname]);

  const handleCreatePlaylist = async () => {
    if (!token) return;
    const title = window.prompt("Name your playlist", "My Mix");
    if (!title?.trim()) return;
    const playlist = await api.createPlaylist(token, { title: title.trim(), is_public: true });
    await refreshPlaylists();
    navigate(`/playlists/${playlist.id}`);
  };

  return (
    <div className="app-shell">
      <Sidebar
        playlists={playlists}
        loading={playlistsLoading}
        currentUser={user?.name ?? "Listener"}
        onCreatePlaylist={handleCreatePlaylist}
      />
      <div className="main-column">
        <TopBar user={user} onLogout={logout} />
        {error ? <div className="banner error-banner">{error}</div> : null}
        <main className="main-content">
          <Outlet context={{ refreshPlaylists }} />
        </main>
      </div>
      <BottomPlayerBar />
    </div>
  );
}

function RequireAuth() {
  const { token, initializing } = useAuth();

  if (initializing) {
    return <div className="screen-center">Checking your session…</div>;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <AppLayout />;
}

function PublicOnly() {
  const { token, initializing } = useAuth();

  if (initializing) {
    return <div className="screen-center">Checking your session…</div>;
  }

  return token ? <Navigate to="/" replace /> : <AuthPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicOnly />} />
      <Route path="/" element={<RequireAuth />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="playlists/:playlistId" element={<PlaylistPage />} />
        <Route path="albums/:albumId" element={<AlbumPage />} />
        <Route path="artists/:artistId" element={<ArtistPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
