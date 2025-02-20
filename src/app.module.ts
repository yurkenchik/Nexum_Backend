import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule, MongooseModuleFactoryOptions } from "@nestjs/mongoose";
import { ConsoleModule } from "nestjs-console";
import { AppService } from "src/app.service";
import { AppController } from "src/app.controller";
import { UserModule } from "src/infrastructure/user/user.module";
import { AuthModule } from "src/infrastructure/auth/auth.module";
import { RedisModule } from "src/infrastructure/redis/redis.module";
import { PokerSessionModule } from "src/infrastructure/poker-session/poker-session.module";
import { DatabaseModule } from 'src/infrastructure/database/database.module';

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
        PokerSessionModule,
        ConsoleModule,
        DatabaseModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
