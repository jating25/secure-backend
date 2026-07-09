import { ApiProperty } from '@nestjs/swagger';

export class DashboardResponseDto {
  @ApiProperty()
  totalUsers!: number;

  @ApiProperty()
  totalAdmins!: number;

  @ApiProperty()
  activeUsers!: number;

  @ApiProperty()
  inactiveUsers!: number;

  @ApiProperty()
  lockedUsers!: number;
}