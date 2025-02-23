import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { Player } from 'src/domain/common/entities/player.entity';
import { Round } from 'src/domain/common/entities/round.entity';

export type GameSessionDocument = HydratedDocument<GameSession>;

@Schema({ timestamps: true })
export class GameSession {
    @Prop({ required: true, unique: true })
    public roomId: string;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Player" }] })
    public players: Array<Player>;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Round" }] })
    public rounds: Array<Round>;

    @Prop({ type: Date, default: Date.now })
    public createdAt: Date;

    @Prop({ type: Date, nullable: true })
    public startedAt?: Date;

    @Prop({ type: Date, nullable: true })
    public endedAt?: Date;

    @Prop({ default: "waiting" })
    public status: string;
}

export const gameSessionSchema = SchemaFactory.createForClass(GameSession);
