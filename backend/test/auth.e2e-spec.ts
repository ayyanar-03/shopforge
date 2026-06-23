import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Auth & RBAC (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

  describe('POST /auth/signup', () => {
    it('should register a new buyer by default', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'Buyer', email: uniqueEmail(), password: 'password123' })
        .expect(201);

      expect(res.body.user.role).toBe('buyer');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should register a seller when role is specified', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'Seller', email: uniqueEmail(), password: 'password123', role: 'seller' })
        .expect(201);

      expect(res.body.user.role).toBe('seller');
    });

    it('should reject duplicate email', async () => {
      const email = uniqueEmail();
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'User1', email, password: 'password123' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'User2', email, password: 'password123' })
        .expect(409);
    });

    it('should reject invalid payload', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'NoEmail' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const email = uniqueEmail();

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'LoginUser', email, password: 'password123' });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'password123' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);
    });
  });

  describe('POST /auth/refresh (token rotation)', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'RefreshUser', email: uniqueEmail(), password: 'password123' });
      refreshToken = res.body.refreshToken;
    });

    it('should issue new token pair and revoke the old refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.refreshToken).not.toBe(refreshToken);

      // Old token should now be revoked
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('RBAC on product endpoints', () => {
    let buyerToken: string;
    let sellerToken: string;
    let adminToken: string;

    beforeAll(async () => {
      const buyerRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'Buyer', email: uniqueEmail(), password: 'password123', role: 'buyer' });
      buyerToken = buyerRes.body.accessToken;

      const sellerRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'Seller', email: uniqueEmail(), password: 'password123', role: 'seller' });
      sellerToken = sellerRes.body.accessToken;

      const adminRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'Admin', email: uniqueEmail(), password: 'password123', role: 'admin' });
      adminToken = adminRes.body.accessToken;
    });

    it('should allow anyone to GET /products', async () => {
      await request(app.getHttpServer())
        .get('/products')
        .expect(200);
    });

    it('should deny buyer from creating a product', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ name: 'Widget', description: 'A widget', price: 10, stock: 100 })
        .expect(403);
    });

    it('should allow seller to create a product', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ name: 'Widget', description: 'A widget', price: 10, stock: 100 })
        .expect(201);
    });

    it('should allow admin to create a product', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Gadget', description: 'A gadget', price: 20, stock: 50 })
        .expect(201);
    });

    it('should deny unauthenticated user from creating a product', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Widget', description: 'A widget', price: 10, stock: 100 })
        .expect(401);
    });

    it('should deny seller from deleting a product (admin only)', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ name: 'ToDelete', description: 'Delete me', price: 5, stock: 10 });

      await request(app.getHttpServer())
        .delete(`/products/${createRes.body.id}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);
    });

    it('should allow admin to delete a product', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'AdminDelete', description: 'Admin can delete', price: 5, stock: 10 });

      await request(app.getHttpServer())
        .delete(`/products/${createRes.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('DTO validation', () => {
    it('should reject signup with short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'User', email: uniqueEmail(), password: '12345' })
        .expect(400);
    });

    it('should reject signup with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'User', email: 'not-an-email', password: 'password123' })
        .expect(400);
    });

    it('should reject signup with invalid role', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'User', email: uniqueEmail(), password: 'password123', role: 'superadmin' })
        .expect(400);
    });

    it('should reject product with negative price', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'Seller', email: uniqueEmail(), password: 'password123', role: 'seller' });

      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${res.body.accessToken}`)
        .send({ name: 'Bad', description: 'Negative price', price: -5, stock: 10 })
        .expect(400);
    });

    it('should reject cart item with zero quantity', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ name: 'CartUser', email: uniqueEmail(), password: 'password123' });

      await request(app.getHttpServer())
        .post('/cart')
        .set('Authorization', `Bearer ${res.body.accessToken}`)
        .send({ productId: 1, quantity: 0 })
        .expect(400);
    });
  });
});
