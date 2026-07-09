import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}


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

  
  async getLogs(
    page = 1,
    limit = 20,
    search?: string,
    userId?: number,
    method?: string,
    statusCode?: number,
    from?: string,
    to?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          endpoint: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          action: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (userId) {
      where.userId = userId;
    }

    if (method) {
      where.method = method.toUpperCase();
    }

    if (statusCode) {
      where.statusCode = statusCode;
    }

    if (from || to) {
      where.createdAt = {};

      if (from) {
        where.createdAt.gte = new Date(from);
      }

      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.log.findMany({
        skip,
        take: limit,
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.log.count({
        where,
      }),
    ]);

    return {
      page,
      limit,
      total,
      logs,
    };
  }

  
  async getLogById(id: number) {
    const log = await this.prisma.log.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      throw new NotFoundException(
        'Log not found',
      );
    }

    return log;
  }

  

  async getLogsByUser(
    userId: number,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.log.findMany({
        where: {
          userId,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.log.count({
        where: {
          userId,
        },
      }),
    ]);

    return {
      page,
      limit,
      total,
      logs,
    };
  }

  

  async deleteAllLogs() {
    const result = await this.prisma.log.deleteMany();

    return {
      deleted: result.count,
    };
  }
}