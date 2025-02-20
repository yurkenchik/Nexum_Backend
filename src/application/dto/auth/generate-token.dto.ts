
export class GenerateTokenDto {
    readonly id: string;
    readonly email: string;
    readonly phoneNumber: string;
    readonly name: string;
    readonly hashedPassword: string;
}