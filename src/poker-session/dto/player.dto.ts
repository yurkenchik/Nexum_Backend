
export class PlayerDto {
    socketId: string;
    name: string;
    amount: number;

    constructor(socketId: string, name: string, amount = 10000) {
        this.socketId = socketId;
        this.name = name;
        this.amount = amount;
    }
}