# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
