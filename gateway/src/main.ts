import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' });
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  new Logger('Gateway').log(`Listening on :${port}`);
}

void bootstrap();
