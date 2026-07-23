import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

import { randomUUID } from 'crypto';

import {
  Request,
  Response,
  NextFunction,
} from 'express';

interface RequestWithId extends Request {
  requestId: string;
}

@Injectable()
export class RequestIdMiddleware
  implements NestMiddleware
{
  use(
    req: RequestWithId,
    res: Response,
    next: NextFunction,
  ): void {
    const requestId = randomUUID();

    req.requestId = requestId;

    res.setHeader(
      'X-Request-ID',
      requestId,
    );

    next();
  }
}
