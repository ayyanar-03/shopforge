import { Controller, Get, Header, Module, OnModuleInit } from '@nestjs/common';
import { collectDefaultMetrics, register } from 'prom-client';
import { LoggerModule } from 'nestjs-pino';

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
export class AppModule implements OnModuleInit {
  onModuleInit() {
    collectDefaultMetrics({ prefix: 'shopforge_gateway_' });
  }
}
