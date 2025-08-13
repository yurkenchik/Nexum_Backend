import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { UploadFileDto } from 'src/application/dto/aws/upload-file.dto';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;

    constructor(
        private readonly configService: ConfigService
    ) {
        this.s3Client = new S3Client({ region: this.configService.get<string>("AWS_REGION") })
    }

    async uploadFile(uploadFileDto: UploadFileDto): Promise<void> {
        const { bucket, key, file } = uploadFileDto;

        const uploadFileParams: PutObjectCommandInput = {
            Bucket: bucket,
            Key: key,
            Body: file
        };

        try {
            const putObjectCommand = new PutObjectCommand(uploadFileParams);
            await this.s3Client.send(putObjectCommand);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(error.message);
        }
    }
}