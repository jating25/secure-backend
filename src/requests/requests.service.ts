import {
  Injectable,
  NotFoundException,
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
    const request =
      await this.prisma.request.create({
        data: {
          title: dto.title,
          description: dto.description,
          createdBy: userId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
        },
      });

    void this.auditService.log({
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

      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }


  async findOne(
    id: number,
    userId: number,
    role: string,
  ) {

    const request =
      await this.prisma.request.findFirst({
        where: {
          id,

          ...(role !== 'ADMIN'
            ? {
                createdBy: userId,
              }
            : {}),
        },

        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      });


    if (!request) {
      throw new NotFoundException(
        'Request not found',
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

   const existing =
  await this.findOne(
    id,
    userId,
    role,
  );


    if (!existing) {
      throw new NotFoundException(
        'Request not found',
      );
    }



    const request =
      await this.prisma.request.update({
        where: {
          id,
        },

        data: {
          title: dto.title,
          description: dto.description,
        },

        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });



    void this.auditService.log({
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

    await this.findOne(
      id,
      userId,
      role,
    );


    await this.prisma.request.delete({
      where: {
        id,
      },
    });



    void this.auditService.log({
      userId,
      action: 'DELETE_REQUEST',
      endpoint: `/requests/${id}`,
      method: 'DELETE',
      statusCode: 200,
    });



    return {
      success: true,
      message:
        'Request deleted successfully',
    };

  }




  async findAllRequests() {

    return this.prisma.request.findMany({

      orderBy: {
        createdAt: 'desc',
      },

      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },

    });

  }





  async updateStatus(
    id: number,
    status: RequestStatus,
  ) {

    const request =
      await this.prisma.request.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          createdBy: true,
        },
      });


    if (!request) {
      throw new NotFoundException(
        'Request not found',
      );
    }



    const updatedRequest =
      await this.prisma.request.update({

        where: {
          id,
        },

        data: {
          status,
        },

        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },

      });



    void this.auditService.log({

      userId: request.createdBy,

      action:
        'UPDATE_REQUEST_STATUS',

      endpoint:
        `/requests/admin/${id}/status`,

      method:
        'PATCH',

      statusCode: 200,

    });



    return updatedRequest;

  }

}
