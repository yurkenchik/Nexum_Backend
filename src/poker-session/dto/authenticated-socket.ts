import { Socket } from "socket.io";
import { UserDocument } from "src/user/user.model";

export class AuthenticatedSocket extends Socket {
    readonly user: Partial<UserDocument>;
}