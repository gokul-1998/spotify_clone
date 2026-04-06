# Phase 1 Backend

This project now includes an Express + MongoDB backend scaffold for the MVP features listed in `phase1.md`.

## Stack

- Express
- MongoDB + Mongoose
- JWT authentication
- Bcrypt password hashing

## Setup

1. Run `npm install`
2. Copy `.env.example` to `.env`
3. Update `MONGODB_URI` and `JWT_SECRET`
4. Start the server with `npm run dev`

## Main API Areas

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `POST /api/users/:id/follow`
- `DELETE /api/users/:id/follow`
- `GET /api/library`
- `POST /api/library/songs/:songId/like`
- `DELETE /api/library/songs/:songId/like`
- `POST /api/library/albums/:albumId/save`
- `DELETE /api/library/albums/:albumId/save`
- `POST /api/library/artists/:artistId/save`
- `DELETE /api/library/artists/:artistId/save`
- `POST /api/library/recent/:songId`
- `GET /api/playlists`
- `POST /api/playlists`
- `GET /api/playlists/:id`
- `PATCH /api/playlists/:id`
- `DELETE /api/playlists/:id`
- `POST /api/playlists/:id/songs`
- `DELETE /api/playlists/:id/songs/:songId`
- `GET /api/playback/state`
- `PUT /api/playback/state`
- `POST /api/playback/play`
- `POST /api/playback/pause`
- `POST /api/playback/seek`
- `POST /api/playback/next`
- `POST /api/playback/previous`
- `POST /api/playback/volume`
- `POST /api/playback/modes`
- `GET /api/search`
- `GET /api/search/suggestions`
- `GET /api/songs`
- `GET /api/songs/:id`
- `GET /api/songs/:id/stream`

## Notes

- The stream endpoint supports HTTP range requests when `audioFilePath` points to a local file and `AUDIO_BASE_PATH` is configured.
- If `audioUrl` is stored on a song document, the stream endpoint redirects to that hosted URL instead.
- Seed/admin upload flows are not included yet, so songs, artists, and albums need to be inserted manually or through a future admin API.
