// [TV1] Task 1
// TODO: Bootstrap NestJS, ValidationPipe, CORS, port 3001
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { AppModule } from './app.module';

config({ path: resolve(process.cwd(), '../.env') });
config({ path: resolve(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors();

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);

  console.log(`BrewLite backend is running at http://localhost:${port}`);
}

bootstrap();
