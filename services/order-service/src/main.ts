import './tracer';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod, VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'metrics', method: RequestMethod.GET },
    ],
  });
  app.enableVersioning({ type: VersioningType.HEADER, header: 'Api-Version', defaultVersion: '1' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' });
  const port = parseInt(process.env.PORT || '3002', 10);
  await app.listen(port);
}

void bootstrap();
