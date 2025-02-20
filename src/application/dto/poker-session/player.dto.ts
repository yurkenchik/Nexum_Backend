import { PlayingCardDocument } from 'src/domain/common/entities/playing-card.entity';

export class PlayerDto {
    public socketId: string;
    public name: string;
    public amount: number;
    public cards: PlayingCardDocument;

}