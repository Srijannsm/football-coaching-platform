# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A football coaching academy platform with a Django REST Framework backend and a React (Vite) frontend. Players browse and book training sessions; admins manage sessions, coaches, bookings, enquiries, and gallery content.

---

## Development Commands

### Backend

All backend commands run from `backend/` with the virtualenv active:

```bash
source ../venv/bin/activate          # activate venv (root-level)
python manage.py runserver           # dev server on :8000
python manage.py migrate             # apply migrations
python manage.py makemigrations      # generate migrations after model changes
python manage.py createsuperuser     # create admin user
```

Requires a `backend/.env` file. Minimum required vars:
```
SECRET_KEY=...
DB_PASSWORD=...
DEBUG=True
DB_HOST=localhost
DB_PORT=5432
```

### Frontend

All frontend commands run from `frontend/`:

```bash
npm run dev      # dev server on :5173 (proxies /api and /media to :8000)
npm run build    # production build
npm run lint     # ESLint
```

### Docker (backend + postgres only)

```bash
docker-compose up --build    # starts postgres (:5433) + Django (:8000) via gunicorn
docker-compose down
```

The frontend is **not** containerized — run it locally with `npm run dev`.

---

## Architecture

### Backend (`backend/`)

Django apps and their responsibilities:

| App | Purpose |
|-----|---------|
| `accounts` | Custom User model, PlayerProfile, CoachProfile, all auth views |
| `training` | TrainingProgram and TrainingSession models/views |
| `bookings` | Booking model, player booking flow, player dashboard API |
| `adminpanel` | Admin-facing CRUD views, email utilities, notifications, IsAdminRole permission |
| `contents` | Testimonial model |
| `enquiries` | Enquiry model |
| `gallery` | GalleryCategory and GalleryItem models/views |
| `config` | settings.py, urls.py, wsgi.py |

All apps mount under `/api/` except admin endpoints which mount under `/api/admin/`.

**Authentication** uses HttpOnly JWT cookies (not Authorization headers). The custom class is `accounts/authentication.py:CookieJWTAuthentication`. Access token lifetime is 12 hours, refresh is 1 day. The frontend axios interceptor (`frontend/src/api/axios.js`) handles silent token refresh on 401, queuing concurrent requests until refresh completes.

**Authorization** has two layers:
- `IsAuthenticated` (default for all views)
- `IsAdminRole` (`adminpanel/permissions.py`) — checks `user.role == 'admin'` or `is_superuser`

**Email verification** and **password reset** both use `django.core.signing.TimestampSigner` with different salts (`default` for email verification, `'password-reset'` for resets). Never reuse tokens across flows. Email helpers live in `adminpanel/email_utils.py`.

**Password minimum length** is 8 characters — set in both `AUTH_PASSWORD_VALIDATORS` (settings) and enforced in `accounts/serializers.py` and `accounts/views.py` (reset confirm view).

**Bookings** use `select_for_update()` to prevent race conditions on capacity checks.

**All email sending** is done via `adminpanel/email_utils.py`. In dev, `EMAIL_BACKEND` defaults to console — emails print to terminal.

### Frontend (`frontend/src/`)

**Routing** (all in `App.jsx`): Public routes are open. `/player-dashboard/*` wrapped in `ProtectedRoute`. `/admin-dashboard/*` wrapped in `AdminRoute`. `/login` and `/register` wrapped in `PublicOnlyRoute`.

**State** is managed with three React Contexts:
- `AuthContext` — user object, `isAuthenticated`, `login()`, `logout()`
- `ToastContext` — `showToast(message, type)` for all notifications
- `ThemeContext` — dark/light mode persisted to localStorage

**API layer** (`src/api/axios.js`): Single axios instance with `withCredentials: true`. All service files (`src/services/`) use this instance. Never add Authorization headers — auth is cookie-based.

**Toast pattern**: Booking errors, form errors, and success confirmations all go through `showToast` from `useToast()`. Do not use `<Alert>` components for transient errors — those are only for inline persistent validation messages (e.g., login page).

**Admin features** live in `src/features/admin/` — this is the only feature-folder; everything else is flat in `src/pages/` and `src/components/`.

**Unverified email banner** renders inside `Navbar.jsx` when `user.is_email_verified === false`. The backend returns `is_email_verified` on both login (`/api/login/`) and the `/api/me/` endpoint.

### URL / API surface

```
POST   /api/register/
POST   /api/login/
POST   /api/logout/
POST   /api/token/refresh/
GET    /api/me/
GET    /api/verify-email/?token=
POST   /api/send-verification/
POST   /api/forgot-password/
POST   /api/reset-password/
GET/PATCH /api/player/profile/
GET    /api/coaches/profiles/
GET    /api/training-sessions/
GET    /api/training-sessions/:id/
POST   /api/bookings/
GET    /api/my-bookings/
PATCH  /api/my-bookings/:id/cancel/
GET    /api/bookings/dashboard/
GET    /api/gallery/categories/
GET    /api/gallery/random/
POST   /api/enquiries/
GET    /api/admin/*     ← all admin CRUD endpoints
```

---

## Key Conventions

- **User roles**: `'player'`, `'coach'`, `'admin'` — stored on `User.role`. Check with `user.is_player`, `user.is_coach`, `user.is_admin` properties.
- **Booking statuses**: `pending`, `confirmed`, `cancelled`, `attended`, `missed`.
- **Session types**: `'group'`, `'one_to_one'` — one-to-one sessions are hard-capped at `max_players=1`.
- **Images**: Uploaded via `multipart/form-data`. All uploads are processed by `config/image_utils.py` which validates via Pillow (magic-byte check to block malicious files), strips EXIF metadata, downscales images exceeding `IMAGE_MAX_DIMENSION` (default 1920px), and converts to WebP. Processing is wired into every serializer that accepts image fields — never save raw uploads. Frontend uses `ImageUploadField` component for all image inputs. All `<img>` tags must include `loading="lazy"` and `decoding="async"` (except lightbox/modal images that are already in viewport).
- **Pagination**: DRF uses `PageNumberPagination` with `PAGE_SIZE=10`. Admin list endpoints return paginated responses; frontend admin tables must handle `next`/`previous`.
- **Throttling**: Anon 30/min, authenticated 120/min. Applied to registration, login, password reset, send-verification.
