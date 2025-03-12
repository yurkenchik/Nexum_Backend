import { UserDocument } from 'src/domain/common/entities/user.entity';
import { PlayerDto } from 'src/application/dto/poker-session/player.dto';

export class PlayerMapper {
    static toDto(userDocument: UserDocument): PlayerDto {
        return new PlayerDto(
            userDocument.id,
            userDocument.name,
            1000,
            50
        );
    }
}