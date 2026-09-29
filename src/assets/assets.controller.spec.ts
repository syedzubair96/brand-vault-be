import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from './assets.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AssetsService } from './assets.service.js';
import { AssetTaggingService } from '../ai/asset-tagging.service.js';

describe('AssetsController', () => {
  let controller: AssetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        AssetsService,
        { provide: PrismaService, useValue: {} },
        { provide: AssetTaggingService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AssetsController>(AssetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
