import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "src/user/user.service";
import { UserController } from "src/user/user.controller";
import { User, userSchema } from "src/user/user.model";
import { JwtModule } from "@nestjs/jwt";

@Module({
    providers: [UserService],
    controllers: [UserController],
    imports: [MongooseModule.forFeature([{ name: User.name, schema: userSchema }]), JwtModule],
    exports: [UserService],
})
export class UserModule {}