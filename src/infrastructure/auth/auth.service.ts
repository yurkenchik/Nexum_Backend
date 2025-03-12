import { Injectable } from "@nestjs/common";
import { TokenService } from "src/infrastructure/auth/token.service";
import { CreateUserDto } from "src/application/dto/user/create-user.dto";
import { AuthorizationResponseDto } from "src/application/dto/auth/authorization-response.dto";
import { UserService } from "src/infrastructure/user/user.service";
import { UserAlreadyExistsException } from "src/domain/common/exceptions/client/user-already-exists.exception";
import { Password } from "src/domain/common/value-objects/password.vo";
import { Email } from "src/domain/common/value-objects/emai.vo";
import { PhoneNumber } from "src/domain/common/value-objects/phone-number.vo";
import { LoginDto } from "src/application/dto/auth/login.dto";
import { UserDocument } from "src/domain/common/entities/user.entity";
import { UserNotFoundException } from "src/domain/common/exceptions/client/user-not-found.exception";
import { PasswordDontMatchException } from "src/domain/common/exceptions/client/passwords-dont-match.exception";
import { ValidateUserDto } from "src/application/dto/auth/validate-user.dto";
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/presentation/enums/events.enum';
import { UserCreatedEvent } from 'src/application/events/user-created.event';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly eventEmitter: EventEmitter2
    ) {}

    async registration(registrationDto: CreateUserDto): Promise<AuthorizationResponseDto> {
        const { email, name, phoneNumber, password } = registrationDto;

        const userExistsByEmail = await this.userService.getUseByEmail(email);
        if (userExistsByEmail) {
            throw new UserAlreadyExistsException();
        }

        const passwordValueObject = new Password(password);
        const hashedPassword = await passwordValueObject.hash();

        const user = await this.userService.createUser({
            email: new Email(email).getValue(),
            name,
            phoneNumber: new PhoneNumber(phoneNumber).getValue(),
            password: hashedPassword,
        });

        const { id } = user;
        const token = await this.tokenService.generateToken({
            id,
            email,
            hashedPassword: password,
            phoneNumber: user.phoneNumber,
            name
        });

        this.eventEmitter.emit(Events.USER_CREATED, new UserCreatedEvent(user));
        return { token };
    }

    async login(loginDto: LoginDto): Promise<AuthorizationResponseDto> {
        const { email, password } = loginDto;
        const user = await this.validateUser({ email, password });

        const { id } = user;
        const token = await this.tokenService.generateToken({
            id,
            email,
            hashedPassword: password,
            phoneNumber: user.phoneNumber,
            name: user.name
        });

        return { token };
    }

    private async validateUser(validateUserDto: ValidateUserDto): Promise<UserDocument> {
        const { email, password } = validateUserDto;
        const user = await this.userService.getUseByEmail(email);
        if (!user) {
            throw new UserNotFoundException();
        }

        const passwordValueObject = new Password(password);
        const passwordMatch = await passwordValueObject.comparePasswords(user.password);

        if (!passwordMatch) {
            throw new PasswordDontMatchException();
        }
        return user;
    }

    async confirmRegistration() {}

    async confirmLogin() {}
}