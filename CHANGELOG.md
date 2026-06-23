# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
