import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async check() {
    const started = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',

        timestamp: new Date(),

        uptime: process.uptime(),

        memory: process.memoryUsage(),

        database: 'connected',

        responseTime: `${Date.now() - started}ms`,
      };
    } catch {
      return {
        status: 'unhealthy',

        timestamp: new Date(),

        uptime: process.uptime(),

        database: 'disconnected',

        responseTime: `${Date.now() - started}ms`,
      };
    }
  }
}
