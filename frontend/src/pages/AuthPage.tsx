import { useState } from "react";

import { useAuth } from "../contexts/AuthContext";

export function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");

    try {
      setSubmitting(true);
      setError(null);
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup({ email, password, name });
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <p className="eyebrow">Spotify Clone</p>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="muted">Connect the React frontend to your FastAPI backend with JWT auth.</p>

        <div className="auth-switcher">
          <button className={mode === "login" ? "active-control" : ""} type="button" onClick={() => setMode("login")}>
            Login
          </button>
          <button className={mode === "signup" ? "active-control" : ""} type="button" onClick={() => setMode("signup")}>
            Signup
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label>
              Name
              <input name="name" placeholder="Your display name" required />
            </label>
          ) : null}
          <label>
            Email
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input name="password" type="password" placeholder="At least 6 characters" required />
          </label>
          {error ? <div className="banner error-banner">{error}</div> : null}
          <button className="pill-button auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Working…" : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
