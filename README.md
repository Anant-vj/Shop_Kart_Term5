# ShopKart — Full Stack Customer Authentication & Portal

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-18%20Passed-success.svg)](backend/test/test-runner.js)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-brightgreen.svg)](https://mongoosejs.com/)

This repository contains the complete implementation for **Engineering Lab 01 (Backend)** and **Engineering Lab 02 (Frontend)** of the ShopKart project.

---

## 📁 Repository Structure

```text
mern_class_projects/
├── backend/
│   ├── controllers/
│   │   └── customer.controller.js  # Registration, login, profile, logout, change-password
│   ├── models/
│   │   └── customer.model.js       # Customer schema, validations, bcrypt pre-save hook
│   ├── routes/
│   │   └── customer.routes.js      # REST API route mapping with protection middleware
│   ├── middlewares/
│   │   └── auth.middleware.js      # JWT cookie verification & req.user attachment
│   ├── utils/
│   │   └── generateToken.js        # JWT signing & HttpOnly cookie configuration
│   ├── test/
│   │   └── test-runner.js          # Automated test runner (18 test assertions)
│   ├── .env                        # Backend environment configuration
│   ├── .env.example                # Example configuration template
│   ├── index.js                    # Server entry point & MongoDB connection
│   ├── package.json                # Backend dependencies and scripts
│   ├── README.md                   # Lab 01 documentation & viva guide
│   └── ShopKart_Auth_API.postman_collection.json # Postman evaluation collection
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Task 2: Login page with credentials & cookie support
│   │   │   ├── Register.jsx        # Task 1: Controlled registration form with validation
│   │   │   └── Home.jsx            # Task 3: Protected dashboard fetching /customers/me
│   │   ├── components/
│   │   │   └── Navbar.jsx          # Task 4: Navbar with branding, profile, & logout
│   │   ├── services/
│   │   │   └── api.js              # Axios instance configured with withCredentials: true
│   │   ├── App.jsx                 # React Router configuration & session management
│   │   ├── main.jsx                # React DOM entry point
│   │   └── index.css               # Design system & responsive styles
│   ├── index.html                  # HTML entry point with Inter font
│   ├── vite.config.js              # Vite configuration with backend proxy
│   ├── package.json                # Frontend dependencies and scripts
│   └── README.md                   # Lab 02 documentation & viva guide
│
├── .gitignore                      # Git ignore file (node_modules, dist, logs)
├── package.json                    # Root script runner
└── README.md                       # Main repository guide
```

---

## ⚡ Quick Start Instructions

### 1. Start the Backend Server (Terminal 1)
```bash
cd backend
npm install
npm run dev
```
Backend runs on: `http://localhost:5000`

### 2. Start the Frontend Application (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 3. Run Backend Test Suite
```bash
npm test
```
All 18 unit & integration tests pass with 0 failures.

---

## 🎓 Lab 02 TA Viva Questions & Model Answers

### Q1: Why do we use `withCredentials: true`?
> **Answer:**
> Cross-origin requests in browsers (such as frontend at `localhost:5173` making requests to `localhost:5000`) do not send cookies by default. `withCredentials: true` tells Axios/Fetch to include HttpOnly cookies in request headers and store cookies from `Set-Cookie` response headers. Without it, the JWT cookie would not reach protected routes like `/customers/me`.

### Q2: Why can't JavaScript read an HttpOnly cookie?
> **Answer:**
> The `HttpOnly` flag forbids browser client scripts from reading the cookie via `document.cookie`. This defends against Cross-Site Scripting (XSS) attacks: even if malicious JavaScript is executed on the page, the attacker cannot steal or exfiltrate the authentication token.

### Q3: Why is `/home` called a protected route?
> **Answer:**
> It is only accessible to users with a valid, authenticated session. When a user navigates to `/home`, the app requests `GET /customers/me`. If the session is missing, expired, or invalid (`401 Unauthorized`), the user is immediately redirected to `/login`.

### Q4: Why do we fetch `/customers/me` instead of storing the user manually in `localStorage`?
> **Answer:**
> 1. **Single Source of Truth:** Ensures data matches the database in real time.
> 2. **Tamper Resistance:** `localStorage` can be modified via browser DevTools, whereas `/customers/me` is verified by the cryptographically signed JWT stored in the HttpOnly cookie.
> 3. **Automatic Expiry Synchronization:** If the backend revokes the token or the cookie expires, `/customers/me` returns 401, immediately redirecting to login.

### Q5: What is the difference between authentication and authorization?
> **Answer:**
> - **Authentication (AuthN):** Verifying **who** the user is (e.g. valid credentials verified at `/customers/login`).
> - **Authorization (AuthZ):** Determining **what** actions or resources the authenticated user is permitted to access (e.g. access rights to administrative routes vs standard customer views).
