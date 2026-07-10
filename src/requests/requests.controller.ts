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
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

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
  @ApiOperation({
    summary: 'Get My Requests',
  })
  findAll(@Req() req: any) {
    return this.requestsService.findAll(
      req.user.id,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Request By ID',
  })
  findOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.requestsService.findOne(
      Number(id),
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Request',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRequestDto,
    @Req() req: any,
  ) {
    return this.requestsService.update(
      Number(id),
      dto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Request',
  })
  remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.requestsService.remove(
      Number(id),
      req.user.id,
      req.user.role,
    );
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get All Requests',
  })
  adminFindAll() {
    return this.requestsService.findAllRequests();
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update Request Status',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRequestStatusDto,
  ) {
    return this.requestsService.updateStatus(
      Number(id),
      dto.status,
    );
  }
}