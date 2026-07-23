import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['log', 'error', 'warn'],
  });

  const server =
    app.getHttpAdapter().getInstance();

  // Disable Express header
  server.disable('x-powered-by');

  // Trust reverse proxy (NGINX/Cloudflare/AWS ALB)
  server.set('trust proxy', 1);

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: false,

      crossOriginEmbedderPolicy: false,

      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },

      frameguard: {
        action: 'deny',
      },

      noSniff: true,

      referrerPolicy: {
        policy: 'no-referrer',
      },
    }),
  );

  // Compress API responses
  app.use(
    compression({
      level: 6,
      threshold: 1024,
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin:
      process.env.FRONTEND_URL ||
      'http://localhost:3001',

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,

      // Better performance
      forbidUnknownValues: false,

      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );

  // Swagger only in development
  if (
    process.env.NODE_ENV !==
    'production'
  ) {
    const config =
      new DocumentBuilder()
        .setTitle(
          'Secure Backend API',
        )
        .setDescription(
          'Professional NestJS Authentication & Authorization API',
        )
        .setVersion('1.0.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          'JWT-auth',
        )
        .build();

    const document =
      SwaggerModule.createDocument(
        app,
        config,
      );

    SwaggerModule.setup(
      'docs',
      app,
      document,
      {
        swaggerOptions: {
          persistAuthorization: true,
        },

        customSiteTitle:
          'Secure Backend API Docs',
      },
    );
  }

  app.enableShutdownHooks();

  const port =
    Number(process.env.PORT) || 3000;

  await app.listen(
    port,
    '0.0.0.0',
  );

  console.log(
    `🚀 Backend running on http://0.0.0.0:${port}`,
  );

  if (
    process.env.NODE_ENV !==
    'production'
  ) {
    console.log(
      `📘 Swagger Docs: http://localhost:${port}/docs`,
    );
  }
}

bootstrap();
