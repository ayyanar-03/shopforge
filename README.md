# ShopForge

A full-stack e-commerce platform built with NestJS and React.

## Architecture

### v0.7 — Decomposed (current)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Browser  React SPA :5173                                               │
│           Axios + JWT Bearer header                                     │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │ REST / JSON
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Gateway  :3000  (NestJS proxy — no business logic)                     │
│                                                                         │
│  /api/orders/*         ──────────────────────────┐                      │
│  /api/admin/orders/*   ──────────────────────────┤                      │
│  /api/admin/stats      ──────────────────────────┤                      │
│  everything else       ──────────┐               │                      │
└─────────────────────────────────┬┼───────────────┼──────────────────────┘
                                  ││               │
                    HTTP proxy    ││               │  HTTP proxy
                                  ▼▼               ▼
┌──────────────────────────────────┐  ┌────────────────────────────────────┐
│  catalog-service  :3001          │  │  order-service  :3002              │
│                                  │  │                                    │
│  Auth (JWT + Passport)           │  │  OrdersController                  │
│  Users  · Products (Redis cache) │  │  AdminOrdersController             │
│  Cart   · Reviews · Seller       │  │  PaymentService                    │
│  Wishlist · Coupons · Admin      │  │    StripeStrategy                  │
│  InternalController (/internal/) │◄─┤    RazorpayStrategy                │
│    cart · products · users       │  │    CodStrategy                     │
│    coupons · stats               │  │  CatalogClientService (HTTP)       │
└──────────────┬───────────────────┘  └──────────────┬─────────────────────┘
               │                                      │
               │ TypeORM                              │ TypeORM        BullMQ
               │                                      │             enqueue job
               ▼                                      ▼                  │
┌──────────────────────┐   ┌──────────────────────┐  │                  │
│  MySQL :3307         │   │  Redis :6379          │◄─┘                  │
│  (shared instance,   │   │  • Cache-aside        │                     │
│   catalog tables +   │   │  • BullMQ queues:     │                     ▼
│   orders tables)     │   │    notifications      │  ┌──────────────────────────┐
└──────────────────────┘   │    inventory          │  │  notification-service    │
                           └──────────────────────┘  │  :3003 (worker-only)     │
                                      ▲              │                          │
                                      └──────────────┤  NotificationProcessor   │
                                     dequeue jobs    │  InventoryProcessor      │
                                                     │  NotificationFactory     │
                                                     │    EmailChannel          │
                                                     │  EmailService            │
                                                     └──────────────────────────┘
```

### v0.6 — Monolith (before decomposition)

```
┌──────────────────────────────────────────────────────────────┐
│  Browser  React SPA :5173                                    │
└──────────────────────────┬───────────────────────────────────┘
                           │ REST / JSON
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  NestJS Monolith  :3000                                      │
│                                                              │
│  Auth · Users · Products · Cart · Orders · Admin             │
│  Reviews · Seller · Wishlist · Coupons                       │
│  PaymentService (Stripe / Razorpay / COD)                    │
│  EmailService (Nodemailer)                                   │
│  BullMQ Producers + Processors (same process)                │
│                              │                               │
│                     TypeORM  │  BullMQ                       │
└─────────────────────────────┬┼──────────────────────────────┘
                              ││
                   ┌──────────┘└────────────┐
                   ▼                        ▼
        ┌──────────────────┐    ┌──────────────────┐
        │  MySQL :3307     │    │  Redis :6379      │
        └──────────────────┘    └──────────────────┘
```

### Service responsibilities

| Service              | Port | Owns                                                              |
|----------------------|------|-------------------------------------------------------------------|
| gateway              | 3000 | URL routing only; no auth, no business logic                      |
| catalog-service      | 3001 | Auth, users, products, cart, reviews, seller, wishlist, coupons   |
| order-service        | 3002 | Order lifecycle, payments, idempotency, admin order management    |
| notification-service | 3003 | BullMQ workers; email delivery; extensible channel factory        |

### Inter-service communication

| Caller               | Callee               | Transport       | Purpose                              |
|----------------------|----------------------|-----------------|--------------------------------------|
| order-service        | catalog-service      | REST `/internal` | Cart, stock, user, coupon lookups    |
| order-service        | Redis                | BullMQ enqueue  | Queue notification + inventory jobs  |
| notification-service | Redis                | BullMQ dequeue  | Process jobs, send emails            |
| catalog-service admin stats | order-service | REST `/internal` | Aggregate order count + revenue     |

See [docs/adr/001-microservice-decomposition.md](docs/adr/001-microservice-decomposition.md) for the full decision record including consistency tradeoffs.

---

## Tech Stack

| Layer            | Technology                                         |
|------------------|----------------------------------------------------|
| Frontend         | React 19, TypeScript, Vite 8, Tailwind CSS v4      |
| Gateway          | NestJS 10, http-proxy-middleware                   |
| Catalog-service  | NestJS 11, TypeORM, Passport/JWT, Redis cache-aside|
| Order-service    | NestJS 11, TypeORM, BullMQ producer, Stripe SDK   |
| Notification-svc | NestJS 11, BullMQ workers, Nodemailer              |
| Database         | MySQL 8.0 (shared instance, separate table sets)   |
| Queue / Cache    | Redis 7                                            |
| Containerization | Docker Compose                                     |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose (for MySQL + Redis)
- npm

### 1. Start infrastructure

```bash
docker-compose up -d   # MySQL on :3307, Redis on :6379
```

### 2. Run catalog-service (was: backend)

```bash
cd backend
npm install
npm run start:dev      # :3001
```

### 3. Run order-service

```bash
cd services/order-service
npm install
npm run start:dev      # :3002
```

### 4. Run notification-service

```bash
cd services/notification-service
npm install
npm run start:dev      # :3003 (worker — processes BullMQ jobs)
```

### 5. Run gateway

```bash
cd gateway
npm install
npm run start:dev      # :3000 — the single public entry point
```

### 6. Run the frontend

```bash
cd frontend
npm install
npm run dev            # :5173
```

The frontend's `VITE_API_BASE_URL` (defaults to `http://localhost:3000`) points at the
gateway. All API calls route through the gateway transparently.

### Environment Variables

| Variable               | Default                  | Used by              |
|------------------------|--------------------------|----------------------|
| `DB_HOST`              | `127.0.0.1`              | catalog, order       |
| `DB_PORT`              | `3307`                   | catalog, order       |
| `DB_USER`              | `shopforge_user`         | catalog, order       |
| `DB_PASSWORD`          | `shopforge_pass`         | catalog, order       |
| `DB_NAME`              | `shopforge`              | catalog, order       |
| `REDIS_HOST`           | `127.0.0.1`              | catalog, order, notif|
| `REDIS_PORT`           | `6379`                   | catalog, order, notif|
| `JWT_SECRET`           | `shopforge_secret`       | catalog, order       |
| `INTERNAL_TOKEN`       | `shopforge_internal`     | catalog, order, gw   |
| `CATALOG_SERVICE_URL`  | `http://localhost:3001`  | order, gateway       |
| `ORDER_SERVICE_URL`    | `http://localhost:3002`  | catalog, gateway     |
| `STRIPE_SECRET_KEY`    | `sk_test_placeholder`    | order                |
| `RAZORPAY_KEY_ID`      | *(absent = dev stub)*    | order                |
| `RAZORPAY_KEY_SECRET`  | *(absent = dev stub)*    | order                |
| `SMTP_HOST`            | *(absent = Ethereal dev)*| notification         |

---

## Project Structure

```
shopforge/
├── backend/                   # catalog-service (:3001)
│   └── src/
│       ├── auth/              # JWT strategy, Passport, RBAC
│       ├── cache/             # Redis cache-aside
│       ├── internal/          # /internal/* endpoints for order-service
│       ├── users · products · cart · reviews
│       ├── seller · wishlist · coupons · admin
│       └── app.module.ts
│
├── services/
│   ├── order-service/         # order-service (:3002)
│   │   └── src/
│   │       ├── auth/          # Standalone JWT guard (no Passport)
│   │       ├── catalog-client/ # HTTP client for catalog-service
│   │       ├── orders/        # Entity, service, controller
│   │       ├── payments/      # Strategy pattern (Stripe/Razorpay/COD)
│   │       ├── queue/         # BullMQ producer only
│   │       └── admin/         # Admin order endpoints
│   │
│   └── notification-service/  # notification-service (:3003)
│       └── src/
│           ├── email/         # EmailService (Nodemailer)
│           ├── notifications/ # Factory pattern (channels)
│           └── queue/         # BullMQ processors (workers)
│
├── gateway/                   # API gateway (:3000)
│   └── src/
│       └── app.module.ts      # http-proxy-middleware routing
│
├── frontend/                  # React SPA (:5173)
├── docs/adr/                  # Architecture Decision Records
│   └── 001-microservice-decomposition.md
├── docker-compose.yml
├── CHANGELOG.md
└── README.md
```

---

## Performance (v0.4-perf benchmarks)

Redis cache-aside on product endpoints. Benchmarked with autocannon (10c, 10s, 50 products).

| Metric          | MySQL only | Redis cache | Change  |
|-----------------|----------:|------------:|--------:|
| Req/sec         | 2,742     | 3,223       | +17.5%  |
| Latency avg     | 3.15 ms   | 2.55 ms     | -19.0%  |
| Latency p99     | 12 ms     | 6 ms        | -50.0%  |
| Throughput      | 1,044 KB/s| 14,478 KB/s | +13.9×  |

## License

MIT
