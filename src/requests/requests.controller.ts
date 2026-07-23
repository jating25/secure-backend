import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

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

import { RequestsService } from './requests.service';

import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';

@ApiTags('Requests')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
  ) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Create Request',
  })
  @ApiResponse({
    status: 201,
    description: 'Request created successfully',
  })
  create(
    @Req() req: any,
    @Body() dto: CreateRequestDto,
  ) {
    return this.requestsService.create(
      req.user.id,
      dto,
    );
  }

  @Get()
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get My Requests',
  })
  findAll(@Req() req: any) {
    return this.requestsService.findAll(
      req.user.id,
    );
  }

  
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get All Requests',
  })
  adminFindAll() {
    return this.requestsService.findAllRequests();
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Update Request Status',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRequestStatusDto,
  ) {
    return this.requestsService.updateStatus(
      id,
      dto.status,
    );
  }

  

  @Get(':id')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get Request By ID',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.requestsService.findOne(
      id,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Update Request',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRequestDto,
    @Req() req: any,
  ) {
    return this.requestsService.update(
      id,
      dto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Delete Request',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.requestsService.remove(
      id,
      req.user.id,
      req.user.role,
    );
  }
}
