import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { PlaybackProvider } from "./contexts/PlaybackContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlaybackProvider>
          <App />
        </PlaybackProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
