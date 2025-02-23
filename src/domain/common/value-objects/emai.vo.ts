import { ValueObject } from "src/domain/common/common-instances/value-object.instance";
import { InvalidEmailException } from "src/domain/common/exceptions/client/invalid-email.exception";

export class Email extends ValueObject<string>{
    constructor(public readonly email: string) {
        if (!Email.validateEmail(email)) {
            throw new InvalidEmailException();
        }
        super(email);
    }

    private static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        if (!other) {
            return false;
        }
        return other.value === this.value;
    }
}
