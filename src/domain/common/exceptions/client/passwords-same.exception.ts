import { HttpException, HttpStatus } from "@nestjs/common";

export class SamePasswordsException extends HttpException {
    constructor() {
        super("Passwords are the same, try another one", HttpStatus.BAD_REQUEST);
    }
}