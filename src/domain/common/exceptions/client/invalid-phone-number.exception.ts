import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidPhoneNumberException extends HttpException {
    constructor() {
        super("Invalid phone number", HttpStatus.BAD_REQUEST);
    }
}