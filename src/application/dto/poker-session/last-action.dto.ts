import { BetAction } from 'src/presentation/enums/bet-action.enum';

export class LastActionDto {
    readonly playerId: string;
    readonly action: BetAction;
    readonly amount: number;
}