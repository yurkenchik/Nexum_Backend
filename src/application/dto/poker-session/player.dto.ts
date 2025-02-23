import { PlayingCardDocument } from 'src/domain/common/entities/playing-card.entity';
import { PokerRole } from 'src/presentation/enums/poker-role.enum';

export class PlayerDto {
    public socketId: string;
    public name: string;
    public amount: number;
    public role: PokerRole;
    public cards: PlayingCardDocument;

}