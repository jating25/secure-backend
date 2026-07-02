import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'Login successful',
  })
  message!: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Authenticated user details',
    example: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    },
  })
  user!: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}