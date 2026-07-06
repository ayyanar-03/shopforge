import './tracer';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

const ORDER_URL = process.env.ORDER_SERVICE_URL ?? 'http://localhost:3002';
const CATALOG_URL = process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3001';

const GATEWAY_LOCAL = new Set(['/health', '/metrics']);

const CORS_HEADERS = [
  'access-control-allow-origin',
  'access-control-allow-credentials',
  'access-control-expose-headers',
];

function makeProxy(target: string) {
  return createProxyMiddleware<Request, Response>({
    target,
    changeOrigin: true,
    on: {
      proxyRes: (proxyRes) => {
        // Strip upstream CORS headers so the gateway's own cors() middleware wins
        CORS_HEADERS.forEach((h) => delete proxyRes.headers[h]);
      },
      error: (_err, _req, res) => {
        (res as Response).status(502).json({ message: 'Upstream service unavailable' });
      },
    },
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableCors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' });

  const http = app.getHttpAdapter().getInstance() as import('express').Express;

  // Order-service routes — use root-level middleware to preserve full path
  const ORDER_PREFIXES = ['/api/orders', '/api/admin'];
  const orderProxy = makeProxy(ORDER_URL);
  http.use((req: Request, res: Response, next: NextFunction) => {
    if (ORDER_PREFIXES.some((p) => req.path.startsWith(p))) return orderProxy(req, res, next);
    next();
  });

  // Catalog-service: everything except gateway-local routes
  const catalogProxy = makeProxy(CATALOG_URL);
  http.use((req: Request, res: Response, next: NextFunction) => {
    if (GATEWAY_LOCAL.has(req.path)) return next();
    catalogProxy(req, res, next);
  });

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
}

void bootstrap();
