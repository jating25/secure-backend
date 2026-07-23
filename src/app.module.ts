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

      ttl: 60000,

      max: 1000,

    }),



    ThrottlerModule.forRoot([
  {
    ttl:60000,
    limit:
      process.env.NODE_ENV === 'test'
        ? 100000
        : 1000,
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
