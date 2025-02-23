import { ValueObject } from "src/domain/common/common-instances/value-object.instance";
import { InvalidPasswordException } from "src/domain/common/exceptions/client/invalid-password.exception";
import * as bcrypt from "bcrypt";

export class Password extends ValueObject<string>{
    constructor(public readonly password: string) {
        if (!Password.validatePassword(password)) {
            throw new InvalidPasswordException();
        }
        super(password);
    }

    private static validatePassword(password: string): boolean {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
        return passwordRegex.test(password);
    }

    async hash(): Promise<string> {
        return bcrypt.hash(this.value, 5);
    }

    getValue(): string {
        return this.value;
    }

    async comparePasswords(password: string): Promise<boolean> {
        return bcrypt.compare(this.value, password);
    }

    equals(other: Password): boolean {
        if (!other) {
            return false;
        }
        return other.value === this.value;
    }
}
