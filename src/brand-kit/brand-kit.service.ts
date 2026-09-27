import { Injectable } from '@nestjs/common';
import { CreateBrandKitDto } from './dto/create-brand-kit.dto.js';
import { UpdateBrandKitDto } from './dto/update-brand-kit.dto.js';

@Injectable()
export class BrandKitService {
  create(createBrandKitDto: CreateBrandKitDto) {
    return 'This action adds a new brandKit';
  }

  findAll() {
    return `This action returns all brandKit`;
  }

  findOne(id: number) {
    return `This action returns a #${id} brandKit`;
  }

  update(id: number, updateBrandKitDto: UpdateBrandKitDto) {
    return `This action updates a #${id} brandKit`;
  }

  remove(id: number) {
    return `This action removes a #${id} brandKit`;
  }
}
