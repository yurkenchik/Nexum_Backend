import { BetAction } from 'src/presentation/enums/bet-action.enum';

export class PlayerActionDto {
    readonly tableId: string;
    readonly action: BetAction;
    readonly amount: number;
}