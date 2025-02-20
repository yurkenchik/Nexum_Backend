import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "src/infrastructure/user/user.service";
import { UserController } from "src/presentation/http/user.controller";
import { User, userSchema } from "src/domain/common/entities/user.entity";
import { JwtModule } from "@nestjs/jwt";

@Module({
    providers: [UserService],
    controllers: [UserController],
    imports: [MongooseModule.forFeature([{ name: User.name, schema: userSchema }]), JwtModule],
    exports: [UserService],
})
export class UserModule {}