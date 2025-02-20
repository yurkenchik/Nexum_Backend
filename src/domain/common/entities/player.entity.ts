import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { PokerTable } from 'src/domain/common/entities/poker-table.entity';
import { GameSession } from 'aws-sdk/clients/gamelift';

export type PlayerDocument = HydratedDocument<Player>;

@Schema({ timestamps: true })
export class Player {
    @Prop()
    public name: string;

    @Prop()
    public socketId: string;

    @Prop({ default: 10000 })
    public chips: number;

    @Prop({ default: false })
    public isReady: boolean;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "PokerTable", nullable: true })
    public table?: PokerTable;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "GameSession", nullable: true })
    public gameSession?: GameSession;

    @Prop()
    public createdAt?: Date;

    @Prop()
    public updatedAt?: Date;
}

export const playerSchema = SchemaFactory.createForClass(Player);