import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger, HttpException } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, query } = request;

        const start = Date.now();
        this.logger.log(`📥 [${method}] ${url} - Body: ${JSON.stringify(body)} - Query: ${JSON.stringify(query)}`);

        return next.handle().pipe(
            tap(() => {
                const responseTime = Date.now() - start;
                this.logger.log(`📤 [${method}] ${url} - Completed in ${responseTime}ms`);
            }),
            catchError((error) => {
                const responseTime = Date.now() - start;
                if (error instanceof HttpException) {
                    this.logger.error(`❌ [${method}] ${url} - ⚠️ Error: ${error.message} - Status: ${error.getStatus()} - Completed in ${responseTime}ms`);
                } else {
                    this.logger.error(`❌ [${method}] ${url} - ⚠️ Unexpected Error: ${error.message} - Completed in ${responseTime}ms`);
                }
                return throwError(() => error);
            }),
        );
    }
}