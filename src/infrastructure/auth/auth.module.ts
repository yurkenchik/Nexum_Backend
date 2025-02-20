import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthService } from "src/infrastructure/auth/auth.service";
import { TokenService } from "src/infrastructure/auth/token.service";
import { AuthController } from "src/presentation/http/auth.controller";
import { UserModule } from "src/infrastructure/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { AwsModule } from "src/infrastructure/aws/aws.module";

@Module({
    providers: [AuthService, TokenService],
    controllers: [AuthController],
    imports: [JwtModule, ConfigModule, UserModule, AwsModule],
    exports: [AuthService],
})
export class AuthModule {}