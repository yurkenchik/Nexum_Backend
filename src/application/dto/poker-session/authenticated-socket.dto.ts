import { Socket } from "socket.io";
import { UserDocument } from "src/user/user.model";

export class AuthenticatedSocketDto extends Socket {
    readonly user: Partial<UserDocument>;
}