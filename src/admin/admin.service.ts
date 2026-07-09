import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

import { AdminLoginDto } from './dto/admin-login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  
  async login(
    dto: AdminLoginDto,
    res: Response,
  ) {
    const { email, password } = dto;

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    if (user.role !== 'ADMIN') {
      throw new UnauthorizedException(
        'Administrator access only.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Administrator account is disabled.',
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const tokens =
      this.authService.generateTokens(user);

    const hashedRefresh =
      await bcrypt.hash(tokens.refreshToken, 10);

    await this.usersService.updateRefreshToken(
      user.id,
      hashedRefresh,
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/admin/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      message: 'Admin login successful',
      accessToken: tokens.accessToken,
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

 

  async logout(
    userId: number,
    res: Response,
  ) {
    await this.usersService.logout(userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/admin/refresh',
    });

    return {
      success: true,
      message: 'Admin logged out successfully',
    };
  }

  

  async profile(userId: number) {
    const admin =
      await this.usersService.findByIdOrThrow(
        userId,
      );

    return {
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
    };
  }

 

  async dashboard(userId: number) {
    const admin =
      await this.usersService.findByIdOrThrow(
        userId,
      );

    const [
      totalUsers,
      totalAdmins,
      activeUsers,
      inactiveUsers,
      lockedUsers,
    ] = await Promise.all([
      this.usersService.countUsers(),
      this.usersService.countAdmins(),
      this.usersService.countActiveUsers(),
      this.usersService.countInactiveUsers(),
      this.usersService.countLockedUsers(),
    ]);

    return {
      success: true,
      message: `Welcome ${admin.name}`,
      statistics: {
        totalUsers,
        totalAdmins,
        activeUsers,
        inactiveUsers,
        lockedUsers,
      },
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  

  async getUsers(
    page = 1,
    limit = 10,
    search?: string,
  ) {
    const users =
      await this.usersService.getAllUsers(
        page,
        limit,
        search,
      );

    const total =
      await this.usersService.countUsers();

    return {
      success: true,
      page,
      limit,
      total,
      users,
    };
  }

  async getUser(id: number) {
    const user =
      await this.usersService.findByIdOrThrow(id);

    return {
      success: true,
      user,
    };
  }

  async updateUser(
    id: number,
    dto: UpdateUserDto,
  ) {
    await this.usersService.findByIdOrThrow(id);

    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        await this.usersService.activateUser(id);
      } else {
        await this.usersService.deactivateUser(id);
      }
    }

    const updated =
      await this.usersService.findByIdOrThrow(id);

    return {
      success: true,
      message: 'User updated successfully',
      user: updated,
    };
  }

  async unlockUser(id: number) {
    await this.usersService.unlockAccount(id);

    return {
      success: true,
      message: 'User account unlocked successfully',
    };
  }

  async deleteUser(id: number) {
    await this.usersService.deactivateUser(id);

    return {
      success: true,
      message: 'User deactivated successfully',
    };
  }
}