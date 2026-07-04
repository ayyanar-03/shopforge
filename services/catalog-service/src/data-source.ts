import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { CartItem } from './cart/entities/cart-item.entity';
import { Coupon } from './coupons/entities/coupon.entity';
import { Review } from './reviews/entities/review.entity';
import { Wishlist } from './wishlist/entities/wishlist.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'shopforge_user',
  password: process.env.DB_PASSWORD ?? 'shopforge_pass',
  database: process.env.DB_NAME ?? 'shopforge',
  entities: [User, Product, CartItem, Coupon, Review, Wishlist, RefreshToken],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
});
