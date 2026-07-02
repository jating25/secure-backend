import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from 'logs/logs.service';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const start = Date.now();

    return next.handle().pipe(
      tap(async () => {
        const response = context.switchToHttp().getResponse();

        const duration = Date.now() - start;

        await this.logsService.create({
          userId: request.user?.userId,
          action: `${request.method} ${request.originalUrl}`,
          endpoint: request.originalUrl,
          method: request.method,
          statusCode: response.statusCode,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        });

        console.log(
          `[${response.statusCode}] ${request.method} ${request.originalUrl} (${duration}ms)`,
        );
      }),
    );
  }
}