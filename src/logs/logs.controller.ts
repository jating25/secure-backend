import {
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

import { LogsService } from './logs.service';

@ApiTags('Admin Logs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/logs')
export class LogsController {
  constructor(
    private readonly logsService: LogsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all logs',
  })
  getLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('userId') userId?: string,
    @Query('method') method?: string,
    @Query('statusCode') statusCode?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.logsService.getLogs(
      Number(page),
      Number(limit),
      search,
      userId ? Number(userId) : undefined,
      method,
      statusCode
        ? Number(statusCode)
        : undefined,
      from,
      to,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get log by ID',
  })
  getLog(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.logsService.getLogById(id);
  }

  @Get('user/:id')
  @ApiOperation({
    summary: 'Get logs by user',
  })
  getUserLogs(
    @Param('id', ParseIntPipe)
    id: number,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.logsService.getLogsByUser(
      id,
      Number(page),
      Number(limit),
    );
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete all logs',
  })
  deleteLogs() {
    return this.logsService.deleteAllLogs();
  }
}