import { PlayingCardSuits } from 'src/presentation/enums/playing-card-suits.enum';
import { PlayingCardRank } from 'src/presentation/enums/playing-card-ranks.enum';

export class PlayingCardDto {
    suit: PlayingCardSuits;
    rank: PlayingCardRank;
    code: string;
    hidden: boolean;

    constructor(
        suit: PlayingCardSuits,
        rank: PlayingCardRank,
        code: string,
        hidden: boolean = true
    ) {
        this.suit = suit;
        this.rank = rank;
        this.code = code;
        this.hidden = hidden;
    }
}