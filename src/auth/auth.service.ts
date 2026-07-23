import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuditService } from '../logs/audit.service';


interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  tokenVersion: number;
}


export interface TokenUser {
  id: number;
  email: string;
  role: string;
  tokenVersion: number;
}


@Injectable()
export class AuthService {

  private readonly logger =
    new Logger(AuthService.name);


  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}



  async register(
    dto: RegisterDto,
  ) {

    const {
      name,
      email,
      password,
    } = dto;


    const exists =
      await this.usersService.findByEmail(
        email,
      );


    if (exists) {
      throw new BadRequestException(
        'User already exists',
      );
    }


    const hashed =
      await bcrypt.hash(
        password,
        12,
      );


    const user =
      await this.usersService.create({
        name,
        email,
        password: hashed,
      });


    await this.auditService.log({
      userId: user.id,
      action: 'REGISTER',
      endpoint: '/auth/register',
      method: 'POST',
      statusCode: 201,
    });


    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };

  }




  async login(
    dto: LoginDto,
  ) {

    try {

      const {
        email,
        password,
      } = dto;


      const user =
        await this.usersService.findByEmail(
          email,
        );


      if (!user) {
        throw new UnauthorizedException(
          'Invalid credentials',
        );
      }


      if (!user.isActive) {
        throw new UnauthorizedException(
          'Account disabled',
        );
      }


      if (
        user.lockedUntil &&
        user.lockedUntil > new Date()
      ) {

        throw new HttpException(
          'Account temporarily locked',
          HttpStatus.TOO_MANY_REQUESTS,
        );

      }



      const match =
        await bcrypt.compare(
          password,
          user.password,
        );


      if (!match) {

        const updated =
          await this.usersService
          .incrementFailedAttempts(
            user.id,
          );


        if (
          updated.failedLoginAttempts >= 5
        ) {

          await this.usersService.lockAccount(
            user.id,
          );


          throw new HttpException(
            'Account locked',
            HttpStatus.TOO_MANY_REQUESTS,
          );

        }


        throw new UnauthorizedException(
          'Invalid credentials',
        );

      }



      await this.usersService
      .resetFailedAttempts(
        user.id,
      );



      const tokens =
        this.generateTokens({
          id: user.id,
          email: user.email,
          role: String(user.role),
          tokenVersion:
            user.tokenVersion ?? 0,
        });



      const refreshHash =
        await bcrypt.hash(
          tokens.refreshToken,
          8,
        );



      await this.usersService
      .updateRefreshToken(
        user.id,
        refreshHash,
      );



      void this.auditService.log({
        userId: user.id,
        action: 'LOGIN',
        endpoint: '/auth/login',
        method: 'POST',
        statusCode: 200,
      });



      return {

        success: true,

        message:
          'Login successful',

        accessToken:
          tokens.accessToken,

        refreshToken:
          tokens.refreshToken,


        user: {

          id: user.id,

          name: user.name,

          email: user.email,

          role: user.role,

        },

      };


    } catch(error) {


      this.logger.error(
        'Login failed',
        error instanceof Error
          ? error.stack
          : String(error),
      );


      throw error;

    }

  }




  async refreshToken(
    refreshToken: string,
  ) {


    if (!refreshToken) {

      throw new UnauthorizedException(
        'Refresh token missing',
      );

    }



    let payload: JwtPayload;


    try {

      payload =
        this.jwtService.verify<JwtPayload>(
          refreshToken,
          {
            secret:
              process.env.JWT_REFRESH_SECRET ||
              process.env.JWT_SECRET,
          },
        );


    } catch {

      throw new UnauthorizedException(
        'Invalid refresh token',
      );

    }




    const user =
      await this.usersService.findById(
        payload.sub,
      );


    if (!user) {

      throw new UnauthorizedException(
        'User not found',
      );

    }




    if (!user.refreshToken) {

      throw new UnauthorizedException(
        'Refresh token revoked',
      );

    }




    const valid =
      await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );


    if (!valid) {

      throw new UnauthorizedException(
        'Invalid refresh token',
      );

    }



    const tokens =
      this.generateTokens({

        id: user.id,

        email: user.email,

        role: String(user.role),

        tokenVersion:
          user.tokenVersion ?? 0,

      });



    await this.usersService
    .updateRefreshToken(
      user.id,
      await bcrypt.hash(
        tokens.refreshToken,
        10,
      ),
    );



    return {

      success: true,

      accessToken:
        tokens.accessToken,

      refreshToken:
        tokens.refreshToken,

    };

  }





  async logout(
    userId: number,
  ) {


    await this.usersService.logout(
      userId,
    );


    await this.auditService.log({

      userId,

      action: 'LOGOUT',

      endpoint: '/auth/logout',

      method: 'POST',

      statusCode: 200,

    });



    return {

      success: true,

      message:
        'Logged out successfully',

    };

  }




  // IMPORTANT: public because AdminService uses it
  public generateTokens(
    user: TokenUser,
  ) {


    const payload: JwtPayload = {

      sub: user.id,

      email: user.email,

      role: user.role,

      tokenVersion:
        user.tokenVersion ?? 0,

    };



    const jwtSecret =
      process.env.JWT_SECRET;


    if (!jwtSecret) {

      throw new Error(
        'JWT_SECRET missing',
      );

    }



    return {


      accessToken:
        this.jwtService.sign(
          payload,
          {
            secret: jwtSecret,
            expiresIn: '15m',
          },
        ),



      refreshToken:
        this.jwtService.sign(
          payload,
          {
            secret:
              process.env.JWT_REFRESH_SECRET ||
              jwtSecret,

            expiresIn: '7d',

          },
        ),

    };

  }

}
