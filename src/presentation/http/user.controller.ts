import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserService } from "src/infrastructure/user/user.service";
import { UserDocument } from "src/domain/common/entities/user.entity";
import { AuthGuard } from "src/presentation/guards/auth.guard";

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @UseGuards(AuthGuard)
    @Get()
    async getUsers(): Promise<Array<UserDocument>> {
        return await this.userService.getUsers();
    }
}