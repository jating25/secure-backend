import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId?: number;
    action: string;
    endpoint: string;
    method: string;
    statusCode: number;
    ip?: string;
    userAgent?: string;
  }) {
    return this.prisma.log.create({
      data,
    });
  }
}