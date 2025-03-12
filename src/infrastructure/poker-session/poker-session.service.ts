import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { v4 as uuid } from "uuid";
import { GameStateDto } from 'src/application/dto/poker-session/game-state.dto';
import { UserService } from 'src/infrastructure/user/user.service';
import { UserDocument } from 'src/domain/common/entities/user.entity';
import { PlayerMapper } from 'src/application/mappers/player.mapper';
import { PlayerDto } from 'src/application/dto/poker-session/player.dto';

@Injectable()
export class PokerSessionService {
    private readonly logger: Logger = new Logger(PokerSessionService.name);

    constructor(
        private readonly redisService: RedisService,
        private readonly userService: UserService
    ) {}

    async findAvailableTable(): Promise<string | null> {
        const tables: Array<string> = await this.redisService.smembers("active_tables") || [];

        for (const tableId of tables) {
            const players: Array<PlayerDto> = await this.getPlayersInTable(tableId);
            if (players.length < 2) {
                return tableId;
            }
        }
        return null;
    }

    async createTable(): Promise<string> {
        const tableId: string = uuid();
        await this.redisService.sadd("active_tables", tableId);
        return tableId;
    }

    async addPlayerToTable(tableId: string, user: UserDocument): Promise<void> {
        const player: PlayerDto = PlayerMapper.toDto(user);
        await this.redisService.sadd<PlayerDto>(`table:${tableId}:players`, player);
    }

    async getPlayersInTable(tableId: string): Promise<Array<PlayerDto> | []> {
        return await this.redisService.smembers(`table:${tableId}:players`) || [];
    }

    async setGameState(tableId: string, gameStateDto: GameStateDto): Promise<void> {
        await this.redisService.set(`table:${tableId}:game_state`, JSON.stringify(gameStateDto));
    }

    async removePlayerFromTable(tableId: string, playerId: string): Promise<void> {
        await this.redisService.srem(`table:${tableId}:players`, playerId);

        const players = await this.getPlayersInTable(tableId);
        if (players.length === 0) {
            await this.redisService.srem('active_tables', tableId);
            await this.redisService.delete(`table:${tableId}:game_state`);
            await this.redisService.delete(`table:${tableId}:players`);
        }
    }
}