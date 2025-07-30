import { Injectable } from "@nestjs/common";
import { TokenService } from "src/infrastructure/authorization/services/token.service";
import { CreateUserDto } from "src/application/dto/user/create-user.dto";
import { AuthorizationResponseDto } from "src/application/dto/authorization/authorization-response.dto";
import { UserService } from "src/infrastructure/user/user.service";
import { UserAlreadyExistsException } from "src/domain/common/exceptions/client/user-already-exists.exception";
import { Password } from "src/domain/common/value-objects/password.vo";
import { Email } from "src/domain/common/value-objects/emai.vo";
import { PhoneNumber } from "src/domain/common/value-objects/phone-number.vo";
import { LoginDto } from "src/application/dto/authorization/login.dto";
import { UserNotFoundException } from "src/domain/common/exceptions/client/user-not-found.exception";
import { PasswordDontMatchException } from "src/domain/common/exceptions/client/passwords-dont-match.exception";
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/domain/common/constants/events';
import { UserRegisteredEvent } from 'src/domain/events/user-registered.event';
import { ConfirmationCodePurpose } from 'src/presentation/enums/verification-code-purpose.enum';
import { ConfirmAuthorizationResponseDto } from 'src/application/dto/authorization/confirm-authorization.response.dto';
import { RedisService } from "src/infrastructure/redis/redis.service";
import { ConfirmAuthorizationRequestDto } from 'src/application/dto/authorization/confirm-authorization-request.dto';
import { CodesDontMatchException } from 'src/domain/common/exceptions/client/codes-dont-match.exception';
import {
    PreRequestAuthorizationResponseDto
} from 'src/application/dto/authorization/pre-request-authorization-response.dto';
import {
    ValidateConfirmationCodesMatchDto
} from 'src/application/dto/authorization/validate-confirmation-codes-match.dto';
import { UserAuthorizedEvent } from 'src/domain/events/user-authorized.event';

@Injectable()
export class AuthorizationService {
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly eventEmitter: EventEmitter2,
        private readonly redisService: RedisService,
    ) {}

    async registration(registrationDto: CreateUserDto): Promise<PreRequestAuthorizationResponseDto> {
        const { email, name, phoneNumber, password } = registrationDto;

        const userExistsByEmail = await this.userService.getUserByEmail(email);
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

        this.eventEmitter.emit(Events.UserRegistered, new UserRegisteredEvent(user, ConfirmationCodePurpose.SIGN_UP));

        return { user, responseMessage: 'Registration was successful, waiting for confirmation' };
    }

    async login(loginDto: LoginDto): Promise<PreRequestAuthorizationResponseDto> {
        const { email, password } = loginDto;

        const user = await this.userService.getUserByEmail(email);
        if (!user) {
            throw new UserNotFoundException();
        }

        const passwordValueObject = new Password(password);
        const passwordMatch = await passwordValueObject.comparePasswords(user.password);

        if (!passwordMatch) {
            throw new PasswordDontMatchException();
        }

        this.eventEmitter.emit(Events.UserAuthorized, new UserAuthorizedEvent(user, ConfirmationCodePurpose.LOG_IN));

        return { user, responseMessage: 'Login was successful, waiting for confirmation' };
    }

    async confirmRegistration(confirmAuthorizationRequestDto: ConfirmAuthorizationRequestDto): Promise<ConfirmAuthorizationResponseDto> {
        const { userId, confirmationCode } = confirmAuthorizationRequestDto;

        const user = await this.userService.getUserById(userId);

        const confirmationCodeKey = `confirmation:${ConfirmationCodePurpose.SIGN_UP}:${user.id}`;
        await this.validationConfirmationCodesMatch({ confirmationCode, confirmationCodeKey });

        await Promise.all([
            this.redisService.delete(confirmationCodeKey),
            this.userService.markUserAsVerified(user.id),
        ]);

        const token = await this.tokenService.generateToken({
            id: user.id,
            email: user.email,
            hashedPassword: user.password,
            phoneNumber: user.phoneNumber,
            name: user.name
        });

        return { user, token };
    }

    async confirmLogin(confirmAuthorizationRequestDto: ConfirmAuthorizationRequestDto): Promise<ConfirmAuthorizationResponseDto> {
        const { userId, confirmationCode } = confirmAuthorizationRequestDto;

        const user = await this.userService.getUserById(userId);

        const confirmationCodeKey = `confirmation:${ConfirmationCodePurpose.LOG_IN}:${user.id}`;

        await this.validationConfirmationCodesMatch({ confirmationCode, confirmationCodeKey });
        await this.redisService.delete(confirmationCodeKey);``

        const token = await this.tokenService.generateToken({
            id: user.id,
            email: user.email,
            hashedPassword: user.password,
            phoneNumber: user.phoneNumber,
            name: user.name
        });

        return { user, token };
    }

    private async validationConfirmationCodesMatch(
        validateConfirmationCodesMatchDto: ValidateConfirmationCodesMatchDto
    ): Promise<void> {
        const { confirmationCode, confirmationCodeKey } = validateConfirmationCodesMatchDto;

        const confirmationCodeFromRedis: number = await this.redisService.get<number>(confirmationCodeKey);

        if (confirmationCode !== confirmationCodeFromRedis) {
            throw new CodesDontMatchException();
        }
    }
}