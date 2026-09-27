import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { BrandKitModule } from './brand-kit/brand-kit.module.js';
import { BrandFolderModule } from './brand-folder/brand-folder.module.js';
import { AssetsModule } from './assets/assets.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),PrismaModule, BrandKitModule, BrandFolderModule, AssetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
