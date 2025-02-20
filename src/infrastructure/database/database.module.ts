import { Module } from '@nestjs/common';
import { PlayingCardSeeder } from 'src/infrastructure/database/seeds/seeders/playing-card.seeder';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayingCard, playingCardSchema } from 'src/domain/common/entities/playing-card.entity';

@Module({
    providers: [PlayingCardSeeder],
    imports: [MongooseModule.forFeature([{ name: PlayingCard.name, schema: playingCardSchema }])],
    exports: [PlayingCardSeeder]
})
export class DatabaseModule {}