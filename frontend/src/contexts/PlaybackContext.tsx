import { createContext, useContext, useEffect, useRef, useState } from "react";

import { api } from "../api/client";
import type { PlaybackState, RepeatMode, Track } from "../api/types";
import { useAuth } from "./AuthContext";

const defaultState: PlaybackState = {
  current_track: null,
  is_playing: false,
  position_seconds: 0,
  volume: 0.7,
  shuffle_enabled: false,
  repeat_mode: "off",
  queue_track_ids: [],
};

interface PlaybackContextValue {
  playback: PlaybackState;
  ready: boolean;
  queueTracks: (tracks: Track[], startingTrack?: Track) => Promise<void>;
  playTrack: (track: Track, queueTrackIds?: number[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleShuffle: () => Promise<void>;
  cycleRepeat: () => Promise<void>;
  syncPlayback: () => Promise<void>;
}

const PlaybackContext = createContext<PlaybackContextValue | undefined>(undefined);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [playback, setPlayback] = useState<PlaybackState>(defaultState);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrubLockRef = useRef(false);

  const applyState = (nextState: PlaybackState) => {
    setPlayback(nextState);
    setReady(true);
  };

  const syncPlayback = async () => {
    if (!token) {
      applyState(defaultState);
      return;
    }
    const nextState = await api.getPlayback(token);
    applyState(nextState);
  };

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "metadata";
    audioRef.current.volume = defaultState.volume;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    void syncPlayback();
  }, [token]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = playback.volume;
  }, [playback.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTrackId = playback.current_track?.id;
    const nextSrc = currentTrackId ? api.streamUrl(currentTrackId) : "";
    if (currentTrackId && audio.src !== nextSrc) {
      audio.src = nextSrc;
      audio.load();
    }
    if (!currentTrackId) {
      audio.removeAttribute("src");
      audio.load();
      return;
    }
    if (Math.abs(audio.currentTime - playback.position_seconds) > 2 && !scrubLockRef.current) {
      audio.currentTime = playback.position_seconds;
    }
    if (playback.is_playing) {
      void audio.play().catch(() => {
        void api.pause(token ?? "").then(applyState).catch(() => undefined);
      });
    } else {
      audio.pause();
    }
  }, [playback.current_track?.id, playback.is_playing, playback.position_seconds, token]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !token) return;

    const handleTimeUpdate = () => {
      if (scrubLockRef.current) return;
      setPlayback((previous) => ({ ...previous, position_seconds: audio.currentTime }));
    };

    const handleEnded = () => {
      void api.next(token).then(applyState).catch(() => undefined);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [token]);

  const guardToken = () => {
    if (!token) {
      throw new Error("You must be signed in");
    }
    return token;
  };

  const playTrack = async (track: Track, queueTrackIds?: number[]) => {
    const authToken = guardToken();
    const nextState = await api.play(authToken, {
      track_id: track.id,
      queue_track_ids: queueTrackIds ?? null,
    });
    applyState(nextState);
  };

  const queueTracks = async (tracks: Track[], startingTrack?: Track) => {
    const authToken = guardToken();
    const queueTrackIds = tracks.map((track) => track.id);
    const nextState = await api.play(authToken, {
      track_id: startingTrack?.id ?? tracks[0]?.id ?? null,
      queue_track_ids: queueTrackIds,
    });
    applyState(nextState);
  };

  const togglePlayPause = async () => {
    const authToken = guardToken();
    const nextState = playback.is_playing ? await api.pause(authToken) : await api.play(authToken, {});
    applyState(nextState);
  };

  const nextTrack = async () => {
    const authToken = guardToken();
    applyState(await api.next(authToken));
  };

  const previousTrack = async () => {
    const authToken = guardToken();
    applyState(await api.previous(authToken));
  };

  const seekTo = async (seconds: number) => {
    const authToken = guardToken();
    scrubLockRef.current = true;
    applyState(await api.seek(authToken, seconds));
    scrubLockRef.current = false;
  };

  const setVolume = async (volume: number) => {
    const authToken = guardToken();
    applyState(await api.setVolume(authToken, volume));
  };

  const toggleShuffle = async () => {
    const authToken = guardToken();
    applyState(await api.toggleShuffle(authToken));
  };

  const cycleRepeat = async () => {
    const authToken = guardToken();
    const order: RepeatMode[] = ["off", "all", "one"];
    const currentIndex = order.indexOf(playback.repeat_mode);
    const nextMode = order[(currentIndex + 1) % order.length];
    applyState(await api.setRepeat(authToken, nextMode));
  };

  return (
    <PlaybackContext.Provider
      value={{
        playback,
        ready,
        queueTracks,
        playTrack,
        togglePlayPause,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        toggleShuffle,
        cycleRepeat,
        syncPlayback,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error("usePlayback must be used inside PlaybackProvider");
  }
  return context;
}
