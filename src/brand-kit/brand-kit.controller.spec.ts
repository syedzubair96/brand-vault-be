import { Test, TestingModule } from '@nestjs/testing';
import { BrandKitController } from './brand-kit.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BrandKitService } from './brand-kit.service.js';

describe('BrandKitController', () => {
  let controller: BrandKitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandKitController],
      providers: [BrandKitService, { provide: PrismaService, useValue: {} }],
    }).compile();

    controller = module.get<BrandKitController>(BrandKitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
