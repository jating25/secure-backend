import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { RequestStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../logs/audit.service';

import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    userId: number,
    dto: CreateRequestDto,
  ) {
    const request = await this.prisma.request.create({
      data: {
        title: dto.title,
        description: dto.description,
        createdBy: userId,
      },
    });

    await this.auditService.log({
      userId,
      action: 'CREATE_REQUEST',
      endpoint: '/requests',
      method: 'POST',
      statusCode: 201,
    });

    return request;
  }

  async findAll(userId: number) {
    return this.prisma.request.findMany({
      where: {
        createdBy: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(
    id: number,
    userId: number,
    role: string,
  ) {
    const request =
      await this.prisma.request.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

    if (!request) {
      throw new NotFoundException(
        'Request not found',
      );
    }

    if (
      role !== 'ADMIN' &&
      request.createdBy !== userId
    ) {
      throw new ForbiddenException(
        'Access denied',
      );
    }

    return request;
  }

  async update(
    id: number,
    dto: UpdateRequestDto,
    userId: number,
    role: string,
  ) {
    await this.findOne(id, userId, role);

    const request =
      await this.prisma.request.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
        },
      });

    await this.auditService.log({
      userId,
      action: 'UPDATE_REQUEST',
      endpoint: `/requests/${id}`,
      method: 'PATCH',
      statusCode: 200,
    });

    return request;
  }

  async remove(
    id: number,
    userId: number,
    role: string,
  ) {
    await this.findOne(id, userId, role);

    await this.prisma.request.delete({
      where: { id },
    });

    await this.auditService.log({
      userId,
      action: 'DELETE_REQUEST',
      endpoint: `/requests/${id}`,
      method: 'DELETE',
      statusCode: 200,
    });

    return {
      success: true,
      message: 'Request deleted successfully',
    };
  }

  async findAllRequests() {
    return this.prisma.request.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(
    id: number,
    status: RequestStatus,
  ) {
    const request =
      await this.prisma.request.findUnique({
        where: { id },
      });

    if (!request) {
      throw new NotFoundException(
        'Request not found',
      );
    }

    const updatedRequest =
      await this.prisma.request.update({
        where: { id },
        data: {
          status,
        },
      });

    await this.auditService.log({
      userId: request.createdBy,
      action: 'UPDATE_REQUEST_STATUS',
      endpoint: `/requests/admin/${id}/status`,
      method: 'PATCH',
      statusCode: 200,
    });

    return updatedRequest;
  }
}