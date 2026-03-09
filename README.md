# ConstructPortal — Construction Client Portal

A full-stack MVP web application that allows construction companies to manage projects, track tasks, share documents, and give clients real-time visibility into their project progress.

---

## Features

- **JWT Authentication** — Secure login with role-based access (admin/client)
- **Project Management** — Create, update, and track projects with status and progress percentage
- **Task Tracking** — Add tasks to projects, cycle through statuses (pending → in progress → completed)
- **Document Sharing** — Upload PDF/image documents per project, download on demand
- **Role-Based Access Control** — Admins manage everything; clients see only their own projects
- **Responsive Dashboard** — Stats overview, recent projects grid, animated progress bars
- **Demo Credentials** — One-click fill on the login page for quick evaluation

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Node.js, Express.js                 |
| Database   | MySQL (mysql2/promise, connection pooling) |
| Auth       | JWT (jsonwebtoken), bcryptjs        |
| File Upload| multer (disk storage, 10MB limit)   |
| Frontend   | Next.js 14 (Pages Router), React 18 |
| Styling    | TailwindCSS 3                       |
| HTTP Client| Axios (with interceptors)           |
| Toasts     | react-hot-toast                     |

---

## Project Structure

```
ClientPortal/
├── .gitignore
├── README.md
├── database/
│   ├── schema.sql          # MySQL table definitions + indexes
│   └── seed.js             # Node.js seed script (hashes passwords with bcrypt)
├── backend/
│   ├── server.js           # Express app entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js           # mysql2 connection pool
│   ├── middleware/
│   │   ├── auth.js         # verifyToken + restrictTo RBAC middleware
│   │   └── upload.js       # multer configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── documentController.js
│   └── routes/
│       ├── auth.js
│       ├── projects.js
│       ├── tasks.js
│       └── documents.js
└── frontend/
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    ├── context/
    │   └── AuthContext.js  # React context: login, logout, user state
    ├── services/
    │   └── api.js          # Axios instance with JWT interceptors
    ├── components/
    │   ├── Layout.js       # Auth guard + sidebar wrapper
    │   ├── Sidebar.js      # Navigation sidebar
    │   ├── ProjectCard.js  # Project summary card with progress bar
    │   ├── ProgressBar.js  # Reusable progress bar component
    │   ├── TaskCard.js     # Task item with status toggle
    │   └── Modal.js        # Accessible modal dialog
    ├── pages/
    │   ├── _app.js
    │   ├── index.js        # Login page
    │   ├── dashboard.js    # Stats + recent projects
    │   └── projects/
    │       ├── index.js    # All projects with filters
    │       └── [id].js     # Project detail: tasks + documents
    └── styles/
        └── globals.css     # Tailwind directives + component classes
```

---

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd ClientPortal
```

### 2. Set up the database

```bash
# Log into MySQL and run the schema
mysql -u root -p < database/schema.sql
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and a strong JWT_SECRET
```

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Seed the database

```bash
cd backend
npm run seed
# This creates 2 users, 3 projects, 5 tasks, and 2 document records
```

### 6. Start the backend server

```bash
cd backend
npm run dev       # Development (nodemon)
# or
npm start         # Production
```

The API will be available at `http://localhost:5000`.

### 7. Configure the frontend

```bash
cd frontend
cp .env.example .env.local
# Verify NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 8. Install frontend dependencies

```bash
cd frontend
npm install
```

### 9. Start the frontend

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Description                        | Default                 |
|-----------------|------------------------------------|-------------------------|
| `PORT`          | Express server port                | `5000`                  |
| `DB_HOST`       | MySQL host                         | `localhost`             |
| `DB_PORT`       | MySQL port                         | `3306`                  |
| `DB_USER`       | MySQL username                     | `root`                  |
| `DB_PASSWORD`   | MySQL password                     | _(empty)_               |
| `DB_NAME`       | MySQL database name                | `construction_portal`   |
| `JWT_SECRET`    | Secret key for JWT signing         | _(required)_            |
| `JWT_EXPIRES_IN`| JWT expiry duration                | `7d`                    |
| `UPLOAD_PATH`   | Directory for uploaded files       | `./uploads`             |
| `FRONTEND_URL`  | Allowed CORS origin                | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variable                | Description          | Default                        |
|-------------------------|----------------------|--------------------------------|
| `NEXT_PUBLIC_API_URL`   | Backend API base URL | `http://localhost:5000/api`    |

---

## API Endpoints

### Auth

| Method | Endpoint           | Access  | Description          |
|--------|--------------------|---------|----------------------|
| POST   | `/api/auth/register` | Public | Register new user    |
| POST   | `/api/auth/login`    | Public | Login, returns JWT   |
| GET    | `/api/auth/me`       | Auth   | Get current user     |

### Projects

| Method | Endpoint                  | Access       | Description                     |
|--------|---------------------------|--------------|---------------------------------|
| GET    | `/api/projects`           | Auth         | List projects (filtered by role)|
| GET    | `/api/projects/:id`       | Auth         | Get single project              |
| POST   | `/api/projects`           | Admin        | Create project                  |
| PUT    | `/api/projects/:id`       | Admin        | Update project                  |
| DELETE | `/api/projects/:id`       | Admin        | Delete project                  |
| GET    | `/api/projects/clients`   | Admin        | List all client users           |

### Tasks

| Method | Endpoint          | Access  | Description                            |
|--------|-------------------|---------|----------------------------------------|
| GET    | `/api/tasks?project_id=X` | Auth | Get tasks for a project         |
| POST   | `/api/tasks`      | Admin   | Create task                            |
| PUT    | `/api/tasks/:id`  | Auth    | Update task (clients: status only)     |
| DELETE | `/api/tasks/:id`  | Admin   | Delete task                            |

### Documents

| Method | Endpoint                      | Access  | Description              |
|--------|-------------------------------|---------|--------------------------|
| GET    | `/api/documents?project_id=X` | Auth    | List documents           |
| POST   | `/api/documents`              | Auth    | Upload document (multipart) |
| GET    | `/api/documents/:id/download` | Auth    | Download file            |
| DELETE | `/api/documents/:id`          | Admin   | Delete document          |

---

## Default Credentials

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Admin  | admin@portal.com       | admin123   |
| Client | client@portal.com      | client123  |

> These are created by the seed script. The login page includes quick-fill buttons for both accounts.

---

## Development Notes

- The `uploads/` directory is created automatically by multer when the first file is uploaded. It is gitignored.
- Accepted file types for upload: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` (max 10MB).
- Clients are restricted to their own projects at the API level — not just the UI.
- The `database/seed.js` script truncates existing data before inserting, so it is safe to re-run.
