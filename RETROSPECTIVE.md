# ShopForge — Retrospective

This document covers what we learned building ShopForge from a monolith to a microservices platform with full observability, the breaks that happened along the way, and what we would do differently at real production scale.

---

## What We Learned

### 1. NestJS middleware scope is narrower than it looks

`app.use(forRoutes({ path: '*path' }))` only applies to paths that have a registered NestJS handler. A catch-all proxy that needs to intercept *all* HTTP traffic — including routes with no NestJS controller — must be mounted at the underlying Express adapter level (`app.getHttpAdapter().getInstance().use(...)`). The NestJS docs bury this detail; the symptom (proxy silently returning 404 without even reaching the upstream) took significant debugging to trace.

### 2. TypeORM 1.0 breaks nullable union types

TypeORM 0.3.x inferred column types from TypeScript. TypeORM 1.0 removed that inference: a column typed `string | null` or `number | null` produces `DataTypeNotSupportedError: Data type "Object"` at startup. Every nullable column with a union type needs an explicit `type: 'varchar'` or `type: 'int'` in the decorator. This is not prominently documented and affected three entities simultaneously.

### 3. Circular imports kill BullMQ processor decoration

When `queue.module.ts` re-exports from the file that imports it (processors), Node.js resolves the circular require with a partially-initialised module. The result is that the string constant used in `@Processor({ name: ... })` is `undefined` at class decoration time, but the stack trace points to a completely different crash ("Queue name must be provided"). The fix — extract constants to a separate file imported by both sides — is simple once the root cause is understood. The diagnosis is not.

### 4. Container healthchecks require tools that exist in the base image

nginx:alpine does not ship `wget`. A `HEALTHCHECK` using `wget` silently fails, marking the container perpetually unhealthy. `curl` is available in nginx:alpine; switching to `curl -fs` resolved the issue immediately. Always verify which utilities are present in a minimal base image before writing healthcheck commands.

### 5. N+1 HTTP calls are a service-boundary smell

`OrdersService.placeOrder()` was making one `GET /internal/products/:id` call *per cart item* to validate stock — even though `CatalogClientService.getCartItems()` already returns each cart item with its product embedded. The redundant round-trips went unnoticed because the monolith-era code had a local repository call there, and the refactor copied the pattern without questioning whether it still made sense across a network boundary. Explicit naming (`validateStock`) and a test that asserts `getProduct` is *never called* made the invariant visible.

### 6. Self-closing async fan-out hides failures

`void this.notificationQueue.add(...)` means a queue write failure is silently swallowed. For order confirmation emails this is acceptable — the trade-off is documented. For inventory alerting the tradeoff is less clear. BullMQ's built-in retry and dead-letter queues partially compensate, but a proper outbox pattern (write job to DB in the same transaction as the order) would give stronger guarantees.

### 7. Gateway PR auto-merge classifiers reject self-approvals

The GitHub Actions auto-merge classifier requires a human approval on PRs opened by the repository owner. This is a reasonable guardrail but caught us by surprise twice. The workaround (`gh pr merge --admin`) requires the `workflow` OAuth scope, which the gh CLI token may not have if initially authenticated without it. SSH push avoids the scope issue for normal commits; merge approvals still require a browser review.

---

## What Broke During Development

| Break | Root cause | Fix |
|-------|-----------|-----|
| Gateway returns 404 for all proxied routes | NestJS middleware does not apply to unregistered paths | Mount proxy on Express adapter directly |
| catalog-service crash on startup | TypeORM 1.0 breaks `string \| null` column type inference | Add explicit `type: 'varchar'` / `type: 'int'` |
| notification-service crash — "Queue name must be provided" | Circular import: `NOTIFICATION_QUEUE` constant is `undefined` at processor decoration time | Extract constants to `queue.constants.ts` |
| Frontend container stuck in "unhealthy" | nginx:alpine has no `wget`; healthcheck uses `wget` | Switch to `curl -fs` |
| `orders.service.ts` making N+1 HTTP calls per checkout | Stock validation re-fetched products already embedded in cart items | Delete the validation loop; use `item.product.stock` directly |
| ESLint `no-misused-promises` on SIGTERM handler | Promise returned from `.on()` callback not void-wrapped | Add `void` keyword + multiline brace format for Prettier |

---

## What We'd Do Differently at Greater Scale

### Search: Elasticsearch instead of MySQL FULLTEXT

MySQL FULLTEXT search works well for small catalogues but does not support fuzzy matching, stemming, faceted filters, or relevance tuning without significant custom work. At scale (100k+ products) we would replace the FULLTEXT index with **Elasticsearch** (or OpenSearch):

- Faceted category/price filtering becomes an aggregation query
- Typo tolerance comes for free with `fuzziness: AUTO`
- Index replicas handle read traffic without touching MySQL
- The migration path from MySQL FULLTEXT is documented in `docs/adr/002-search.md`

### Messaging: Kafka instead of BullMQ

BullMQ over Redis is excellent for job queues but has limitations at event-stream scale:

- Redis is not durable by default; AOF/RDB persistence adds latency
- BullMQ queues are point-to-point; multiple consumers on the same job type require separate queues
- No native event replay or time-travel debugging

**Apache Kafka** would replace both BullMQ queues and the synchronous HTTP calls from order-service to catalog-service for inventory decrement. An `OrderPlaced` event emitted to a Kafka topic could fan out to: notification consumer, inventory consumer, analytics consumer — without any coupling between producers and consumers. The saga pattern (with a compensating `CancelOrder` event on stock failure) would replace the current synchronous checkout loop.

### Orchestration: Kubernetes instead of Docker Compose

Docker Compose is the right choice for local development and small-team deployments. It does not provide:

- **Rolling deployments** — a new image always requires downtime
- **Health-driven restart** — containers restart, but there is no readiness gate before traffic is shifted
- **Horizontal scaling** — spinning up a second catalog-service replica requires manual Compose overrides
- **Secrets management** — `.env` files checked into the repo are a liability

A **Kubernetes** deployment would add:
- Deployments + HPA (Horizontal Pod Autoscaler) on CPU/RPS metrics — Grafana already exports the data needed
- Kubernetes Secrets (or Vault) for `JWT_SECRET`, Stripe keys, SMTP credentials
- Ingress (nginx or Envoy) replacing the NestJS gateway — reduces one hop and one failure domain
- Liveness/readiness probes wired to the existing `/health` endpoints

### Database: Read Replicas + Connection Pooling

The current architecture uses a single MySQL instance shared by catalog-service and order-service. At scale:

- Add a **read replica** and route all `SELECT` queries from product listing and order history reads to it
- Use **PgBouncer** or **ProxySQL** in front of MySQL to pool connections — each NestJS process opens a TypeORM connection pool, and many replicas contacting MySQL directly exhausts `max_connections`
- Long-term: consider **CockroachDB** or **Vitess** for horizontal sharding if the orders table grows past 100M rows

### Observability: Sampling + Alerting

The current OTel setup traces 100% of requests. At high traffic this generates significant storage cost in Jaeger. We would add:

- **Head-based sampling** (e.g. 10% in production, 100% in staging) via the OTel SDK's `TraceIdRatioBased` sampler
- **Prometheus alerting rules** — the metrics infrastructure is in place; adding `PrometheusRule` resources with SLO-based alerts (p99 latency > 200ms, error rate > 1%) completes the observability loop
- **Grafana Loki** for log aggregation alongside the existing Pino JSON structured logs
