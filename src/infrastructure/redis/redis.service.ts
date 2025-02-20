import { Injectable } from "@nestjs/common";
import { createClient } from "redis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RedisService {
    private readonly redisClient = createClient({ url: this.configService.get<string>("REDIS_BASE_URL") });

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.redisClient.connect();
    }

    async set(key: string, value: any): Promise<void> {
        await this.redisClient.set(key, value);
    }

    async get(key: string): Promise<string> {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }

    async delete(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    async addToQueue(key: string, value: any): Promise<void> {
        await this.redisClient.rPush(key, value);
    }

    async removeFromQueue(key: string, value: any): Promise<void> {
        await this.redisClient.lRem(key, 0, value);
    }

    async getQueue(key: string) {
        const data = await this.redisClient.lRange(key, 0, -1);
        return data.map(item => JSON.parse(item));
    }
}