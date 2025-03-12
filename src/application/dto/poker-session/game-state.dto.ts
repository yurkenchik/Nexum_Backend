import { PlayingCardDto } from "src/application/dto/poker-session/playing-card.dto";
import { PlayerDto } from "src/application/dto/poker-session/player.dto";
import { GamePhase } from "src/presentation/enums/game-phase.enum";

export class GameStateDto {
    readonly players: Array<PlayerDto>;
    readonly pot?: number = 0;
    readonly communityCards: Array<PlayingCardDto>;
    readonly playerHands: Record<string, Array<PlayingCardDto>>;
    readonly currentUserTurn: string;
    readonly gamePhase?: GamePhase = GamePhase.PRE_FLOP;
}