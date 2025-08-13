import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { v4 as uuid } from "uuid";
import { GameStateDto } from 'src/application/dto/poker-session/response/game-state.dto';
import { UserService } from 'src/infrastructure/user/user.service';
import { UserDocument } from 'src/domain/common/entities/user.entity';
import { PlayerMapper } from 'src/application/mappers/player.mapper';
import { PlayerDto } from 'src/application/dto/poker-session/response/player.dto';
import { DefaultConfiguration } from 'src/domain/common/constants/default-configuration';

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
            if (players.length < DefaultConfiguration.maxPlayersNumber) {
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

    async addPlayerToTable(tableId: string, user: UserDocument, socketId: string): Promise<void> {
        const player: PlayerDto = PlayerMapper.toDto(user, socketId);
        await this.redisService.sadd<PlayerDto>(`table:${tableId}:players`, player);
    }

    async getPlayersInTable(tableId: string): Promise<Array<PlayerDto>> {
        return await this.redisService.smembers(`table:${tableId}:players`) || [];
    }

    async setGameState(tableId: string, gameStateDto: GameStateDto): Promise<void> {
        await this.redisService.set(`table:${tableId}:game_state`, JSON.stringify(gameStateDto));
    }

    async getGameState(tableId: string): Promise<GameStateDto | null> {
        return this.redisService.get(`table:${tableId}:game_state`);
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

    async updatePlayer(tableId: string, updatedPlayer: PlayerDto): Promise<void> {
        const playersKey = `table:${tableId}:players`;
        const players = await this.getPlayersInTable(playersKey);
        const existing = players.find(p => p.id === updatedPlayer.id);
        if (existing) {
            await this.redisService.srem(playersKey, JSON.stringify(existing));
        }

        await this.redisService.sadd(playersKey, JSON.stringify(updatedPlayer));
    }
}