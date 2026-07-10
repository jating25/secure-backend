import { Module } from '@nestjs/common';

import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    LogsModule, // <-- Add this
  ],
  controllers: [
    RequestsController,
  ],
  providers: [
    RequestsService,
  ],
  exports: [
    RequestsService,
  ],
})
export class RequestsModule {}