import { Injectable } from "@nestjs/common";
import { PublishCommand, PublishInput, SNSClient } from "@aws-sdk/client-sns";
import { ConfigService } from "@nestjs/config";
import { PublishMessageDto } from "src/application/dto/aws/publish-message.dto";

@Injectable()
export class SnsService {
    private readonly snsClient: SNSClient;

    constructor(
        private readonly configService: ConfigService
    ) {
        const region: string = this.configService.get<string>("AWS_REGION") || "us-east-1";
        this.snsClient = new SNSClient({ region });
    }

    async publishMessage(publishMessageDto: PublishMessageDto): Promise<void> {
        const publishMessageParams: PublishInput = {
            Message: publishMessageDto.message,
            TopicArn: this.configService.get<string>("AWS_TOPIC_ARN"),
        };

        if (publishMessageDto.phoneNumber) {
            publishMessageParams.PhoneNumber = publishMessageDto.phoneNumber;
            delete publishMessageParams.TopicArn;
        }

        try {
            const publishMessageCommand: PublishCommand = new PublishCommand(publishMessageParams);
            await this.snsClient.send(publishMessageCommand);
        } catch (error) {
            throw error;
        }
    }
}