import { Controller, Get, Header, MiddlewareConsumer, Module, NestModule, OnModuleInit, RequestMethod } from '@nestjs/common';
import { collectDefaultMetrics, register } from 'prom-client';
import { LoggerModule } from 'nestjs-pino';
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

@Controller()
class HealthController {
  @Get('health')
  check() {
    return { status: 'ok', service: 'gateway', version: '0.8.0', timestamp: new Date().toISOString() };
  }
}

@Controller('metrics')
class MetricsController {
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async metrics(): Promise<string> {
    return register.metrics();
  }
}

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
  ],
  controllers: [HealthController, MetricsController],
})
export class AppModule implements NestModule, OnModuleInit {
  onModuleInit() {
    collectDefaultMetrics({ prefix: 'shopforge_gateway_' });
  }
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

    // Everything else goes to catalog-service; exclude gateway-local routes
    consumer
      .apply(proxy(CATALOG_URL))
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'metrics', method: RequestMethod.GET },
      )
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
