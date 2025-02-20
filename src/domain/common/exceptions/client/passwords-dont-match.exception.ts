import { HttpException, HttpStatus } from "@nestjs/common";

export class PasswordDontMatchException extends HttpException {
    constructor() {
        super("Passwords do not match", HttpStatus.BAD_REQUEST);
    }
}