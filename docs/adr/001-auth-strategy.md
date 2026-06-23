# ADR-001: Authentication and Authorization Strategy

## Status

Accepted

## Context

ShopForge needs to authenticate users and enforce different access levels: buyers browse and purchase, sellers manage product listings, and admins have full control. The system is a monolithic NestJS API consumed by a React SPA, so the auth mechanism must work well with stateless HTTP and be easy to validate on every request without a session store.

Key requirements:
- Stateless authentication compatible with horizontal scaling
- Role-based access control with at least three tiers (buyer, seller, admin)
- Token refresh without requiring re-login
- Protection against refresh token theft (token reuse detection)
- Rate limiting on auth endpoints to slow credential-stuffing attacks

## Decision

**JWT access tokens (short-lived) + opaque refresh tokens (database-backed, rotated).**

1. **Access tokens:** Signed JWTs containing `sub`, `email`, and `role` claims. TTL of 15 minutes. Validated statelessly by passport-jwt on every protected request. Short TTL limits the damage window if a token leaks.

2. **Refresh tokens:** Random 48-byte hex strings stored in the `refresh_tokens` table. TTL of 7 days. On each refresh, the old token is revoked and a new pair (access + refresh) is issued. If a revoked token is presented, all tokens for that user are invalidated (reuse detection).

3. **Role-based access control:** A `role` enum column on the User entity (`buyer`, `seller`, `admin`). A custom `RolesGuard` reads the `@Roles()` decorator metadata and compares it against `req.user.role` set by the JWT strategy. Guards are applied per-route, not globally, so public endpoints remain unguarded.

4. **Rate limiting:** `@nestjs/throttler` applied globally (60 req/min default) with tighter per-route overrides on `/auth/signup` (5/min), `/auth/login` (10/min), and `/auth/refresh` (10/min).

5. **DTO validation:** `class-validator` with `ValidationPipe({ whitelist: true, transform: true })` applied globally. Every endpoint validates and strips unknown fields.

## Consequences

**Positive:**
- Access tokens are stateless — no database call on every authenticated request
- Refresh token rotation limits the usefulness of a stolen refresh token to a single use
- Reuse detection provides an early warning if tokens are being intercepted
- Role enforcement is declarative via decorators, keeping controllers clean
- Rate limiting is low-effort and covers the highest-risk endpoints

**Negative:**
- Access tokens cannot be revoked before expiry (15-min window); acceptable for MVP but may need a token blacklist at scale
- Refresh tokens require a database table and cleanup of expired rows
- Role is embedded in the JWT, so role changes don't take effect until the token is refreshed
- No per-resource ownership checks yet (e.g., seller can only edit their own products) — requires a future authorization layer

## Alternatives Considered

**Session-based auth (express-session + Redis):**
Rejected. Requires sticky sessions or a shared session store, adding infrastructure complexity. Doesn't fit the stateless API model well, and doesn't pair naturally with mobile clients if added later.

**OAuth 2.0 / OpenID Connect (Auth0, Keycloak):**
Rejected for MVP. Adds external service dependency and configuration overhead. The right choice at scale, but premature for a monolith with three user roles. Easy to migrate to later since the JWT format is compatible.

**Opaque access tokens (database-validated):**
Rejected. Requires a database lookup on every authenticated request, adding latency and a single point of failure. JWT avoids this at the cost of not being instantly revocable.

**RBAC via CASL or casbin:**
Rejected for now. The current three-role model is simple enough for a NestJS guard with decorator metadata. A policy engine becomes worthwhile when per-resource ownership or complex permission hierarchies are needed.
