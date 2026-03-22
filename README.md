# ⚽ Football Coaching Platform

A full-stack football academy booking platform where players can register, browse training sessions, and book coaching sessions online.

## 🚀 Features

- Player registration and login (JWT authentication)
- Browse available training sessions
- Session hero images
- Book training sessions
- View personal bookings
- Cancel bookings
- Session capacity and availability management
- Responsive UI built with Tailwind CSS

## 🛠 Tech Stack

**Backend**
- Django
- Django REST Framework
- JWT Authentication (SimpleJWT)
- PostgreSQL

**Frontend**
- React (Vite)
- React Router
- Axios
- Tailwind CSS


## 🧰 Project Structure

```text
football-coaching-platform/
├── backend/      # Django + DRF API
├── frontend/     # React + Vite client
└── docker-compose.yml
```

---

## ✅ First-Time Local Setup (Recommended)

### 1) Start backend + PostgreSQL with Docker

From the repository root:

```bash
docker compose up --build
```

This starts:
- PostgreSQL (`coaching_db`) on host port `5433`
- Django backend (`coaching_web`) on `http://localhost:8000`

The backend container automatically runs migrations before starting the dev server.

### 2) Start frontend in a second terminal

```bash
cd frontend
npm install
npm run dev
```

Then open:
- Frontend: `http://localhost:5173`
- Backend API root routes are under: `http://localhost:8000/api/`

---

## 🧪 Useful Development Commands

### Frontend

```bash
cd frontend
npm run dev      # start dev server
npm run lint     # run eslint
npm run build    # production build
```

### Backend

```bash
cd backend
python manage.py check
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

If you're not using Docker for backend, install dependencies first:

```bash
cd backend
pip install -r requirements.txt
```

---

## 🔐 Authentication Notes

- Backend uses JWT auth (SimpleJWT).
- Login endpoint returns access + refresh tokens.
- Frontend auto-attaches the access token and attempts token refresh on 401 responses.

---

## 🧭 Core API Route Groups

All routes are prefixed by `/api/`:

- Accounts & auth: registration, login, profile
- Training programs & sessions
- Bookings and player dashboard data
- Content endpoints (coaches/testimonials)
- Enquiries (including admin enquiry endpoints)
- Admin dashboard endpoints under `/api/admin/`

---

## 🛠 Common Troubleshooting

- **`ModuleNotFoundError: corsheaders`**  
  Make sure backend dependencies are installed (`pip install -r backend/requirements.txt`) or run backend through Docker Compose.

- **Frontend cannot reach API**  
  Confirm backend is running on `http://localhost:8000` and frontend base URL matches.

- **Database issues on fresh setup**  
  Rebuild and restart containers:
  ```bash
  docker compose down -v
  docker compose up --build
  ```

---

## 👨‍💻 Author

Srijan Pradhan
