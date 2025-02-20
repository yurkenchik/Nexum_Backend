import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { Player } from 'aws-sdk/clients/gamelift';
import { PlayingCard } from 'src/domain/common/entities/playing-card.entity';

export type PlayerHandDocument = HydratedDocument<PlayerHand>;

@Schema({ timestamps: true })
export class PlayerHand {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Player", required: true })
    public player: Player;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "PlayingCard" })
    public playingCards: Array<PlayingCard>;

    @Prop({ default: false })
    public folded: boolean;
}

export const PlayerHandSchema = SchemaFactory.createForClass(PlayerHand);
