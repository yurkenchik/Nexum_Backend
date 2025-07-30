import { UserDocument } from 'src/domain/common/entities/user.entity';
import { ConfirmationCodePurpose } from 'src/presentation/enums/verification-code-purpose.enum';

export class UserRegisteredEvent {
    constructor(
        public readonly user: UserDocument,
        public readonly confirmationCodePurpose: ConfirmationCodePurpose,
    ) {}
}