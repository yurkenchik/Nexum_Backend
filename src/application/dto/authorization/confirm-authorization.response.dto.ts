import { UserDocument } from 'src/domain/common/entities/user.entity';

export class ConfirmAuthorizationResponseDto {
    readonly user: UserDocument;
    readonly token: string;
}