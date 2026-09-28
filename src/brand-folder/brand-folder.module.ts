import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { BrandFolderService } from './brand-folder.service.js';
import { BrandFolderController } from './brand-folder.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [BrandFolderController],
  providers: [BrandFolderService],
})
export class BrandFolderModule {}
