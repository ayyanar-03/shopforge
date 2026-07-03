import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: parseInt(process.env.DB_PORT ?? '3307', 10),
  username: process.env.DB_USER ?? 'shopforge_user',
  password: process.env.DB_PASSWORD ?? 'shopforge_pass',
  database: process.env.DB_NAME ?? 'shopforge',
  entities: [Order, OrderItem],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
});
