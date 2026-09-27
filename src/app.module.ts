import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { BrandKitModule } from './brand-kit/brand-kit.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),PrismaModule, BrandKitModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
