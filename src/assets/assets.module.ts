import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AssetsService } from './assets.service.js';
import { AssetsController } from './assets.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
