import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { AppModule } from './app.module';

config({ path: resolve(process.cwd(), '../.env') });
config({ path: resolve(process.cwd(), '.env') });

async function bootstrap() {
  console.log('Starting NestJS application...');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors();
  console.log('Middleware and CORS configured.');

  const port = Number(process.env.PORT) || 3001;
  
  console.log(`Attempting to listen on port ${port}...`);
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 BrewLite backend is successfully running on port ${port}`);
}
bootstrap();