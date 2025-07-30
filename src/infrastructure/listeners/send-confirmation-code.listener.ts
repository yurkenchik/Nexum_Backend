import { HttpException, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from 'src/domain/common/constants/events';
import { SnsService } from 'src/infrastructure/aws/services/sns.service';
import { UserRegisteredEvent } from 'src/domain/events/user-registered.event';
import { UserAuthorizedEvent } from 'src/domain/events/user-authorized.event';
import { UserRequestedPasswordResetEvent } from 'src/domain/events/user-requested-password-reset.event';
import { VerificationCodeSubject } from 'src/domain/common/common-instances/verification-code-subject';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { DefaultTtlInMinutesForConfirmationCode } from 'src/domain/common/constants/utils';
import { SesService } from 'src/infrastructure/aws/services/ses.service';
import { UserRequestedEmailChangeEvent } from 'src/domain/events/user-requested-email-change.event';

type UnifiedSendVerificationCodeType =
    UserRegisteredEvent |
    UserAuthorizedEvent |
    UserRequestedPasswordResetEvent |
    UserRequestedEmailChangeEvent;

@Injectable()
export class SendConfirmationCodeListener {
    private readonly logger = new Logger(SendConfirmationCodeListener.name);

    constructor(
        private readonly snsService: SnsService,
        private readonly sesService: SesService,
        private readonly redisService: RedisService,
    ) {}

    @OnEvent(Events.UserRegistered)
    async executeUserRegistered(event: UserRegisteredEvent): Promise<void> {
        await this.execute(event);
    }

    @OnEvent(Events.UserAuthorized)
    async executeUserAuthorized(event: UserAuthorizedEvent): Promise<void> {
        await this.execute(event);
    }

    @OnEvent(Events.UserRequestedPasswordReset)
    async executeUserRequestedPasswordReset(event: UserRequestedPasswordResetEvent): Promise<void> {
        await this.execute(event);
    }

    @OnEvent(Events.UserRequestedEmailChange)
    async executeUserRequestedEmailChange(event: UserRequestedEmailChangeEvent): Promise<void> {
        await this.execute(event);
    }

    async execute(event: UnifiedSendVerificationCodeType): Promise<void> {
        const { user, confirmationCodePurpose } = event;

        const confirmationCode = VerificationCodeSubject.generate({
            purpose: confirmationCodePurpose,
            timeToLiveMinutes: DefaultTtlInMinutesForConfirmationCode,
            userId: user.id
        });

        try {
            const redisKey = `confirmation:${confirmationCodePurpose}:${user.id}`;
            await this.redisService.set(redisKey, confirmationCode.code, 1000 * DefaultTtlInMinutesForConfirmationCode);
        } catch (error) {
            this.logger.error(`Failed to set confirmation code in Redis: ${error.message}`);
            throw new HttpException(error.message, error.statusCode);
        }

        try {
            // TODO change to SMS via phone number after resolving an AWS issue with requests limit
            await this.sesService.sendEmail({
                receiver: user.email,
                message: `You received a confirmation code: ${confirmationCode.code}`,
                subject: 'Code confirmation'
            });

            this.logger.log(`Sent confirmation code for ${confirmationCodePurpose} to ${user.email}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${user.email}: ${error.message}`);
            throw new HttpException(error.message, error.statusCode);
        }
    }
}