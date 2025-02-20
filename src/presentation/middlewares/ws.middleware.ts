import { Socket } from "socket.io";
import { WsAuthGuard } from "src/system/guards/ws-auth.guard";

export type SocketIOMiddleware = { (client: Socket, next: (error?: Error) => void): void | Promise<void>; }

export const SocketAuthMiddleware: () => SocketIOMiddleware = (): SocketIOMiddleware => {
    return (client: Socket, next: (error?: Error) => void): void => {
        try {
            WsAuthGuard.validateToken(client);
            next();
        } catch (error) {
            next(error);
        }
    }
}