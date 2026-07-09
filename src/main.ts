import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
          ],
          imgSrc: [
            "'self'",
            'data:',
            'https:',
          ],
          fontSrc: [
            "'self'",
            'https:',
            'data:',
          ],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },

      crossOriginEmbedderPolicy: false,

      crossOriginOpenerPolicy: {
        policy: 'same-origin',
      },

      crossOriginResourcePolicy: {
        policy: 'same-origin',
      },

      frameguard: {
        action: 'deny',
      },

      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },

      noSniff: true,

      referrerPolicy: {
        policy: 'no-referrer',
      },

      xPoweredBy: false,
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
      forbidUnknownValues: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Secure Backend API')
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

  app.enableShutdownHooks();

  const port =
    Number(process.env.PORT) || 3000;

  await app.listen(port);

  console.log(
    ` Backend running at http://localhost:${port}`,
  );

  console.log(
    ` Swagger Docs: http://localhost:${port}/docs`,
  );
}

bootstrap();