import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PokerSessionGateway } from "src/poker-session/poker-session.gateway";
import { RedisModule } from "src/redis/redis.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
    providers: [PokerSessionGateway],
    imports: [ConfigModule, RedisModule, JwtModule],
    exports: [PokerSessionGateway],
})
export class PokerSessionModule {}