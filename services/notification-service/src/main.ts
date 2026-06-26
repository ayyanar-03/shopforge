import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Worker-only service; exposes a health endpoint on its port
  const port = parseInt(process.env.PORT || '3003', 10);
  await app.listen(port);
  new Logger('NotificationService').log(`Worker listening on port ${port}`);
}

void bootstrap();
