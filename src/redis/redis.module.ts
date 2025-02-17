import { Module } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";
import { ConfigModule } from "@nestjs/config";

@Module({
    providers: [RedisService],
    imports: [ConfigModule],
    exports: [RedisService],
})
export class RedisModule {}