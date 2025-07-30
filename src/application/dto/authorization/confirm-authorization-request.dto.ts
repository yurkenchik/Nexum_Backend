import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ConfirmAuthorizationRequestDto {
    @IsNotEmpty()
    readonly userId: string;

    @IsNotEmpty()
    @IsNumber()
    readonly confirmationCode: number;
}