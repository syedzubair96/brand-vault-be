import { Test, TestingModule } from '@nestjs/testing';
import { BrandKitService } from './brand-kit.service.js';

describe('BrandKitService', () => {
  let service: BrandKitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrandKitService],
    }).compile();

    service = module.get<BrandKitService>(BrandKitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
