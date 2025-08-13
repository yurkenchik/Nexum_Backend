import { PlayingCardDto } from 'src/application/dto/poker-session/response/playing-card.dto';

export class PlayerDto {
    id: string;
    socketId: string
    name: string;
    chips: number;
    isAllIn: boolean = false;
    hasFolded: boolean = false;
    currentBet: number;
    hand: Array<PlayingCardDto> = [];

    constructor(
        id: string,
        socketId: string,
        name: string,
        chips: number,
        currentBet: number,
        isAllIn: boolean = false,
        hasFolded: boolean = false,
        hand: Array<PlayingCardDto>,
    ) {
        this.id = id;
        this.socketId = socketId;
        this.name = name;
        this.chips = chips;
        this.isAllIn = isAllIn;
        this.hasFolded = hasFolded;
        this.currentBet = currentBet;
        this.hand = hand;
    }
}