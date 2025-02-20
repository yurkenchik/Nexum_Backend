import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type GameQueueDocument = HydratedDocument<GameQueue>;

@Schema({ timestamps: true })
export class GameQueue {
    @Prop({ required: true, unique: true })
    public email: string;

    @Prop()
    public name: string;

    @Prop()
    public maxPlayers: number;

    @Prop()
    public createdAt?: Date;

    @Prop()
    public updatedAt?: Date;
}

export const gameQueueSchema = SchemaFactory.createForClass(GameQueue);