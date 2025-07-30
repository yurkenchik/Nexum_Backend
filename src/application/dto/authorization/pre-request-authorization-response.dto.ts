import { UserDocument } from 'src/domain/common/entities/user.entity';
import { IsString } from 'class-validator';

export class PreRequestAuthorizationResponseDto {
    readonly user: UserDocument;

    @IsString()
    readonly responseMessage: string;
}