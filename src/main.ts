import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const isVercel = Boolean(process.env.VERCEL);
  const dataDir = isVercel ? '/tmp' : join(process.cwd(), 'data');
  try {
    mkdirSync(dataDir, { recursive: true });
  } catch {
    // Si ya existe
  }

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`=======================================================`);
  console.log(` Sistema de Gestión Administrativa NMA (NestJS Full-Stack) `);
  console.log(` Aplicación web y panel: http://localhost:${port}`);
  console.log(` API REST:                http://localhost:${port}/api`);
  console.log(` Persistencia activa en:  ${join(dataDir, 'papeleria.sqlite')}`);
  console.log(`=======================================================`);
}

bootstrap();
