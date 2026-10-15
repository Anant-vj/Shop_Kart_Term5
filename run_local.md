# 🚀 Running ShopKart Locally — Complete Setup & Run Guide

This guide provides step-by-step instructions to run the entire **ShopKart** full-stack commerce application (Frontend + Backend + MongoDB + Razorpay Test Mode) on your local machine.

---

## 📋 System Prerequisites

Before starting, ensure you have installed:
1. **Node.js**: `v18.0.0` or higher (tested on Node v20/v24).
   - Check version: `node -v`
2. **npm**: `v9.0.0` or higher.
   - Check version: `npm -v`
3. **MongoDB**:
   - **Option A (Local)**: MongoDB Community Server running locally at `mongodb://localhost:27017`.
   - **Option B (Cloud)**: A free MongoDB Atlas cluster connection string (`mongodb+srv://...`).

---

## ⚙️ Step 1 — Backend Environment Configuration (`.env`)

The backend requires an environment file for database connection, JWT authentication, and Razorpay test mode keys.

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Verify that a `.env` file exists (or create one by copying `.env.example`):
   ```bash
   cp .env.example .env
   ```
3. Your `backend/.env` should contain:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/shopkart
   JWT_SECRET=shopkart_super_secret_jwt_key_2026
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   RAZORPAY_KEY_ID=rzp_test_51bShpkX7r4v4A
   RAZORPAY_KEY_SECRET=shopkart_test_secret_key_2026
   ```
   > 💡 **Note on Razorpay:** The keys provided above are configured for offline and test mock evaluation. If you have your own Razorpay Dashboard Test Mode keys (`rzp_test_xxxx`), you can paste them here. **Never** use live production keys.

---

## 🏃 Step 2 — Running the Application

You can run the application either with **one single command** from the root folder or in **two separate terminals**.

### 🌟 Method A: One-Command Start (Recommended)

From the project root directory (`mern_class_projects/`):

```bash
npm run dev
```

This starts **both** the backend and frontend simultaneously with color-coded terminal logs:
- `[BACKEND]` running on: **`http://localhost:5000`**
- `[FRONTEND]` running on: **`http://localhost:5173`**

Open **[http://localhost:5173](http://localhost:5173)** in your browser to start shopping!

---

### 💻 Method B: Running in Separate Terminals

#### Terminal 1 — Backend (Express API Server)
```bash
cd backend
npm install
npm run dev
```
- Console output:
  ```text
  Connected to MongoDB: localhost:27017/shopkart
  ShopKart Authentication Server running on port 5000
  ```

#### Terminal 2 — Frontend (React + Vite Client)
```bash
cd frontend
npm install
npm run dev
```
- Console output:
  ```text
  VITE v6.4.4  ready in 250 ms
  ➜  Local:   http://localhost:5173/
  ```

---

## 📦 Step 3 — Seeding Catalogue Products (Optional but Recommended)

To populate MongoDB with realistic demo products across **Electronics, Fashion, Books, and Home & Kitchen** categories:

```bash
npm run seed
```
*(Or from inside `backend/`: `npm run seed`)*

Console confirmation:
```text
Connecting to MongoDB: mongodb://localhost:27017/shopkart
Cleared existing products
Successfully seeded 12 realistic products across 4 categories!
Disconnected from MongoDB
```

---

## 🧪 Step 4 — Running Automated Tests

To run the complete automated test suite (verifying Auth, Products, Wishlist, Cart, Checkout, Razorpay HMAC signature verification, and Status Progression):

```bash
npm test
```
*(Or from inside `backend/`: `npm test`)*

Expected output:
```text
=============================================
  SHOPKART AUTHENTICATION SERVICE TEST SUITE  
=============================================
...
TEST SUMMARY: 61 passed, 0 failed
=============================================
```

---

## 🛒 Complete End-to-End User Flow Walkthrough

Once the servers are running, follow this flow to test all features:

1. **Register / Login**:
   - Go to `http://localhost:5173/register`
   - Fill in: Full Name, Email, Password (min 6 chars), 10-digit Phone.
   - Click **Register Account** $\rightarrow$ automatically logs in and saves HttpOnly session cookie.
2. **Product Catalog & Discovery**:
   - Browse `http://localhost:5173/products`
   - Test live Search Bar, Category filters (`Electronics`, `Fashion`, `Books`, `Home & Kitchen`), and Price sorting (`Price: Low to High` / `High to Low`).
3. **Wishlist**:
   - Click the ❤️ heart icon on any product card to toggle wishlist.
   - Open `/wishlist` to inspect saved items.
4. **Shopping Cart**:
   - Click **Add to Cart** on products.
   - Notice the Navbar badge updates dynamically: `Cart (1)`, `Cart (3)`.
   - Open `/cart` to adjust quantities using `[-] 2 [+]` or remove items.
5. **Checkout**:
   - Click **Proceed to Checkout** $\rightarrow$ opens `/checkout`.
   - Enter your Shipping Address:
     - Full Name
     - 10-digit Phone Number
     - Address Line
     - City
     - State
     - 6-digit Pincode (e.g. `560001`)
   - Click **Place Order & Pay**.
6. **Razorpay Test Payment**:
   - Razorpay test checkout modal opens.
   - Select **Netbanking** or **UPI / Card** $\rightarrow$ click **Success**.
   - Backend cryptographically verifies the HMAC-SHA256 signature, marks order `PAID` and `PLACED`, decrements product inventory, and clears user cart.
7. **Order Confirmation Receipt**:
   - Automatically navigates to `/order-success/:id`.
   - Shows Order ID, snapshot receipts of items purchased, and shipping address.
8. **My Orders & Status Progression**:
   - Navigate to `/orders` (or click **View My Orders**).
   - View past orders sorted newest first.
   - **Bonus Feature (+10 Marks)**: Click the **"Advance to CONFIRMED / SHIPPED / DELIVERED"** button to watch the live visual order progression tracker update!

---

## 🔧 Troubleshooting & FAQ

### 1. `npm error Missing script: "dev"`
- **Cause:** You ran `npm run dev` in the root folder before the root script was added.
- **Solution:** Root `package.json` now includes `"dev"`, which runs `concurrently` across backend and frontend. You can now simply run `npm run dev` from the root folder!

### 2. MongoDB Connection Error (`ECONNREFUSED 127.0.0.1:27017`)
- **Cause:** Local MongoDB service is not started.
- **Solution (Windows):** Open PowerShell as Administrator and run:
  ```powershell
  net start MongoDB
  ```
  Or check Services app (`services.msc`) and start **MongoDB Server**.
- Alternatively, if using MongoDB Atlas, replace `MONGO_URI` in `backend/.env` with your Atlas connection string:
  ```env
  MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/shopkart?retryWrites=true&w=majority
  ```

### 3. Port Conflicts (`Port 5000 or 5173 already in use`)
- **Backend:** Change `PORT=5001` in `backend/.env`.
- **Frontend:** Vite will automatically prompt to use the next available port (e.g. `5174`).

### 4. Razorpay Modal Behavior in Test Mode
- No real money is deducted in Test Mode.
- To test payment failure: In the Razorpay modal, select **Failure** or close the popup. Notice that your cart is **not** cleared and remains fully intact!

---

## 📜 All Available npm Scripts

| Location | Command | Description |
|---|---|---|
| **Root** | `npm run dev` | Runs both Backend and Frontend concurrently |
| **Root** | `npm run start` | Starts backend production server + frontend dev server |
| **Root** | `npm run seed` | Seeds catalogue products into MongoDB |
| **Root** | `npm test` | Runs the 61 automated backend tests |
| **Root** | `npm run build:frontend` | Generates frontend production bundle in `frontend/dist/` |
| **`backend/`** | `npm run dev` | Runs Express backend with nodemon file watcher |
| **`backend/`** | `npm test` | Runs automated test suite |
| **`backend/`** | `npm run seed` | Seeds product catalog |
| **`frontend/`** | `npm run dev` | Runs Vite React frontend server on `http://localhost:5173` |
| **`frontend/`** | `npm run build` | Builds optimized production bundle |

---

**Happy Building & Shopping — ShopKart Team**
