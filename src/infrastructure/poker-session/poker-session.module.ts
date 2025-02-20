import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PokerSessionGateway } from "src/infrastructure/poker-session/poker-session.gateway";
import { RedisModule } from "src/infrastructure/redis/redis.module";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from '@nestjs/mongoose';
import { Player, playerSchema } from 'src/domain/common/entities/player.entity';
import { GameQueue, gameQueueSchema } from 'src/domain/common/entities/game-queue.entity';
import { PlayingCard, playingCardSchema } from 'src/domain/common/entities/playing-card.entity';
import { GameSession, gameSessionSchema } from 'src/domain/common/entities/game-session.entity';
import { PlayingCardModule } from 'src/infrastructure/playing-card/playin-card.module';

@Module({
    providers: [PokerSessionGateway],
    imports: [
        ConfigModule,
        RedisModule,
        JwtModule,
        MongooseModule.forFeature([
            { name: Player.name, schema: playerSchema },
            { name: GameSession.name, schema: gameSessionSchema },
            { name: GameQueue.name, schema: gameQueueSchema },
            { name: PlayingCard.name, schema: playingCardSchema },
        ]),
        PlayingCardModule
    ],
    exports: [PokerSessionGateway],
})
export class PokerSessionModule {}