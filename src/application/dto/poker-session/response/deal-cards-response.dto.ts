import { PlayingCardDto } from 'src/application/dto/poker-session/response/playing-card.dto';

export class DealCardsResponseDto {
    readonly playerHands: Record<string, Array<PlayingCardDto>>;
    readonly deck: Array<PlayingCardDto>;
}