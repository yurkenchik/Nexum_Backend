import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserDto } from "src/application/dto/user/create-user.dto";
import { User, UserDocument } from "src/domain/common/entities/user.entity";
import { UserNotFoundException } from 'src/domain/common/exceptions/client/user-not-found.exception';

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
            throw new UserNotFoundException();
        }
        return user;
    }

    async getUseByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email });
    }
}