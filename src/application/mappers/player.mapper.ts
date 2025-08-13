import { UserDocument } from 'src/domain/common/entities/user.entity';
import { PlayerDto } from 'src/application/dto/poker-session/response/player.dto';

export class PlayerMapper {
    static toDto(userDocument: UserDocument, socketId: string): PlayerDto {
        return new PlayerDto(
            userDocument.id,
            socketId,
            userDocument.name,
            1000,
            50,
            false,
            false,
            []
        );
    }
}