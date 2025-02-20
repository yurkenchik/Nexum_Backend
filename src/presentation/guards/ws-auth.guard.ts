import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

const jwtService = new JwtService();
const configService = new ConfigService();

@Injectable()
export class WsAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (context.getType() === "ws") {
            return true;
        }

        const client = context.switchToWs().getClient();
        const user = WsAuthGuard.validateToken(client);
        client.user = user;

        return true
    }

    static validateToken(client: Socket) {
        const { authorization } = client.handshake?.headers;
        const token = authorization?.split(" ")[1] as string;
        const tokenPayload = jwtService.verify(token, {
            secret: configService.get<string>("JWT_SECRET"),
        });
        return tokenPayload;
    }
}