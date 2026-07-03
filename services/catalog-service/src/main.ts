import './tracer';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({ origin: process.env.CORS_ORIGIN || false });
  app.enableVersioning({ type: VersioningType.HEADER, header: 'Api-Version', defaultVersion: '1' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port);
}
void bootstrap();
