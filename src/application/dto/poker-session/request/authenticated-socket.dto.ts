import { Socket } from "socket.io";
import { UserDocument } from "src/domain/common/entities/user.entity";

export class AuthenticatedSocketDto extends Socket {
    readonly user: UserDocument;
}