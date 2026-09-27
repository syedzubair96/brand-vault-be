import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { BrandKitService } from './brand-kit.service.js';

describe('BrandKitService', () => {
  let service: BrandKitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrandKitService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<BrandKitService>(BrandKitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
