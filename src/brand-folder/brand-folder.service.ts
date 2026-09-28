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

  async create(dto: CreateBrandFolderDto) {
    const headFolderId = dto.HeadFolderId ?? null;
    if (headFolderId !== null) {
      await this.checkParentFolder(headFolderId, dto.createdBy);
    }

    try {
      return await this.prisma.assetFolder.create({
        data: {
          FolderName: dto.FolderName,
          HeadFolderId: headFolderId,
          createdBy: dto.createdBy,
        },
      });
    } catch (error) {
      this.handleKnownErrors(error);
    }
  }

  findAll(query: ListBrandFoldersDto) {
    return this.prisma.assetFolder.findMany({
      where: {
        deletedAt: null,
        createdBy: query.createdBy,
        HeadFolderId: query.topLevel ? null : query.headFolderId,
      },
      orderBy: { FolderName: 'asc' },
    });
  }

  async findOne(id: number) {
    const folder = await this.findActive(id);
    if (!folder) {
      throw new NotFoundException(`Folder ${id} not found`);
    }
    return folder;
  }

  async update(id: number, dto: UpdateBrandFolderDto) {
    const folder = await this.findOne(id);

    const newParentId = dto.HeadFolderId;
    if (newParentId != null && newParentId !== folder.HeadFolderId) {
      await this.checkNotOwnDescendant(id, newParentId);
      await this.checkParentFolder(newParentId, folder.createdBy);
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

  async remove(id: number) {
    await this.findOne(id);

    const childCount = await this.prisma.assetFolder.count({
      where: { HeadFolderId: id, deletedAt: null },
    });
    if (childCount > 0) {
      throw new ConflictException(
        `Folder ${id} still has ${childCount} subfolder(s); delete or move them first`,
      );
    }

    return this.prisma.assetFolder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private findActive(id: number) {
    return this.prisma.assetFolder.findFirst({ where: { id, deletedAt: null } });
  }

  private async checkParentFolder(parentId: number, ownerId: number) {
    const parent = await this.findActive(parentId);
    if (!parent || parent.createdBy !== ownerId) {
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
