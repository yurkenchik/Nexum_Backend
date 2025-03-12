import { UserDocument } from 'src/domain/common/entities/user.entity';

export class UserCreatedEvent {
    constructor(
        public readonly user: UserDocument,
    ) {}
}