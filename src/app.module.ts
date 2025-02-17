import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { MongooseModule, MongooseModuleFactoryOptions } from "@nestjs/mongoose";
import { AppService } from "src/app.service";
import { AppController } from "src/app.controller";
import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";
import { RedisModule } from "src/redis/redis.module";
import { PokerSessionModule } from "src/poker-session/poker-session.module";
import { APP_GUARD } from "@nestjs/core";
import { WsAuthGuard } from "src/system/guards/ws-auth.guard";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV}`,
        }),
        JwtModule,
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService): MongooseModuleFactoryOptions => ({
                uri: configService.get<string>("MONGO_DB_URI")
            })
        }),
        UserModule,
        AuthModule,
        RedisModule,
        PokerSessionModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: WsAuthGuard
        }
    ],
})
export class AppModule {}
