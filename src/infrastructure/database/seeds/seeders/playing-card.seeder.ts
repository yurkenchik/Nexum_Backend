import { InjectModel } from "@nestjs/mongoose";
import { PlayingCard, PlayingCardDocument } from "src/domain/common/entities/playing-card.entity";
import { Model } from "mongoose";
import { PlayingCardSuits } from "src/presentation/enums/playing-card-suits.enum";
import { PlayingCardRank } from "src/presentation/enums/playing-card-ranks.enum";
import { Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PlayingCardSeeder {
    constructor(
        @InjectModel(PlayingCard.name)
        private readonly playingCardModel: Model<PlayingCardDocument>,
        private readonly httpService: HttpService,
    ) {}

    async execute() {
        await this.playingCardModel.deleteMany();

        const staticDeckCardsImagesUrl = 'https://deckofcardsapi.com/api/deck/new/draw/?count=52';
        const deckOfCardsStaticImagesApiResponse = await lastValueFrom(this.httpService.get(staticDeckCardsImagesUrl));

        const playingCards = Object.values(PlayingCardSuits).flatMap(suit => {

            return Object.values(PlayingCardRank).map((rank: PlayingCardRank) => {
                const code = `${rank[rank !== "10" ? 0 : 1]}${suit[0]}`.toUpperCase();
                const card = deckOfCardsStaticImagesApiResponse.data.cards.find(card => card.code === code);

                if (!card) {
                    console.warn(`⚠️ Card not found for code ${code}`);
                }

                return {
                    suit,
                    rank,
                    code,
                    weight: this.getRankWeights()[rank],
                    imageUrl: card?.image ?? null,
                };
            });
        });

        return this.playingCardModel.insertMany(playingCards);
    }

    private getRankWeights(): Record<PlayingCardRank, number> {
        return {
            [PlayingCardRank.TWO]: 2,
            [PlayingCardRank.THREE]: 3,
            [PlayingCardRank.FOUR]: 4,
            [PlayingCardRank.FIVE]: 5,
            [PlayingCardRank.SIX]: 6,
            [PlayingCardRank.SEVEN]: 7,
            [PlayingCardRank.EIGHT]: 8,
            [PlayingCardRank.NINE]: 9,
            [PlayingCardRank.TEN]: 10,
            [PlayingCardRank.JACK]: 11,
            [PlayingCardRank.QUEEN]: 12,
            [PlayingCardRank.KING]: 13,
            [PlayingCardRank.ACE]: 14,
        };
    }
}