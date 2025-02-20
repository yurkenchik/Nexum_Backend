import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayingCard, playingCardSchema } from 'src/domain/common/entities/playing-card.entity';
import { PlayingCardService } from 'src/infrastructure/playing-card/playing-card-service';

@Module({
    providers: [PlayingCardService],
    imports: [MongooseModule.forFeature([{ name: PlayingCard.name, schema: playingCardSchema }])],
    exports: [PlayingCardService],
})
export class PlayingCardModule {}