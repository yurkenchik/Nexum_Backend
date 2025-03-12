import { PlayingCardDocument } from 'src/domain/common/entities/playing-card.entity';
import { PlayingCardDto } from 'src/application/dto/poker-session/playing-card.dto';

export class PlayingCardMapper {
    static toDto(playingCardDocument: PlayingCardDocument): PlayingCardDto {
        return new PlayingCardDto(playingCardDocument.suit, playingCardDocument.rank, playingCardDocument.code);
    }
}