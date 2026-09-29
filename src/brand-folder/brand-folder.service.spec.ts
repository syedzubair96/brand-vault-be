import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { BrandFolderService } from './brand-folder.service.js';

const USER_ID = 1;
const DELETED_AT = new Date('2026-09-28T10:00:00Z');

function folder(overrides: Partial<{ id: number; HeadFolderId: number | null; deletedAt: Date | null }>) {
  return {
    id: 10,
    FolderName: 'Folder',
    HeadFolderId: null,
    createdAt: new Date(),
    deletedAt: DELETED_AT,
    createdBy: USER_ID,
    ...overrides,
  };
}

describe('BrandFolderService', () => {
  let service: BrandFolderService;
  const prisma = {
    assetFolder: {
      findFirst: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
    assets: {
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrandFolderService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<BrandFolderService>(BrandFolderService);
  });

  describe('restore', () => {
    it('clears deletedAt for a deleted top-level folder', async () => {
      prisma.assetFolder.findFirst.mockResolvedValueOnce(folder({}));
      prisma.assetFolder.update.mockResolvedValue(folder({ deletedAt: null }));

      await service.restore(USER_ID, 10);

      expect(prisma.assetFolder.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { deletedAt: null },
      });
    });

    it('refuses while the parent folder is still deleted', async () => {
      prisma.assetFolder.findFirst
        .mockResolvedValueOnce(folder({ HeadFolderId: 5 }))
        .mockResolvedValueOnce(null);

      await expect(service.restore(USER_ID, 10)).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.assetFolder.update).not.toHaveBeenCalled();
    });

    it('refuses a folder that is not deleted', async () => {
      prisma.assetFolder.findFirst.mockResolvedValueOnce(folder({ deletedAt: null }));

      await expect(service.restore(USER_ID, 10)).rejects.toBeInstanceOf(ConflictException);
    });

    it("returns 404 for another user's folder", async () => {
      prisma.assetFolder.findFirst.mockResolvedValueOnce(null);

      await expect(service.restore(USER_ID, 10)).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.assetFolder.findFirst).toHaveBeenCalledWith({
        where: { id: 10, createdBy: USER_ID },
      });
    });
  });

  describe('removePermanently', () => {
    it('deletes the folder and its trashed assets together', async () => {
      prisma.assetFolder.findFirst.mockResolvedValueOnce(folder({}));
      prisma.assetFolder.count.mockResolvedValue(0);
      prisma.assets.count.mockResolvedValue(0);
      prisma.$transaction.mockResolvedValue([{ count: 2 }, folder({})]);

      const result = await service.removePermanently(USER_ID, 10);

      expect(prisma.assets.deleteMany).toHaveBeenCalledWith({
        where: { FolderId: 10, createdBy: USER_ID },
      });
      expect(prisma.assetFolder.delete).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(result).toMatchObject({ id: 10 });
    });

    it('refuses while the folder still has subfolders', async () => {
      prisma.assetFolder.findFirst.mockResolvedValueOnce(folder({}));
      prisma.assetFolder.count.mockResolvedValue(1);

      await expect(service.removePermanently(USER_ID, 10)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('refuses while the folder still has active assets', async () => {
      prisma.assetFolder.findFirst.mockResolvedValueOnce(folder({}));
      prisma.assetFolder.count.mockResolvedValue(0);
      prisma.assets.count.mockResolvedValue(3);

      await expect(service.removePermanently(USER_ID, 10)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('refuses a folder that is not deleted', async () => {
      prisma.assetFolder.findFirst.mockResolvedValueOnce(folder({ deletedAt: null }));

      await expect(service.removePermanently(USER_ID, 10)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });
});
