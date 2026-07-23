import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import {
  APP_GUARD,
  APP_INTERCEPTOR,
} from '@nestjs/core';

import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';


import { AppController } from './app.controller';
import { AppService } from './app.service';


import { PrismaModule } from './prisma/prisma.module';

import { UsersModule } from './users/users.module';

import { AuthModule } from './auth/auth.module';

import { AdminModule } from './admin/admin.module';

import { LogsModule } from './logs/logs.module';

import { RequestsModule } from './requests/requests.module';

import { HealthModule } from './health/health.module';

import { MetricsModule } from './metrics/metrics.module';

import { OtpModule } from './otp/otp.module';

import { MailModule } from './mail/mail.module';



import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

import { ResponseInterceptor } from './common/interceptors/response.interceptor';

import { CacheInterceptor } from './common/interceptors/cache.interceptor';



import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

import { RequestTimingMiddleware } from './common/middleware/request-timing.middleware';



@Module({

  imports: [

    ConfigModule.forRoot({

      isGlobal: true,

      envFilePath: '.env',

      cache: true,

    }),



    CacheModule.register({

      isGlobal: true,

      ttl:
        Number(process.env.CACHE_TTL) || 60,

      max:
        Number(process.env.CACHE_MAX_ITEMS) || 1000,

    }),




    ThrottlerModule.forRoot([

      {

        ttl:
          Number(process.env.THROTTLE_TTL) || 60000,


        limit:
          Number(process.env.THROTTLE_LIMIT) || 100,

      },

    ]),




    PrismaModule,

    UsersModule,

    AuthModule,

    AdminModule,

    LogsModule,

    RequestsModule,

    HealthModule,

    MetricsModule,

    OtpModule,

    MailModule,

  ],




  controllers: [

    AppController,

  ],




  providers: [

    AppService,



    {

      provide: APP_INTERCEPTOR,

      useClass: CacheInterceptor,

    },



    {

      provide: APP_INTERCEPTOR,

      useClass: LoggingInterceptor,

    },



    {

      provide: APP_INTERCEPTOR,

      useClass: ResponseInterceptor,

    },



    {

      provide: APP_GUARD,

      useClass: ThrottlerGuard,

    },

  ],


})


export class AppModule implements NestModule {


  configure(

    consumer: MiddlewareConsumer,

  ) {


    consumer

      .apply(

        RequestIdMiddleware,

        RequestTimingMiddleware,

      )

      .forRoutes('*');


  }


}
