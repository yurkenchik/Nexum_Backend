import { ConfigService } from "@nestjs/config";
import * as dotenv from "dotenv";
import { connect, Model } from "mongoose";
import { PlayingCard, PlayingCardDocument, playingCardSchema } from "src/playing-card/playing-card.model";
import { InternalServerErrorException } from "@nestjs/common";
import { PlayingCardSeeder } from "src/database/seeds/seeders/playing-card.seeder";
dotenv.config();

const configService = new ConfigService();

async function seedDatabase(): Promise<void> {
    try {
        const mongoose = await connect(configService.get<string>("MONGO_DB_URI") as string);
        const playingCardModel: Model<PlayingCardDocument> = mongoose.model<PlayingCardDocument>(
            PlayingCard.name,
            playingCardSchema
        );

        const playingCardSeeder = new PlayingCardSeeder(playingCardModel);
        await playingCardSeeder.execute();
        await mongoose.disconnect();
    } catch (error) {
        throw new InternalServerErrorException("Error seeding database: ", error);
    }
}

seedDatabase();