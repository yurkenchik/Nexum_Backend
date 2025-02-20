import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { GameSession } from 'aws-sdk/clients/gamelift';
import { Player } from 'src/domain/common/entities/player.entity';

export type PokerTableDocument = HydratedDocument<PokerTable>;

@Schema({ timestamps: true })
export class PokerTable {
    @Prop({ required: true, unique: true })
    public email: string;

    @Prop()
    public tableName: string;

    @Prop({ default: 6 })
    public maxPlayers: number;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Player" }] })
    public players?: Array<Player>;

    @Prop()
    public createdAt?: Date;

    @Prop()
    public updatedAt?: Date;
}

export const userSchema = SchemaFactory.createForClass(PokerTable);