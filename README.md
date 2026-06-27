# DevBoard 🚀

A full-stack developer task and notes manager built with **React**, **Flask**, and **PostgreSQL**. Manage your projects, track tasks, and attach notes — all in one place.

**Live Demo:** [devboard-iota-ashen.vercel.app](https://devboard-iota-ashen.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios |
| Backend | Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Bcrypt |
| Database | PostgreSQL (Neon.tech) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Features

- **JWT Authentication** — Secure signup, login, and logout with token-based auth
- **Projects** — Create and delete projects to organize your work
- **Tasks** — Add tasks to projects with status tracking (Todo / In Progress / Done)
- **Notes** — Attach notes to any task for context and reminders
- **Protected Routes** — Unauthenticated users are redirected to login automatically
- **Ownership Verification** — Users can only access and modify their own data
- **Cascade Deletes** — Deleting a project removes all its tasks and notes automatically
- **Persistent Sessions** — Stay logged in across page refreshes via localStorage

---

## Project Structure

```
devboard/
├── frontend/                   # React app (Vite)
│   ├── src/
│   │   ├── pages/              # Login, Signup, Dashboard, ProjectDetail, TaskDetail
│   │   ├── components/         # ProtectedRoute, PublicRoute
│   │   ├── services/           # Axios API service layer (auth, projects, tasks, notes)
│   │   ├── context/            # AuthContext (global JWT + user state)
│   │   └── App.jsx             # Routes
│   ├── .env.development
│   ├── .env.production
│   └── vercel.json
│
└── backend/                    # Flask API
    ├── app/
    │   ├── models/             # User, Project, Task, Note (SQLAlchemy)
    │   ├── routes/             # auth, projects, tasks, notes (Blueprints)
    │   └── __init__.py         # App factory
    ├── config.py               # Config from environment variables
    ├── run.py                  # Entry point
    ├── Procfile                # Gunicorn for Render
    └── requirements.txt
```

---

## Database Schema

```
users
 └── projects (one-to-many)
       └── tasks (one-to-many)
             └── notes (one-to-many)
```

All relationships use cascade delete — removing a parent removes all its children automatically.

---

## API Endpoints

### Auth
```
POST   /api/auth/register     Create a new account
POST   /api/auth/login        Login and receive JWT token
```

### Projects (JWT required)
```
GET    /api/projects/              Get all projects for logged-in user
POST   /api/projects/              Create a new project
DELETE /api/projects/<id>          Delete a project
```

### Tasks (JWT required)
```
GET    /api/projects/<id>/tasks/              Get all tasks for a project
POST   /api/projects/<id>/tasks/              Create a task
PATCH  /api/projects/<id>/tasks/<id>          Update task status
DELETE /api/projects/<id>/tasks/<id>          Delete a task
```

### Notes (JWT required)
```
GET    /api/tasks/<id>/notes/              Get all notes for a task
POST   /api/tasks/<id>/notes/              Create a note
DELETE /api/tasks/<id>/notes/<id>          Delete a note
```

---

## Running Locally

### Prerequisites
- Node.js v18+
- Python 3.10+
- A [Neon.tech](https://neon.tech) PostgreSQL database (free)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
DATABASE_URL=postgresql://...your-neon-connection-string...?sslmode=require
JWT_SECRET_KEY=your-secret-key-here
```

Start the backend:
```bash
python run.py
```

Flask runs on `http://localhost:5000`

---

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.development`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

React runs on `http://localhost:5173`

---

## Deployment

### Backend → Render
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn run:app`
- **Environment Variables:** `DATABASE_URL`, `JWT_SECRET_KEY`, `PYTHON_VERSION`

### Frontend → Vercel
- **Root Directory:** `frontend`
- **Framework:** Vite (auto-detected)
- **Environment Variables:** `VITE_API_URL` (your Render backend URL)

---

## Security

- Passwords hashed with **bcrypt** — never stored in plain text
- JWT tokens signed with a **secret key** — cannot be forged without it
- Tokens expire after **24 hours**
- Every protected endpoint verifies **ownership** before returning or modifying data
- Cross-user access returns **403 Forbidden**
- `.env` file never committed to version control

---

## Key Learnings

This project was built to understand full-stack architecture from scratch:

- How React communicates with a Flask API over HTTP
- How JWT authentication flows from login to protected routes
- How SQLAlchemy models map to PostgreSQL tables
- How Axios interceptors handle token attachment and 401 responses globally
- How React Context shares auth state without prop drilling
- How to deploy a decoupled frontend + backend to the cloud

---

## Author

**Shubham Dambal**
- GitHub: [@ShubhamDambal](https://github.com/ShubhamDambal)
