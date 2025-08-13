import { GameStateDto } from 'src/application/dto/poker-session/response/game-state.dto';
import { PlayerDto } from 'src/application/dto/poker-session/response/player.dto';

export class ProcessPlayerActionResponseDto {
    readonly player: PlayerDto;
    readonly gameState: GameStateDto;
}