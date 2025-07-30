import { Injectable } from '@nestjs/common';
import { UserService } from 'src/infrastructure/user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from 'src/domain/common/constants/events';
import { UserRequestedPasswordResetEvent } from 'src/domain/events/user-requested-password-reset.event';
import { ConfirmationCodePurpose } from 'src/presentation/enums/verification-code-purpose.enum';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { DefaultTtlInMinutesForConfirmationCode } from 'src/domain/common/constants/utils';
import { RequestPasswordResetResponseDto } from 'src/application/dto/account-configuration/response/request-password-reset-response.dto';
import { ResetPasswordRequestDto } from 'src/application/dto/account-configuration/request/reset-password-request.dto';
import { CodesDontMatchException } from 'src/domain/common/exceptions/client/codes-dont-match.exception';
import { Password } from 'src/domain/common/value-objects/password.vo';
import { PasswordDontMatchException } from 'src/domain/common/exceptions/client/passwords-dont-match.exception';
import { SamePasswordsException } from 'src/domain/common/exceptions/client/passwords-same.exception';
import { ChangeEmailDto } from 'src/application/dto/account-configuration/request/change-email.dto';
import { Email } from 'src/domain/common/value-objects/emai.vo';

@Injectable()
export class AccountConfigurationService {
    constructor(
        private readonly userService: UserService,
        private readonly eventEmitter: EventEmitter2,
        private readonly redisService: RedisService,
    ) {}

    async requestPasswordReset(userId: string): Promise<RequestPasswordResetResponseDto> {
        const user = await this.userService.getUserById(userId);

        this.eventEmitter.emit(
            Events.UserRequestedPasswordReset,
            new UserRequestedPasswordResetEvent(user, ConfirmationCodePurpose.RESET_PASSWORD)
        );

        return {
            user,
            responseMessage: 'Password request was successful',
            expiresAt: new Date(Date.now() + DefaultTtlInMinutesForConfirmationCode * 60_000),
        };
    }

    async resetPassword(userId: string, resetPasswordRequestDto: ResetPasswordRequestDto) {
        const { password, confirmPassword, confirmationCode } = resetPasswordRequestDto;

        const user = await this.userService.getUserById(userId);

        const confirmationCodeKey = `confirmation:${ConfirmationCodePurpose.RESET_PASSWORD}:${user.id}`;
        const confirmationCodeFromRedis: number = await this.redisService.get<number>(confirmationCodeKey);

        if (confirmationCode !== confirmationCodeFromRedis) {
            throw new CodesDontMatchException();
        }

        const passwordValueObject = new Password(password);

        const arePasswordsEqual = await passwordValueObject.comparePasswords(user.password);
        if (arePasswordsEqual) {
            throw new SamePasswordsException();
        }

        if (password !== confirmPassword) {
            throw new PasswordDontMatchException();
        }

        return;
    }

    async changePhoneNumber() {}

    async changeEmail(userId: string, changeEmailDto: ChangeEmailDto) {
        const { newEmail, confirmationCode } = changeEmailDto;

        const user = await this.userService.getUserById(userId);

        const confirmationCodeKey = `confirmation:${ConfirmationCodePurpose.CHANGE_EMAIL}:${user.id}`;
        const confirmationCodeFromRedis: string = await this.redisService.get<string>(confirmationCodeKey);

        const emailValueObject = new Email(newEmail);


        // TODO complete logic
        await this.redisService.delete(confirmationCodeKey);
        const userWithChangedEmail = await this.userService.updateUser(user.id, { email: newEmail });
    }
}