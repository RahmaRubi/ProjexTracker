# ConstructPortal — Construction Client Portal

A full-stack MVP web application that allows companies and small businesses to manage projects, track tasks, share documents, and give clients real-time visibility into their project progress.

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

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

---

## Installation

### 1. Clone the repository


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

### 8. Install frontend & backend dependencies

```bash
cd frontend
npm install
```
cd backend 
npm install

### 9. Start the frontend and backend servers simultaneously 
npm start
