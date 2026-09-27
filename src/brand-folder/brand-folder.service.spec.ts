import { Test, TestingModule } from '@nestjs/testing';
import { BrandFolderService } from './brand-folder.service.js';

describe('BrandFolderService', () => {
  let service: BrandFolderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrandFolderService],
    }).compile();

    service = module.get<BrandFolderService>(BrandFolderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
