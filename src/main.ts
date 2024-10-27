import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from "cors-ts";
import {SETTINGS} from "./core/settings/settings";
import { useContainer } from "class-validator";
import { BadRequestExceptionFilter } from './core/exceptions/exception-filters/bad-request-exception-filter';
import cookieParser from 'cookie-parser'
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true
  });
  // app.setGlobalPrefix('api')
  app.use(cors({
    // credentials: true,
  }))
  // app.useGlobalFilters(new BadRequestExceptionFilter())
  useContainer(app.select(AppModule), {fallbackOnErrors: true})
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const customErrors = [];
        errors.forEach((e) => {
          const constraintKeys = Object.keys(e.constraints as any);
          constraintKeys.forEach((cKey, index) => {
            if (index >= 1) return;
            const msg = e.constraints?.[cKey] as any;
            // @ts-ignore
            customErrors.push({ field: e.property, message: msg });
          });
        });
        throw new BadRequestException(customErrors);
      },
    }),
  );
  app.use(cookieParser())
  await app.listen(SETTINGS.PORT, () => console.log('DB connect'));
}
bootstrap();
