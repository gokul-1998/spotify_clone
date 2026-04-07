import type {
  Album,
  Artist,
  LibrarySnapshot,
  PlaybackState,
  Playlist,
  SearchResponse,
  SuggestionsResponse,
  TokenResponse,
  Track,
  UserProfile,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const rawText = await response.text();
  const payload = rawText ? JSON.parse(rawText) : null;

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload && "detail" in payload
        ? String((payload as { detail: unknown }).detail)
        : "Request failed";
    throw new ApiError(detail, response.status, payload);
  }

  return payload as T;
}

export const api = {
  baseUrl: API_BASE_URL,
  streamUrl(trackId: number) {
    return `${API_BASE_URL}/tracks/${trackId}/stream`;
  },
  health() {
    return request<{ status: string }>("/health");
  },
  signup(payload: { email: string; password: string; name: string }) {
    return request<TokenResponse>("/auth/signup", { method: "POST", body: payload });
  },
  login(payload: { email: string; password: string }) {
    return request<TokenResponse>("/auth/login", { method: "POST", body: payload });
  },
  me(token: string) {
    return request<UserProfile>("/auth/me", { token });
  },
  updateMe(token: string, payload: { name?: string | null; avatar_url?: string | null; bio?: string | null }) {
    return request<UserProfile>("/auth/me", { method: "PATCH", token, body: payload });
  },
  listTracks() {
    return request<Track[]>("/tracks");
  },
  getTrack(trackId: number) {
    return request<Track>(`/tracks/${trackId}`);
  },
  listArtists() {
    return request<Artist[]>("/artists");
  },
  listAlbums() {
    return request<Album[]>("/albums");
  },
  search(query: string) {
    return request<SearchResponse>(`/search?q=${encodeURIComponent(query)}`);
  },
  suggestions(query: string) {
    return request<SuggestionsResponse>(`/search/suggestions?q=${encodeURIComponent(query)}`);
  },
  getLibrary(token: string) {
    return request<LibrarySnapshot>("/library", { token });
  },
  likeTrack(token: string, trackId: number) {
    return request<{ liked: boolean; track_id: number }>(`/library/tracks/${trackId}/like`, {
      method: "POST",
      token,
    });
  },
  unlikeTrack(token: string, trackId: number) {
    return request<{ liked: boolean; track_id: number }>(`/library/tracks/${trackId}/like`, {
      method: "DELETE",
      token,
    });
  },
  saveAlbum(token: string, albumId: number) {
    return request<{ saved: boolean; album_id: number }>(`/library/albums/${albumId}/save`, {
      method: "POST",
      token,
    });
  },
  unsaveAlbum(token: string, albumId: number) {
    return request<{ saved: boolean; album_id: number }>(`/library/albums/${albumId}/save`, {
      method: "DELETE",
      token,
    });
  },
  saveArtist(token: string, artistId: number) {
    return request<{ saved: boolean; artist_id: number }>(`/library/artists/${artistId}/save`, {
      method: "POST",
      token,
    });
  },
  unsaveArtist(token: string, artistId: number) {
    return request<{ saved: boolean; artist_id: number }>(`/library/artists/${artistId}/save`, {
      method: "DELETE",
      token,
    });
  },
  listPlaylists(token: string) {
    return request<Playlist[]>("/playlists", { token });
  },
  getPlaylist(token: string, playlistId: number) {
    return request<Playlist>(`/playlists/${playlistId}`, { token });
  },
  createPlaylist(token: string, payload: { title: string; description?: string; is_public?: boolean }) {
    return request<Playlist>("/playlists", { method: "POST", token, body: payload });
  },
  updatePlaylist(
    token: string,
    playlistId: number,
    payload: { title?: string | null; description?: string | null; is_public?: boolean | null },
  ) {
    return request<Playlist>(`/playlists/${playlistId}`, { method: "PATCH", token, body: payload });
  },
  deletePlaylist(token: string, playlistId: number) {
    return request<void>(`/playlists/${playlistId}`, { method: "DELETE", token });
  },
  addTrackToPlaylist(token: string, playlistId: number, trackId: number) {
    return request<Playlist>(`/playlists/${playlistId}/tracks`, {
      method: "POST",
      token,
      body: { track_id: trackId },
    });
  },
  removeTrackFromPlaylist(token: string, playlistId: number, playlistTrackId: number) {
    return request<Playlist>(`/playlists/${playlistId}/tracks/${playlistTrackId}`, {
      method: "DELETE",
      token,
    });
  },
  getPlayback(token: string) {
    return request<PlaybackState>("/playback", { token });
  },
  play(token: string, payload: { track_id?: number | null; queue_track_ids?: number[] | null }) {
    return request<PlaybackState>("/playback/play", { method: "POST", token, body: payload });
  },
  pause(token: string) {
    return request<PlaybackState>("/playback/pause", { method: "POST", token });
  },
  seek(token: string, positionSeconds: number) {
    return request<PlaybackState>("/playback/seek", {
      method: "POST",
      token,
      body: { position_seconds: positionSeconds },
    });
  },
  next(token: string) {
    return request<PlaybackState>("/playback/next", { method: "POST", token });
  },
  previous(token: string) {
    return request<PlaybackState>("/playback/previous", { method: "POST", token });
  },
  toggleShuffle(token: string) {
    return request<PlaybackState>("/playback/shuffle", { method: "POST", token });
  },
  setRepeat(token: string, repeatMode: PlaybackState["repeat_mode"]) {
    return request<PlaybackState>("/playback/repeat", { method: "POST", token, body: { repeat_mode: repeatMode } });
  },
  setVolume(token: string, volume: number) {
    return request<PlaybackState>("/playback/volume", { method: "POST", token, body: { volume } });
  },
};
