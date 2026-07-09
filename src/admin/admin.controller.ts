import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Throttle } from '@nestjs/throttler';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  
  @Post('login')
  @Throttle({
    default: {
      limit: 5,
      ttl: 900000,
    },
  })
  @ApiOperation({
    summary: 'Admin Login',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin logged in successfully',
  })
  async login(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.login(dto, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Admin Logout',
  })
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.logout(
      req.user.sub,
      res,
    );
  }

 
  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Admin Profile',
  })
  profile(@Req() req: any) {
    return this.adminService.profile(
      req.user.sub,
    );
  }

  
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Admin Dashboard',
  })
  dashboard(@Req() req: any) {
    return this.adminService.dashboard(
      req.user.sub,
    );
  }

  

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get All Users',
  })
  getUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(
      Number(page),
      Number(limit),
      search,
    );
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get User By ID',
  })
  getUser(
    @Param('id') id: string,
  ) {
    return this.adminService.getUser(
      Number(id),
    );
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update User',
  })
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(
      Number(id),
      dto,
    );
  }

  @Patch('users/:id/unlock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Unlock User Account',
  })
  unlockUser(
    @Param('id') id: string,
  ) {
    return this.adminService.unlockUser(
      Number(id),
    );
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deactivate User',
  })
  deleteUser(
    @Param('id') id: string,
  ) {
    return this.adminService.deleteUser(
      Number(id),
    );
  }
}