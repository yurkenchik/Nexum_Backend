import { Module } from "@nestjs/common";
import { SnsService } from "src/infrastructure/aws/services/sns.service";
import { ConfigModule } from "@nestjs/config";
import { SesService } from 'src/infrastructure/aws/services/ses.service';

@Module({
    providers: [SnsService, SesService],
    imports: [ConfigModule],
    exports: [SnsService, SesService]
})
export class AwsModule {}