import './tracer';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new AllExceptionsFilter());

  if (!process.env.SMTP_HOST) {
    app.get(Logger).warn(
      'SMTP_HOST not set — emails will use Ethereal (fake inbox). Set SMTP_* env vars for real delivery.',
      'bootstrap',
    );
  }

  const port = parseInt(process.env.PORT || '3003', 10);
  await app.listen(port);
}

void bootstrap();
