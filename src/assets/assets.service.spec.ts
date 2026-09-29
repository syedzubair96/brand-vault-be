import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetTaggingService } from '../ai/asset-tagging.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AssetsService } from './assets.service.js';

const USER_ID = 1;

const asset = {
  id: 7,
  name: 'Summer banner',
  type: 1,
  LogoURL: 'https://cdn.example.com/summer-banner.png',
  FolderId: 3,
  createdBy: USER_ID,
  deletedAt: null,
};

describe('AssetsService', () => {
  let service: AssetsService;
  const prisma = {
    assets: { findFirst: vi.fn(), update: vi.fn() },
    assetFolder: { findFirst: vi.fn() },
    brandKit: { findFirst: vi.fn() },
  };
  const tagging = { suggest: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AssetTaggingService, useValue: tagging },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
  });

  describe('suggestAiMetadata', () => {
    it('sends only the asset, its folder name and the brand profile, scoped to the user', async () => {
      prisma.assets.findFirst.mockResolvedValue(asset);
      prisma.assetFolder.findFirst.mockResolvedValue({ FolderName: 'Social Media' });
      prisma.brandKit.findFirst.mockResolvedValue({
        BrandName: 'Acme',
        PrimaryColor: '#111111',
        SecondaryColor: '#EEEEEE',
      });
      const suggestion = { tags: ['banner'], description: 'd', usage_suggestion: 'u' };
      tagging.suggest.mockResolvedValue(suggestion);

      await expect(service.suggestAiMetadata(USER_ID, 7)).resolves.toBe(suggestion);

      expect(prisma.assets.findFirst).toHaveBeenCalledWith({
        where: { id: 7, createdBy: USER_ID, deletedAt: null },
      });
      expect(prisma.assetFolder.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 3, createdBy: USER_ID, deletedAt: null } }),
      );
      expect(prisma.brandKit.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { createdBy: USER_ID } }),
      );
      expect(tagging.suggest).toHaveBeenCalledWith({
        asset: { name: 'Summer banner', type: 'image', url: 'https://cdn.example.com/summer-banner.png' },
        folder: { name: 'Social Media' },
        brand: { name: 'Acme', primary_color: '#111111', secondary_color: '#EEEEEE' },
      });
      expect(prisma.assets.update).not.toHaveBeenCalled();
    });

    it('sends null folder and brand when they do not exist', async () => {
      prisma.assets.findFirst.mockResolvedValue(asset);
      prisma.assetFolder.findFirst.mockResolvedValue(null);
      prisma.brandKit.findFirst.mockResolvedValue(null);
      tagging.suggest.mockResolvedValue({});

      await service.suggestAiMetadata(USER_ID, 7);

      expect(tagging.suggest).toHaveBeenCalledWith(expect.objectContaining({ folder: null, brand: null }));
    });

    it("never calls the AI for another user's asset", async () => {
      prisma.assets.findFirst.mockResolvedValue(null);

      await expect(service.suggestAiMetadata(USER_ID, 7)).rejects.toBeInstanceOf(NotFoundException);
      expect(tagging.suggest).not.toHaveBeenCalled();
    });
  });

  describe('saveAiMetadata', () => {
    it('stores tags as a comma-separated string', async () => {
      prisma.assets.findFirst.mockResolvedValue(asset);
      prisma.assets.update.mockResolvedValue(asset);

      await service.saveAiMetadata(USER_ID, 7, {
        tags: ['summer', 'banner'],
        description: 'Summer banner image.',
        usage_suggestion: 'Suitable for web banners.',
      });

      expect(prisma.assets.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: {
          tags: 'summer, banner',
          description: 'Summer banner image.',
          usage_suggestion: 'Suitable for web banners.',
        },
      });
    });

    it("refuses to update another user's asset", async () => {
      prisma.assets.findFirst.mockResolvedValue(null);

      await expect(
        service.saveAiMetadata(USER_ID, 7, { tags: ['a'], description: 'd', usage_suggestion: 'u' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.assets.update).not.toHaveBeenCalled();
    });
  });
});
