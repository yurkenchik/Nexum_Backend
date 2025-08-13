import { Logger, OnModuleInit } from '@nestjs/common';
import {
    ConnectedSocket, MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer, WsException,
} from '@nestjs/websockets';
import { Server } from "socket.io";
import { PokerSessionEvents } from "src/presentation/enums/poker-session-events.enum";
import { AuthenticatedSocketDto } from "src/application/dto/poker-session/request/authenticated-socket.dto";
import { SocketMessages } from 'src/presentation/enums/socket-message.enum';
import { PokerSessionService } from 'src/infrastructure/poker-session/poker-session.service';
import { PlayingCardService } from 'src/infrastructure/playing-card/playing-card-service';
import { SocketAuthMiddleware } from 'src/presentation/middlewares/ws.middleware';
import { SocketUserId } from 'src/presentation/decorators/socket-user-id.decorator';
import { LeaveTableDto } from 'src/application/dto/poker-session/request/leave-table.dto';
import { PlayingCardDto } from 'src/application/dto/poker-session/response/playing-card.dto';
import { StartGameDto } from 'src/application/dto/poker-session/request/start-game.dto';
import { PlayerDto } from 'src/application/dto/poker-session/response/player.dto';
import { GameStateDto } from 'src/application/dto/poker-session/response/game-state.dto';
import { DefaultConfiguration } from 'src/domain/common/constants/default-configuration';
import { GamePhase } from 'src/presentation/enums/game-phase.enum';
import { PlayerActionDto } from 'src/application/dto/poker-session/response/last-action.dto';
import { BetAction } from 'src/presentation/enums/bet-action.enum';
import {
    ProcessPlayerActionRequestDto
} from 'src/application/dto/poker-session/request/process-player-action-request.dto';

@WebSocketGateway({ cors: { origin: "*" } })
export class PokerSessionGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    private readonly logger: Logger = new Logger(PokerSessionGateway.name);

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

    @SubscribeMessage(SocketMessages.JOIN_LOBBY)
    async joinLobby(@ConnectedSocket() client: AuthenticatedSocketDto): Promise<void> {
        const tableId = await this.pokerSessionService.findAvailableTable() || await this.pokerSessionService.createTable();

        await this.pokerSessionService.addPlayerToTable(tableId, client.user, client.id);
        const playersInTable = await this.pokerSessionService.getPlayersInTable(tableId);

        if (playersInTable.length === DefaultConfiguration.maxPlayersNumber) {
            setTimeout(async () => await this.startGame({ tableId }), 200);
        }

        client.join(tableId);
        this.server.to(client.id).emit(PokerSessionEvents.LOBBY_JOINED, { tableId });
    }

    @SubscribeMessage(SocketMessages.LEAVE_TABLE)
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
        const { tableId } = startGameDto;

        const players: Array<PlayerDto> = await this.pokerSessionService.getPlayersInTable(tableId);
        const { playerHands, deck } = await this.playingCardService.dealCards(players);

        const gameState = new GameStateDto();

        gameState.playerHands = playerHands;
        gameState.currentUserTurn = players[0].id;
        gameState.deck = deck;

        for (const player of players) {
            player.hand = playerHands[player.id];
            gameState.playerBets[player.id] = 0;
            await this.pokerSessionService.updatePlayer(tableId, player);
            this.server.to(player.id).emit(PokerSessionEvents.GAME_STARTED, { hand: playerHands[player.id] })
        }

        await this.pokerSessionService.setGameState(tableId, gameState);

        this.server.to(tableId).emit(PokerSessionEvents.GAME_STATE_RECEIVED, {
            players: this.extractPlayersWithoutCardsHand(players),
            cardsInDeck: gameState.getCardsInDeck(),
            currentUserTurn: players[0].id,
        });
    }

    @SubscribeMessage(SocketMessages.HANDLE_PLAYER_ACTION)
    async handlePlayerAction(
        @ConnectedSocket() client: AuthenticatedSocketDto,
        @SocketUserId() userId: string,
        @MessageBody() playerActionDto: PlayerActionDto,
    ): Promise<void> {
        const { tableId, action, amount } = playerActionDto;

        const gameState = await this.getVerifiedGameState(tableId);
        const players = await this.pokerSessionService.getPlayersInTable(tableId);
        const player = players.find(player => player.id === userId) as PlayerDto;

        const updatedGameState = await this.processPlayerAction({ gameState, player, action, amount, tableId });

        this.server.to(tableId).emit(PokerSessionEvents.GAME_STATE_UPDATED, updatedGameState);
        const bettingRoundCompleted = this.isBettingRoundCompleted(players);

        if (bettingRoundCompleted) {
            if (updatedGameState.communityCards.length < 5) {
                await this.revealNextCommunityCard(tableId);
            } else {
                this.server.to(tableId).emit(PokerSessionEvents.SHOWDOWN, { players, communityCards: gameState.communityCards });
            }
        } else {
            await this.nextTurn(tableId);
        }
    }

    private isBettingRoundCompleted(players: Array<PlayerDto>): boolean {
        const activePlayers: Array<PlayerDto> = players.filter(player => !player.hasFolded && !player.isAllIn);
        if (activePlayers.length <= 1) {
            return true;
        }

        const maxBet: number = Math.max(...activePlayers.map(player => player.currentBet));
        return activePlayers.every(player => player.currentBet === maxBet);
    }

    async setPotAmount(tableId: string, amount: number): Promise<void> {
        const gameState = await this.getVerifiedGameState(tableId);
        gameState.pot += amount;
        gameState.lastUpdateTime = new Date();

        await this.pokerSessionService.setGameState(tableId, gameState);
    }

    async nextTurn(tableId: string): Promise<void> {
        const gameState = await this.getVerifiedGameState(tableId);
        const players = await this.pokerSessionService.getPlayersInTable(tableId);
        const activePlayers = players.filter(player => !player.hasFolded && !player.isAllIn);

        const currentIndex = activePlayers.findIndex(player => player.id === gameState.currentUserTurn);
        const nextIndex = (currentIndex + 1) % activePlayers.length;

        gameState.turnIndex = nextIndex;
        gameState.currentUserTurn = activePlayers[nextIndex].id;
        gameState.lastUpdateTime = new Date();

        await this.pokerSessionService.setGameState(tableId, gameState);
        this.server.to(tableId).emit(PokerSessionEvents.NEXT_TURN, { currentUserTurn: gameState.currentUserTurn });
    }

    async revealNextCommunityCard(tableId: string): Promise<void> {
        const gameState = await this.getVerifiedGameState(tableId);

        const nextCard = gameState.deck.pop() as PlayingCardDto;
        gameState.communityCards.push(nextCard);

        gameState.gamePhase = this.setGamePhase(gameState);
        gameState.lastUpdateTime = new Date();

        await this.pokerSessionService.setGameState(tableId, gameState);
        this.server.to(tableId).emit(PokerSessionEvents.COMMUNITY_CARD_REVEALED, {
            communityCards: gameState.communityCards,
            gamePhase: gameState.gamePhase
        });
    }

    private setGamePhase(gameState: GameStateDto): GamePhase {
        const communityCardsLength = gameState.communityCards.length;

        if (communityCardsLength === 3) {
            return GamePhase.FLOP;
        } else if (communityCardsLength === 4) {
            return GamePhase.TURN
        } else if (communityCardsLength === 5) {
            return GamePhase.RIVER;
        }

        return GamePhase.PRE_FLOP;
    }

    private async processPlayerAction(
        processPlayerActionRequestDto: ProcessPlayerActionRequestDto
    ): Promise<GameStateDto> {
        const { gameState, player, action, amount, tableId } = processPlayerActionRequestDto;

        const players = await this.pokerSessionService.getPlayersInTable(tableId);
        const currentMaxBet = Math.max(...players.map(player => player.currentBet));

        switch (action) {
            case BetAction.FOLD:
                player.hasFolded = true;
                break;

            case BetAction.CHECK:
                if (player.currentBet < currentMaxBet) {
                    throw new WsException('Cannot check, need to call or fold.');
                }
                break;

            case BetAction.CALL: {
                const toCall = currentMaxBet - player.currentBet;
                if (toCall > player.chips) {
                    throw new WsException('Not enough chips to call.');
                }
                player.chips -= toCall;
                player.currentBet += toCall;
                gameState.pot += toCall;
                break;
            }

            case BetAction.RAISE: {
                const raiseAmount = amount;
                const toCall = currentMaxBet - player.currentBet;
                const totalAmount = toCall + raiseAmount;

                if (totalAmount > player.chips) {
                    throw new WsException('Not enough chips to raise.');
                }

                player.chips -= totalAmount;
                player.currentBet += totalAmount;
                gameState.pot += totalAmount;

                break;
            }
            default:
                throw new WsException('Unknown action');
        }

        gameState.lastAction = action;
        gameState.lastUpdateTime = new Date();

        await this.pokerSessionService.updatePlayer(tableId, player);
        await this.pokerSessionService.setGameState(tableId, gameState);

        return gameState;
    }

    private extractPlayersWithoutCardsHand(players: Array<PlayerDto>): Array<Omit<PlayerDto, 'hand'>> {
        return players.map((player: PlayerDto): Omit<PlayerDto, 'hand'> => {
            const { hand, ...rest } = player;
            return rest;
        });
    }

    async getVerifiedGameState(tableId: string): Promise<GameStateDto> {
        const gameState = await this.pokerSessionService.getGameState(tableId);
        if (!gameState) {
            throw new WsException('No game session found');
        }
        return gameState;
    }

    private getMinimalRaiseAmount(phase: GamePhase): number {
        const baseRaiseAmount = 20;
        const phaseMultiplier = {
            [GamePhase.PRE_FLOP]: 1,
            [GamePhase.FLOP]: 1.5,
            [GamePhase.TURN]: 2,
            [GamePhase.RIVER]: 3,
        };

        return baseRaiseAmount * (phaseMultiplier[phase] ?? 1);
    }
}