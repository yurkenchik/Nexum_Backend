import { PlayingCardDocument } from 'src/domain/common/entities/playing-card.entity';

export class GameStateDto {
    readonly deck: Array<PlayingCardDocument>;
    readonly playerHands: Record<string, Array<PlayingCardDocument>>;
}