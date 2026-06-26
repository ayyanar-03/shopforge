import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'notification-service', version: '0.8.0', timestamp: new Date().toISOString() };
  }
}
