import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SendEmailCommand, SendEmailRequest, SESClient } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';
import { SendEmailDto } from 'src/application/dto/aws/send-email.dto';

@Injectable()
export class SesService {
    private readonly senderEmail: string;
    private readonly sesClient: SESClient;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.sesClient = new SESClient({ region: this.configService.get<string>("AWS_REGION") });
        this.senderEmail = this.configService.get<string>("AWS_SENDER_EMAIL") as string;
    }

    async sendEmail(sendEmailDto: SendEmailDto): Promise<void> {
        const { receiver, subject, message } = sendEmailDto;

        const sendEmailParams: SendEmailRequest = {
            Source: this.senderEmail,
            Destination: { ToAddresses: [receiver] },
            Message: { Subject: { Data: subject }, Body: { Text: { Data: message } } }
        };

        try {
            const sendEmailCommand = new SendEmailCommand(sendEmailParams);
            await this.sesClient.send(sendEmailCommand);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(error.message);
        }
    }
}