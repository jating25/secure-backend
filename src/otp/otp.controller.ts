import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';

import {
  Throttle,
} from '@nestjs/throttler';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { OtpService } from './otp.service';

import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@ApiTags('OTP')
@Controller('auth')
export class OtpController {

  constructor(
    private readonly otpService: OtpService,
  ) {}

  @Post('send-otp')
  @Throttle({
    default: {
      limit: 3,
      ttl: 300000, 
    },
  })
  @ApiOperation({
    summary: 'Send OTP to email',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many OTP requests',
  })
  async sendOtp(
    @Body() dto: SendOtpDto,
  ) {
    return this.otpService.generateOtp(
      dto.email,
    );
  }

  @Post('resend-otp')
  @Throttle({
    default: {
      limit: 5,
      ttl: 3600000, // 1 hour
    },
  })
  @ApiOperation({
    summary: 'Resend OTP',
  })
  @ApiResponse({
    status: 200,
    description: 'If the email exists, a new OTP has been sent.',
  })
  @ApiResponse({
    status: 400,
    description: 'Please wait before requesting another OTP.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many resend requests.',
  })
  async resendOtp(
    @Body() dto: ResendOtpDto,
  ) {
    return this.otpService.resendOtp(
      dto.email,
    );
  }

  @Post('verify-otp')
  @Throttle({
    default: {
      limit: 5,
      ttl: 300000, 
    },
  })
  @ApiOperation({
    summary: 'Verify OTP',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
  })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
  ) {
    return this.otpService.verifyOtp(
      dto.email,
      dto.otp,
    );
  }
}
