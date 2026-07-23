import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor
  implements NestInterceptor
{
  private readonly cache = new Map<
    string,
    {
      data: any;
      expires: number;
    }
  >();

  private readonly ttl = 5000; // 5 seconds

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request =
      context.switchToHttp().getRequest();

    if (request.method !== 'GET') {
      return next.handle();
    }

    const key =
      request.originalUrl || request.url;

    const cached =
      this.cache.get(key);

    if (
      cached &&
      cached.expires > Date.now()
    ) {
      return of(cached.data);
    }

    return next.handle().pipe(
      tap((response) => {
        this.cache.set(key, {
          data: response,
          expires:
            Date.now() + this.ttl,
        });
      }),
    );
  }
}
