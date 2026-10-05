import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { ValidationPipe } from '@nestjs/common';

const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
let isAppInitialized = false;

async function bootstrap() {
  if (!isAppInitialized) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.setGlobalPrefix('api');
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    isAppInitialized = true;
  }
  return server;
}

function restoreUrl(req: Request) {
  const forwarded = (req.headers['x-forwarded-uri'] ||
    req.headers['x-invoke-path'] ||
    req.headers['x-matched-path']) as string | undefined;
  if (forwarded && typeof forwarded === 'string' && forwarded.startsWith('/api')) {
    req.url = forwarded;
  }
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  restoreUrl(req);
  server(req, res);
}
