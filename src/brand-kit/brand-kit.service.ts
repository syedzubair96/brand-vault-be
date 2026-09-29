import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBrandKitDto } from './dto/create-brand-kit.dto.js';
import { UpdateBrandKitDto } from './dto/update-brand-kit.dto.js';

@Injectable()
export class BrandKitService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateBrandKitDto) {
    try {
      return await this.prisma.brandKit.create({
        data: {
          BrandName: dto.BrandName,
          PrimaryColor: dto.PrimaryColor,
          SecondaryColor: dto.SecondaryColor,
          LogoURL: dto.LogoURL,
          createdBy: userId,
        },
      });
    } catch (error) {
      this.handleKnownErrors(error);
    }
  }

  findAll(userId: number) {
    return this.prisma.brandKit.findMany({
      where: { createdBy: userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const brandKit = await this.prisma.brandKit.findFirst({
      where: { id, createdBy: userId },
    });
    if (!brandKit) {
      throw new NotFoundException(`Brand kit ${id} not found`);
    }
    return brandKit;
  }

  async update(userId: number, id: number, dto: UpdateBrandKitDto) {
    await this.findOne(userId, id);
    try {
      return await this.prisma.brandKit.update({ where: { id }, data: dto });
    } catch (error) {
      this.handleKnownErrors(error, id);
    }
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    try {
      return await this.prisma.brandKit.delete({ where: { id } });
    } catch (error) {
      this.handleKnownErrors(error, id);
    }
  }

  private handleKnownErrors(error: unknown, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('A brand kit with this name already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Brand kit ${id} not found`);
      }
    }
    throw error;
  }
}
