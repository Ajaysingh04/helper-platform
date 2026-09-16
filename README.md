# 🛠️ Helper - Fullstack On-Demand Home Services Platform & Super Admin Portal

A modern, full-stack on-demand home services web application built with **React**, **Node.js/Express**, and featuring a master **Super Admin Panel** with two-way data reactivity.

---

## 📁 Project Structure

```
helper/
├── frontend/                     # React Client Application
│   ├── public/                   # Static assets & HTML shell
│   ├── src/                      # Components, Pages, Admin, Context & CSS
│   │   ├── components/           # Public UI & Super Admin components
│   │   ├── context/              # DataContext (State + API sync)
│   │   ├── css/                  # Curated styling & design system
│   │   ├── App.js                # React Router v7 routes
│   │   └── index.js              # React DOM entry
│   ├── package.json              # Frontend dependencies
│   └── .env                      # Frontend environment variables
│
├── backend/                      # Node.js + Express REST API Server
│   ├── data/                     # Seed dataset & JSON persistent storage
│   ├── routes/                   # Modular REST endpoints
│   │   ├── servicesRoutes.js     # Services CRUD API
│   │   ├── categoriesRoutes.js   # Categories CRUD API
│   │   ├── bookingsRoutes.js     # Bookings & Orders API
│   │   ├── providersRoutes.js    # Verified Providers API
│   │   ├── usersRoutes.js        # Customer Accounts API
│   │   ├── promotionsRoutes.js   # Hero Slider & Offers API
│   │   ├── ticketsRoutes.js      # Support Tickets API
│   │   ├── settingsRoutes.js     # Platform Settings API
│   │   └── authRoutes.js         # Admin Authentication API
│   ├── server.js                 # Express server bootstrap
│   ├── package.json              # Backend dependencies
│   └── .env                      # Backend configuration
│
├── .gitignore                    # Unified Git ignore rules
├── package.json                  # Root runner scripts (concurrently dev runner)
└── README.md                     # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Install All Dependencies
From the root project directory:
```bash
npm run install:all
```

### 2. Run Both Frontend & Backend Concurrently
```bash
npm run dev
```
- **Frontend App**: `http://localhost:3000`
- **Super Admin Portal**: `http://localhost:3000/admin` (Default PIN: `admin123` or 1-Click Quick Unlock)
- **Backend API**: `http://localhost:5000/api`
- **API Health**: `http://localhost:5000/api/health`

### 3. Individual Run Commands
- **Frontend Only**: `npm run client` (or `cd frontend && npm start`)
- **Backend Only**: `npm run server` (or `cd backend && npm start`)
- **Backend Dev (Nodemon)**: `npm run server:dev` (or `cd backend && npm run dev`)
- **Run Tests**: `npm test`

---

## 📡 Backend REST API Endpoints

| Resource | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/health` | Server uptime & status check |
| **Services** | `GET` | `/api/services` | Get all services catalog |
| **Services** | `POST` | `/api/services` | Add new service |
| **Services** | `PUT` | `/api/services/:id` | Update service details & price |
| **Services** | `DELETE` | `/api/services/:id` | Remove a service |
| **Categories** | `GET` | `/api/categories` | Get all service categories |
| **Categories** | `POST` | `/api/categories` | Add a new category |
| **Bookings** | `GET` | `/api/bookings` | List all bookings (filter by status) |
| **Bookings** | `POST` | `/api/bookings` | Register a new customer booking |
| **Bookings** | `PUT` | `/api/bookings/:id` | Update booking status / assign provider |
| **Providers** | `GET` | `/api/providers` | Get verified experts list |
| **Providers** | `PUT` | `/api/providers/:id` | Update provider verification & contact |
| **Users** | `GET` | `/api/users` | List customer accounts |
| **Promotions** | `GET` | `/api/promotions` | Get homepage hero banner slides |
| **Tickets** | `GET` | `/api/tickets` | List support & complaint tickets |
| **Settings** | `GET` | `/api/settings` | Get platform operational settings |
| **Auth** | `POST` | `/api/auth/verify-admin` | Verify admin PIN credentials |

---

## 🐙 Step-by-Step Git Deployment Guide

### Step 1: Check Current Git Status
From the root folder `C:\helper`:
```bash
git status
```

### Step 2: Stage All Clean Project Files
```bash
git add .
```

### Step 3: Create Your Initial Commit
```bash
git commit -m "feat: restructure fullstack architecture with frontend, backend Express REST API, and super admin panel"
```

### Step 4: Link Your GitHub Repository
1. Go to [GitHub](https://github.com/new) and create a new repository (e.g. `helper-platform`).
2. Copy your GitHub repository URL (e.g. `https://github.com/YOUR_USERNAME/helper-platform.git`).
3. Run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/helper-platform.git
git branch -M main
```

### Step 5: Push to GitHub
```bash
git push -u origin main
```
