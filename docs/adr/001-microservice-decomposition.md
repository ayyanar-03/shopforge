# ADR 001 — Decompose Monolith into catalog-service, order-service, and notification-service

| Field       | Value                      |
|-------------|----------------------------|
| Status      | Accepted                   |
| Date        | 2026-06-27                 |
| Deciders    | ayyanar                    |

---

## Context

ShopForge started as a single NestJS monolith (`backend/`). By v0.6-async, the monolith
contained:

- Catalog domain: auth, users, products, cart, reviews, seller, wishlist, coupons, admin
- Order domain: order lifecycle, payment strategies, idempotency
- Notification domain: BullMQ queue processors, email channel, notification factory

This became a problem for three reasons:

1. **Deploy coupling** — a change to the email template required redeploying the entire
   backend, including all catalog logic.
2. **Scale mismatch** — order throughput and notification throughput have very different
   load profiles. A sale event can spike order volume 50× while catalog reads stay flat.
3. **Team ownership** — the order and notification domains are natural seams for separate
   ownership and release cadences.

---

## Decision

Extract two services from the monolith, communicate via REST (synchronous) and BullMQ
events (asynchronous), and add a lightweight API gateway as the single entry point for
the React frontend.

### Services after decomposition

```
gateway          :3000   Routes by URL prefix; no business logic
catalog-service  :3001   Auth, products, cart, reviews, seller, wishlist, coupons, admin
order-service    :3002   Order lifecycle, payment strategies, admin order management
notification-service :3003  BullMQ workers; email/channel delivery
```

### Communication

| From                   | To                     | Protocol              | When                          |
|------------------------|------------------------|-----------------------|-------------------------------|
| Frontend               | Gateway                | REST/HTTP             | Every request                 |
| Gateway                | catalog-service        | HTTP proxy            | Most routes                   |
| Gateway                | order-service          | HTTP proxy            | /api/orders/*, /api/admin/orders/*, /api/admin/stats |
| order-service          | catalog-service        | REST `/internal/*`    | Checkout (cart, stock, users, coupons) |
| order-service          | Redis (BullMQ)         | Enqueue job           | After every successful order  |
| notification-service   | Redis (BullMQ)         | Dequeue + process     | Continuously                  |

Internal endpoints (`/api/internal/*`) are authenticated with a shared `X-Internal-Token`
header (env: `INTERNAL_TOKEN`). They are never exposed through the gateway.

---

## Consistency tradeoffs

### 1. Eventual consistency between order and inventory

**Problem:** When `order-service` places an order, it calls `catalog-service` to
decrement stock via `PATCH /internal/products/:id/decrement`. These are two separate
network calls with no distributed transaction. If order-service crashes after creating
the order record but before calling decrement, the inventory never decrements.

**Mitigation in place:**
- Idempotency keys on orders prevent duplicate order records on retry.
- `decrementStock` is called before the job is queued, so inventory is consistent with
  the order record if the order commit succeeds.
- Partial failure (order saved, decrement missed) is handled by the idempotency check on
  retry: the existing order is returned without re-decrementing.

**Known gap:** A crash between order creation and stock decrement leaves inventory
overstated. The correct fix is a saga (compensating transaction) or an outbox pattern.
This is documented as a known tradeoff accepted for v0.7.

### 2. Eventual consistency between order and notification

Order confirmation emails are enqueued on Redis after the order is saved. If the order
saves but Redis is unavailable, the email is never sent. BullMQ's `attempts: 3` and
exponential backoff retry are configured at the queue level to mitigate transient
failures. Lost jobs on a Redis restart (without AOF persistence) are an accepted risk in
the dev/staging environment; production should run Redis with `appendonly yes`.

### 3. Shared database (accepted tactical debt)

Both `catalog-service` and `order-service` connect to the **same MySQL instance** and
use TypeORM `synchronize: true`. Each service only manages its own tables (`orders`,
`order_items` for order-service; everything else for catalog-service). There is no
cross-service join.

In a production multi-team environment each service should own an isolated schema or
database to allow independent migrations. The current design is a deliberate first step
toward decomposition that does not require data migration, and is acceptable at this
scale. The upgrade path is:

1. Introduce a separate MySQL schema per service (same instance, different credentials).
2. Replace the shared instance with service-specific RDS instances.

---

## Consequences

### Good

- `notification-service` can be restarted, updated, or scaled independently of checkout.
- `order-service` scales independently of product catalog reads.
- Adding a new notification channel (SMS, push) requires changes only to
  `notification-service`, zero touch to `order-service` or `catalog-service`.
- Adding a new payment strategy requires changes only to `order-service`.

### Bad / mitigated

- **Operational complexity** — 3 services + gateway means 4 processes to run locally
  (see `README.md` for the `start:dev` commands per service).
- **Network latency** — every checkout now incurs 5–6 synchronous HTTP round trips from
  `order-service` to `catalog-service` (cart, each product stock check, user, optional
  coupon). Acceptable at low volume; caching or a read-model projection would help at
  scale.
- **Partial failure visibility** — the gateway returns 502 if an upstream is down. A
  circuit-breaker (e.g. `opossum`) is the correct next step.

---

## Alternatives considered

| Alternative                     | Why not chosen                                                    |
|---------------------------------|-------------------------------------------------------------------|
| Keep monolith, add feature flags | Doesn't address deploy coupling or scale mismatch                |
| Event-driven only (no REST)     | Checkout requires synchronous confirmation; async-only adds UX complexity |
| gRPC between services           | Unnecessary complexity at this scale; REST is sufficient          |
| Shared npm package for types    | Monorepo workspace setup adds CI complexity; duplicating the ~5 shared DTOs is acceptable |
