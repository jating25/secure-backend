import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { LogsModule } from '../logs/logs.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    LogsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}