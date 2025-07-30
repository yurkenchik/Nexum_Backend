import { UserDocument } from 'src/domain/common/entities/user.entity';

export class RequestPasswordResetResponseDto {
    readonly user: UserDocument;
    readonly responseMessage: string;
    readonly expiresAt: Date;
}