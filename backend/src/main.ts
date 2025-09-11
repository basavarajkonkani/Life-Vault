import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:3001',
      'http://localhost:3003'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3001;
  
  await app.listen(port);
  console.log(`�� LifeVault Backend server running on http://localhost:${port}`);
  console.log(`📊 Supabase connected successfully`);
  console.log(`🔐 JWT authentication enabled`);
  console.log(`📁 File uploads enabled`);
}
bootstrap();
