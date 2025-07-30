import { Body, Controller, Post } from "@nestjs/common";
import { AuthorizationService } from "src/infrastructure/authorization/services/authorization.service";
import { CreateUserDto } from "src/application/dto/user/create-user.dto";
import { LoginDto } from "src/application/dto/authorization/login.dto";
import { PreRequestAuthorizationResponseDto } from 'src/application/dto/authorization/pre-request-authorization-response.dto';
import { ConfirmAuthorizationRequestDto } from 'src/application/dto/authorization/confirm-authorization-request.dto';
import { ConfirmAuthorizationResponseDto } from 'src/application/dto/authorization/confirm-authorization.response.dto';

@Controller("authorization")
export class AuthorizationController {
    constructor(
        private readonly authorizationService: AuthorizationService,
    ) {}

    @Post("registration")
    async registration(@Body() registrationDto: CreateUserDto): Promise<PreRequestAuthorizationResponseDto> {
        return this.authorizationService.registration(registrationDto);
    }

    @Post("login")
    async login(@Body() loginDto: LoginDto): Promise<PreRequestAuthorizationResponseDto> {
        return this.authorizationService.login(loginDto);
    }

    @Post('confirm-registration')
    async confirmRegistration(@Body() confirmAuthorizationRequestDto: ConfirmAuthorizationRequestDto): Promise<ConfirmAuthorizationResponseDto> {
        return this.authorizationService.confirmRegistration(confirmAuthorizationRequestDto);
    }

    @Post('confirm-login')
    async confirmLogin(@Body() confirmAuthorizationRequestDto: ConfirmAuthorizationRequestDto): Promise<ConfirmAuthorizationResponseDto> {
        return this.authorizationService.confirmLogin(confirmAuthorizationRequestDto);
    }
}