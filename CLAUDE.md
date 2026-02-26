# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SwapSpace is a photo-sharing and swiping app (Tinder-style for photos). This is an npm monorepo with two packages: `packages/backend` and `packages/app`. The web frontend targets both browser and native mobile (iOS/Android) via Capacitor.

The backend uses **Supabase** for all infrastructure: hosted PostgreSQL (via Supabase JS client), Supabase Auth for authentication, and Supabase Storage for photo files. The Express backend is the sole API gateway — clients never talk to Supabase directly.

## Commands

### Development

Run from the repo root:
```bash
npm run dev:backend      # Start backend dev server (port 4000, hot reload)
npm run dev:app          # Start web frontend dev server (port 5173)
```

### Build
```bash
npm run build:backend    # Compile backend TypeScript to dist/
npm run build:app        # TypeScript check + Vite production build
npm run build:cap        # TypeScript check + Vite build (capacitor mode)
```

### Capacitor (Mobile)
```bash
npm run cap:sync         # Copy web assets + sync native plugins
npm run cap:ios          # Open iOS project in Xcode
npm run cap:android      # Open Android project in Android Studio
```

Full native build workflow:
```bash
npm run build:cap && npm run cap:sync && npm run cap:ios   # or cap:android
```

For live reload during Capacitor development, uncomment `server.url` in `packages/app/capacitor.config.ts` and set your machine's local IP. Also update `packages/app/.env.capacitor` with the correct IP.

### Lint
```bash
# From packages/app/:
npm run lint             # ESLint with max-warnings: 0
```

There is no ESLint config for backend. There are no tests in this codebase.

### Database

Schema is managed via Supabase migrations (applied through the Supabase MCP or dashboard). There is no local migration script.

## Environment Setup

Copy `.env.example` to `packages/backend/.env` and populate:
- `SUPABASE_URL` — Supabase project URL (e.g., `https://your-project.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (from project settings > API)
- `PORT` — defaults to 4000
- `CORS_ORIGIN` — comma-separated origins, defaults to `http://localhost:5173`. Include `capacitor://localhost` (iOS) and `https://localhost` (Android) for native builds.
- `NODE_ENV` — `development` or `production`

## Architecture

### Backend (`packages/backend/src/`)

Layered Express/TypeScript API: **routes -> controllers -> services -> Supabase**.

- `index.ts` — entry point; validates Supabase env vars and connection
- `app.ts` — Express setup: helmet, CORS (function-based origin check, comma-separated), rate limiting, route mounting, error handler
- `config/supabase.ts` — Supabase admin client (service_role key, no session persistence)
- `middleware/auth.ts` — `requireAuth` middleware; calls `supabaseAdmin.auth.getUser(token)` to validate access tokens; augments `Express.Request` with `user?: JwtPayload`
- `middleware/errorHandler.ts` — global error handler; use `createError(status, message)` to throw HTTP errors
- `middleware/upload.ts` — Multer config: memory storage (buffer), 10MB limit, JPEG/PNG/WebP only

**Routes:**
- `POST /api/v1/auth/register|login` — rate-limited (20/15 min)
- `POST /api/v1/auth/refresh|logout`
- `/api/v1/photos` — all require auth; `POST /` uses `multer.single('photo')`
- `/api/v1/swipes` — all require auth

**Auth flow:** Uses Supabase Auth. `register()` creates user via `auth.admin.createUser()` with `email_confirm: true` (skips email verification — intentional for current dev stage; trigger auto-creates profile in `profiles` table), then signs in to get session tokens. `login()` uses `auth.signInWithPassword()`. `refresh()` uses `auth.refreshSession()`. `logout()` uses `auth.admin.signOut(accessToken, 'local')` — signs out only the current session. Tokens are Supabase JWTs (access + refresh).

**Photo pipeline:** Multer stores file in memory buffer -> Sharp generates 400x400 JPEG thumbnail from buffer -> both original and thumbnail uploaded to Supabase Storage `photos` bucket -> DB record created with storage paths. Public URLs generated via `storage.from('photos').getPublicUrl()`.

**Swipe logic:** A unique constraint on `(user_id, photo_id)` prevents duplicate swipes (Supabase error code `23505` caught in service). The unseen photos feed uses a Postgres RPC function `get_unseen_photos()` that excludes the user's own photos and already-swiped photos, with cursor-based pagination ordered by `created_at DESC`.

**Database schema** (Supabase):
- `auth.users` — managed by Supabase Auth
- `public.profiles` — `id` (FK to auth.users), `username`, `created_at`. Auto-populated by trigger on auth.users insert.
- `public.photos` — `id`, `user_id` (FK to profiles), `original_path`, `thumbnail_path`, `caption`, `created_at`
- `public.swipes` — `id`, `user_id`, `photo_id`, `direction`, `created_at`, UNIQUE(user_id, photo_id)
- RPC functions: `get_unseen_photos(p_user_id, p_limit, p_cursor)`, `get_liked_photos(p_user_id)`
- RLS enabled on all tables (defense-in-depth; backend uses service_role which bypasses RLS)
- Storage bucket: `photos` (public, 10MB limit, JPEG/PNG/WebP)

### App Frontend (`packages/app/src/`)

React 18 + Vite + React Router + TailwindCSS + Capacitor.

- `App.tsx` — router root with `ProtectedRoute`, `GuestRoute`, and `AuthenticatedLayout` (layout route pattern)
- `components/AuthenticatedLayout.tsx` — shared layout with desktop header, mobile header, and mobile bottom tab bar (Swipe/Upload/Liked)
- `auth/AuthContext.tsx` — global auth state; tokens stored via `lib/storage.ts` abstraction (Capacitor Preferences on native, localStorage on web)
- `api/client.ts` — Axios instance with JWT interceptor; base URL resolved via `lib/platform.ts` (relative on web, absolute on native); on 401 calls refresh, retries queued requests; on refresh failure clears auth storage and redirects to `/login`
- `lib/storage.ts` — platform-aware async storage abstraction with sync token cache for Axios interceptor; uses `@capacitor/preferences` on native, `localStorage` on web
- `api/photo.api.ts` — photo API (backend returns absolute Supabase CDN URLs, no client-side URL resolution needed)
- `api/` — one file per resource: auth, photo (with upload progress), swipe
- `lib/platform.ts` — `isNative()`, `getApiBaseUrl()`, `getServerUrl()` utilities for Capacitor platform detection
- `lib/pickPhoto.ts` — platform-aware photo picker: native camera via `@capacitor/camera`, falls back to HTML file input on web
- `hooks/usePhotoStack.ts` — manages card array with cursor pagination; deduplicates by ID; refetches when fewer than 2 cards remain
- `hooks/useCardSwipe.ts` — framer-motion drag gesture; threshold is 80px offset or 400px/s velocity; animates 500px in 0.3s on swipe commit; haptic feedback on native via `@capacitor/haptics`

Vite dev server proxies `/api/*` to `http://localhost:4000`. Photo URLs are now absolute Supabase Storage CDN URLs (no proxy needed for `/uploads`).

**Routes:** `/login`, `/register` (guest-only) | `/swipe`, `/upload`, `/liked` (protected, wrapped in `AuthenticatedLayout`) | `/` redirects to `/swipe`

**Tailwind brand colors:** `brand-pink` (#FF4458) and `brand-blue` (#2979FF) are defined in `tailwind.config.ts`. Safe area utilities (`pt-safe`, `pb-safe`, etc.) are available for iOS notch/home indicator.

**UI components:** `components/ui/` has `Button` (variants: primary, secondary, danger, ghost), `Input`, and `Spinner`.

### Capacitor (Native Mobile)

The web app runs natively on iOS and Android via Capacitor. Native platform projects live in `packages/app/ios/` and `packages/app/android/`.

- `capacitor.config.ts` — app config with `webDir: 'dist'`, Android HTTPS scheme, splash screen
- `.env.capacitor` — env file for Capacitor builds (set `VITE_API_URL` and `VITE_SERVER_URL` to your machine's local IP)
- `build:cap` script uses `--mode capacitor` to load `.env.capacitor`
- Native plugins: `@capacitor/camera`, `@capacitor/status-bar`, `@capacitor/haptics`, `@capacitor/preferences`
