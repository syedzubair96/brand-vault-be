import { Module } from '@nestjs/common';
import { BrandFolderService } from './brand-folder.service.js';
import { BrandFolderController } from './brand-folder.controller.js';

@Module({
  controllers: [BrandFolderController],
  providers: [BrandFolderService],
})
export class BrandFolderModule {}
