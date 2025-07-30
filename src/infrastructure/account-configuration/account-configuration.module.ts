import { Module } from '@nestjs/common';
import { AccountConfigurationService } from 'src/infrastructure/account-configuration/account-configuration.service';
import { UserModule } from 'src/infrastructure/user/user.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from 'src/infrastructure/redis/redis.module';

@Module({
    providers: [AccountConfigurationService],
    controllers: [],
    imports: [UserModule, EventEmitterModule, RedisModule],
    exports: [AccountConfigurationService],
})
export class AccountConfigurationModule {}