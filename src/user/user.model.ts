import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    public email: string;

    @Prop()
    public name: string;

    @Prop({ required: true })
    public phoneNumber: string;

    @Prop({ required: true })
    public password: string;

    @Prop()
    public createdAt?: Date;

    @Prop()
    public updatedAt?: Date;
}

export const userSchema = SchemaFactory.createForClass(User);