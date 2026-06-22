# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-06-23

### Added

- **User module:** signup and login with JWT authentication
- **Product module:** full CRUD operations
- **Cart module:** add/remove items, clear cart
- **Order module:** place order from cart with stock decrement
- Repository pattern with interfaces separated from TypeORM implementations
- Unit tests for Order service (8 test cases)
- React frontend pages: signup, login, product listing, product detail, cart, checkout
- Auth context with localStorage persistence
- Axios API client with JWT interceptor
- Navbar with conditional auth-aware navigation
- Architecture diagram (Mermaid) in README
- API endpoint documentation in README
- Environment variable reference in README

## [0.1.0] - 2026-06-23

### Added

- Initial project scaffolding
- NestJS backend with TypeScript
- React frontend with TypeScript and Vite
- Docker Compose setup for MySQL and Redis
- ESLint and Prettier configuration for both projects
- Architecture Decision Record template
