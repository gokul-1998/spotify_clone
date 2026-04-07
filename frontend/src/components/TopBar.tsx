import { Link } from "react-router-dom";

import type { UserProfile } from "../api/types";

interface TopBarProps {
  user: UserProfile | null;
  onLogout: () => void;
}

export function TopBar({ user, onLogout }: TopBarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">For you</p>
        <h2>Stream your catalog</h2>
      </div>
      <div className="topbar-actions">
        <Link to="/search" className="pill-button">
          Discover
        </Link>
        <div className="profile-chip">
          <div className="avatar-orb">{user?.name?.slice(0, 1).toUpperCase() ?? "?"}</div>
          <div>
            <strong>{user?.name ?? "Guest"}</strong>
            <span>{user?.email ?? "No account loaded"}</span>
          </div>
        </div>
        <button className="ghost-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
