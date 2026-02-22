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

There is no ESLint config for backend or mobile. There are no tests in this codebase.

### Database
```bash
# From packages/backend/:
npm run migrate          # Run SQL migrations from src/db/migrations/
```

## Environment Setup

Copy `.env.example` to `packages/backend/.env` and populate:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — signing secrets
- `JWT_ACCESS_EXPIRES_IN` — defaults to `15m`
- `JWT_REFRESH_EXPIRES_IN` — defaults to `30d`
- `PORT` — defaults to 4000
- `CORS_ORIGIN` — defaults to `http://localhost:5173`
- `NODE_ENV` — `development` or `production`

## Architecture

### Backend (`packages/backend/src/`)

Layered Express/TypeScript API: **routes → controllers → services → DB**.

- `index.ts` — entry point; validates DB connection, creates upload directories
- `app.ts` — Express setup: helmet, CORS, rate limiting, route mounting, error handler
- `config/db.ts` — PostgreSQL pool initialized from `DATABASE_URL`
- `db/migrations/` — ordered SQL files (001: users, 002: photos, 003: refresh_tokens, 004: swipes)
- `middleware/auth.ts` — `requireAuth` middleware; augments `Express.Request` with `user?: JwtPayload`
- `middleware/errorHandler.ts` — global error handler; use `createError(status, message)` to throw HTTP errors
- `middleware/upload.ts` — Multer config: disk storage to `uploads/originals/`, UUID filenames, 10MB limit, JPEG/PNG/WebP only

**Routes:**
- `POST /api/v1/auth/register|login` — rate-limited (20/15 min)
- `POST /api/v1/auth/refresh|logout`
- `/api/v1/photos` — all require auth; `POST /` uses `multer.single('photo')`
- `/api/v1/swipes` — all require auth

**Auth flow:** Access tokens (15 min JWT) + refresh tokens (30 days, hashed with SHA256 in DB). Token is revoked on use and a new pair is issued (rotation). PostgreSQL error code `23505` on duplicate email/username is caught and mapped to 409.

**Photo pipeline:** Multer saves original with UUID filename → Sharp generates 400×400 JPEG thumbnail (cover fit, attention focus) at 80% quality → DB record created. Static files served from `uploads/` with 7-day cache headers. URLs returned from service: `/uploads/originals/{filename}` and `/uploads/thumbnails/{thumbnail}`.

**Swipe logic:** A unique constraint on `(user_id, photo_id)` prevents duplicate swipes (code `23505` caught in service). The unseen photos feed excludes the user's own photos and already-swiped photos via LEFT JOIN, using cursor-based pagination ordered by `created_at DESC`.

### Web Frontend (`packages/web/src/`)

React 18 + Vite + React Router + TailwindCSS.

- `App.tsx` — router root with `ProtectedRoute` (redirects to `/login`) and `GuestRoute` (redirects to `/swipe`)
- `auth/AuthContext.tsx` — global auth state; tokens and user stored in localStorage
- `api/client.ts` — Axios instance with JWT interceptor; on 401 it calls `/api/auth/refresh`, updates tokens, and retries queued requests (uses `isRefreshing` flag to prevent duplicate refresh calls); on refresh failure clears localStorage and redirects to `/login`
- `api/` — one file per resource: auth, photo (with upload progress), swipe
- `hooks/usePhotoStack.ts` — manages card array with cursor pagination; deduplicates by ID; refetches when fewer than 2 cards remain
- `hooks/useCardSwipe.ts` — framer-motion drag gesture; threshold is 100px offset or 500px/s velocity; animates 600px in 0.3s on swipe commit

Vite dev server proxies `/api/*` and `/uploads/*` to `http://localhost:4000`.

**Routes:** `/login`, `/register` (guest-only) · `/swipe`, `/upload`, `/liked` (protected) · `/` redirects to `/swipe`

**Tailwind brand colors:** `brand-pink` (#FF4458) and `brand-blue` (#2979FF) are defined in `tailwind.config.ts`.

**UI components:** `components/ui/` has `Button` (variants: primary, secondary, danger, ghost), `Input`, and `Spinner`.

### Mobile App (`packages/mobile/src/`)

React Native + Expo + React Navigation.

- `auth/AuthContext.tsx` — auth state backed by `expo-secure-store` (not localStorage)
- `navigation/AppNavigator.tsx` — bottom tab navigator (Swipe, Upload, Liked) for authenticated users
- `navigation/AuthNavigator.tsx` — state-based switcher between Login and Register screens (no stack)
- `screens/` — mirrors the web pages (Login, Register, Swipe, Upload, Liked)
- `components/CardStack.tsx` + `SwipeCard.tsx` — swipeable card UI using react-native-gesture-handler + reanimated
- `api/client.ts` — same 401/refresh logic as web but reads tokens from `SecureStore`; `BASE_URL` defaults to `http://localhost:4000/api/v1` — change to your machine's local IP when testing on a physical device

**Metro config:** `metro.config.js` sets `watchFolders` to include the repo root `node_modules` and blocks backend/web packages from resolution — required for monorepo compatibility.

Note: `react-native-reanimated` must remain the last Babel plugin in `babel.config.js`.
