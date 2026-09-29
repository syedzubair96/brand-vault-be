import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Brand Vault API')
    .setDescription('Brand Vault API')
    .setVersion('1.0')
    .addTag('Brand Vault')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

// await app.listen(process.env.PORT || 3000);
// }
// bootstrap();
