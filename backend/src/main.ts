import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('1. Starting NestJS application...');
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    app.enableCors();
    console.log('2. Middleware and CORS configured.');

    const port = Number(process.env.PORT) || 3001;
    console.log(`3. Attempting to listen on port ${port}...`);
    
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 BrewLite backend is successfully running on port ${port}`);
  } catch (error) {
    console.error('❌ CRITICAL ERROR during application startup:', error);
    process.exit(1);
  }
}
bootstrap();  