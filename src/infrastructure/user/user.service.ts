import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserDto } from "src/application/dto/user/create-user.dto";
import { User, UserDocument } from "src/domain/common/entities/user.entity";
import { UserNotFoundException } from 'src/domain/common/exceptions/client/user-not-found.exception';
import { UpdateUserDto } from 'src/application/dto/user/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
        return this.userModel.create(createUserDto);
    }

    async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
        const updatedUser = await this.userModel.findOneAndUpdate(
            { _id: userId },
            { $set: updateUserDto },
        ).exec();

        if (!updatedUser) {
            throw new UserNotFoundException();
        }
        return updatedUser;
    }

    async getUsers(): Promise<Array<UserDocument>> {
        return this.userModel.find();
    }

    async getUserById(id: string): Promise<UserDocument> {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new UserNotFoundException();
        }
        return user;
    }

    async getUserByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email });
    }

    async getUserByPhoneNumber(phoneNumber: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ phoneNumber });
    }

    async markUserAsVerified(userId: string): Promise<UserDocument | null> {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $set: { isVerified: true } },
        ).exec();
    }
}