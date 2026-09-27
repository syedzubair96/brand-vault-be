import { Test, TestingModule } from '@nestjs/testing';
import { BrandFolderController } from './brand-folder.controller.js';
import { BrandFolderService } from './brand-folder.service.js';

describe('BrandFolderController', () => {
  let controller: BrandFolderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandFolderController],
      providers: [BrandFolderService],
    }).compile();

    controller = module.get<BrandFolderController>(BrandFolderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
