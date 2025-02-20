import { InjectModel } from "@nestjs/mongoose";
import { PlayingCard, PlayingCardDocument } from "src/domain/common/entities/playing-card.entity";
import { Model } from "mongoose";
import { PlayingCardSuits } from "src/presentation/enums/playing-card-suits.enum";
import { PlayingCardRank } from "src/presentation/enums/playing-card-ranks.enum";
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
            console.log("PLAYING CARD SUITS: ", suit);
            return Object.values(PlayingCardRank).map((rank) => ({
                suit,
                rank,
                code:`${suit[0]}${rank[0]}`.toUpperCase()
            }));
        });
        console.log("CARDS: ", cards);

        return this.playingCardModel.insertMany(cards);
    }
}