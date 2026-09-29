import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBrandFolderDto } from './dto/create-brand-folder.dto.js';
import { ListBrandFoldersDto } from './dto/list-brand-folders.dto.js';
import { UpdateBrandFolderDto } from './dto/update-brand-folder.dto.js';

@Injectable()
export class BrandFolderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateBrandFolderDto) {
    const headFolderId = dto.HeadFolderId ?? null;
    if (headFolderId !== null) {
      await this.checkParentFolder(userId, headFolderId);
    }

    try {
      return await this.prisma.assetFolder.create({
        data: {
          FolderName: dto.FolderName,
          HeadFolderId: headFolderId,
          createdBy: userId,
        },
      });
    } catch (error) {
      this.handleKnownErrors(error);
    }
  }

  findAll(userId: number, query: ListBrandFoldersDto) {
    return this.prisma.assetFolder.findMany({
      where: {
        deletedAt: query.trash ? { not: null } : null,
        createdBy: userId,
        HeadFolderId: query.topLevel ? null : query.headFolderId,
      },
      orderBy: query.trash ? { deletedAt: 'desc' } : { FolderName: 'asc' },
    });
  }

  async findOne(userId: number, id: number) {
    const folder = await this.findActive(userId, id);
    if (!folder) {
      throw new NotFoundException(`Folder ${id} not found`);
    }
    return folder;
  }

  async update(userId: number, id: number, dto: UpdateBrandFolderDto) {
    const folder = await this.findOne(userId, id);

    const newParentId = dto.HeadFolderId;
    if (newParentId != null && newParentId !== folder.HeadFolderId) {
      await this.checkNotOwnDescendant(id, newParentId);
      await this.checkParentFolder(userId, newParentId);
    }

    try {
      return await this.prisma.assetFolder.update({
        where: { id },
        data: { FolderName: dto.FolderName, HeadFolderId: newParentId },
      });
    } catch (error) {
      this.handleKnownErrors(error, id);
    }
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);

    const childCount = await this.prisma.assetFolder.count({
      where: { HeadFolderId: id, deletedAt: null },
    });
    if (childCount > 0) {
      throw new ConflictException(
        `Folder ${id} still has ${childCount} subfolder(s); delete or move them first`,
      );
    }

    const assetCount = await this.prisma.assets.count({
      where: { FolderId: id, deletedAt: null },
    });
    if (assetCount > 0) {
      throw new ConflictException(
        `Folder ${id} still has ${assetCount} asset(s); move or trash them first`,
      );
    }

    return this.prisma.assetFolder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(userId: number, id: number) {
    const folder = await this.findTrashed(userId, id);

    if (folder.HeadFolderId !== null) {
      const parent = await this.findActive(userId, folder.HeadFolderId);
      if (!parent) {
        throw new ConflictException(
          `Folder ${id} is inside a deleted folder; restore the parent folder first`,
        );
      }
    }

    return this.prisma.assetFolder.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async removePermanently(userId: number, id: number) {
    await this.findTrashed(userId, id);

    const childCount = await this.prisma.assetFolder.count({ where: { HeadFolderId: id } });
    if (childCount > 0) {
      throw new ConflictException(
        `Folder ${id} still has ${childCount} subfolder(s); delete them permanently first`,
      );
    }

    const activeAssetCount = await this.prisma.assets.count({
      where: { FolderId: id, deletedAt: null },
    });
    if (activeAssetCount > 0) {
      throw new ConflictException(
        `Folder ${id} still has ${activeAssetCount} asset(s); move or trash them first`,
      );
    }

    // Assets.FolderId is required, so trashed assets can't outlive their folder.
    const [, folder] = await this.prisma.$transaction([
      this.prisma.assets.deleteMany({ where: { FolderId: id, createdBy: userId } }),
      this.prisma.assetFolder.delete({ where: { id } }),
    ]);
    return folder;
  }

  private async findTrashed(userId: number, id: number) {
    const folder = await this.prisma.assetFolder.findFirst({
      where: { id, createdBy: userId },
    });
    if (!folder) {
      throw new NotFoundException(`Folder ${id} not found`);
    }
    if (folder.deletedAt === null) {
      throw new ConflictException(`Folder ${id} is not deleted`);
    }
    return folder;
  }

  private findActive(userId: number, id: number) {
    return this.prisma.assetFolder.findFirst({
      where: { id, createdBy: userId, deletedAt: null },
    });
  }

  private async checkParentFolder(userId: number, parentId: number) {
    const parent = await this.findActive(userId, parentId);
    if (!parent) {
      throw new BadRequestException(`Parent folder ${parentId} not found`);
    }
  }

  private async checkNotOwnDescendant(folderId: number, newParentId: number) {
    const visited = new Set<number>();
    let currentId: number | null = newParentId;
    while (currentId !== null && !visited.has(currentId)) {
      if (currentId === folderId) {
        throw new BadRequestException(
          'A folder cannot be moved into itself or one of its subfolders',
        );
      }
      visited.add(currentId);
      const parent: { HeadFolderId: number | null } | null =
        await this.prisma.assetFolder.findUnique({
          where: { id: currentId },
          select: { HeadFolderId: true },
        });
      currentId = parent?.HeadFolderId ?? null;
    }
  }

  private handleKnownErrors(error: unknown, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('A folder with this name already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Folder ${id} not found`);
      }
    }
    throw error;
  }
}
