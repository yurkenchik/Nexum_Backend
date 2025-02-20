import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PlayingCardDocument = HydratedDocument<PlayingCard>;

@Schema({ timestamps: true })
export class PlayingCard {
    @Prop({ required: true })
    public suit: string;

    @Prop({ required: true })
    public rank: string;

    @Prop({ required: true })
    public code: string;
}

export const playingCardSchema = SchemaFactory.createForClass(PlayingCard);