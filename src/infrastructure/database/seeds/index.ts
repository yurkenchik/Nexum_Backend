import { AppModule } from 'src/app.module';
import { NestFactory } from '@nestjs/core';
import { PlayingCardSeeder } from 'src/infrastructure/database/seeds/seeders/playing-card.seeder';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const playingCardSeeder = app.get(PlayingCardSeeder);

    await playingCardSeeder.execute();
    await app.close();
}

bootstrap().catch((error) => {
    console.error("Error seeding database", error);
    process.exit(1);
})