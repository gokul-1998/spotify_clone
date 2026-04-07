export type RepeatMode = "off" | "one" | "all";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface PublicUser {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface UserProfile extends PublicUser {
  follower_count: number;
  following_count: number;
}

export interface Artist {
  id: number;
  name: string;
  bio: string | null;
  image_url: string | null;
  genre: string | null;
}

export interface Album {
  id: number;
  title: string;
  cover_image: string | null;
  genre: string | null;
  release_year: number | null;
  artist: Artist;
}

export interface Track {
  id: number;
  title: string;
  duration_seconds: number;
  genre: string | null;
  audio_url: string | null;
  audio_path: string | null;
  artist: Artist;
  album: Album;
}

export interface PlaylistTrack {
  id: number;
  position: number;
  added_at: string;
  track: Track;
}

export interface Playlist {
  id: number;
  title: string;
  description: string | null;
  is_public: boolean;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  owner: PublicUser;
  tracks: PlaylistTrack[];
}

export interface SearchResponse {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
}

export interface SuggestionsResponse {
  suggestions: string[];
}

export interface LibrarySnapshot {
  liked_tracks: Track[];
  saved_albums: Album[];
  saved_artists: Artist[];
  recently_played: Track[];
}

export interface PlaybackState {
  current_track: Track | null;
  is_playing: boolean;
  position_seconds: number;
  volume: number;
  shuffle_enabled: boolean;
  repeat_mode: RepeatMode;
  queue_track_ids: number[];
}
