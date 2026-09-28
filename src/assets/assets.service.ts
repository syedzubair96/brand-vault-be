import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAssetDto } from './dto/create-asset.dto.js';
import { ListAssetsDto } from './dto/list-assets.dto.js';
import { UpdateAssetDto } from './dto/update-asset.dto.js';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssetDto) {
    await this.checkFolder(dto.FolderId, dto.createdBy);
    try {
      return await this.prisma.assets.create({
        data: {
          name: dto.name,
          type: dto.type,
          LogoURL: dto.LogoURL,
          FolderId: dto.FolderId,
          createdBy: dto.createdBy,
        },
      });
    } catch (error) {
      this.handleKnownErrors(error);
    }
  }

  findAll(query: ListAssetsDto) {
    return this.prisma.assets.findMany({
      where: {
        deletedAt: query.trash ? { not: null } : null,
        createdBy: query.createdBy,
        FolderId: query.folderId,
        name: query.q ? { contains: query.q, mode: 'insensitive' } : undefined,
      },
      orderBy: query.sort === 'name_asc' ? { name: 'asc' } : { updatedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const asset = await this.prisma.assets.findFirst({ where: { id, deletedAt: null } });
    if (!asset) {
      throw new NotFoundException(`Asset ${id} not found`);
    }
    return asset;
  }

  async update(id: number, dto: UpdateAssetDto) {
    const asset = await this.findOne(id);

    if (dto.FolderId != null && dto.FolderId !== asset.FolderId) {
      await this.checkFolder(dto.FolderId, asset.createdBy);
    }

    try {
      return await this.prisma.assets.update({
        where: { id },
        data: {
          name: dto.name,
          type: dto.type,
          LogoURL: dto.LogoURL,
          FolderId: dto.FolderId,
        },
      });
    } catch (error) {
      this.handleKnownErrors(error, id);
    }
  }

  async trash(id: number) {
    await this.findOne(id);
    return this.prisma.assets.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: number) {
    const asset = await this.findTrashed(id);

    return this.prisma.assets.update({
      where: { id },
      data: { deletedAt: null, FolderId: asset.FolderId },
    });
  }

  async remove(id: number) {
    await this.findTrashed(id);
    return this.prisma.assets.delete({ where: { id } });
  }

  private async findTrashed(id: number) {
    const asset = await this.prisma.assets.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Asset ${id} not found`);
    }
    if (asset.deletedAt === null) {
      throw new ConflictException(`Asset ${id} is not in the trash`);
    }
    return asset;
  }

  private async checkFolder(folderId: number, ownerId: number) {
    const folder = await this.prisma.assetFolder.findFirst({
      where: { id: folderId, deletedAt: null },
    });
    if (!folder || folder.createdBy !== ownerId) {
      throw new BadRequestException(`Folder ${folderId} not found`);
    }
  }

  private handleKnownErrors(error: unknown, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('An asset with this name already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Asset ${id} not found`);
      }
    }
    throw error;
  }
}
