import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdOrThrow(id: number) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return user;
  }


  async updateRefreshToken(
    userId: number,
    refreshToken: string | null,
  ) {
    await this.findByIdOrThrow(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken,
      },
    });
  }

  async logout(userId: number) {
    await this.findByIdOrThrow(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
        tokenVersion: {
          increment: 1,
        },
      },
    });
  }

  async incrementFailedAttempts(
    userId: number,
  ) {
    await this.findByIdOrThrow(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        failedLoginAttempts: {
          increment: 1,
        },
      },
    });
  }

  async lockAccount(
    userId: number,
    minutes = 15,
  ) {
    await this.findByIdOrThrow(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lockedUntil: new Date(
          Date.now() + minutes * 60 * 1000,
        ),
      },
    });
  }

  async resetFailedAttempts(
    userId: number,
  ) {
    await this.findByIdOrThrow(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  async unlockAccount(userId: number) {
    return this.resetFailedAttempts(userId);
  }

  

  async countUsers() {
    return this.prisma.user.count();
  }

  async countAdmins() {
    return this.prisma.user.count({
      where: {
        role: Role.ADMIN,
      },
    });
  }

  async countActiveUsers() {
    return this.prisma.user.count({
      where: {
        isActive: true,
      },
    });
  }

  async countInactiveUsers() {
    return this.prisma.user.count({
      where: {
        isActive: false,
      },
    });
  }

  async countLockedUsers() {
    return this.prisma.user.count({
      where: {
        lockedUntil: {
          gt: new Date(),
        },
      },
    });
  }

  

  async getAllUsers(
    page = 1,
    limit = 10,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    return this.prisma.user.findMany({
      skip,
      take: limit,

      where: search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : undefined,

      orderBy: {
        createdAt: 'desc',
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateRole(
    userId: number,
    role: Role,
  ) {
    await this.findByIdOrThrow(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
    });
  }

  async activateUser(userId: number) {
    await this.findByIdOrThrow(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: true,
      },
    });
  }

  async deactivateUser(userId: number) {
    await this.findByIdOrThrow(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: false,
      },
    });
  }

  async deleteUser(userId: number) {
    await this.findByIdOrThrow(userId);

    return this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}