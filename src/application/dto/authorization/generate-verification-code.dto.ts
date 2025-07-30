import { ConfirmationCodePurpose } from 'src/presentation/enums/verification-code-purpose.enum';

export class GenerateVerificationCodeDto {
    readonly purpose: ConfirmationCodePurpose;
    readonly userId: string;
    readonly timeToLiveMinutes: number;
}