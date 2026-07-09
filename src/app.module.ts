import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  APP_GUARD,
  APP_INTERCEPTOR,
} from '@nestjs/core';

import {
  ThrottlerModule,
  ThrottlerGuard,
} from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LogsModule } from './logs/logs.module';
import { AdminModule } from './admin/admin.module';

import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    PrismaModule,
    LogsModule,
    AuthModule,
    UsersModule,
    AdminModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,

    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}