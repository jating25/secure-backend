import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OtpService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async generateOtp(
    email: string,
    resendCount = 0,
  ) {


    await this.prisma.otp.deleteMany({
      where: {
        email,
        verified: false,
      },
    });

    const otp = crypto
      .randomInt(100000, 999999)
      .toString();

    const otpHash = await bcrypt.hash(
      otp,
      10,
    );

    await this.prisma.otp.create({
      data: {
        email,
        otpHash,
        resendCount,
        expiresAt: new Date(
          Date.now() + 5 * 60 * 1000,
        ),
      },
    });

    await this.mailService.sendOtp(
      email,
      otp,
    );

    return {
      success: true,
      message:
        'the email exists, an OTP has been sent.',
    };
  }

  async resendOtp(
    email: string,
  ) {

    const latestOtp =
      await this.prisma.otp.findFirst({

        where: {
          email,
          verified: false,
        },

        orderBy: {
          createdAt: 'desc',
        },

      });

    if (latestOtp) {

      const seconds =
        (Date.now() -
          latestOtp.createdAt.getTime()) /
        1000;

      if (seconds < 30) {

        throw new BadRequestException(
          'Please wait before requesting another OTP.',
        );

      }

      if (
        latestOtp.resendCount >= 5
      ) {

        throw new BadRequestException(
          'Maximum resend limit reached.',
        );

      }

      return this.generateOtp(
        email,
        latestOtp.resendCount + 1,
      );

    }

    return this.generateOtp(email);
  }

  async verifyOtp(
    email: string,
    otp: string,
  ) {

    const record =
      await this.prisma.otp.findFirst({

        where: {
          email,
          verified: false,
        },

        orderBy: {
          createdAt: 'desc',
        },

      });

    if (!record) {

      throw new BadRequestException(
        'OTP not found',
      );

    }

    if (
      new Date() >
      record.expiresAt
    ) {

      throw new BadRequestException(
        'OTP expired',
      );

    }

    if (
      record.attempts >= 5
    ) {

      throw new BadRequestException(
        'Too many OTP attempts',
      );

    }

    const valid =
      await bcrypt.compare(
        otp,
        record.otpHash,
      );

    if (!valid) {

      await this.prisma.otp.update({

        where: {
          id: record.id,
        },

        data: {
          attempts: {
            increment: 1,
          },
        },

      });

      throw new BadRequestException(
        'Invalid OTP',
      );

    }


    await this.prisma.otp.delete({

      where: {
        id: record.id,
      },

    });

    return {

      success: true,

      message:
        'OTP verified successfully',

    };
  }

}
