import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { api } from "../api/client";
import type { UserProfile } from "../api/types";

const STORAGE_KEY = "spotify-clone-token";

interface AuthContextValue {
  token: string | null;
  user: UserProfile | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refreshProfile = async () => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const profile = await api.me(token);
      setUser(profile);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    void (async () => {
      await refreshProfile();
      setInitializing(false);
    })();
  }, [token]);

  const persistToken = (nextToken: string | null) => {
    setToken(nextToken);
    if (nextToken) {
      localStorage.setItem(STORAGE_KEY, nextToken);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    persistToken(response.access_token);
    const profile = await api.me(response.access_token);
    setUser(profile);
  };

  const signup = async (payload: { email: string; password: string; name: string }) => {
    const response = await api.signup(payload);
    persistToken(response.access_token);
    const profile = await api.me(response.access_token);
    setUser(profile);
  };

  const logout = () => {
    persistToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      initializing,
      login,
      signup,
      logout,
      refreshProfile,
    }),
    [token, user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
