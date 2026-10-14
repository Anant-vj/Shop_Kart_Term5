# ShopKart Backend API — Complete Full-Stack Commerce System (Labs 01–06)

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-61%20Passed-success.svg)](test/test-runner.js)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-brightgreen.svg)](https://mongoosejs.com/)
[![Razorpay](https://img.shields.io/badge/Payment-Razorpay%20Test%20Mode-blue.svg)](https://razorpay.com/)

---

## 📁 Backend Structure

```text
backend/
│
├── config/
│   └── razorpay.js             # Razorpay Test Mode gateway initialization
│
├── controllers/
│   ├── customer.controller.js  # Auth handlers (register, login, profile, logout, change-password)
│   ├── product.controller.js   # Product handlers (create, list with search/filter/sort, single item)
│   ├── wishlist.controller.js  # Wishlist handlers (add, get with populate, remove, toggle)
│   ├── cart.controller.js      # Cart handlers (add/increment, get populated, update qty, remove)
│   └── order.controller.js     # Order & Checkout handlers (create payment order, verify signature, get orders, single order, status progression)
│
├── models/
│   ├── customer.model.js       # Customer schema (wishlist & cart references, bcrypt hashing)
│   ├── user.model.js           # User/Customer compatibility bridge
│   ├── product.model.js        # Product schema, price > 0, stock >= 0 validations
│   └── order.model.js          # Order schema with purchase-time product snapshots & address
│
├── routes/
│   ├── customer.routes.js      # Customer REST routes with protection middleware
│   ├── product.routes.js       # Product REST routes (/products, /products/:id)
│   ├── wishlist.routes.js      # Protected wishlist REST routes (/wishlist)
│   ├── cart.routes.js          # Protected shopping cart REST routes (/cart)
│   └── order.routes.js         # Protected order REST routes (/orders)
│
├── middlewares/
│   └── auth.middleware.js      # JWT cookie & Bearer token verification, req.user attachment
│
├── utils/
│   ├── generateToken.js        # JWT signing & HttpOnly cookie configuration
│   └── seedProducts.js         # Realistic product catalogue seeder
│
├── test/
│   └── test-runner.js          # Automated test runner (61 test assertions)
│
├── .env                        # Backend environment configuration
├── .env.example                # Example configuration template
├── package.json                # Dependencies and npm scripts
├── index.js                    # Application entry point & MongoDB connection
├── README.md                   # Documentation & TA Viva Preparation Guide
└── ShopKart_API.postman_collection.json # Comprehensive Postman collection
```

---

## 📡 API Reference & Specifications

### 1. Customer Authentication APIs (Lab 01)
- `POST /customers/register`: Registers a customer with bcrypt password hashing.
- `POST /customers/login`: Authenticates customer and sets HttpOnly JWT cookie.
- `GET /customers/me`: Protected route returning authenticated customer profile.
- `POST /customers/logout`: Clears the HttpOnly cookie.
- `PATCH /customers/change-password`: Bonus Challenge endpoint to update password.

### 2. Product Catalog APIs (Lab 03)
- `POST /products`: Creates a new product document with validation (`price > 0`, `stock >= 0`).
- `GET /products`: Returns all products with dynamic query parameters (`?search=...`, `?category=...`, `?sort=price_asc|price_desc`).
- `GET /products/:id`: Fetches a single product by MongoDB ObjectId with 400 (invalid ID format) and 404 (not found) error handling.

### 3. Wishlist Management APIs (Lab 04)
- `POST /wishlist/:productId`: Adds product ObjectId reference to user's wishlist (`409 Conflict` on duplicates).
- `GET /wishlist`: Returns current user's populated wishlist items.
- `DELETE /wishlist/:productId`: Removes product reference from user's wishlist.
- `PATCH /wishlist/:productId/toggle`: Bonus Challenge toggle endpoint.

### 4. Shopping Cart APIs (Lab 05)
All cart routes are protected with `protectRoute`. User identity is derived strictly from `req.user`.

| Method | Endpoint | Auth | Purpose | Status Codes |
|---|---|:---:|---|:---:|
| `POST` | `/cart/:productId` | ✅ | Add product to cart (or increment quantity if already present). Validates stock limits. | `200`, `400`, `401`, `404` |
| `GET` | `/cart` | ✅ | Get current user's cart populated with Product details (`name`, `price`, `stock`, `image`, `category`). | `200`, `401` |
| `PATCH` | `/cart/:productId` | ✅ | Update quantity for an existing cart item (`quantity >= 1`, `quantity <= stock`). | `200`, `400`, `401`, `404` |
| `DELETE` | `/cart/:productId` | ✅ | Remove product item from user's cart. | `200`, `400`, `401`, `404` |

### 5. Orders & Razorpay Checkout APIs (Lab 06)
All order endpoints enforce JWT authentication via `protectRoute`.

| Method | Endpoint | Auth | Purpose | Status Codes |
|---|---|:---:|---|:---:|
| `POST` | `/orders/create-payment-order` | ✅ | Revalidates cart, checks live inventory stock, calculates server-side total, creates pending ShopKart order (`PENDING_PAYMENT`), creates Razorpay Order in paise, saves `razorpayOrderId`. | `201`, `400`, `401`, `500` |
| `POST` | `/orders` | ✅ | Convenience alias for `createPaymentOrder` (supports Postman test suite). | `201`, `400`, `401`, `500` |
| `POST` | `/orders/verify-payment` | ✅ | Verifies HMAC-SHA256 signature against database Razorpay Order ID. If valid: marks `PAID` + `PLACED`, decrements inventory, clears user cart. If invalid: returns 400 and preserves cart. | `200`, `400`, `401`, `404`, `500` |
| `GET` | `/orders` | ✅ | Returns only orders belonging to authenticated user sorted newest first (`createdAt: -1`). | `200`, `401`, `500` |
| `GET` | `/orders/:id` | ✅ | Returns single order details. Enforces ownership: returns `403 Forbidden` if another user attempts access. | `200`, `400`, `401`, `403`, `404` |
| `PATCH` | `/orders/:id/status` | ✅ | Bonus Challenge (+10 Marks): Advances order status (`PLACED` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`). | `200`, `400`, `401`, `403`, `404` |

---

## 💳 Razorpay Test Mode Architecture

```mermaid
flowchart TD
    A[React /checkout Form] -->|1. Submit Validated Shipping Address| B[POST /orders/create-payment-order]
    B -->|2. Authenticate User| C[protectRoute Middleware]
    C -->|3. Load Cart & Latest Products| D[MongoDB Product & Customer]
    D -->|4. Stock & Cart Revalidation| E{Stock Available & Cart > 0?}
    E -->|No| F[400 Bad Request]
    E -->|Yes| G[Calculate Server Total in Rupees & Paise]
    G -->|5. Create Order with PENDING_PAYMENT| H[Save ShopKart Order]
    H -->|6. Call Razorpay API| I[razorpay.orders.create in Paise]
    I -->|7. Save razorpayOrderId| J[Return {shopKartOrderId, razorpayOrderId, amount, key}]
    J -->|8. Open Modal| K[window.Razorpay.open]
    K -->|9. Test Payment Completed| L[Razorpay handler Callback]
    L -->|10. Send paymentId, orderId, signature| M[POST /orders/verify-payment]
    M -->|11. Compute HMAC SHA256| N{expectedSignature === razorpay_signature?}
    N -->|Invalid| O[400 Bad Request - Keep Cart Unchanged]
    N -->|Valid| P[Mark Order PAID & PLACED]
    P -->|12. Decrement Stock & Clear Cart| Q[user.cart = [] & save]
    Q -->|13. Clear Global Frontend State| R[CartContext.clearCartState]
    R -->|14. Navigate| S[/order-success/:id]
```

---

## 📦 Order Data Model & Purchase-Time Snapshots

### Why Snapshot Name and Price?
Suppose a mechanical keyboard is purchased today for **₹2,999**. Next month, inflation or catalogue updates increase its price to **₹3,499**.
- If the order only stored `{ product: productId, quantity: 2 }`, loading old receipts would dynamically re-fetch the product document and incorrectly show **₹6,998** instead of the actual **₹5,998** the customer paid.
- An **Order is a legal, immutable historical document** representing what transpired at the transaction instant.
- The `Order` model snapshots `name`, `price`, `image`, and `quantity` at checkout time, decoupling historical accounting from future catalogue mutations.

---

## 🔐 Payment Security & Business Rules

1. **`RAZORPAY_KEY_SECRET` never reaches the browser:** The Key Secret is stored exclusively in `backend/.env` and accessed server-side to generate HMAC signatures.
2. **Server owns total calculation:** Any `totalAmount` sent from the frontend is discarded. The server computes:
   $$\text{totalAmount} = \sum (\text{product.price} \times \text{cartItem.quantity})$$
3. **Paise currency unit conversion:** Razorpay amounts are strictly converted to paise (`Math.round(totalAmount * 100)`).
4. **Final stock verification:** Inventory is re-checked against MongoDB immediately before creating the pending order to prevent overselling race conditions.
5. **Cart is cleared only upon verified payment:** If the user abandons the Razorpay modal, payment fails, or signature verification fails, the cart remains 100% intact.
6. **Authorization enforcement:** A user cannot inspect another user's orders by guessing an ObjectId (`order.user.toString() === req.user._id.toString()`).

---

## 🧪 Automated Testing

```bash
npm test
```

Runs the automated test runner ([test/test-runner.js](test/test-runner.js)) verifying **61 test assertions**:
- **18** Customer Authentication & Cookie Session tests (Lab 01)
- **9** Product Catalog, Discovery, Search & Filter tests (Lab 03)
- **11** Wishlist Schema, Populate & Toggle tests (Lab 04)
- **12** Shopping Cart Schema, Increment, Stock Limitation, Quantity Update & Removal tests (Lab 05)
- **11** Order Model, Shipping Validation, Stock Check, Fake Total Rejection, HMAC Verification, Cart Clearing, Ownership & Status Progression tests (Lab 06)

---

## 🎤 TA Viva Preparation Guide — Questions & Detailed Answers

### Payments
1. **Why must the Razorpay Order be created from the backend?**  
   *Answer:* The Razorpay order creation API requires the `RAZORPAY_KEY_SECRET`. If created on the frontend, malicious users could inspect the network tab or bundle, extract the secret key, and compromise the entire merchant account. Furthermore, only the backend can verify current database stock and calculate the trusted price.
2. **Why is the Razorpay Key Secret never sent to React?**  
   *Answer:* Any secret shipped to the frontend can be read by opening browser devtools or inspecting memory. The Key Secret represents master merchant credentials used to verify cryptographic signatures and issue refunds.
3. **Why does Razorpay expect INR amounts in paise?**  
   *Answer:* Financial systems represent currency in their smallest subunit (1 INR = 100 paise) to eliminate floating-point precision rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004` in IEEE 754).
4. **What are `razorpay_order_id`, `razorpay_payment_id` and `razorpay_signature`?**  
   *Answer:*  
   - `razorpay_order_id`: The identifier created by Razorpay Orders API representing the intent to collect payment.  
   - `razorpay_payment_id`: The unique transaction ID created once the customer completes payment in the modal.  
   - `razorpay_signature`: The HMAC-SHA256 hash created by Razorpay's servers over `order_id + '|' + payment_id` using the merchant's secret key.
5. **Why is signature verification mandatory?**  
   *Answer:* Without signature verification, an attacker could spoof HTTP requests to `/orders/verify-payment` sending arbitrary strings for `razorpay_payment_id` and claiming the order was paid. Cryptographic verification proves that Razorpay's servers authorized the transaction.
6. **Why should the cart not be cleared when Checkout merely opens?**  
   *Answer:* Opening checkout does not guarantee completion. If the user's card is declined, OTP fails, or the modal is closed, clearing the cart forces the customer to painfully re-find and re-add all products.
7. **What would happen if the client simply sent `paymentSuccess: true`?**  
   *Answer:* Any user could open DevTools or Postman and POST `{ paymentSuccess: true }` to acquire goods without paying a single rupee.

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
