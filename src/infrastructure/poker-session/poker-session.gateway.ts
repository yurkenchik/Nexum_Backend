import { OnModuleInit } from '@nestjs/common';
import {
    ConnectedSocket, MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from "socket.io";
import { PokerSessionEvents } from "src/presentation/enums/poker-session-events.enum";
import { AuthenticatedSocketDto } from "src/application/dto/poker-session/authenticated-socket.dto";
import { SOCKET_MESSAGES } from 'src/domain/common/constants/socket-messages';
import { PokerSessionService } from 'src/infrastructure/poker-session/poker-session.service';
import { PlayingCardService } from 'src/infrastructure/playing-card/playing-card-service';
import { SocketAuthMiddleware } from 'src/presentation/middlewares/ws.middleware';
import { SocketUserId } from 'src/presentation/decorators/socket-user-id.decorator';
import { LeaveTableDto } from 'src/application/dto/poker-session/leave-table.dto';
import { PlayingCardDto } from 'src/application/dto/poker-session/playing-card.dto';
import { StartGameDto } from 'src/application/dto/poker-session/start-game.dto';
import { PlayerDto } from 'src/application/dto/poker-session/player.dto';

@WebSocketGateway({ cors: { origin: "*" } })
export class PokerSessionGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    @WebSocketServer()
    private readonly server: Server;

    constructor(
        private readonly pokerSessionService: PokerSessionService,
        private readonly playingCardService: PlayingCardService
    ) {}

    async onModuleInit(): Promise<void> {
        this.server.use(SocketAuthMiddleware());
    }

    async handleConnection(@ConnectedSocket() client: AuthenticatedSocketDto): Promise<void> {
        client.broadcast.emit(PokerSessionEvents.PLAYER_CONNECTED, { message: `${client.user.name} connected` });
    }

    async handleDisconnect(@ConnectedSocket() client: AuthenticatedSocketDto): Promise<void> {
        this.server.emit(PokerSessionEvents.PLAYER_DISCONNECTED, { message: `${client.user.name} disconnected` });
    }

    @SubscribeMessage(SOCKET_MESSAGES.JOIN_LOBBY)
    async joinLobby(
        @ConnectedSocket() client: AuthenticatedSocketDto,
        @SocketUserId() userId: string,
    ): Promise<void> {
        const tableId = await this.pokerSessionService.findAvailableTable() || await this.pokerSessionService.createTable();

        await this.pokerSessionService.addPlayerToTable(tableId, client.user);
        const playersInTable = await this.pokerSessionService.getPlayersInTable(tableId);

        if (playersInTable.length === 2) {
            setTimeout(async () => await this.startGame({ tableId, userId: userId }), 200);
        }

        client.join(tableId);
        this.server.to(client.id).emit(PokerSessionEvents.LOBBY_JOINED, { tableId });
    }

    @SubscribeMessage(SOCKET_MESSAGES.LEAVE_TABLE)
    async leaveTable(
        @ConnectedSocket() client: AuthenticatedSocketDto,
        @SocketUserId() userId: string,
        @MessageBody() leaveTableDto: LeaveTableDto
    ): Promise<void> {
        const { tableId } = leaveTableDto;

        await this.pokerSessionService.removePlayerFromTable(tableId, userId);
        client.leave(tableId);
        this.server.to(client.id).emit(PokerSessionEvents.PLAYER_LEFT_TABLE, { tableId });
    }

    async startGame(startGameDto: StartGameDto): Promise<void> {
        const { tableId, userId } = startGameDto;

        const players: Array<PlayerDto> = await this.pokerSessionService.getPlayersInTable(tableId);
        const deck: Array<PlayingCardDto> = await this.playingCardService.getPlayingCards();
        const playerHands: Record<string, Array<PlayingCardDto>> = await this.playingCardService.dealCards(players);

        await this.pokerSessionService.setGameState(tableId, {
            players,
            playerHands,
            communityCards: deck,
            currentUserTurn: players[0].id
        });

        this.server.to(tableId).emit(PokerSessionEvents.GAME_STARTED, { playerHands: playerHands[userId] });
        this.server.to(tableId).emit(PokerSessionEvents.GAME_STATE_RECEIVED, { players, playerHands, deck });
    }

    @SubscribeMessage(SOCKET_MESSAGES.PLAYER_ACTION)
    async handlePlayerAction(@ConnectedSocket() client: AuthenticatedSocketDto): Promise<void> {}
}