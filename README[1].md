# Aurora Market — E-Commerce Platform (MERN Stack)

A full-stack e-commerce platform built with **MongoDB, Express, React, and Node.js**.

## Features

- 🔐 **User authentication** — JWT-based register/login, hashed passwords (bcrypt)
- 🔎 **Product listings** — full-text search, category filters, price sort
- 🛒 **Shopping cart & checkout** — Stripe test-mode payment integration (with an automatic mock-payment fallback if no Stripe key is set, so checkout always works)
- 🛠️ **Admin dashboard** — add/edit/delete products, manage order status, revenue & low-stock overview
- 🤖 **AI-powered recommendations** — a content-based recommendation engine that scores products by category affinity and rating, based on each user's order history (cold-start users see top-rated picks)

## Tech Stack

| Layer | Tech |
|---|---|
| Database | MongoDB (via Mongoose) — runs in-memory automatically, no setup required |
| Backend | Express.js, JWT, bcrypt, Stripe SDK |
| Frontend | React 18, React Router, Vite |

## Quick Start (zero setup required)

The backend uses `mongodb-memory-server` by default, so **you don't need to install MongoDB**. Sample products and two demo accounts are seeded automatically the first time the server starts.

### 1. Start the backend

```bash
cd server
npm install
npm start
```

You should see:
```
🧠 Using in-memory MongoDB (no external database required).
🌱 No products found — auto-seeding sample catalog...
✅ Seeded 16 products, admin@shopdemo.com/admin123, customer@shopdemo.com/customer123
🚀 Server running on http://localhost:5000
```

### 2. Start the frontend (in a new terminal)

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@shopdemo.com | admin123 |
| Customer | customer@shopdemo.com | customer123 |

Or just register a new account — new users default to the `customer` role.

## Using a real, persistent MongoDB (optional)

By default, data resets every time the server restarts (in-memory mode). To persist data:

1. Copy `server/.env.example` to `server/.env`
2. Set `MONGO_URI` to your MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
3. Restart the server — it will auto-seed the catalog once, on the first run

## Enabling real Stripe test payments (optional)

Checkout works out of the box in **mock payment mode** — orders are created and marked paid instantly, no Stripe account needed. To use real Stripe test-mode payments instead:

1. Create a free account at [Stripe](https://dashboard.stripe.com/register) and grab a **test** secret key
2. Add `STRIPE_SECRET_KEY=sk_test_...` to `server/.env`
3. Restart the server

## Project Structure

```
ecommerce-platform/
├── server/
│   ├── models/          # Mongoose schemas (User, Product, Cart, Order)
│   ├── routes/           # Express route handlers
│   ├── middleware/        # JWT auth middleware
│   ├── utils/            # Recommendation engine
│   ├── seedData.js       # Sample catalog + auto-seed logic
│   └── server.js         # App entry point
└── client/
    └── src/
        ├── api/           # Fetch wrapper for the backend API
        ├── context/        # Auth & Cart React contexts
        ├── components/     # Header, Footer, ProductCard, route guards
        └── pages/          # Home, ProductDetail, Cart, Orders, Admin, Login, Register
```

## How the recommendation engine works

`server/utils/recommendations.js` implements a transparent **content-based scoring model**:

```
score(product) = categoryAffinity + ratingBoost − outOfStockPenalty
```

It builds a profile of each user's category preferences from their past orders, then ranks unpurchased products by how well they match that profile (plus a small boost for highly-rated items). New users with no order history get a cold-start fallback of top-rated products. Product detail pages also show "similar products" (same category, closest price).

## License

MIT — free to use for learning, coursework, or your portfolio.
