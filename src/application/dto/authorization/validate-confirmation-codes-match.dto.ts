import { IsNumber, IsString } from 'class-validator';

export class ValidateConfirmationCodesMatchDto {
    @IsNumber()
    readonly confirmationCode: number;

    @IsString()
    readonly confirmationCodeKey: string;
}