import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LogsService } from '../../logs/logs.service';

@Injectable()
export class LoggingInterceptor
  implements NestInterceptor
{
  constructor(
    private readonly logsService: LogsService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const http =
      context.switchToHttp();

    const request =
      http.getRequest();

    const response =
      http.getResponse();

    const start =
      Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration =
          Date.now() - start;

        // Non-blocking audit logging
        this.logsService
          .create({
            userId: request.user?.sub,

            action:
              `${request.method} ${request.originalUrl}`,

            endpoint:
              request.originalUrl,

            method:
              request.method,

            statusCode:
              response.statusCode,

            ip:
              request.ip,

            userAgent:
              request.headers['user-agent'],
          })
          .catch((error: unknown) => {
            console.error(
              'Failed to save audit log:',
              error instanceof Error
                ? error.message
                : String(error),
            );
          });

        // Disable console logging during load testing
        if (
          process.env.NODE_ENV !== 'production' &&
          process.env.PERFORMANCE_TEST !== 'true'
        ) {
          console.log(
            `[${response.statusCode}] ${request.method} ${request.originalUrl} (${duration}ms)`,
          );
        }
      }),
    );
  }
}
