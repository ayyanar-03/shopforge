import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST ?? '127.0.0.1',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USER ?? 'shopforge_user',
        password: process.env.DB_PASSWORD ?? 'shopforge_pass',
        database: process.env.DB_NAME ?? 'shopforge',
      }),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [Order, OrderItem],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
});
