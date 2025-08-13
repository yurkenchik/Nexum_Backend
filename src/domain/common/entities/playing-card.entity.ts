import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { PlayingCardSuits } from 'src/presentation/enums/playing-card-suits.enum';
import { PlayingCardRank } from 'src/presentation/enums/playing-card-ranks.enum';

export type PlayingCardDocument = HydratedDocument<PlayingCard>;

@Schema({ timestamps: true })
export class PlayingCard {
    @Prop({ required: true, enum: PlayingCardSuits })
    public suit: PlayingCardSuits;

    @Prop({ required: true, enum: PlayingCardRank })
    public rank: PlayingCardRank;

    @Prop({ required: true })
    public code: string;

    @Prop({ required: true })
    public weight: number;

    @Prop({ required: false })
    public imageUrl: string;
}

export const playingCardSchema = SchemaFactory.createForClass(PlayingCard);