import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { Player } from 'src/domain/common/entities/player.entity';
import { BetAction } from 'src/presentation/enums/bet-action.enum';

export type BetDocument = HydratedDocument<Bet>;

@Schema({ timestamps: true })
export class Bet {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Player", required: true })
    public player: Player;

    @Prop({ required: true, enum: BetAction })
    public action: string;

    @Prop({ type: Number, default: 0 })
    public amount: number;
}

export const BetSchema = SchemaFactory.createForClass(Bet);