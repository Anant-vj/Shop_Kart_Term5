# ShopKart — Full Stack E-Commerce Platform (Labs 01–06 Complete)

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-61%20Passed-success.svg)](backend/test/test-runner.js)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-brightgreen.svg)](https://mongoosejs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-yellow.svg)](https://vitejs.dev/)
[![Razorpay](https://img.shields.io/badge/Payment-Razorpay%20Test%20Mode-blue.svg)](https://razorpay.com/)

Welcome to **ShopKart**, a complete end-to-end full-stack MERN e-commerce application built across six engineering labs:
- **Lab 01:** Backend Customer Authentication Service (bcrypt, JWT, HttpOnly Cookies, MVC architecture)
- **Lab 02:** Frontend Customer Portal (React 18, React Router, Login → Home Flow, Protected Profile)
- **Lab 03:** Product Catalog & Discovery (Mongoose Schema, REST APIs, Search, Filter, Sorting, Dynamic Cards, Product Details, Loading/Error/Empty States)
- **Lab 04:** Persistent Customer Wishlist (MongoDB Relationships, `ObjectId` references, Mongoose `populate()`, Protected REST APIs, Dynamic Wishlist UI, Toggle Bonus)
- **Lab 05:** Shopping Cart Experience (Nested MongoDB Schemas, Stock Limits, Global Cart State via React Context, Reactive Navbar Badge, Derived Subtotals, Dynamic Quantity Controls)
- **Lab 06:** Checkout & Orders (Razorpay Test Mode Payment, Cryptographic HMAC-SHA256 Signature Verification, Purchase-Time Product Snapshots, Server-Side Stock & Price Validation, Global State Reset, Order Confirmation, Order History, Status Progression Bonus)

---

## 📁 Repository Architecture

```text
mern_class_projects/
├── backend/
│   ├── config/
│   │   └── razorpay.js             # Razorpay Test Mode gateway initialization
│   ├── controllers/
│   │   ├── customer.controller.js  # Auth handlers (register, login, profile, logout, change-password)
│   │   ├── product.controller.js   # Product handlers (create, list with search/filter/sort, single item)
│   │   ├── wishlist.controller.js  # Wishlist handlers (add, get with populate, remove, toggle)
│   │   ├── cart.controller.js      # Cart handlers (add/increment, get populated, update qty, remove)
│   │   └── order.controller.js     # Order & Checkout handlers (create payment order, verify signature, get orders, single order, status progression)
│   ├── models/
│   │   ├── customer.model.js       # Customer schema, wishlist & cart subdocument refs, bcrypt hashing
│   │   ├── user.model.js           # User/Customer compatibility bridge
│   │   ├── product.model.js        # Product schema, price > 0, stock >= 0 validations
│   │   └── order.model.js          # Order schema with purchase-time product snapshots & shipping address
│   ├── routes/
│   │   ├── customer.routes.js      # Customer REST routes with protection middleware
│   │   ├── product.routes.js       # Product REST routes (/products, /products/:id)
│   │   ├── wishlist.routes.js      # Protected wishlist REST routes (/wishlist)
│   │   ├── cart.routes.js          # Protected shopping cart REST routes (/cart)
│   │   └── order.routes.js         # Protected order REST routes (/orders)
│   ├── middlewares/
│   │   └── auth.middleware.js      # JWT cookie & Bearer token verification, req.user attachment
│   ├── utils/
│   │   ├── generateToken.js        # JWT signing & HttpOnly cookie configuration
│   │   └── seedProducts.js         # Realistic product catalogue seeder
│   ├── test/
│   │   └── test-runner.js          # Automated test runner (61 test assertions)
│   ├── .env                        # Backend environment configuration
│   ├── .env.example                # Example configuration template
│   ├── index.js                    # Server entry point & MongoDB connection
│   ├── package.json                # Backend dependencies and scripts
│   ├── README.md                   # Backend documentation & viva guide
│   └── ShopKart_API.postman_collection.json # Comprehensive Postman evaluation collection
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── CartContext.jsx     # Global cart state, actions, derived computations & clearCartState
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page with credentials & cookie support
│   │   │   ├── Register.jsx        # Controlled registration form with validation
│   │   │   ├── Home.jsx            # Protected customer dashboard with deep links
│   │   │   ├── Products.jsx        # Dynamic product discovery, search, filter, wishlist & cart
│   │   │   ├── ProductDetails.jsx  # Product details with Add to Cart and Wishlist actions
│   │   │   ├── Wishlist.jsx        # Persistent customer wishlist page
│   │   │   ├── Cart.jsx            # Full-featured Cart page with order summary & proceed to checkout
│   │   │   ├── Checkout.jsx        # Lab 06: Shipping address form validation & Razorpay checkout
│   │   │   ├── OrderSuccess.jsx    # Lab 06: Order confirmation screen with snapshot receipts
│   │   │   └── Orders.jsx          # Lab 06: My Orders history page with status progression tracker
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header with branding, wishlist badge, cart count & orders link
│   │   │   ├── ProductCard.jsx     # Card component with dynamic Add to Cart & Wishlist buttons
│   │   │   ├── CartItem.jsx        # Item row with quantity controls [-] 2 [+] and remove action
│   │   │   ├── WishlistCard.jsx    # Wishlist card with remove action & stock status
│   │   │   └── SearchBar.jsx       # Real-time search, category dropdown & sort selector
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with auth cookies, products, wishlist, cart & orders methods
│   │   ├── App.jsx                 # React Router configuration & CartProvider wrapper
│   │   ├── main.jsx                # React DOM entry point
│   │   └── index.css               # Design system, tokens, and responsive styling
│   ├── index.html                  # HTML entry point with Inter font
│   ├── vite.config.js              # Vite configuration with backend proxy (/customers, /products, /wishlist, /cart, /orders)
│   ├── package.json                # Frontend dependencies and scripts
│   └── README.md                   # Frontend documentation & viva guide
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

### 2. Seed Sample Products into MongoDB (Optional)
```bash
npm run seed
```

### 3. Run Backend Automated Test Suite
```bash
npm test
```
Executes 61 comprehensive automated tests across all 6 labs.

### 4. Start the Frontend Development Server (Terminal 2)
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 💳 Complete End-to-End Purchase Flow (Lab 06)

```mermaid
flowchart LR
    A[Browse Products] --> B[Add to Cart]
    B --> C[Cart Page]
    C --> D[Proceed to Checkout]
    D --> E[Validate Shipping Address]
    E --> F[POST /orders/create-payment-order]
    F --> G[Server Validates Stock & Prices]
    G --> H[Create Pending Order + Razorpay Order]
    H --> I[Open Razorpay Test Checkout]
    I --> J[Complete Test Payment]
    J --> K[POST /orders/verify-payment]
    K --> L[Verify HMAC SHA256 Signature]
    L --> M[Mark Order PAID & PLACED]
    M --> N[Clear User Cart on Backend & Frontend]
    N --> O[Order Confirmation /order-success/:id]
    O --> P[My Orders /orders]
```

---

## 📋 Evaluation Rubric Mapping (Lab 06 — 100 Marks + 10 Marks Bonus)

| Area | Marks | Implementation Details |
|:---|:---:|:---|
| **Order Model + Snapshot Design** | 15 | [order.model.js](file:///c:/Users/anant/Desktop/SST/Year%202/Term%205/mern_class_projects/backend/models/order.model.js) stores `user` ObjectId ref, snapshot of each item (`product`, `name`, `price`, `quantity`, `image`), `shippingAddress`, `totalAmount`, `paymentStatus` (`PENDING`, `PAID`, `FAILED`), and `status` (`PENDING_PAYMENT`, `PLACED`, `CONFIRMED`, `SHIPPED`, `DELIVERED`). |
| **Checkout Page + Shipping Form** | 15 | [Checkout.jsx](file:///c:/Users/anant/Desktop/SST/Year%202/Term%205/mern_class_projects/frontend/src/pages/Checkout.jsx) at `/checkout` collects Full Name, Phone, Address Line, City, State, and Pincode, paired with live order review snapshot. |
| **Form Validation** | 10 | Strict client-side and server-side validation: non-empty/non-whitespace fields, 10-digit phone format, and 6-digit pincode format (`^\d{6}$`). Prevents backend calls on invalid inputs. |
| **Checkout + Razorpay Order API** | 15 | `POST /orders/create-payment-order` authenticates user, verifies non-empty cart, loads fresh product docs, creates ShopKart order with `PENDING_PAYMENT`, converts total to paise, and creates Razorpay order. |
| **Razorpay Checkout Integration** | 15 | Dynamically injects `https://checkout.razorpay.com/v1/checkout.js`, initializes `window.Razorpay(options)`, handles prefill, modal dismissal, payment failure events, and triggers verification callback. |
| **Payment Signature Verification** | 15 | `POST /orders/verify-payment` computes HMAC-SHA256 signature using database-stored Razorpay Order ID and `RAZORPAY_KEY_SECRET`. Rejects invalid signatures with 400 and preserves cart; marks `PAID` + `PLACED` upon match. |
| **Stock + Server Total Validation** | 10 | Re-verifies inventory stock before order creation (400 if requested > stock). Ignores fake client totals (`req.body.totalAmount: 1`) and recalculates $\sum (\text{price} \times \text{qty})$ on the server. Decrements inventory upon confirmed payment. |
| **Cart Clearing + State Sync** | 5 | Clears user cart on MongoDB (`user.cart = []`) only after successful payment verification. Invokes `clearCartState()` in `CartContext`, immediately resetting Navbar to `Cart (0)`. |
| **Order Confirmation** | 5 | [OrderSuccess.jsx](file:///c:/Users/anant/Desktop/SST/Year%202/Term%205/mern_class_projects/frontend/src/pages/OrderSuccess.jsx) at `/order-success/:id` displays confirmed order ID, total paid, purchased items snapshot, delivery address snapshot, and quick navigation. |
| **My Orders API + Page** | 5 | `GET /orders` returns authenticated user orders sorted newest first. [Orders.jsx](file:///c:/Users/anant/Desktop/SST/Year%202/Term%205/mern_class_projects/frontend/src/pages/Orders.jsx) at `/orders` renders order cards, loading/empty/error states, and receipt links. Single order API enforces ownership (`403 Forbidden` on other users' orders). |
| **Code Quality + Viva** | 5 | Clean architecture, strict security (Key Secret backend-only), all 21 Viva questions fully documented with answers. |
| **Bonus Challenge (+10 Marks)** | 10 | `PATCH /orders/:id/status` endpoint to advance order status (`PLACED` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`). Visual status tracker rendered on the Orders page with an interactive "Advance Status" test button. |
| **Total Marks** | **110/100** | **Full 100 Marks + 10 Marks Bonus Coverage** |

---

## 🎤 TA Viva Preparation Guide — Questions & Detailed Answers

### Payments
1. **Why must the Razorpay Order be created from the backend?**  
   *Answer:* The Razorpay order creation API requires the `RAZORPAY_KEY_SECRET`. If created on the frontend, malicious users could inspect the network tab or bundle, extract the secret key, and compromise the merchant account. Additionally, only the backend can verify current database stock and calculate trusted pricing.
2. **Why is the Razorpay Key Secret never sent to React?**  
   *Answer:* Any secret shipped to client-side code can be inspected and stolen via browser DevTools. The Key Secret represents master merchant credentials used to verify cryptographic signatures and issue refunds.
3. **Why does Razorpay expect INR amounts in paise?**  
   *Answer:* Financial systems represent currency in their smallest subunit (1 INR = 100 paise) to eliminate floating-point precision rounding errors (e.g., `0.1 + 0.2 = 0.30000000000000004` in IEEE 754).
4. **What are `razorpay_order_id`, `razorpay_payment_id` and `razorpay_signature`?**  
   *Answer:*  
   - `razorpay_order_id`: The ID created by Razorpay Orders API representing the intent to collect payment.  
   - `razorpay_payment_id`: The unique transaction ID created once the customer completes payment in the modal.  
   - `razorpay_signature`: The HMAC-SHA256 hash created by Razorpay's servers over `order_id + '|' + payment_id` using the merchant's secret key.
5. **Why is signature verification mandatory?**  
   *Answer:* Without signature verification, an attacker could spoof HTTP requests to `/orders/verify-payment` sending arbitrary strings for `razorpay_payment_id` and claiming the order was paid. Cryptographic verification proves that Razorpay's servers authorized the transaction.
6. **Why should the cart not be cleared when Checkout merely opens?**  
   *Answer:* Opening checkout does not guarantee completion. If the user's card is declined, OTP fails, or the modal is closed, clearing the cart forces the customer to painfully re-find and re-add all products.
7. **What would happen if the client simply sent `paymentSuccess: true`?**  
   *Answer:* Any user could open DevTools or Postman and POST `{ paymentSuccess: true }` to acquire goods without paying.

### Orders
8. **Why does an Order store product name and price separately from the Product document?**  
   *Answer:* Products change over time (prices rise, descriptions change, items get deleted). An Order is a historical legal receipt; it must record the exact snapshot values at purchase time.
9. **Why should order price not change when product price changes?**  
   *Answer:* The customer agreed to and paid a specific price at transaction time. Changing order totals retroactively breaks accounting, invoicing, and auditing.
10. **What is the difference between Cart data and Order data?**  
    *Answer:* Cart data is dynamic, temporary pre-purchase intent pointing to live Product references. Order data is persistent, immutable post-purchase financial record containing product snapshots and delivery addresses.
11. **Why should an Order reference the User?**  
    *Answer:* To enforce privacy, access control, and customer service tracking so each user can retrieve only their historical orders (`user: req.user._id`).

### Security & Business Logic
12. **Why should the backend calculate totalAmount?**  
    *Answer:* The client environment is completely untrusted. If the backend accepted `totalAmount` from the request body, a client could manipulate a ₹50,000 order to ₹1.
13. **Why must stock be checked again during checkout?**  
    *Answer:* Other shoppers may have bought the remaining inventory between when the user added the item to their cart and when they clicked checkout.
14. **Why should the frontend not send the final order items as trusted data?**  
    *Answer:* An attacker could modify quantities, prices, or product IDs in transit. The server queries the authenticated user's cart directly from MongoDB.
15. **How do you prevent a user from reading someone else's order?**  
    *Answer:* In `GET /orders/:id`, after fetching the order, verify `order.user.toString() === req.user._id.toString()`. Return `403 Forbidden` if they differ.

### State Management & React
16. **Why must global cart state be cleared after order creation?**  
    *Answer:* To reflect the backend database mutation where `user.cart = []`. If the frontend state is not cleared, the cart icon and checkout buttons will still display purchased items.
17. **What happens if the backend order succeeds but frontend state is not updated?**  
    *Answer:* The UI becomes desynchronized: the navbar shows a badge like `Cart (3)` even though the backend cart is empty, confusing the user and causing subsequent checkout attempts to error.
18. **Why should cart remain untouched if order creation fails?**  
    *Answer:* So the customer can correct payment details, change delivery addresses, or retry without losing their selected items.
19. **Where should checkout form state live?**  
    *Answer:* In local component state inside `Checkout.jsx` (controlled form inputs) because shipping inputs are ephemeral to the checkout view until submitted.
20. **What loading states should exist while placing an order?**  
    *Answer:* Initial cart loading spinner, Razorpay script loader, in-flight payment gateway connection spinner (`Connecting Razorpay...`), and payment verification spinner.
21. **What should happen if the cart is empty and a user directly opens `/checkout`?**  
    *Answer:* The view detects `cartItems.length === 0` and renders an empty cart state prompt with a `"Browse Products"` link rather than displaying an invalid checkout form.
