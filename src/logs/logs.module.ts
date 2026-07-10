import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { AuditService } from './audit.service';

@Module({
  imports: [PrismaModule],

  controllers: [LogsController],

  providers: [
    LogsService,
    AuditService,
  ],

  exports: [
    LogsService,
    AuditService,
  ],
})
export class LogsModule {}