import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "src/infrastructure/auth/auth.service";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { AuthorizationResponseDto } from "src/infrastructure/auth/dto/authorization-response.dto";
import { LoginDto } from "src/infrastructure/auth/dto/login.dto";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post("registration")
    async registration(@Body() registrationDto: CreateUserDto): Promise<AuthorizationResponseDto> {
        return this.authService.registration(registrationDto);
    }

    @Post("login")
    async login(@Body() loginDto: LoginDto): Promise<AuthorizationResponseDto> {
        return this.authService.login(loginDto);
    }
}