import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestUserId = createParamDecorator(
    (data: unknown, executionContext: ExecutionContext): string => {
        const request = executionContext.switchToHttp().getRequest();
        return request.user?.id;
    }
);