import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Res,
  UnauthorizedException,
} from '@nestjs/common';

import { Throttle, SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
@SkipThrottle()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    if (!result?.accessToken) {
      throw new UnauthorizedException(
        'Login failed',
      );
    }

    res.cookie(
      'refreshToken',
      result.refreshToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite: 'lax',
        path: '/auth/refresh',
        maxAge:
          7 * 24 * 60 * 60 * 1000,
      },
    );

    const { refreshToken, ...safe } =
      result;

    return safe;
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
  })
  @ApiResponse({
    status: 200,
    description:
      'Token refreshed successfully',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  refresh(@Req() req: any) {
    const token =
      req.cookies?.refreshToken;

    if (!token) {
      throw new UnauthorizedException(
        'No refresh token found',
      );
    }

    return this.authService.refreshToken(
      token,
    );
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
  })
  @ApiResponse({
    status: 200,
    description:
      'Logged out successfully',
  })
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException(
        'Invalid token payload',
      );
    }

    await this.authService.logout(
      req.user.id,
    );

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        'production',
      sameSite: 'lax',
      path: '/auth/refresh',
    });

    return {
      success: true,
      message:
        'Logged out successfully',
    };
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
  })
  @ApiResponse({
    status: 200,
    description:
      'Profile fetched successfully',
  })
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  getProfile(@Req() req: any) {
    if (!req.user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    return {
      success: true,
      user: req.user,
    };
  }
}