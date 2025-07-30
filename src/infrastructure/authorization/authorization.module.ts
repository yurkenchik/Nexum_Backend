import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthorizationService } from "src/infrastructure/authorization/services/authorization.service";
import { TokenService } from "src/infrastructure/authorization/services/token.service";
import { AuthorizationController } from "src/presentation/http/authorization.controller";
import { UserModule } from "src/infrastructure/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { AwsModule } from "src/infrastructure/aws/aws.module";
import { SendConfirmationCodeListener } from 'src/infrastructure/listeners/send-confirmation-code.listener';
import { RedisModule } from 'src/infrastructure/redis/redis.module';

@Module({
    providers: [AuthorizationService, TokenService, SendConfirmationCodeListener],
    controllers: [AuthorizationController],
    imports: [JwtModule, ConfigModule, UserModule, AwsModule, RedisModule],
    exports: [AuthorizationService],
})
export class AuthorizationModule {}