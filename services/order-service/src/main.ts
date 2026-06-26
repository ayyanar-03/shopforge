import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' });
  const port = parseInt(process.env.PORT || '3002', 10);
  await app.listen(port);
  new Logger('OrderService').log(`Listening on port ${port}`);
}

void bootstrap();
