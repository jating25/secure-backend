import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey:
        process.env.JWT_SECRET || 'dev_secret',
    });
  }

  async validate(payload: any) {
    const user =
      await this.usersService.findById(
        payload.sub,
      );

    if (!user) {
      throw new UnauthorizedException(
        'User no longer exists',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Account is disabled',
      );
    }

    if (
      payload.tokenVersion !==
      user.tokenVersion
    ) {
      throw new UnauthorizedException(
        'Token has been revoked',
      );
    }

    const {
      password,
      refreshToken,
      ...safeUser
    } = user;

    return safeUser;
  }
}
