import { NestFactory } from '@nestjs/core';
import { AppModule } from "src/app.module";
import * as process from "node:process";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const PORT = process.env.PORT || 3000;

    app.setGlobalPrefix(process.env.NODE_ENV === "production" ? "api" : "dev");
    await app.listen(PORT, () => console.log(`Server application is listening on PORT: ${PORT}`));
}
bootstrap();
