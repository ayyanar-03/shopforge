# ShopForge

A full-stack e-commerce platform built with NestJS microservices and React.

---

## Architecture (v1.0)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Browser  React SPA :5173                                                        │
│           Axios + JWT Bearer header                                              │
└──────────────────────────┬───────────────────────────────────────────────────────┘
                           │ REST / JSON
                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Gateway  :3000  (NestJS — Express adapter, no business logic)                   │
│                                                                                  │
│  /api/orders/*      ────────────────────────────────────────────┐                │
│  /api/admin/orders/*  ──────────────────────────────────────────┤                │
│  everything else    ──────────────────┐                         │                │
└───────────────────────────────────────┼─────────────────────────┼────────────────┘
                                        │                         │
                         http-proxy     │                         │  http-proxy
                                        ▼                         ▼
┌────────────────────────────────────────┐  ┌─────────────────────────────────────┐
│  catalog-service  :3001                │  │  order-service  :3002               │
│                                        │  │                                     │
│  Auth (JWT + Passport + RBAC)          │  │  OrdersController                   │
│  Users  · Products (Redis cache-aside) │  │  AdminOrdersController              │
│  Cart   · Reviews  · Seller portal     │  │  PaymentService (Strategy pattern)  │
│  Wishlist · Coupons  · Admin           │  │    StripeStrategy                   │
│  FULLTEXT search (MySQL)               │  │    RazorpayStrategy                 │
│  InternalController (/internal/)    ◄──┤  │    CodStrategy                     │
│    cart  · products  · users           │  │  CatalogClientService (HTTP)        │
│    coupons · stats                     │  │  Idempotency (UUID dedup)           │
└──────────────┬─────────────────────────┘  └──────────────┬──────────────────────┘
               │                                            │
               │ TypeORM                                    │ TypeORM   BullMQ enqueue
               ▼                                            ▼               │
┌──────────────────────┐   ┌──────────────────────┐         │               │
│  MySQL 8.0  :3307    │   │  Redis 7  :6379       │◄────────┘               │
│  catalog tables +    │   │  Cache-aside (60s TTL)│                         │
│  orders tables       │   │  BullMQ queues:       │                         │
└──────────────────────┘   │    notifications      │                         │
                           │    inventory          │                         ▼
                           └──────────────────────┘    ┌────────────────────────────┐
                                                        │  notification-service       │
                                      ┌─────────────────│  :3003 (worker only)        │
                                      │  dequeue jobs   │                            │
                                      └─────────────────│  NotificationProcessor     │
                                                        │  InventoryProcessor        │
                                                        │  NotificationFactory       │
                                                        │    EmailChannel            │
                                                        │  EmailService (Nodemailer) │
                                                        └────────────────────────────┘

                            ┌─────────────────────────────────────────────────────────┐
                            │  Observability Stack                                     │
                            │                                                         │
                            │  All 4 NestJS services export:                          │
                            │    OTel traces → Jaeger :16686                          │
                            │    Prometheus metrics → /metrics endpoint               │
                            │                        ↓                                │
                            │  Prometheus :9090 ─────── scrapes all services          │
                            │       ↓                                                 │
                            │  Grafana :4000  ─────── pre-provisioned dashboards      │
                            └─────────────────────────────────────────────────────────┘
```

### Service Responsibilities

| Service              | Port | Owns                                                              |
|----------------------|------|-------------------------------------------------------------------|
| gateway              | 3000 | URL routing only; no auth, no business logic                      |
| catalog-service      | 3001 | Auth, users, products, cart, reviews, seller, wishlist, coupons   |
| order-service        | 3002 | Order lifecycle, payments, idempotency, admin order management    |
| notification-service | 3003 | BullMQ workers; email delivery; extensible channel factory        |

### Observability Ports

| Component   | Port  | Purpose                                      |
|-------------|-------|----------------------------------------------|
| Jaeger UI   | 16686 | Distributed trace viewer                     |
| Prometheus  | 9090  | Metrics scraper and time-series storage      |
| Grafana     | 4000  | Dashboards (user: `admin`, pw: `shopforge`)  |

### Inter-Service Communication

| Caller               | Callee               | Transport         | Purpose                              |
|----------------------|----------------------|-------------------|--------------------------------------|
| order-service        | catalog-service      | REST `/internal`  | Cart, stock, user, coupon lookups    |
| order-service        | Redis                | BullMQ enqueue    | Queue notification + inventory jobs  |
| notification-service | Redis                | BullMQ dequeue    | Process jobs, send emails            |
| catalog admin stats  | order-service        | REST `/internal`  | Aggregate order count + revenue      |

See [docs/adr/001-microservice-decomposition.md](docs/adr/001-microservice-decomposition.md) for the full decision record.

---

## Tech Stack

| Layer               | Technology                                            |
|---------------------|-------------------------------------------------------|
| Frontend            | React 19, TypeScript, Vite 8, Tailwind CSS v4         |
| Gateway             | NestJS 10, http-proxy-middleware                      |
| Catalog-service     | NestJS 11, TypeORM, Passport/JWT, Redis cache-aside   |
| Order-service       | NestJS 11, TypeORM, BullMQ producer, Stripe SDK       |
| Notification-svc    | NestJS 11, BullMQ workers, Nodemailer                 |
| Database            | MySQL 8.0 (shared instance, separate table sets)      |
| Queue / Cache       | Redis 7                                               |
| Tracing             | OpenTelemetry SDK → Jaeger (OTLP HTTP)                |
| Metrics             | prom-client → Prometheus → Grafana                    |
| Containerization    | Docker Compose (9 containers)                         |

---

## Design Patterns

| Pattern             | Where used                                                                              |
|---------------------|-----------------------------------------------------------------------------------------|
| **Repository**      | `IUserRepository`, `IProductRepository`, `ICartRepository` — interfaces decouple TypeORM from service layer, enabling unit tests with mocks |
| **Strategy**        | `PaymentService` + `IPaymentStrategy` — Stripe, Razorpay, COD implement the same interface; adding a new gateway = new class only |
| **Factory**         | `NotificationFactory` + `INotificationChannel` — maps channel name strings to concrete implementations; adding SMS = new class + one `switch` case |
| **Cache-aside**     | `CacheService` wraps Redis: read cache → on miss read DB → write cache; 60s TTL; invalidated on write |
| **Observer/Queue**  | BullMQ: `placeOrder` enqueues `NotificationJob` and `InventoryJob`; processors run in a separate process; failures retry without blocking checkout |
| **Proxy (gateway)** | `http-proxy-middleware` at the Express adapter layer; the gateway holds zero business logic — it only routes by URL prefix |
| **ADR**             | Architecture Decision Records in `docs/adr/` document why each major trade-off was made |

---

## Getting Started

### Prerequisites

- Docker & Docker Compose v2
- Node.js ≥ 18 (for local dev only)

### Full Stack via Docker Compose (Recommended)

```bash
# From the repo root
docker compose up --build
```

This starts 9 containers:

| Container              | Exposed Port |
|------------------------|-------------|
| shopforge-frontend     | 5173        |
| shopforge-gateway      | 3000        |
| shopforge-catalog      | (internal)  |
| shopforge-orders       | (internal)  |
| shopforge-notifications| (internal)  |
| shopforge-mysql        | 3307        |
| shopforge-redis        | 6379        |
| shopforge-jaeger       | 16686       |
| shopforge-prometheus   | 9090        |
| shopforge-grafana      | 4000        |

Open http://localhost:5173 when all containers are healthy.  
Observability: Jaeger at http://localhost:16686, Grafana at http://localhost:4000.

### Local Dev (Manual)

```bash
# 1. Start infra
docker compose up -d mysql redis jaeger prometheus grafana

# 2. catalog-service
cd backend && npm install && npm run start:dev   # :3001

# 3. order-service
cd services/order-service && npm install && npm run start:dev   # :3002

# 4. notification-service
cd services/notification-service && npm install && npm run start:dev   # :3003

# 5. gateway
cd gateway && npm install && npm run start:dev   # :3000

# 6. frontend
cd frontend && npm install && npm run dev   # :5173
```

### Running Tests

```bash
# catalog-service (includes cart, coupons, products, auth controller)
cd backend && npm test

# order-service (orders, payments)
cd services/order-service && npm install && npm test
```

---

## Environment Variables

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
| `OTEL_EXPORTER_OTLP_ENDPOINT` | *(absent = no traces)* | all services  |
| `GRAFANA_PASSWORD`     | `shopforge`              | grafana              |

---

## Project Structure

```
shopforge/
├── backend/                   # catalog-service (:3001)
│   └── src/
│       ├── auth/              # JWT strategy, Passport, RBAC
│       ├── cache/             # Redis cache-aside (CacheService)
│       ├── internal/          # /internal/* for order-service calls
│       ├── metrics/           # prom-client /metrics endpoint
│       ├── users · products · cart · reviews
│       └── seller · wishlist · coupons · admin
│
├── services/
│   ├── order-service/         # order-service (:3002)
│   │   └── src/
│   │       ├── auth/          # Standalone JWT guard (no Passport)
│   │       ├── catalog-client/ # HTTP client for catalog-service
│   │       ├── orders/        # Entity, service, controller, tests
│   │       ├── payments/      # Strategy pattern (Stripe/Razorpay/COD), tests
│   │       └── queue/         # BullMQ producer only
│   │
│   └── notification-service/  # notification-service (:3003)
│       └── src/
│           ├── email/         # EmailService (Nodemailer)
│           ├── notifications/ # Factory pattern (channels)
│           └── queue/         # BullMQ processors (workers)
│
├── gateway/                   # API gateway (:3000)
│   └── src/
│       └── main.ts            # Express-level proxy middleware
│
├── frontend/                  # React SPA (:5173)
├── monitoring/
│   └── grafana/provisioning/  # Auto-provisioned datasource + dashboard config
├── docs/adr/                  # Architecture Decision Records
├── prometheus.yml             # Prometheus scrape config
├── docker-compose.yml
├── CHANGELOG.md
├── RETROSPECTIVE.md
└── README.md
```

---

## Performance (v0.4 benchmarks)

Redis cache-aside on product listing/detail endpoints. Measured with autocannon (10 connections, 10 seconds, 50-product catalogue).

| Metric          | MySQL only | Redis cache | Change  |
|-----------------|----------:|------------:|--------:|
| Req/sec         |     2,742 |       3,223 | +17.5%  |
| Latency avg     |   3.15 ms |     2.55 ms | −19.0%  |
| Latency p99     |    12 ms  |       6 ms  | −50.0%  |
| Throughput      | 1,044 KB/s| 14,478 KB/s | +13.9×  |

The throughput jump (13.9×) reflects JSON serialization cost shifting from MySQL+ORM to Redis string retrieval. p99 halved because cache hits skip the TypeORM query planner entirely.

---

## License

MIT
