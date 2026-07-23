import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger =
    new Logger(AuditService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async log(data: {
    userId?: number;
    action: string;
    endpoint: string;
    method: string;
    statusCode: number;
    ip?: string;
    userAgent?: string;
  }): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setImmediate(() => {
        this.prisma.log
          .create({
            data: {
              userId: data.userId,
              action: data.action,
              endpoint: data.endpoint,
              method: data.method,
              statusCode: data.statusCode,
              ip: data.ip,
              userAgent: data.userAgent,
            },
          })
          .then(() => {
            resolve({
              success: true,
            });
          })
          .catch((error) => {
            this.logger.error(
              'Audit log creation failed',
              error instanceof Error
                ? error.stack
                : String(error),
            );

            resolve({
              success: false,
            });
          });
      });
    });
  }
}
