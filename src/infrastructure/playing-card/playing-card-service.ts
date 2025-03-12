import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PlayingCard, PlayingCardDocument } from 'src/domain/common/entities/playing-card.entity';
import { Model } from 'mongoose';
import { PlayingCardNotFoundException } from 'src/domain/common/exceptions/client/playing-card-not-found.exception';
import { PlayingCardDto } from 'src/application/dto/poker-session/playing-card.dto';
import { PlayerDto } from 'src/application/dto/poker-session/player.dto';

@Injectable()
export class PlayingCardService {
    constructor(
        @InjectModel(PlayingCard.name)
        private readonly playingCardModel: Model<PlayingCard>,
    ) {}

    async getPlayingCards(): Promise<Array<PlayingCardDto>> {
        const cards: Array<PlayingCardDto> = await this.playingCardModel.find();
        return this.shuffle(cards);
    }

    async getPlayingCardByCode(code: string): Promise<PlayingCardDocument> {
        const playingCard = await this.playingCardModel.findOne({ code });
        if (!playingCard) {
            throw new PlayingCardNotFoundException();
        }
        return playingCard;
    }

    async shuffle(cards: Array<PlayingCardDto>): Promise<Array<PlayingCardDto>> {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return cards;
    }

    async drawCard(): Promise<PlayingCardDto> {
        const cards: Array<PlayingCardDto> = await this.getPlayingCards();
        return cards.pop()!;
    }

    async drawCards(count: number): Promise<Array<PlayingCardDto>> {
        const drawnCards: Array<PlayingCardDto> = await Promise.all(
            Array.from({ length: count }, (): Promise<PlayingCardDto> => this.drawCard()),
        )
        return drawnCards.filter((card: PlayingCardDto): boolean => card !== null);
    }

    async dealCards(players: Array<PlayerDto>): Promise<Record<string, Array<PlayingCardDto>>> {
        const deck: Array<PlayingCardDto> = await this.getPlayingCards();
        const playerHands: Record<string, Array<PlayingCardDto>> = {};

        for (const player of players) {
            playerHands[player.id] = [deck.pop()!, deck.pop()!];
        }
        return playerHands;
    }
}