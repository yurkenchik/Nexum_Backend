import { ConfirmationCodePurpose } from 'src/presentation/enums/verification-code-purpose.enum';
import { GenerateVerificationCodeDto } from 'src/application/dto/authorization/generate-verification-code.dto';

export class VerificationCodeSubject {
    constructor(
        public readonly code: string,
        public readonly purpose: ConfirmationCodePurpose,
        public readonly userId: string,
        public readonly expiresAt: Date,
    ) {}

    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    static generate(generateVerificationCodeDto: GenerateVerificationCodeDto): VerificationCodeSubject {
        const { purpose, userId, timeToLiveMinutes } = generateVerificationCodeDto;

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + timeToLiveMinutes * 60 * 1000);
        return new VerificationCodeSubject(code, purpose, userId, expiresAt);
    }
}