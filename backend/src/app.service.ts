import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'catalog-service',
      version: '0.8.0',
      timestamp: new Date().toISOString(),
    };
  }
}
