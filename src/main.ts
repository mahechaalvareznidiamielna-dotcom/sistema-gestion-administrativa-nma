import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
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
  console.log(` Sistema de Gestión Administrativa NMA (NestJS Full-Stack)`);
  console.log(` Aplicación web y panel: http://localhost:${port}`);
  console.log(` API REST:                http://localhost:${port}/api`);
  console.log(` Modo simulado: Auth hardcodeado | BD en memoria RAM`);
  console.log(`=======================================================`);
}

bootstrap();
