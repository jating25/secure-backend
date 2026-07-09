import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  tokenVersion: number;
}

interface TokenUser {
  id: number;
  email: string;
  role: string;
  tokenVersion: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    const existingUser =
      await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException(
        'User already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user =
      await this.usersService.create({
        name,
        email,
        password: hashedPassword,
      });

    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user =
      await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated.',
      );
    }

    if (
      user.lockedUntil &&
      new Date(user.lockedUntil) > new Date()
    ) {
      throw new HttpException(
        'Account temporarily locked. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!isMatch) {
      const updated =
        await this.usersService.incrementFailedAttempts(
          user.id,
        );

      if (
        updated.failedLoginAttempts >= 5
      ) {
        await this.usersService.lockAccount(
          user.id,
        );

        throw new HttpException(
          'Account locked due to too many failed attempts',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new UnauthorizedException(
        `Invalid credentials. ${
          5 - updated.failedLoginAttempts
        } attempts left.`,
      );
    }

    await this.usersService.resetFailedAttempts(
      user.id,
    );

    const freshUser =
      await this.usersService.findById(
        user.id,
      );

    if (!freshUser) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    const tokens =
      this.generateTokens(freshUser);

    const hashedRefreshToken =
      await bcrypt.hash(
        tokens.refreshToken,
        10,
      );

    await this.usersService.updateRefreshToken(
      freshUser.id,
      hashedRefreshToken,
    );

    return {
      success: true,
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: freshUser.id,
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role,
      },
    };
  }

  async refreshToken(
    refreshToken: string,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'No refresh token provided',
      );
    }

    let payload: JwtPayload;

    try {
      payload =
        this.jwtService.verify<JwtPayload>(
          refreshToken,
        );
    } catch {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const user =
      await this.usersService.findById(
        payload.sub,
      );

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    if (!user.refreshToken) {
      throw new UnauthorizedException(
        'Refresh token not found',
      );
    }

    const isValid =
      await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

    if (!isValid) {
      throw new UnauthorizedException(
        'Refresh token expired or reused',
      );
    }

    if (
      payload.tokenVersion !==
      user.tokenVersion
    ) {
      throw new UnauthorizedException(
        'Refresh token has been revoked',
      );
    }

    const tokens =
      this.generateTokens(user);

    const hashedRefreshToken =
      await bcrypt.hash(
        tokens.refreshToken,
        10,
      );

    await this.usersService.updateRefreshToken(
      user.id,
      hashedRefreshToken,
    );

    return {
      success: true,
      message:
        'Token refreshed successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: number) {
    if (!userId) {
      throw new UnauthorizedException(
        'Invalid user id',
      );
    }

    await this.usersService.logout(userId);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  public generateTokens(
    user: TokenUser,
  ) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    return {
      accessToken:
        this.jwtService.sign(payload, {
          expiresIn: '15m',
        }),

      refreshToken:
        this.jwtService.sign(payload, {
          expiresIn: '7d',
        }),
    };
  }
}