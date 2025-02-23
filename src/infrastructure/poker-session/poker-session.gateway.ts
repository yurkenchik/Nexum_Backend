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
import { JoinLobbyDto } from 'src/application/dto/poker-session/join-lobby.dto';
import { PokerSessionService } from 'src/infrastructure/poker-session/poker-session.service';
import { StartGameDto } from 'src/application/dto/poker-session/start-game.dto';
import { PlayingCardService } from 'src/infrastructure/playing-card/playing-card-service';
import { PlayingCardDocument } from 'src/domain/common/entities/playing-card.entity';

@WebSocketGateway({ cors: { origin: "*" } })
export class PokerSessionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private readonly server: Server;

    constructor(
        private readonly pokerSessionService: PokerSessionService,
        private readonly playingCardService: PlayingCardService
    ) {}

    async handleConnection(@ConnectedSocket() client: AuthenticatedSocketDto) {
        client.broadcast.emit(PokerSessionEvents.PLAYER_CONNECTED, { message: `Player with ID ${client.id} connected` });
    }

    async handleDisconnect(@ConnectedSocket() client: AuthenticatedSocketDto) {
        this.server.emit(PokerSessionEvents.PLAYER_DISCONNECTED, { message: `Player with ID ${client.id} disconnected` });
    }

    @SubscribeMessage(SOCKET_MESSAGES.JOIN_LOBBY)
    async joinLobby(
        @ConnectedSocket() client: AuthenticatedSocketDto,
        @MessageBody() joinLobbyDto: JoinLobbyDto
    ): Promise<void> {
        const { userId } = joinLobbyDto;

        const tableId =
            await this.pokerSessionService.findAvailableTable()
            || await this.pokerSessionService.createTable();

        await this.pokerSessionService.addPlayerToTable(tableId, userId);
        client.join(tableId);
        this.server.to(client.id).emit(PokerSessionEvents.LOBBY_JOINED);
    }

    @SubscribeMessage(SOCKET_MESSAGES.LEAVE_TABLE)
    async leaveTable(
        @ConnectedSocket() client: AuthenticatedSocketDto,
        @MessageBody() data: { tableId: string, userId: string }
    ): Promise<void> {
        const { tableId, userId } = data;
        await this.pokerSessionService.removePlayerFromTable(tableId, userId);
        client.leave(tableId);
        this.server.to(client.id).emit(PokerSessionEvents.PLAYER_LEFT_TABLE, { tableId });
    }

    @SubscribeMessage(SOCKET_MESSAGES.START_GAME)
    async startGame(
        @ConnectedSocket() client: AuthenticatedSocketDto,
        @MessageBody() startGameDto: StartGameDto
    ): Promise<void> {
        const { tableId } = startGameDto;

        const players = await this.pokerSessionService.getPlayersInTable(tableId);
        const deck = await this.playingCardService.getPlayingCards();
        const playerHands: Record<string, Array<PlayingCardDocument>> = await this.playingCardService.dealCards(players.length);

        await this.pokerSessionService.setGameState(tableId, { deck, playerHands });
        this.server.to(tableId).emit(PokerSessionEvents.GAME_STARTED, { playerHands });
    }

    @SubscribeMessage(SOCKET_MESSAGES.PLAYER_ACTION)
    async handlePlayerAction(@ConnectedSocket() client: AuthenticatedSocketDto): Promise<void> {}
}