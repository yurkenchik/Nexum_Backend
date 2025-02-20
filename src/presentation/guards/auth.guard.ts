import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserDocument } from "src/user/user.model";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        try {
            const [bearer, token] = request.headers.authorization.split(" ");

            if (!token || bearer !== "Bearer") {
                throw new UnauthorizedException();
            }

            const user: UserDocument = await this.jwtService.verify(token, {
                secret: this.configService.get<string>("JWT_SECRET")
            });
            request.user = user;
            return true
        } catch (error) {
            throw new UnauthorizedException();
        }
    }
}