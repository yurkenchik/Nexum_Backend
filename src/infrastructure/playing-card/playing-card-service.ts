import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PlayingCard, PlayingCardDocument } from 'src/domain/common/entities/playing-card.entity';
import { Model } from 'mongoose';
import { PlayingCardNotFoundException } from 'src/domain/common/exceptions/client/playing-card-not-found.exception';

@Injectable()
export class PlayingCardService {
    constructor(
        @InjectModel(PlayingCard.name)
        private readonly playingCardModel: Model<PlayingCard>,
    ) {}

    async getPlayingCards(): Promise<Array<PlayingCardDocument>> {
        const cards = await this.playingCardModel.find();
        return this.shuffle(cards);
    }

    async getPlayingCardByCode(code: string): Promise<PlayingCardDocument> {
        const playingCard = await this.playingCardModel.findOne({ code });
        if (!playingCard) {
            throw new PlayingCardNotFoundException();
        }
        return playingCard;
    }

    async shuffle(cards: Array<PlayingCardDocument>): Promise<Array<PlayingCardDocument>> {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return cards;
    }

    async drawCard(): Promise<PlayingCardDocument | null> {
        const cards = await this.getPlayingCards();
        return cards.length > 0 ? cards.pop()! : null;
    }

    async drawCards(count: number): Promise<Array<PlayingCardDocument>> {
        const drawnCards = await Promise.all(
            Array.from({ length: count }, () => this.drawCard()),
        )

        return drawnCards.filter((card): card is PlayingCardDocument => card !== null);
    }

    async dealCards(playerCount: number): Promise<Record<string, Array<PlayingCardDocument>>> {
        const deck = await this.getPlayingCards();
        const playerHands: Record<string, Array<PlayingCardDocument>> = {};

        for (let i = 0; i <= playerCount; i++) {
            playerHands[`player${i}`] = [deck.pop()!, deck.pop()!];
        }
        return playerHands;
    }
}