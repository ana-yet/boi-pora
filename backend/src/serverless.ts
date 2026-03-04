import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import type { Request, Response } from 'express';
import { AppModule } from './app.module.js';

const server = express();
let appPromise: Promise<express.Express> | null = null;

function getApp(): Promise<express.Express> {
  if (!appPromise) {
    appPromise = bootstrap().catch((err) => {
      appPromise = null;
      throw err;
    });
  }
  return appPromise;
}

async function bootstrap(): Promise<express.Express> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  await app.init();
  return server;
}

export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  app(req, res);
}
