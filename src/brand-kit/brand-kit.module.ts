import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { BrandKitService } from './brand-kit.service.js';
import { BrandKitController } from './brand-kit.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [BrandKitController],
  providers: [BrandKitService],
})
export class BrandKitModule {}
