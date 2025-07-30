import { Injectable } from "@nestjs/common";
import { createClient } from "redis";
import { ConfigService } from "@nestjs/config";
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private readonly redisClient: Redis;
    private readonly publisher: Redis;
    private readonly subscriber: Redis;

    constructor(
        private readonly configService: ConfigService,
    ) {
        const redisUrl = this.configService.get<string>("REDIS_BASE_URL") as string;

        this.redisClient = new Redis(redisUrl);
        this.publisher = new Redis(redisUrl);
        this.subscriber = new Redis(redisUrl);
        this.redisClient.flushdb();
    }

    async onModuleInit(): Promise<void> {
        console.log('✅ RedisService initialized');
    }

    async onModuleDestroy(): Promise<void> {
        await this.redisClient.quit();
        await this.publisher.quit();
        await this.subscriber.quit();
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redisClient.set(key, value, 'EX', ttl);
        } else {
            await this.redisClient.set(key, value);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }

    async getArray<T>(key: string): Promise<T | []> {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : [];
    }

    async delete(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    async sadd<T>(key: string, value: T): Promise<number> {
        return this.redisClient.sadd(key, JSON.stringify(value));
    }

    async smembers<T>(key: string): Promise<Array<T>> {
        const data = await this.redisClient.smembers(key);
        return data? data.map(record => JSON.parse(record)) : [];
    }

    async srem(key: string, value: string): Promise<number> {
        return this.redisClient.srem(key, value);
    }

    async sismember(key: string, value: string): Promise<boolean> {
        const result = await this.redisClient.sismember(key, value);
        return result === 1;
    }

    async publish<T>(channel: string, message: T): Promise<void> {
        await this.publisher.publish(channel, JSON.stringify(message));
    }

    async subscribe<T>(channel: string, callback: (message: T) => void): Promise<void> {
        this.subscriber.subscribe(channel);
        this.subscriber.on("message", (chan: string, msg: string): void => {
            if (chan === channel) {
                callback(JSON.parse(msg));
            }
        })
    }
}