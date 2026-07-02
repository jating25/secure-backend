import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string | null,
  ) {
    const id = Number(userId);

    if (Number.isNaN(id) || id <= 0) {
      throw new NotFoundException('Invalid user id');
    }

    await this.findByIdOrThrow(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        refreshToken,
      },
    });
  }

  /**
   * Immediate logout
   * Clears refresh token and revokes all issued access tokens.
   */
  async logout(userId: number) {
    const id = Number(userId);

    if (Number.isNaN(id) || id <= 0) {
      throw new NotFoundException('Invalid user id');
    }

    await this.findByIdOrThrow(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        refreshToken: null,
        tokenVersion: {
          increment: 1,
        },
      },
    });
  }

  async incrementFailedAttempts(userId: number) {
    await this.findByIdOrThrow(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: {
          increment: 1,
        },
      },
    });
  }

  async lockAccount(userId: number, minutes = 15) {
    await this.findByIdOrThrow(userId);

    const lockedUntil = new Date(
      Date.now() + minutes * 60 * 1000,
    );

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil,
      },
    });
  }

  async resetFailedAttempts(userId: number) {
    await this.findByIdOrThrow(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  async unlockAccount(userId: number) {
    await this.findByIdOrThrow(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }
}