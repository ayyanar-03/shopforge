# ADR-002: Product Search — MySQL FULLTEXT vs. Dedicated Search Engine

**Date:** 2026-06-25  
**Status:** Accepted

## Context

ShopForge needs product search with text matching on `name` and `description`, plus filters (category, price range) and sorting (relevance, price, name). We need to choose between MySQL FULLTEXT search and a dedicated search engine like Elasticsearch or Meilisearch.

## Decision

Use **MySQL FULLTEXT search** (`MATCH … AGAINST … IN BOOLEAN MODE`) with a composite index on `(name, description)`.

## Rationale

| Concern | MySQL FULLTEXT | Elasticsearch |
|---|---|---|
| Ops complexity | Zero — already have MySQL | New service, cluster mgmt, snapshots |
| Infrastructure cost | Included in existing DB | Additional instance ($30–$100/mo on managed) |
| Sync complexity | None — queries live data | Must sync writes via CDC or dual-write |
| Relevance tuning | Basic BM25-style scoring | Full BM25, field boosts, custom analyzers |
| Faceted search | Manual GROUP BY queries | Native aggregations |
| Typo tolerance | None | Fuzzy matching built-in |
| Scale ceiling | ~10M rows before noticeable lag | Horizontally scalable |

At current scale (hundreds to low thousands of products), MySQL FULLTEXT covers the requirements:
- Boolean mode prefix search (`+term*`) handles partial matches
- Filters (category, price range) map cleanly to WHERE clauses on indexed columns
- Sorting by price/name uses existing B-tree indexes
- Short queries (< 3 chars) fall back to `LIKE` automatically

## What Would Change at Scale

The migration trigger is roughly **1M+ products or > 500 search req/sec with p99 > 100ms**. At that point:

1. **Add Elasticsearch or Meilisearch** as a sidecar service
2. **Sync via CDC** (Debezium → Kafka → ES consumer) or dual-write in the repository layer
3. **Swap the `IProductRepository.search()` implementation** — the interface contract stays the same; only the TypeORM implementation is replaced with an ES client call
4. **Enable fuzzy matching and field boosts** (`name^3 description^1`) for better relevance
5. **Move filters to ES aggregations** for faceted counts (e.g., "Electronics (12)")

The repository pattern isolates this change to a single file (`product.repository.ts`), making the swap surgical.

## Alternatives Considered

- **Meilisearch:** Better DX than ES, but still requires a separate process and sync pipeline. Premature at current scale.
- **PostgreSQL full-text search (tsvector):** Comparable to MySQL FULLTEXT but we're on MySQL; not worth a DB switch for this feature alone.
- **Application-level filtering (`LIKE` everywhere):** Already in place as a fallback for short queries; does not scale past ~100k rows due to full table scans.

## Consequences

- FULLTEXT index is created automatically by TypeORM `synchronize: true`
- MySQL minimum word length (`ft_min_word_len = 4` by default on some versions; 3 on MySQL 8) means very short tokens may not be indexed — mitigated by the `LIKE` fallback for queries < 3 characters
- Adding a `category` column to `products` requires existing rows to be backfilled if categories are introduced retroactively
