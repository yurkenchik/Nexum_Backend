import { PlayerDto } from 'src/application/dto/poker-session/player.dto';
import { PlayingCard } from 'src/domain/common/entities/playing-card.entity';
import { LastActionDto } from 'src/application/dto/poker-session/last-action.dto';

export class GameSessionInfoDto {
    public players: Array<PlayerDto>;
    public currentBet: number = 50;
    public turnIndex: number;
    public potAmount: number = 0;
    public smallBlind: number = 25;
    public bigBlind: number = 50;
    public pendingPlayers: Array<PlayerDto> = [];
    public disconnectedPlayers: Array<PlayerDto> = [];
    public roundNumber: number = 1;
    public communityCards: Array<PlayingCard> = [];
    public lastAction: LastActionDto | null = null;
    public startTime: Date = new Date();
    public lastUpdateTime: Date = new Date();
}