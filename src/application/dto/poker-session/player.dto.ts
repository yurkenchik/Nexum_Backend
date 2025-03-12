import { PlayingCardDto } from 'src/application/dto/poker-session/playing-card.dto';

export class PlayerDto {
    id: string;
    name: string;
    chips: number;
    isAllIn: boolean = false;
    hasFolded: boolean = false;
    currentBet: number;

    constructor(
        id: string,
        name: string,
        chips: number,
        currentBet: number,
        isAllIn: boolean = false,
        hasFolded: boolean = false,
    ) {
        this.id = id;
        this.name = name;
        this.chips = chips;
        this.isAllIn = isAllIn;
        this.hasFolded = hasFolded;
        this.currentBet = currentBet;
    }
}