import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { v4 as uuid } from "uuid";
import { PUBLISH_MESSAGES } from 'src/domain/common/constants/publish-messsages';
import { GameStateDto } from 'src/application/dto/poker-session/game-state.dto';

@Injectable()
export class PokerSessionService {
    constructor(
        private readonly redisService: RedisService
    ) {}

    async findAvailableTable(): Promise<string | null> {
        const tables: Array<string> = await this.redisService.get<Array<string>>("active_table");

        for (const tableId of tables) {
            const players = await this.getPlayersInTable(tableId);
            if (players.length < 6) {
                return tableId;
            }
        }
        return null;
    }

    async createTable(): Promise<string> {
        const tableId = uuid();
        const tables = await this.redisService.get<Array<string>>("active_tables") || [];

        tables.push(tableId);
        await this.redisService.set("active_tables", tables);
        return tableId;
    }

    async addPlayerToTable(tableId: string, playerId: string): Promise<void> {
        const players = await this.getPlayersInTable(tableId);

        players.push(playerId);
        await this.redisService.set(`table:${tableId}:players`, players);

        if (players.length === 6) {
            await this.redisService.publish(PUBLISH_MESSAGES.START_GAME, { tableId });
        }
    }

    async getPlayersInTable(tableId: string): Promise<Array<string>> {
        return this.redisService.get<Array<string>>(`table:${tableId}:players`);
    }

    async setGameState(tableId: string, gameStateDto: GameStateDto): Promise<void> {
        await this.redisService.set(`table:${tableId}:game_state`, gameStateDto);
    }

    async removePlayerFromTable(tableId: string, playerId: string): Promise<void> {
        const players = await this.getPlayersInTable(tableId);
        const playersWithoutRemovedPlayer = players.find(player => player !== playerId);

        await this.redisService.set("active_tables", playersWithoutRemovedPlayer);

        if (players.length === 0) {
            const tables = await this.redisService.get<Array<string>>("active_tables");
            const tablesWithoutRemovedTable = tables.filter(table => table !== tableId);

            await this.redisService.set("active_tables", tablesWithoutRemovedTable);
            await this.redisService.delete(`table:${tableId}:state`);
            await this.redisService.delete(`table:${tableId}:players`);
        }
    }
}