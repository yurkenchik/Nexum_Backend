import { Module } from "@nestjs/common";
import { SnsService } from "src/infrastructure/aws/sns.service";
import { ConfigModule } from "@nestjs/config";

@Module({
    providers: [SnsService],
    imports: [ConfigModule],
    exports: [SnsService]
})
export class AwsModule {}