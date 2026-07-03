import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { OrdersModule } from './orders/orders.module';
import { AdminOrdersModule } from './admin/admin-orders.module';
import { QueueModule } from './queue/queue.module';
import { HealthController } from './health/health.controller';
import { MetricsModule } from './metrics/metrics.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

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
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3307', 10),
      username: process.env.DB_USER || 'shopforge_user',
      password: process.env.DB_PASSWORD || 'shopforge_pass',
      database: process.env.DB_NAME || 'shopforge',
      entities: [Order, OrderItem],
      synchronize: false,
      migrations: [__dirname + '/migrations/*.js'],
      migrationsRun: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    MetricsModule,
    QueueModule,
    OrdersModule,
    AdminOrdersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
