import { HttpException, HttpStatus } from '@nestjs/common';

export class PlayingCardNotFoundException extends HttpException {
    constructor() {
        super("Playing card not found", HttpStatus.NOT_FOUND);
    }
}