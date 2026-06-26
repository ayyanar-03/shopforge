import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { createProxyMiddleware, type Options } from 'http-proxy-middleware';
import type { Request, Response, NextFunction } from 'express';

const CATALOG_URL = process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3001';
const ORDER_URL = process.env.ORDER_SERVICE_URL ?? 'http://localhost:3002';

function proxy(target: string): (req: Request, res: Response, next: NextFunction) => void {
  const handler = createProxyMiddleware<Request, Response>({
    target,
    changeOrigin: true,
    on: {
      error: (_err, _req, res) => {
        (res as Response).status(502).json({ message: 'Upstream service unavailable' });
      },
    },
  } as Options<Request, Response>);
  return handler as (req: Request, res: Response, next: NextFunction) => void;
}

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Order-service handles: /api/orders/*, /api/admin/orders/*, /api/admin/stats
    consumer
      .apply(proxy(ORDER_URL))
      .forRoutes(
        { path: 'api/orders', method: RequestMethod.ALL },
        { path: 'api/orders/*path', method: RequestMethod.ALL },
        { path: 'api/admin/orders', method: RequestMethod.ALL },
        { path: 'api/admin/orders/*path', method: RequestMethod.ALL },
        { path: 'api/admin/stats', method: RequestMethod.ALL },
      );

    // Everything else goes to catalog-service
    consumer
      .apply(proxy(CATALOG_URL))
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
