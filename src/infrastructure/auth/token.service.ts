import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { GenerateTokenDto } from "src/auth/dto/generate-token.dto";

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async generateToken(generateTokenDto: GenerateTokenDto): Promise<string> {
        return this.jwtService.sign(generateTokenDto, {
            secret: this.configService.get<string>("JWT_SECRET"),
            expiresIn: this.configService.get<number>("JWT_EXPIRATION_TIME"),
        });
    }
}