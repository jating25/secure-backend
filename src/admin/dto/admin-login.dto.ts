import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    example: 'admin@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Admin@123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}