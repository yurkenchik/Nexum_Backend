import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { UserDocument } from "src/user/user.model";
import { AuthGuard } from "src/system/guards/auth.guard";

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