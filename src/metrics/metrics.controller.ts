import { Controller, Get } from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Application Metrics',
  })
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
