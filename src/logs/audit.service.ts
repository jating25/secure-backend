import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
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
  }) {
    return this.prisma.log.create({
      data: {
        userId: data.userId,
        action: data.action,
        endpoint: data.endpoint,
        method: data.method,
        statusCode: data.statusCode,
        ip: data.ip,
        userAgent: data.userAgent,
      },
    });
  }
}