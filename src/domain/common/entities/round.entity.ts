import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { PlayerHand } from 'src/domain/common/entities/player-hand.entity';
import { Bet } from 'src/domain/common/entities/ber.entity';

export type RoundDocument = HydratedDocument<Round>;

@Schema({ timestamps: true })
export class Round {
    @Prop({ required: true })
    public roundNumber: number;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Bet" }] })
    public bets: Bet[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "PlayerHand" }] })
    public playerHands: Array<PlayerHand>;

    @Prop({ type: [String], default: [] })
    public communityCards: string[];

    @Prop({ default: "ongoing" })
    public status: string;
}

export const RoundSchema = SchemaFactory.createForClass(Round);