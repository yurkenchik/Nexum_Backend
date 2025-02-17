import {
    ConnectedSocket, MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RedisService } from "src/redis/redis.service";
import { PokerSessionEvents } from "src/system/enums/poker-session-events.enum";
import { GAME_QUEUE } from "src/system/constants/utils";
import { JoinGameQueueDto } from "src/poker-session/dto/join-game-queue.dto";
import { SocketAuthMiddleware } from "src/system/middlewares/ws.middleware";
import { PlayerDto } from "src/poker-session/dto/player.dto";
import { AuthenticatedSocket } from "src/poker-session/dto/authenticated-socket";

@WebSocketGateway({ cors: { origin: "*" } })
export class PokerSessionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private readonly server: Server;

    constructor(
        private readonly redisService: RedisService,
    ) {}

    afterInit(@ConnectedSocket() client: AuthenticatedSocket) {
        client.use(SocketAuthMiddleware() as any);
    }

    async onModuleInit(): Promise<void> {
        await this.redisService.delete(GAME_QUEUE);
    }

    async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
        client.broadcast.emit(PokerSessionEvents.PLAYER_CONNECTED, { message: `Player with ID ${client.id} connected` });
    }

    async handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
        this.server.emit(PokerSessionEvents.PLAYER_DISCONNECTED, { message: `Player with ID ${client.id} disconnected` });
        await this.redisService.removeFromQueue(GAME_QUEUE, client.id);
    }

    @SubscribeMessage("join-game-queue")
    async handleJoinGameQueue(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() joinGameQueueDto: JoinGameQueueDto
    ): Promise<void> {
        const gameQueueId = `queue-${joinGameQueueDto.playerCount}`;
        console.log("CLIENT USER: ", client.user);
        await this.redisService.addToQueue(GAME_QUEUE, new PlayerDto(client.id, client.user.name as string));
        const gameQueue: Array<PlayerDto> = await this.redisService.getQueue(GAME_QUEUE);

        this.server.emit(PokerSessionEvents.GAME_QUEUE_UPDATED, { gameQueueSize: gameQueue.length });
        if (gameQueue.length === joinGameQueueDto.playerCount) {
            await this.startGame(gameQueue, gameQueueId);
        }
    }

    async startGame(players: Array<PlayerDto>, gameQueueId: string) {
        const gameRoom = `game-${Date.now()}`;

        for (const player of players) {
            const client = this.server.sockets.sockets.get(player.socketId);
            if (client) {
                client.join(gameRoom);
                client.emit(PokerSessionEvents.GAME_STARTED, { roomId: gameRoom });
            }
        }

        this.server.to(gameRoom).emit(PokerSessionEvents.GAME_STARTED, { message: "Game started", players });
        await this.redisService.delete(gameQueueId);
    }

    @SubscribeMessage("join-table")
    async joinTable(@ConnectedSocket() client: AuthenticatedSocket, tableId: string): Promise<void> {
        await client.join(tableId);

        client.to(tableId).emit(PokerSessionEvents.PLAYER_JOINED_TABLE, { message: `Player with ID ${client.id} joined` });
        await this.redisService.set(`player:${client.id}`, { id: client.id, tableId });
    }

    @SubscribeMessage("leave-table")
    async leaveTable(@ConnectedSocket() client: Socket, tableId: string): Promise<void> {
        await client.leave(tableId);

        client.to(tableId).emit(PokerSessionEvents.PLAYER_LEFT_TABLE, { message: `Player ${client.id} left the table` });
        await this.redisService.delete(`player:${client.id}`);
    }
}