# ShopKart Backend API — Customer Authentication & Product Catalogue (Labs 01 & 03)

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-27%20Passed-success.svg)](test/test-runner.js)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-brightgreen.svg)](https://mongoosejs.com/)

---

## 📁 Backend Structure

```text
backend/
│
├── controllers/
│   ├── customer.controller.js  # Auth handlers (register, login, profile, logout, change-password)
│   └── product.controller.js   # Product handlers (create, list with search/filter/sort, single item)
│
├── models/
│   ├── customer.model.js       # Customer schema, validations, bcrypt pre-save hashing
│   └── product.model.js        # Product schema, price > 0, stock >= 0 validations
│
├── routes/
│   ├── customer.routes.js      # Customer REST routes with protection middleware
│   └── product.routes.js       # Product REST routes (/products, /products/:id)
│
├── middlewares/
│   └── auth.middleware.js      # JWT cookie verification & req.user attachment
│
├── utils/
│   ├── generateToken.js        # JWT signing & HttpOnly cookie configuration
│   └── seedProducts.js         # Realistic product catalogue seeder
│
├── test/
│   └── test-runner.js          # Automated test runner (27 test assertions)
│
├── .env                        # Backend environment configuration
├── .env.example                # Example configuration template
├── package.json                # Dependencies and npm scripts
├── index.js                    # Application entry point & MongoDB connection
├── README.md                   # Documentation & TA Viva Preparation Guide
└── ShopKart_API.postman_collection.json # Postman evaluation collection
```

---

## 📡 API Reference & Specifications

### Customer Authentication APIs (Lab 01)
- `POST /customers/register`: Registers a customer with bcrypt password hashing.
- `POST /customers/login`: Authenticates customer and sets HttpOnly JWT cookie.
- `GET /customers/me`: Protected route returning authenticated customer profile.
- `POST /customers/logout`: Clears the HttpOnly cookie.
- `PATCH /customers/change-password`: Bonus Challenge endpoint to update password.

### Product Catalog APIs (Lab 03)
- `POST /products`: Creates a new product document with validation (`price > 0`, `stock >= 0`).
- `GET /products`: Returns all products with dynamic query parameters:
  - `?search=keyboard`: Case-insensitive regex match on name.
  - `?category=Electronics`: Filters by category.
  - `?sort=price_asc` / `?sort=price_desc`: Sorts by price (Bonus Challenge +10 Marks).
- `GET /products/:id`: Fetches a single product by MongoDB ObjectId with 400 (invalid ID format) and 404 (not found) error handling.

---

## 🧪 Automated Testing
```bash
npm test
```
Runs the automated test runner ([test/test-runner.js](test/test-runner.js)) testing all 27 unit & integration assertions.
