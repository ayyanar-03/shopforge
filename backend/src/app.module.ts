import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { RedisCacheModule } from './cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3307', 10),
      username: process.env.DB_USER || 'shopforge_user',
      password: process.env.DB_PASSWORD || 'shopforge_pass',
      database: process.env.DB_NAME || 'shopforge',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    RedisCacheModule,
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
