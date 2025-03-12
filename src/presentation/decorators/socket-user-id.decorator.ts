import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SocketUserId = createParamDecorator(
    (data: any, context: ExecutionContext) => {
        const request: any = context.switchToWs();
        return request?.args?.[0].user?.id;
    }
)