import { GameStateDto } from 'src/application/dto/poker-session/response/game-state.dto';
import { PlayerDto } from 'src/application/dto/poker-session/response/player.dto';
import { BetAction } from 'src/presentation/enums/bet-action.enum';

export class ProcessPlayerActionRequestDto {
    readonly gameState: GameStateDto;
    readonly player: PlayerDto;
    readonly action: BetAction;
    readonly amount: number;
    readonly tableId: string;
}