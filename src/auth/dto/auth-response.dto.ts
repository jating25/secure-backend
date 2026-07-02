import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  accessToken: string;

  @ApiProperty({
    description: 'User details',
  })
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}