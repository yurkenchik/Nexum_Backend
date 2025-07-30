import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordRequestDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(256)
    readonly password: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(256)
    readonly confirmPassword: string;

    @IsNotEmpty()
    @IsNumber()
    readonly confirmationCode: number;
}