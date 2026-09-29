import { Module } from '@nestjs/common';
import { AssetTaggingService } from './asset-tagging.service.js';

@Module({
  providers: [AssetTaggingService],
  exports: [AssetTaggingService],
})
export class AiModule {}
