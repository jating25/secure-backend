import {
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';

import {
  Request,
  Response,
  NextFunction,
} from 'express';

@Injectable()
export class RequestTimingMiddleware
  implements NestMiddleware
{
  private readonly logger =
    new Logger(RequestTimingMiddleware.name);

  use(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const started = Date.now();

    res.on('finish', () => {
      const duration =
        Date.now() - started;

      this.logger.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
      );
    });

    next();
  }
}
