import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  getMetrics() {
    const memory = process.memoryUsage();

    return {
      timestamp: new Date(),

      uptime: process.uptime(),

      nodeVersion: process.version,

      platform: process.platform,

      pid: process.pid,

      cpuUsage: process.cpuUsage(),

      memory: {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
        external: memory.external,
      },

      environment:
        process.env.NODE_ENV || 'development',
    };
  }
}
