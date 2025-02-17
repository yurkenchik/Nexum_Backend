import { InjectModel } from "@nestjs/mongoose";
import { PlayingCard, PlayingCardDocument } from "src/playing-card/playing-card.model";
import { Model } from "mongoose";
import { PlayingCardSuits } from "src/system/enums/playing-card-suits.enum";
import { PlayingCardRank } from "src/system/enums/playing-card-ranks.enum";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PlayingCardSeeder {
    constructor(
        @InjectModel(PlayingCard.name)
        private readonly playingCardModel: Model<PlayingCardDocument>,
    ) {}

    async execute() {
        await this.playingCardModel.deleteMany();

        const cards = Object.values(PlayingCardSuits).flatMap(suit => {
            Object.values(PlayingCardRank).map((rank) => ({
                suit,
                rank,
                code:`${suit}${rank}`.toUpperCase()
            }));
        });

        return this.playingCardModel.insertMany(cards);
    }
}