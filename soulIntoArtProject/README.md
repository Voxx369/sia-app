# Soul Into Art - Front-end

React 19 + Vite SPA that now talks to the Express/Postgres API.

## Setup
- `npm install`
- Copy `.env.example` to `.env` (create it) and set `VITE_API_URL=http://localhost:3000` if your API runs locally.
- `npm run dev` to start the dev server.

## Features
- Real login/signup with JWT stored in localStorage.
- Courses page fetches `GET /courses` and lets a logged user enroll via `POST /enroll`.
- My courses page fetches `GET /me/courses`.
- Simple nav with logout and links.

## Notes
- Demo user seeded: `demo.student@sia.local` / `password123`. Admin: `admin@sia.local` / `password123`.
- User session is kept in `localStorage` (`sia:auth`).
