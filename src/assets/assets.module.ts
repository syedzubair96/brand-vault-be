import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AssetsService } from './assets.service.js';
import { AssetsController } from './assets.controller.js';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
