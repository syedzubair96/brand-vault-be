import { Module } from '@nestjs/common';
import { BrandKitService } from './brand-kit.service.js';
import { BrandKitController } from './brand-kit.controller.js';

@Module({
  controllers: [BrandKitController],
  providers: [BrandKitService],
})
export class BrandKitModule {}
