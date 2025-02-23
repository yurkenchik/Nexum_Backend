import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserDto } from "src/application/dto/user/create-user.dto";
import { User, UserDocument } from "src/domain/common/entities/user.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
        return this.userModel.create(createUserDto);
    }

    async getUsers(): Promise<Array<UserDocument>> {
        return this.userModel.find();
    }

    async getUserById(id: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ id });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        return user;
    }

    async getUseByEmail(email: string): Promise<UserDocument | null> {
        const user = await this.userModel.findOne({ email });
        console.log("USER: ", user);
        return user;
    }
}