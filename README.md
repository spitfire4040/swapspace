# SwapSpace

A photo-sharing and swiping app (Tinder-style for photos). Users upload photos, swipe through a feed to like or skip, and browse their liked collection.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | npm workspaces |
| **Backend** | Express 4, TypeScript, Node.js |
| **Frontend** | React 18, Vite 5, React Router 6, TailwindCSS 3 |
| **Mobile** | Capacitor 8 (iOS & Android) |
| **Database** | PostgreSQL (Supabase-hosted) |
| **Auth** | Supabase Auth (JWT access + refresh tokens) |
| **Storage** | Supabase Storage (photo uploads) |
| **Image Processing** | Sharp (400x400 JPEG thumbnails) |
| **Animations** | Framer Motion (drag gestures, card swiping) |
| **Validation** | Zod (shared across backend & frontend) |

## Project Structure

```
packages/
  backend/   Express API — routes, controllers, services, Supabase client
  app/       React SPA — also builds to iOS/Android via Capacitor
```

The Express backend is the sole API gateway. Clients never talk to Supabase directly.

## Prerequisites

- Node.js (ES2020+ target, 18+ recommended)
- npm 7+ (workspace support)
- A [Supabase](https://supabase.com) project with:
  - Auth enabled
  - A `photos` storage bucket (public, 10MB limit, JPEG/PNG/WebP)
  - Database tables: `profiles`, `photos`, `swipes`
  - RPC functions: `get_unseen_photos`, `get_liked_photos`
  - A trigger on `auth.users` insert to auto-create a `profiles` row

## Environment Variables

### Backend (`packages/backend/.env`)

Copy from `packages/backend/.env.example`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,capacitor://localhost,https://localhost
```

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (bypasses RLS) |
| `PORT` | No | Server port (default: 4000) |
| `NODE_ENV` | No | `development` or `production` |
| `CORS_ORIGIN` | No | Comma-separated allowed origins |

### Frontend — Capacitor builds only (`packages/app/.env.capacitor`)

Copy from `packages/app/.env.capacitor.example`:

```env
VITE_API_URL=http://YOUR_LOCAL_IP:4000/api/v1
VITE_SERVER_URL=http://YOUR_LOCAL_IP:4000
```

Web development doesn't need a `.env` — Vite proxies `/api/*` to `http://localhost:4000` automatically.

## Getting Started

```bash
# Install all dependencies
npm install

# Start both servers (in separate terminals)
npm run dev:backend    # Express API on :4000
npm run dev:app        # Vite dev server on :5173
```

Open http://localhost:5173.

## All Scripts

Run from the repo root:

| Script | Description |
|--------|-------------|
| `npm run dev:backend` | Backend dev server with hot reload |
| `npm run dev:app` | Frontend dev server with HMR |
| `npm run build:backend` | Compile backend TypeScript to `dist/` |
| `npm run build:app` | TypeScript check + Vite production build |
| `npm run build:cap` | Vite build for Capacitor (loads `.env.capacitor`) |
| `npm run cap:sync` | Sync web assets to native projects |
| `npm run cap:ios` | Open Xcode |
| `npm run cap:android` | Open Android Studio |

Lint (from `packages/app/`):
```bash
npm run lint   # ESLint, zero warnings allowed
```

## Mobile Development (Capacitor)

```bash
# Full native build workflow
npm run build:cap && npm run cap:sync && npm run cap:ios    # or cap:android
```

For live reload on a device, set your machine's local IP in `packages/app/.env.capacitor` and uncomment `server.url` in `packages/app/capacitor.config.ts`.

## API Overview

All endpoints are prefixed with `/api/v1`.

**Auth** (public):
- `POST /auth/register` — Create account (email, username, password)
- `POST /auth/login` — Sign in
- `POST /auth/refresh` — Refresh token pair
- `POST /auth/logout` — Sign out current session (requires auth)

**Photos** (all require auth):
- `POST /photos` — Upload photo (multipart, field: `photo`, optional `caption`)
- `GET /photos/unseen` — Paginated feed (excludes own & swiped photos)
- `GET /photos/liked` — Photos the user has liked
- `GET /photos/mine` — User's own uploads
- `DELETE /photos/:id` — Delete photo (owner only)

**Swipes** (all require auth):
- `POST /swipes` — Record a swipe (`photoId`, `direction`: `like`/`skip`)
- `GET /swipes/liked` — User's liked swipes

## Database Schema

| Table | Key Columns |
|-------|-------------|
| `auth.users` | Managed by Supabase Auth |
| `profiles` | `id` (FK auth.users), `username`, `created_at` |
| `photos` | `id`, `user_id`, `original_path`, `thumbnail_path`, `caption`, `created_at` |
| `swipes` | `id`, `user_id`, `photo_id`, `direction`, `created_at`, UNIQUE(user_id, photo_id) |

RLS is enabled on all tables. The backend uses the service role key which bypasses RLS.
