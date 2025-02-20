import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PlayingCard } from 'src/domain/common/entities/playing-card.entity';
import { Model } from 'mongoose';
import { PlayingCardNotFoundException } from 'src/domain/common/exceptions/client/playing-card-not-found.exception';

@Injectable()
export class PlayingCardService {
    constructor(
        @InjectModel(PlayingCard.name)
        private readonly playingCardModel: Model<PlayingCard>,
    ) {}

    async getPlayingCards(): Promise<Array<PlayingCard>> {
        return this.playingCardModel.find();
    }

    async getPlayingCardByCode(code: string): Promise<PlayingCard> {
        const playingCard = await this.playingCardModel.findOne({ code });
        if (!playingCard) {
            throw new PlayingCardNotFoundException();
        }
        return playingCard;
    }
}