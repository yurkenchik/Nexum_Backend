import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type BanDocument = HydratedDocument<Ban>;

@Schema({ timestamps: true })
export class Ban {
    @Prop()
    public reason: string;

    @Prop({ default: true })
    public isActive: boolean;

    @Prop({ default: false })
    public notificationsEnabled: boolean;

    @Prop({ type: "timestamp" })
    public bannedAt?: Date;

    @Prop({ type: "timestamp" })
    public bannedUntil?: Date | null;
}

export const banSchema = SchemaFactory.createForClass(Ban);