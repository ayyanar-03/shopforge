# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-06-28

### Added

- **RETROSPECTIVE.md** — post-project analysis covering root causes of every break during development, lessons learned about NestJS internals, TypeORM 1.0 migration gotchas, and next-steps for Elasticsearch, Kafka, and Kubernetes at production scale
- **`cart.service.spec.ts`** (backend) — 6 unit tests covering `getCart`, `addItem` (new item + quantity merge), `removeItem`, `clearCart`; all backed by a mocked `ICartRepository`
- **`orders.service.spec.ts`** (order-service) — 11 unit tests including idempotency dedup, empty cart, insufficient stock, COD happy path, coupon application, Stripe PAID status, parallel stock decrement, low-stock inventory fan-out, pagination math, `getOrder` not-found, and `getStats` null-table edge case
- **`payment.service.spec.ts`** (order-service) — 5 unit tests verifying the Strategy routing for Stripe, Razorpay, and COD, rejection of unknown methods, and isolation between strategies
- **Jest configuration added to order-service** — `devDependencies` (`@nestjs/testing`, `jest`, `ts-jest`, `@types/jest`) and `jest` block in `package.json`; `"test"` and `"test:cov"` scripts added

### Changed

- **`OrdersService.placeOrder()` refactored** — eliminated N+1 HTTP calls: stock validation now uses `.product.stock` already on the `CartItemDto` from `getCartItems()` instead of making one `GET /internal/products/:id` call per cart item; `as never` TypeScript escape hatch replaced with `DeepPartial<OrderItem>[]`; side-effect accumulation in `.map()` replaced with `.reduce()`; method decomposed into four private helpers: `validateStock`, `buildLineItems`, `decrementAllStock`, `dispatchPostOrderJobs`; seller fetches for low-stock alerts now run in parallel with `Promise.all` instead of sequentially
- **`app.controller.spec.ts`** — updated health response expectations to match current `service: 'catalog-service'`, `version: '0.8.0'`, and `timestamp` shape
- **README.md** — full rewrite: v1.0 architecture diagram includes observability stack, observability port table, design patterns table, Docker Compose startup instructions, local dev instructions, test instructions, updated env var table, RETROSPECTIVE.md cross-reference

## [0.9-observability] - 2026-06-28

### Added

- **OpenTelemetry tracing** — `@opentelemetry/sdk-node` added to all four NestJS services; conditional on `OTEL_EXPORTER_OTLP_ENDPOINT` env var; SIGTERM handler shuts down the SDK cleanly; `tracer.ts` imported at the top of each `main.ts`
- **Prometheus metrics** — `prom-client` added to all four services; `MetricsModule` calls `collectDefaultMetrics()` with a per-service prefix (`shopforge_catalog_`, `shopforge_order_`, `shopforge_notification_`, `shopforge_gateway_`); `GET /metrics` endpoint exposed on each service
- **Jaeger** (`jaegertracing/all-in-one:1.56`) added to `docker-compose.yml`; OTLP HTTP on port 4318, UI on port 16686
- **Prometheus** (`prom/prometheus:v2.51.0`) added to `docker-compose.yml`; scrapes all four services via `prometheus.yml`
- **Grafana** (`grafana/grafana:10.4.2`) added to `docker-compose.yml` on host port 4000; auto-provisioned Prometheus datasource via `monitoring/grafana/provisioning/datasources/prometheus.yml`; dashboard file provider via `monitoring/grafana/provisioning/dashboards/dashboard.yml`
- **`products.service.spec.ts`** — 10 unit tests for `ProductsService` (mock `IProductRepository` + `CacheService`)
- **`coupons.service.spec.ts`** — 16 unit tests for `CouponsService` (mock TypeORM `Repository<Coupon>`)

### Fixed

- **Gateway proxy** — moved `http-proxy-middleware` from NestJS middleware to the Express adapter level; NestJS middleware only fires for paths with registered handlers, so the catch-all proxy was silently dropping all catalog routes
- **TypeORM 1.0 `DataTypeNotSupportedError`** — added explicit `type: 'varchar'` / `type: 'int'` to all `@Column({ nullable: true })` decorators on `Product`, `Coupon`, and `Order` entities
- **notification-service crash** — `NOTIFICATION_QUEUE` and `INVENTORY_QUEUE` constants extracted to `queue.constants.ts`; circular import between `queue.module.ts` and processors caused the constants to be `undefined` at class decoration time
- **Frontend healthcheck** — switched from `wget` to `curl -fs`; nginx:alpine does not include `wget`

## [0.8-infra] - 2026-06-27

### Added

- **Dockerfiles (multi-stage, `node:20-alpine`)** for all five services: `backend/Dockerfile` (catalog-service), `services/order-service/Dockerfile`, `services/notification-service/Dockerfile`, `gateway/Dockerfile`, `frontend/Dockerfile` (nginx:alpine serving Vite build); each includes a `HEALTHCHECK` instruction and a two-stage build (all deps → compile → prod-deps-only runtime)
- **`docker-compose.yml` (full system)** — replaces the previous infra-only compose; runs MySQL + Redis + catalog-service + order-service + notification-service + gateway + frontend; all application services depend on infra healthchecks before starting; gateway waits for catalog and order services to be healthy; all env vars (`DB_*`, `REDIS_*`, `JWT_SECRET`, `INTERNAL_TOKEN`, SMTP, Stripe/Razorpay keys) are injected via environment blocks with safe defaults; `VITE_API_BASE_URL` is passed as a Docker build arg to the frontend
- **`frontend/nginx.conf`** — serves React SPA with `try_files $uri $uri/ /index.html` for client-side routing; gzip enabled for common MIME types
- **Structured logging via `nestjs-pino`** — added `nestjs-pino@^4.1.0` and `pino-http@^10.3.0` to all four NestJS services; `pino-pretty@^13.0.0` as devDependency; `LoggerModule.forRoot()` registered in each `AppModule`; `app.useLogger(app.get(Logger))` called in each `main.ts` with `bufferLogs: true`; dev mode outputs pretty single-line logs, production outputs structured JSON; `LOG_LEVEL` env var controls verbosity
- **Health endpoints** — each service exposes `GET /health` returning `{ status, service, version, timestamp }`:
  - `catalog-service :3001/health` — existed, updated to version `0.8.0` and added timestamp
  - `order-service :3002/health` — new `HealthController`; excluded from the `/api` global prefix
  - `notification-service :3003/health` — new `HealthController`
  - `gateway :3000/health` — inline `HealthController` in `AppModule`
- **`frontend/src/api.ts`** — base URL now reads `import.meta.env.VITE_API_BASE_URL` with fallback to `http://localhost:3000`; makes the Docker build-arg injectable without changing dev defaults
- **`.github/workflows/ci.yml`** — GitHub Actions CI workflow:
  - On every push / PR to master: runs `catalog-lint`, `catalog-test`, `order-build`, `notification-build`, `gateway-build`, `frontend-lint`, `frontend-build` as parallel jobs
  - On push to master only (after all jobs pass): `docker-build` job logs into GitHub Container Registry and pushes images to `ghcr.io/{repo}/{service}:latest` with GHA layer caching per service

### Changed

- `backend/src/main.ts` — port default changed from `3000` to `3001` (catalog-service now runs on 3001; gateway is the public entry point on 3000)
- `backend/src/app.service.ts` — health response updated: `service: 'catalog-service'`, `version: '0.8.0'`, added `timestamp`
- `docker-compose.yml` — rewrote to include all application services; MySQL internal port is now `3306` (Docker default); host-side port mapping `3307:3306` preserved for local dev

## [0.7-microservices] - 2026-06-27

### Added

- **`services/order-service/` (:3002)** — standalone NestJS app extracted from the monolith; owns `orders` + `order_items` tables; includes `CatalogClientService` (HTTP client for internal catalog-service calls), `PaymentsModule` (Strategy pattern: Stripe/Razorpay/COD), BullMQ queue producer, and admin order endpoints; validates JWTs independently via `@nestjs/jwt` without Passport
- **`services/notification-service/` (:3003)** — standalone NestJS worker; owns `NotificationProcessor` and `InventoryProcessor` (BullMQ consumers); `NotificationFactory` (Factory pattern, `EmailChannel`); `EmailService` (Nodemailer); no HTTP business endpoints, health port only
- **`gateway/` (:3000)** — NestJS API gateway using `http-proxy-middleware`; routes `/api/orders/*` and `/api/admin/orders/*` and `/api/admin/stats` to order-service; everything else to catalog-service; single public entry point for the React frontend
- **`backend/src/internal/` (catalog-service)** — `/internal/*` controller group secured by `X-Internal-Token` header; exposes cart, product (with stock decrement returning updated entity), user, coupon apply, and catalog stats for order-service to call at checkout time
- **`docs/adr/001-microservice-decomposition.md`** — full Architecture Decision Record covering service boundaries, inter-service communication table, consistency tradeoffs (eventual consistency between order and inventory, shared-DB tactical debt, BullMQ retry semantics), and alternatives considered

### Changed

- **`backend/` (catalog-service)** — `OrdersModule`, `EmailModule`, `QueueModule`, `PaymentsModule`, `NotificationsModule` extracted and deleted; `AdminService.getStats()` now calls order-service `/internal/stats` via native `fetch` for order count and revenue, with graceful fallback to zero; admin order CRUD endpoints removed (moved to order-service)
- **`AdminController`** — order routes (`GET /admin/orders`, `PATCH /admin/orders/:id/status`) removed; coupon CRUD remains
- **`AppModule`** (catalog-service) — removed `BullModule`, `OrdersModule`, `EmailModule`, `QueueModule`, `PaymentsModule`, `NotificationsModule`; added `InternalModule`
- **README.md** — added before/after ASCII architecture diagrams, service table, inter-service communication table, per-service `start:dev` commands, and full environment variable reference

### Architecture notes (see ADR 001)

- Order-service and catalog-service share the same MySQL instance for now (separate table sets, no cross-service joins) — documented as accepted tactical debt
- Checkout involves 5–6 synchronous HTTP calls from order-service to catalog-service; this is the known network cost of the decomposition and is acceptable at current scale
- A crash between order creation and stock decrement leaves inventory overstated until the next retry; a saga/outbox pattern is the documented next step

## [0.6-async] - 2026-06-27

### Added

- **BullMQ async job queues (Redis-backed):** two named queues — `notifications` and `inventory`; `QueueModule` registers both and owns the processors; `OrdersModule` injects queues as producers
- **NotificationProcessor:** BullMQ worker that dequeues `NotificationJob` payloads and dispatches to registered channels via `NotificationService`; order confirmation emails are now non-blocking and retryable
- **InventoryProcessor:** BullMQ worker that receives an `InventoryJob` after each order; emits a low-stock alert notification when a product's remaining stock falls below the threshold (5 units)
- **Factory pattern — notification channels:** `INotificationChannel` interface; `NotificationFactory` maps channel type strings (`'email'`) to concrete implementations; `NotificationService.send(channels[], payload)` fans out across all requested channels; adding SMS/push requires only a new class + one `switch` case
- **Strategy pattern — payment methods:** `IPaymentStrategy` interface with `process(amount, currency, idempotencyKey) → PaymentResult`; three strategies registered in `PaymentService`:
  - `StripeStrategy` — creates and immediately confirms a `PaymentIntent` via the Stripe SDK (test mode; set `STRIPE_SECRET_KEY` to use live keys)
  - `RazorpayStrategy` — calls `/v1/orders` over HTTPS with Basic auth; falls back to a dev-mode stub when credentials are absent (`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`)
  - `CodStrategy` — synchronous, returns `{ status: 'pending' }` with no external call
- **Idempotency keys:** `Order` entity gains a unique-nullable `idempotencyKey` column; `PlaceOrderDto` accepts a client-generated UUID v4; `OrdersService` returns the existing order on duplicate key instead of double-charging; `CartPage` generates the key on mount with `crypto.randomUUID()` and holds it stable across retries
- **Payment fields on Order:** `paymentMethod` (enum: stripe | razorpay | cod), `paymentStatus` (enum: pending | paid | failed), and `paymentId` columns; Stripe sets status to `paid` immediately, Razorpay and COD start as `pending`
- **Low-stock email alert:** `EmailService.sendLowStockAlert()` sends a formatted HTML email to the seller when inventory drops below threshold; routed through `EmailChannel` via the same factory/service pipeline as order confirmation
- **Payment method selector in Cart:** radio group (Cash on Delivery / Stripe test / Razorpay test) wired to `POST /orders`; idempotency key sent on every checkout attempt

### Changed

- `OrdersService.placeOrder()` no longer calls `EmailService` directly; fires a queued `NotificationJob` instead; payment is processed before stock decrement (failed payment = no order created)
- `OrdersModule` drops `EmailModule` import; now imports `PaymentsModule` and registers `BullModule` queues for producing jobs
- `AppModule` adds `BullModule.forRoot()` (Redis connection) and `QueueModule`

## [0.6.0] - 2026-06-26

### Added

- **Order status management:** `PATCH /admin/orders/:id/status` endpoint (admin only); status lifecycle: `pending → confirmed → shipped → delivered → cancelled`; admin orders view replaced static badge with an inline colour-coded dropdown that updates optimistically
- **Admin dashboard:** stat cards (users, products, orders, revenue), paginated users table with role badges, paginated orders management, paginated product table with delete
- **Seller portal:** `/seller` area (seller role only) with overview stats (products, reviews, avg rating), product list with edit/delete actions, shared create/edit product form
- **Product reviews & star ratings:** `POST /products/:id/reviews` (one per user), `GET /products/:id/reviews`; `averageRating` and `reviewCount` denormalised onto `Product` and recalculated on each submission; interactive `StarRating` component (half-star support) shown on cards and detail page
- **Category-aware product images:** Unsplash photo IDs mapped by category (8 categories × 5 photos) with price-tier fallback; `getProductImage()` utility respects stored `imageUrl` first
- **`sellerId` column on Product:** stamped from JWT on create; sellers can only edit/delete their own products (admins bypass ownership check)
- **ESLint/TypeScript strict mode:** eliminated all `any` types across backend and frontend; `AuthenticatedRequest` interface shared across guards and controllers

### Changed

- `OrderStatus` enum extended with `shipped` and `delivered` values
- Admin orders page refactored: expand/collapse rows, status dropdown replaces static badge
- Products controller passes `req.user.id` and `req.user.role` to service for ownership enforcement on update/delete
- Navbar shows role-specific links: Seller (green) for sellers, Admin (blue) for admins

## [0.5.0-search] - 2026-06-25

### Added

- **MySQL FULLTEXT search:** Composite FULLTEXT index on `products(name, description)`; `GET /products/search` supports text query, category filter, price range filter, and sort (price, name, newest)
- **`category` column** on `Product` entity (nullable varchar) with support in create/update DTOs
- **Related products:** `GET /products/:id/related` returns up to 4 products sharing the same category
- **Search bar** on the Products page with 350ms debounce, live filtering, URL sync via `useSearchParams`
- **Filter controls:** category dropdown, min/max price inputs, sort select with "Clear filters" button
- ADR-002: FULLTEXT search rationale and Elasticsearch migration path

### Changed

- Short queries (< 3 chars) fall back to `LIKE` to work around MySQL minimum token length
- Search results not cached (dynamic queries with arbitrary filter combinations)
- `app.controller.spec.ts` updated for renamed `getHealth()` method
- `orders.service.spec.ts` updated for paginated `getOrders(userId, page, limit)` signature

## [0.4.0-perf] - 2026-06-24

### Added

- **Redis caching:** Cache-aside pattern on product listing and detail endpoints using ioredis (60s TTL), with invalidation on create/update/delete
- **Pagination:** Product listing and order history return paginated results (`page`, `limit`, `total`, `totalPages`); default 20 items/page, max 100
- `PaginationDto` with class-validator/class-transformer for query param validation
- Global `RedisCacheModule` with `CacheService` for get/set/del/delByPattern
- Load test script (`scripts/load-test.js`) using autocannon
- Performance benchmark results in README

### Changed

- Product GET endpoints skip rate limiting (`@SkipThrottle()`) since they are public and cached
- Product repository uses `findAndCount` with skip/take for paginated queries
- Order repository uses `findAndCount` with skip/take for paginated queries

### Performance

- MySQL indexes added on cart_items (userId, productId), orders (userId, createdAt), order_items (orderId, productId), refresh_tokens (userId)
- p99 latency reduced from 12 ms to 6 ms (50% reduction)
- Throughput increased from 1,044 KB/s to 14,478 KB/s (13.9x)

## [0.3.0-security] - 2026-06-23

### Added

- **RBAC:** Role enum (buyer, seller, admin) with `@Roles()` decorator and `RolesGuard`
- User entity gains `role` column (default: buyer), JWT payload includes role claim
- **Refresh token rotation:** `refresh_tokens` table with reuse detection — presenting a revoked token invalidates all tokens for that user
- `POST /auth/refresh` and `POST /auth/logout` endpoints
- **Rate limiting:** `@nestjs/throttler` globally (60 req/min) with tighter limits on auth endpoints (signup: 5/min, login: 10/min, refresh: 10/min)
- Integration tests (e2e) covering signup, login, refresh token rotation, RBAC enforcement on product CRUD, and DTO validation across all endpoints
- ADR-001: Authentication and authorization strategy decision record

### Changed

- Product write endpoints (`POST`, `PUT`) restricted to seller and admin roles
- Product delete restricted to admin only
- Access token TTL reduced from 7 days to 15 minutes
- Signup DTO accepts optional `role` field with enum validation

### Security

- Refresh token rotation prevents token replay attacks
- Reuse detection revokes all user tokens on suspected theft
- Rate limiting on auth endpoints slows credential-stuffing attacks
- `ValidationPipe` with `whitelist: true` strips unknown fields on all endpoints

## [0.2.0-mvp] - 2026-06-23

### Added

- **User module:** signup and login with JWT authentication
- **Product module:** full CRUD operations
- **Cart module:** add/remove items, clear cart
- **Order module:** place order from cart with stock decrement
- Repository pattern with interfaces separated from TypeORM implementations
- Unit tests for Order service (8 test cases)
- React frontend pages: signup, login, product listing, product detail, cart, orders
- Auth context with localStorage persistence
- Axios API client with JWT interceptor
- Navbar with conditional auth-aware navigation

### Changed

- Docker Compose MySQL port mapped to 3307 to avoid conflicts with local MySQL
- Backend default `DB_PORT` updated to 3307
- README rewritten with detailed Mermaid architecture diagram showing monolith structure
- Setup instructions updated with Docker and local-service alternatives

### Fixed

- TypeScript `import type` errors for repository interfaces in decorated signatures
- TypeORM `relations` syntax updated from string arrays to object notation

## [0.1.0] - 2026-06-23

### Added

- Initial project scaffolding
- NestJS backend with TypeScript
- React frontend with TypeScript and Vite
- Docker Compose setup for MySQL and Redis
- ESLint and Prettier configuration for both projects
- Architecture Decision Record template
