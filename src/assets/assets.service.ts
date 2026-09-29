import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetTaggingService } from '../ai/asset-tagging.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ASSET_TYPES } from './asset-types.js';
import { CreateAssetDto } from './dto/create-asset.dto.js';
import { ListAssetsDto } from './dto/list-assets.dto.js';
import { SaveAiMetadataDto } from './dto/save-ai-metadata.dto.js';
import { UpdateAssetDto } from './dto/update-asset.dto.js';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assetTagging: AssetTaggingService,
  ) {}

  async create(userId: number, dto: CreateAssetDto) {
    await this.checkFolder(userId, dto.FolderId);
    try {
      return await this.prisma.assets.create({
        data: {
          name: dto.name,
          type: dto.type,
          LogoURL: dto.LogoURL,
          FolderId: dto.FolderId,
          createdBy: userId,
        },
      });
    } catch (error) {
      this.handleKnownErrors(error);
    }
  }

  findAll(userId: number, query: ListAssetsDto) {
    return this.prisma.assets.findMany({
      where: {
        deletedAt: query.trash ? { not: null } : null,
        createdBy: userId,
        FolderId: query.folderId,
        name: query.q ? { contains: query.q, mode: 'insensitive' } : undefined,
      },
      orderBy: query.sort === 'name_asc' ? { name: 'asc' } : { updatedAt: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const asset = await this.prisma.assets.findFirst({
      where: { id, createdBy: userId, deletedAt: null },
    });
    if (!asset) {
      throw new NotFoundException(`Asset ${id} not found`);
    }
    return asset;
  }

  async update(userId: number, id: number, dto: UpdateAssetDto) {
    const asset = await this.findOne(userId, id);

    if (dto.FolderId != null && dto.FolderId !== asset.FolderId) {
      await this.checkFolder(userId, dto.FolderId);
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

  async trash(userId: number, id: number) {
    await this.findOne(userId, id);
    return this.prisma.assets.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(userId: number, id: number) {
    const asset = await this.findTrashed(userId, id);

    return this.prisma.assets.update({
      where: { id },
      data: { deletedAt: null, FolderId: asset.FolderId },
    });
  }

  async remove(userId: number, id: number) {
    await this.findTrashed(userId, id);
    return this.prisma.assets.delete({ where: { id } });
  }

  async suggestAiMetadata(userId: number, id: number) {
    const asset = await this.findOne(userId, id);
    const [folder, brandKit] = await Promise.all([
      this.prisma.assetFolder.findFirst({
        where: { id: asset.FolderId, createdBy: userId, deletedAt: null },
        select: { FolderName: true },
      }),
      this.prisma.brandKit.findFirst({
        where: { createdBy: userId },
        orderBy: { updatedAt: 'desc' },
        select: { BrandName: true, PrimaryColor: true, SecondaryColor: true },
      }),
    ]);

    return this.assetTagging.suggest({
      asset: {
        name: asset.name,
        type: ASSET_TYPES[asset.type as keyof typeof ASSET_TYPES] ?? 'unknown',
        url: asset.LogoURL,
      },
      folder: folder ? { name: folder.FolderName } : null,
      brand: brandKit
        ? {
            name: brandKit.BrandName,
            primary_color: brandKit.PrimaryColor,
            secondary_color: brandKit.SecondaryColor,
          }
        : null,
    });
  }

  /** Saves a suggestion the user has reviewed (and possibly edited). */
  async saveAiMetadata(userId: number, id: number, dto: SaveAiMetadataDto) {
    await this.findOne(userId, id);
    return this.prisma.assets.update({
      where: { id },
      data: {
        tags: dto.tags.join(', '),
        description: dto.description,
        usage_suggestion: dto.usage_suggestion,
      },
    });
  }

  private async findTrashed(userId: number, id: number) {
    const asset = await this.prisma.assets.findFirst({ where: { id, createdBy: userId } });
    if (!asset) {
      throw new NotFoundException(`Asset ${id} not found`);
    }
    if (asset.deletedAt === null) {
      throw new ConflictException(`Asset ${id} is not in the trash`);
    }
    return asset;
  }

  private async checkFolder(userId: number, folderId: number) {
    const folder = await this.prisma.assetFolder.findFirst({
      where: { id: folderId, createdBy: userId, deletedAt: null },
    });
    if (!folder) {
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
