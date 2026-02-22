# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SwapSpace is a photo-sharing and swiping app (Tinder-style for photos). This is an npm monorepo with three packages: `packages/backend`, `packages/web`, and `packages/mobile`.

## Commands

### Development

Run from the repo root:
```bash
npm run dev:backend      # Start backend dev server (port 4000, hot reload)
npm run dev:web          # Start web frontend dev server (port 5173)
```

Run mobile from `packages/mobile/`:
```bash
npm start                # Start Expo dev server
npm run ios              # Launch on iOS simulator
npm run android          # Launch on Android emulator
```

### Build
```bash
npm run build:backend    # Compile backend TypeScript to dist/
npm run build:web        # TypeScript check + Vite production build
```

### Lint
```bash
# From packages/web/:
npm run lint             # ESLint with max-warnings: 0
```

### Database
```bash
# From packages/backend/:
npm run migrate          # Run SQL migrations from src/db/migrations/
```

## Environment Setup

Copy `.env.example` to `packages/backend/.env` and populate:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` and `JWT_REFRESH_SECRET` — signing secrets
- `PORT` — defaults to 4000
- `CORS_ORIGIN` — defaults to `http://localhost:5173`

## Architecture

### Backend (`packages/backend/src/`)

Layered Express/TypeScript API: **routes → controllers → services → DB**.

- `index.ts` — entry point; validates DB connection, creates upload directories
- `app.ts` — Express setup: helmet, CORS, rate limiting, route mounting, error handler
- `config/db.ts` — PostgreSQL pool
- `db/migrations/` — ordered SQL files (001: users, 002: photos, 003: refresh_tokens, 004: swipes)
- `middleware/auth.ts` — `requireAuth` middleware using JWT verification
- `middleware/upload.ts` — Multer configuration for file uploads
- `services/` — all business logic lives here (auth, photo, swipe)
- `controllers/` — Zod request validation + service delegation
- `routes/` — route definitions

**Auth flow:** Access tokens (15 min JWT) + refresh tokens (30 days, hashed in DB with rotation). The refresh token is revoked on use and a new pair is issued.

**Photo pipeline:** Multer saves original with UUID filename → Sharp generates 400×400 JPEG thumbnail at 80% quality → DB record created. Static files served from `uploads/` with 7-day cache headers.

**Swipe logic:** A unique constraint on `(user_id, photo_id)` prevents duplicate swipes. The unseen photos feed excludes the user's own photos and already-swiped photos, using cursor-based pagination ordered by `created_at DESC`.

### Web Frontend (`packages/web/src/`)

React 18 + Vite + React Router + TailwindCSS.

- `App.tsx` — router root with `ProtectedRoute` (redirects to `/login`) and `GuestRoute` (redirects to `/swipe`)
- `auth/AuthContext.tsx` — global auth state; tokens stored in localStorage
- `api/client.ts` — Axios instance with JWT interceptor; on 401 it calls `/api/auth/refresh`, updates tokens, and retries the original request
- `api/` — one file per resource (auth, photo, swipe)
- `hooks/usePhotoStack.ts` — manages the photo feed state
- `hooks/useCardSwipe.ts` — drag/swipe gesture logic used by `SwipeCard`

Vite dev server proxies `/api/*` and `/uploads/*` to `http://localhost:4000`.

**Routes:** `/login`, `/register` (guest-only) · `/swipe`, `/upload`, `/liked` (protected) · `/` redirects to `/swipe`

### Mobile App (`packages/mobile/src/`)

React Native + Expo + React Navigation.

- `auth/AuthContext.tsx` — auth state backed by `expo-secure-store` (not localStorage)
- `navigation/AppNavigator.tsx` — stack navigator for authenticated screens
- `navigation/AuthNavigator.tsx` — stack navigator for login/register
- `screens/` — mirrors the web pages (Login, Register, Swipe, Upload, Liked)
- `components/CardStack.tsx` + `SwipeCard.tsx` — swipeable card UI

Note: `react-native-reanimated` must remain the last Babel plugin in `babel.config.js`.
