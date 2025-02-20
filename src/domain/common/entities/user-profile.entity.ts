import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserProfileDocument = HydratedDocument<UserProfile>;

@Schema({ timestamps: true })
export class UserProfile {
    @Prop()
    public name: string;

    @Prop()
    public avatarImageUrl: string;

    @Prop()
    readonly country: string;

    @Prop()
    readonly city: string;

    @Prop({ default: false })
    readonly notificationsEnabled: boolean;

    @Prop()
    public createdAt?: Date;

    @Prop()
    public updatedAt?: Date;
}

export const userProfileSchema = SchemaFactory.createForClass(UserProfile);