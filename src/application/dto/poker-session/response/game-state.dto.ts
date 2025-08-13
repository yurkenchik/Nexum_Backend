import { PlayingCardDto } from "src/application/dto/poker-session/response/playing-card.dto";
import { PlayerDto } from "src/application/dto/poker-session/response/player.dto";
import { GamePhase } from "src/presentation/enums/game-phase.enum";
import { BetAction } from 'src/presentation/enums/bet-action.enum';

export class GameStateDto {
    pot: number = 0;
    smallBlind: number = 25;
    bigBlind: number = 50;
    turnIndex: number = 0;
    currentUserTurn: string | null = null;
    gamePhase: GamePhase = GamePhase.PRE_FLOP;
    deck: Array<PlayingCardDto> = [];
    roundNumber: number = 1;
    startTime: Date = new Date();
    lastUpdateTime: Date = new Date();
    communityCards: Array<PlayingCardDto> = [];
    playerHands: Record<string, Array<PlayingCardDto>>;
    lastAction: BetAction | null = null;
    pendingPlayers: Array<PlayerDto> = [];
    disconnectedPlayers: Array<PlayerDto> = [];
    playerBets: Record<string, number> = {};

    getCardsInDeck(): number {
        return this.deck.length;
    }
}